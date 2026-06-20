import React, { useCallback, useEffect, useRef, useState } from "react";
import { Animated, View, StyleSheet } from "react-native";
import { SafeAreaProvider, useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { LinearGradient } from "expo-linear-gradient";
import { useFonts } from "expo-font";

import { colors, motion } from "./src/theme/tokens";
import { fontMap } from "./src/theme/fonts";
import { AppProvider, useApp } from "./src/state/AppContext";
import { analyzeImage, hasApiKey } from "./src/lib/anthropic";
import { makeSampleResult } from "./src/lib/sampleResult";
import useReducedMotion from "./src/lib/useReducedMotion";

import IntroScreen from "./src/screens/IntroScreen";
import CaptureScreen from "./src/screens/CaptureScreen";
import ConfirmScreen from "./src/screens/ConfirmScreen";
import AnalyzingScreen from "./src/screens/AnalyzingScreen";
import AccountScreen from "./src/screens/AccountScreen";
import PaywallScreen from "./src/screens/PaywallScreen";
import LimitScreen from "./src/screens/LimitScreen";
import ErrorScreen from "./src/screens/ErrorScreen";
import ResultsScreen from "./src/screens/ResultsScreen";
import HomeScreen from "./src/screens/HomeScreen";

/* ------------------------------------------------------------------ *
 * Clarity — calm, evidence-based skin analysis.
 * Funnel for new users: scan → account → pay → results → dashboard.
 * Returning users open straight to the dashboard, where they rescan
 * and track progress over time.
 * ------------------------------------------------------------------ */

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export default function App() {
  return (
    <SafeAreaProvider>
      <AppProvider>
        <StatusBar style="dark" />
        <LinearGradient colors={[colors.canvasTop, colors.canvasBottom]} style={StyleSheet.absoluteFill} />
        <Root />
      </AppProvider>
    </SafeAreaProvider>
  );
}

function Root() {
  const insets = useSafeAreaInsets();
  const { ready, user, subscribed, latest, history, signIn, subscribe, signOut, addScan } = useApp();
  const [fontsLoaded, fontError] = useFonts(fontMap);

  // Never block the UI on fonts — if they fail or stall, fall back to system
  // fonts after a moment so the app always renders.
  const [fontTimeout, setFontTimeout] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setFontTimeout(true), 2500);
    return () => clearTimeout(t);
  }, []);
  const fontsReady = fontsLoaded || !!fontError || fontTimeout;

  const reduced = useReducedMotion();
  const [stage, setStage] = useState("loading");
  const [active, setActive] = useState(null); // result shown on the Results screen
  const [pending, setPending] = useState(null); // scan awaiting account/payment
  const [captured, setCaptured] = useState(null); // photo awaiting confirmation
  const [demo, setDemo] = useState(false);
  const routed = useRef(false);

  // One-time startup diagnostic so it's obvious whether the API key loaded.
  useEffect(() => {
    console.log(
      hasApiKey
        ? "[Clarity] API key detected — real scans (not Preview) will call the API."
        : "[Clarity] No API key detected — set EXPO_PUBLIC_ANTHROPIC_API_KEY in .env and restart with `npx expo start -c`."
    );
  }, []);

  // Decide the landing screen once everything has loaded.
  useEffect(() => {
    if (ready && fontsReady && !routed.current) {
      routed.current = true;
      setStage(user && subscribed && latest ? "home" : "intro");
    }
  }, [ready, fontsReady, user, subscribed, latest]);

  // One real (API-backed) scan per day. Demo/sample scans don't count, so
  // the no-key preview stays unlimited for testing.
  const DAILY_LIMIT = 1;
  const today = new Date().toDateString();
  const usedToday = history.filter(
    (h) => !h.demo && new Date(h.date).toDateString() === today
  ).length;
  const canScan = usedToday < DAILY_LIMIT;

  const goScan = useCallback(() => {
    setStage(canScan ? "capture" : "limit");
  }, [canScan]);

  const commit = useCallback(
    (result, isDemo) => {
      const rec = addScan(result, { demo: isDemo });
      setActive({ ...rec, _demo: isDemo });
      setStage("results");
    },
    [addScan]
  );

  // Gate a finished scan behind account creation + payment.
  const gate = useCallback(
    (result, isDemo) => {
      setPending(result);
      setDemo(isDemo);
      if (!user) setStage("account");
      else if (!subscribed) setStage("paywall");
      else commit(result, isDemo);
    },
    [user, subscribed, commit]
  );

  const runScan = useCallback(
    async (base64, mediaType) => {
      if (base64 == null && !hasApiKey) {
        // upload/capture failed with no fallback
      }
      setStage("analyzing");
      if (!hasApiKey) {
        await sleep(1700);
        gate(makeSampleResult(history.length), true);
        return;
      }
      try {
        const result = await analyzeImage(base64, mediaType, history);
        gate(result, false);
      } catch {
        setStage("error");
      }
    },
    [gate, history]
  );

  // Capture/upload now routes to a confirmation step before analyzing.
  const onCapture = useCallback((base64, mediaType) => {
    if (!base64) {
      setStage("error");
      return;
    }
    setCaptured({ base64, mediaType });
    setStage("confirm");
  }, []);

  // Preview from the intro — runs the full funnel (account → paywall →
  // results → dashboard) with sample data, so the whole app is explorable
  // without an API key or a camera.
  const preview = useCallback(async () => {
    setStage("analyzing");
    await sleep(1500);
    gate(makeSampleResult(history.length), true);
  }, [gate, history.length]);

  const onSignIn = useCallback(
    (u) => {
      signIn(u);
      if (!subscribed) setStage("paywall");
      else commit(pending, demo);
    },
    [signIn, subscribed, commit, pending, demo]
  );

  const onPay = useCallback(() => {
    subscribe();
    commit(pending, demo);
  }, [subscribe, pending, demo]);

  const viewReport = useCallback(() => {
    if (!latest) return;
    setActive({ ...latest, _demo: false });
    setStage("results");
  }, [latest]);

  const viewRecord = useCallback((record) => {
    if (!record) return;
    setActive({ ...record, _demo: false });
    setStage("results");
  }, []);

  const onResultsDone = useCallback(() => {
    setStage(user && latest ? "home" : "intro");
  }, [user, latest]);

  const onSignOut = useCallback(() => {
    signOut();
    routed.current = true;
    setStage("intro");
  }, [signOut]);

  const backFromCapture = useCallback(() => {
    setStage(user && latest ? "home" : "intro");
  }, [user, latest]);

  // Gentle cross-fade whenever the stage changes (ties transitions together
  // without fighting each screen's own entrance motion).
  const fade = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (stage === "loading") return;
    if (reduced) {
      fade.setValue(1);
      return;
    }
    fade.setValue(0);
    Animated.timing(fade, {
      toValue: 1,
      duration: motion.duration.fast,
      easing: motion.ease,
      useNativeDriver: true,
    }).start();
  }, [stage, fade, reduced]);

  if (!fontsReady || stage === "loading") {
    return <View style={{ flex: 1 }} />;
  }

  return (
    <Animated.View style={{ flex: 1, paddingTop: insets.top, paddingBottom: insets.bottom, opacity: fade }}>
      {stage === "intro" && <IntroScreen onStart={goScan} onPreview={preview} />}
      {stage === "capture" && <CaptureScreen onBack={backFromCapture} onCapture={onCapture} />}
      {stage === "limit" && <LimitScreen onClose={() => setStage(user && latest ? "home" : "intro")} />}
      {stage === "confirm" && captured && (
        <ConfirmScreen
          image={captured}
          onUse={() => runScan(captured.base64, captured.mediaType)}
          onRetake={() => setStage("capture")}
        />
      )}
      {stage === "analyzing" && <AnalyzingScreen />}
      {stage === "account" && <AccountScreen onSignIn={onSignIn} />}
      {stage === "paywall" && <PaywallScreen onPay={onPay} onCancel={() => setStage("intro")} />}
      {stage === "error" && <ErrorScreen onRetry={() => setStage("capture")} />}
      {stage === "results" && active && (
        <ResultsScreen result={active} demo={active._demo} onDone={onResultsDone} />
      )}
      {stage === "home" && (
        <HomeScreen
          onRescan={goScan}
          onViewReport={viewReport}
          onViewRecord={viewRecord}
          onSignOut={onSignOut}
          canScan={canScan}
        />
      )}
    </Animated.View>
  );
}

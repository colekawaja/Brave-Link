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
import { SAMPLE_RESULT } from "./src/lib/sampleResult";

import IntroScreen from "./src/screens/IntroScreen";
import CaptureScreen from "./src/screens/CaptureScreen";
import AnalyzingScreen from "./src/screens/AnalyzingScreen";
import AccountScreen from "./src/screens/AccountScreen";
import PaywallScreen from "./src/screens/PaywallScreen";
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
  const { ready, user, subscribed, latest, signIn, subscribe, signOut, addScan } = useApp();
  const [fontsLoaded] = useFonts(fontMap);

  const [stage, setStage] = useState("loading");
  const [active, setActive] = useState(null); // result shown on the Results screen
  const [pending, setPending] = useState(null); // scan awaiting account/payment
  const [demo, setDemo] = useState(false);
  const routed = useRef(false);

  // Decide the landing screen once everything has loaded.
  useEffect(() => {
    if (ready && fontsLoaded && !routed.current) {
      routed.current = true;
      setStage(user && subscribed && latest ? "home" : "intro");
    }
  }, [ready, fontsLoaded, user, subscribed, latest]);

  const commit = useCallback(
    (result, isDemo) => {
      const rec = addScan(result);
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
        gate(SAMPLE_RESULT, true);
        return;
      }
      try {
        const result = await analyzeImage(base64, mediaType);
        gate(result, false);
      } catch {
        setStage("error");
      }
    },
    [gate]
  );

  const onCapture = useCallback(
    (base64, mediaType) => {
      if (!base64 && hasApiKey) {
        setStage("error");
        return;
      }
      runScan(base64, mediaType);
    },
    [runScan]
  );

  // Free preview from the intro — skips the account/payment gate.
  const preview = useCallback(async () => {
    setStage("analyzing");
    await sleep(1500);
    setActive({ ...SAMPLE_RESULT, _demo: true });
    setStage("results");
  }, []);

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
    fade.setValue(0);
    Animated.timing(fade, {
      toValue: 1,
      duration: motion.duration.fast,
      easing: motion.ease,
      useNativeDriver: true,
    }).start();
  }, [stage, fade]);

  if (!fontsLoaded || stage === "loading") {
    return <View style={{ flex: 1 }} />;
  }

  return (
    <Animated.View style={{ flex: 1, paddingTop: insets.top, paddingBottom: insets.bottom, opacity: fade }}>
      {stage === "intro" && <IntroScreen onStart={() => setStage("capture")} onPreview={preview} />}
      {stage === "capture" && <CaptureScreen onBack={backFromCapture} onCapture={onCapture} />}
      {stage === "analyzing" && <AnalyzingScreen />}
      {stage === "account" && <AccountScreen onSignIn={onSignIn} />}
      {stage === "paywall" && <PaywallScreen onPay={onPay} onCancel={() => setStage("intro")} />}
      {stage === "error" && <ErrorScreen onRetry={() => setStage("capture")} />}
      {stage === "results" && active && (
        <ResultsScreen result={active} demo={active._demo} onDone={onResultsDone} />
      )}
      {stage === "home" && (
        <HomeScreen onRescan={() => setStage("capture")} onViewReport={viewReport} onSignOut={onSignOut} />
      )}
    </Animated.View>
  );
}

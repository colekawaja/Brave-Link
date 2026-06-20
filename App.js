import React from "react";
import { View, StyleSheet } from "react-native";
import { SafeAreaProvider, useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { LinearGradient } from "expo-linear-gradient";
import { useFonts } from "expo-font";

import { colors } from "./src/theme/tokens";
import { fontMap } from "./src/theme/fonts";
import useAnalysis from "./src/hooks/useAnalysis";

import IntroScreen from "./src/screens/IntroScreen";
import CaptureScreen from "./src/screens/CaptureScreen";
import AnalyzingScreen from "./src/screens/AnalyzingScreen";
import ErrorScreen from "./src/screens/ErrorScreen";
import ResultsScreen from "./src/screens/ResultsScreen";

/* ------------------------------------------------------------------ *
 * Clarity — a calm, editorial skin-analysis phone app.
 * App composes the screens over a soft gradient canvas and routes
 * between the five stages via the useAnalysis hook.
 * ------------------------------------------------------------------ */

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <LinearGradient
        colors={[colors.canvasTop, colors.canvasBottom]}
        style={StyleSheet.absoluteFill}
      />
      <Root />
    </SafeAreaProvider>
  );
}

function Root() {
  const insets = useSafeAreaInsets();
  const { stage, setStage, result, analyze } = useAnalysis();
  const [fontsLoaded] = useFonts(fontMap);

  if (!fontsLoaded) {
    return <View style={{ flex: 1 }} />;
  }

  const onCapture = (base64, mediaType) => {
    if (!base64) {
      setStage("error");
      return;
    }
    analyze(base64, mediaType);
  };

  return (
    <View style={{ flex: 1, paddingTop: insets.top, paddingBottom: insets.bottom }}>
      {stage === "intro" && <IntroScreen onStart={() => setStage("capture")} />}
      {stage === "capture" && (
        <CaptureScreen onBack={() => setStage("intro")} onCapture={onCapture} />
      )}
      {stage === "analyzing" && <AnalyzingScreen />}
      {stage === "error" && <ErrorScreen onRetry={() => setStage("capture")} />}
      {stage === "results" && result && (
        <ResultsScreen result={result} onRescan={() => setStage("capture")} />
      )}
    </View>
  );
}

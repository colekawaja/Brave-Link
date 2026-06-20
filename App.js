import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Easing,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as ImagePicker from "expo-image-picker";
import Svg, { Circle, Ellipse } from "react-native-svg";
import { useFonts } from "expo-font";
import {
  Fraunces_400Regular,
  Fraunces_500Medium,
} from "@expo-google-fonts/fraunces";
import {
  Inter_400Regular,
  Inter_500Medium,
} from "@expo-google-fonts/inter";

/* ------------------------------------------------------------------ *
 * Clarity — a calm, minimal skin-analysis phone app.
 * One selfie in, a Skin Clarity Score and a quiet routine out.
 * Single-file React Native (Expo). Native camera, native rendering.
 * ------------------------------------------------------------------ */

/* ---- palette -------------------------------------------------------- */
const C = {
  bg: "#F4F1EA", // warm bone
  surface: "#FBFAF4", // card
  ink: "#1F1C18", // near-black
  muted: "#6E665B", // soft brown-grey
  faint: "#9A9184", // tertiary text
  line: "#E5DFD2", // single hairline
  sage: "#76876C", // restrained accent
  sageSoft: "#EBEEE6",
  viewport: "#E9E4D8",
};

const FONT = {
  serif: "Fraunces_400Regular",
  serifMed: "Fraunces_500Medium",
  sans: "Inter_400Regular",
  sansMed: "Inter_500Medium",
};

/* The vision model. Opus 4.8 — the most capable Opus-tier model. */
const MODEL = "claude-opus-4-8";

/* On a phone there is no artifact environment to inject auth, so the key
 * comes from an Expo public env var (EXPO_PUBLIC_ANTHROPIC_API_KEY). */
const API_KEY = process.env.EXPO_PUBLIC_ANTHROPIC_API_KEY;

const ANALYSIS_PROMPT = `You are a cosmetic skin-analysis assistant. Analyze ONLY the visible skin in this
selfie, for cosmetic skincare purposes (not medical diagnosis). Be encouraging and
constructive. Never comment on attractiveness, symmetry, age, weight, or facial
features unrelated to skin condition.

Return ONLY valid JSON (no markdown, no preamble) matching exactly this schema:
{
  "overallClarity": <int 0-100, higher = clearer, calmer, more even skin>,
  "summary": "<1 supportive sentence>",
  "concerns": [
    {
      "name": "<Breakouts|Redness|Texture|Pores|Pigmentation|Hydration|Under-eye|Oiliness>",
      "score": <int 0-100, higher = better>,
      "severity": "<minimal|mild|moderate|notable>",
      "note": "<one short, kind sentence>",
      "products": [
        { "type": "<e.g. Salicylic acid cleanser>",
          "example": "<reputable named product>",
          "ingredient": "<key active>",
          "why": "<6-10 words>" }
      ]
    }
  ],
  "routine": { "am": ["<step>", ...], "pm": ["<step>", ...] }
}

Rules: include all 8 categories in "concerns". For "minimal" severity, leave
"products" as an empty array. Always include SPF in the AM routine. If no clear
face/skin is visible or lighting is too poor to assess, return exactly:
{ "error": "retake" }`;

const LABELS = { Pigmentation: "Dark spots", "Under-eye": "Under-eye" };
const label = (name) => LABELS[name] || name;
const SEVERITY_ORDER = { minimal: 0, mild: 1, moderate: 2, notable: 3 };

/* ---- helpers -------------------------------------------------------- */
const clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, n));

// Calm green (high) → warm amber (low). Never red.
function scoreColor(value) {
  const t = clamp(value, 0, 100) / 100;
  const hue = 38 + t * 72; // 38 amber → 110 sage-green
  const sat = 34 - t * 4;
  const light = 46 - t * 4;
  return `hsl(${hue.toFixed(0)}, ${sat.toFixed(0)}%, ${light.toFixed(0)}%)`;
}

/* Build request headers. */
function buildHeaders() {
  const headers = { "Content-Type": "application/json" };
  if (API_KEY) {
    headers["x-api-key"] = API_KEY;
    headers["anthropic-version"] = "2023-06-01";
  }
  return headers;
}

async function analyzeImage(base64, mediaType) {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: buildHeaders(),
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 4096,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: { type: "base64", media_type: mediaType, data: base64 },
            },
            { type: "text", text: ANALYSIS_PROMPT },
          ],
        },
      ],
    }),
  });
  if (!res.ok) throw new Error("request failed");
  const data = await res.json();
  const textBlock = (data.content || []).find((b) => b.type === "text");
  let raw = (textBlock ? textBlock.text : "").trim();
  raw = raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
  const parsed = JSON.parse(raw);
  if (parsed.error === "retake" || typeof parsed.overallClarity !== "number") {
    throw new Error("retake");
  }
  return parsed;
}

/* ---- gentle entrance ------------------------------------------------ */
function Reveal({ delay = 0, style, children }) {
  const a = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(a, {
      toValue: 1,
      duration: 600,
      delay,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [a, delay]);
  return (
    <Animated.View
      style={[
        style,
        {
          opacity: a,
          transform: [
            {
              translateY: a.interpolate({
                inputRange: [0, 1],
                outputRange: [10, 0],
              }),
            },
          ],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
}

/* ---- hero score ring ------------------------------------------------ */
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

function ScoreRing({ value }) {
  const size = 232;
  const stroke = 10;
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;

  const progress = useRef(new Animated.Value(0)).current;
  const [shown, setShown] = useState(0);

  useEffect(() => {
    const id = progress.addListener(({ value: v }) =>
      setShown(Math.round(v * value))
    );
    Animated.timing(progress, {
      toValue: 1,
      duration: 1150,
      delay: 200,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
    return () => progress.removeListener(id);
  }, [progress, value]);

  const dashoffset = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [circ, circ * (1 - clamp(value, 0, 100) / 100)],
  });

  return (
    <View style={{ width: size, height: size, alignItems: "center", justifyContent: "center" }}>
      <Svg width={size} height={size} style={{ transform: [{ rotate: "-90deg" }] }}>
        <Circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={C.line} strokeWidth={stroke} />
        <AnimatedCircle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={scoreColor(shown)}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={dashoffset}
        />
      </Svg>
      <View style={StyleSheet.absoluteFill}>
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <Text style={{ fontFamily: FONT.serifMed, color: C.ink, fontSize: 72, lineHeight: 76 }}>
            {shown}
          </Text>
          <Text
            style={{
              fontFamily: FONT.sans,
              color: C.faint,
              fontSize: 11,
              letterSpacing: 2.4,
              marginTop: 6,
            }}
          >
            SKIN CLARITY
          </Text>
        </View>
      </View>
    </View>
  );
}

/* ---- thin score bar ------------------------------------------------- */
function ScoreBar({ value }) {
  const a = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(a, {
      toValue: clamp(value, 0, 100),
      duration: 900,
      delay: 120,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [a, value]);
  const width = a.interpolate({ inputRange: [0, 100], outputRange: ["0%", "100%"] });
  return (
    <View style={{ height: 4, borderRadius: 999, backgroundColor: C.line, overflow: "hidden" }}>
      <Animated.View style={{ height: 4, borderRadius: 999, width, backgroundColor: scoreColor(value) }} />
    </View>
  );
}

/* ---- severity chip -------------------------------------------------- */
function SeverityChip({ severity }) {
  return (
    <View style={{ borderRadius: 999, backgroundColor: C.sageSoft, paddingHorizontal: 10, paddingVertical: 4 }}>
      <Text style={{ fontFamily: FONT.sans, fontSize: 11, color: C.muted, textTransform: "capitalize" }}>
        {severity}
      </Text>
    </View>
  );
}

/* ---- concern card --------------------------------------------------- */
function ConcernCard({ concern, delay }) {
  return (
    <Reveal delay={delay} style={styles.card}>
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
        <Text style={{ fontFamily: FONT.serifMed, color: C.ink, fontSize: 19 }}>
          {label(concern.name)}
        </Text>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
          <SeverityChip severity={concern.severity} />
          <Text style={{ fontFamily: FONT.serifMed, fontSize: 22, color: scoreColor(concern.score) }}>
            {concern.score}
          </Text>
        </View>
      </View>
      <View style={{ marginTop: 12 }}>
        <ScoreBar value={concern.score} />
      </View>
      <Text style={{ fontFamily: FONT.sans, color: C.muted, fontSize: 14, lineHeight: 22, marginTop: 12 }}>
        {concern.note}
      </Text>
    </Reveal>
  );
}

/* ---- product row ---------------------------------------------------- */
function ProductRow({ product }) {
  return (
    <View style={{ paddingVertical: 12, borderTopWidth: 1, borderTopColor: C.line }}>
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
        <Text style={{ fontFamily: FONT.sansMed, color: C.ink, fontSize: 14, flexShrink: 1 }}>
          {product.example}
        </Text>
        <Text style={{ fontFamily: FONT.sans, color: C.faint, fontSize: 12 }}>{product.ingredient}</Text>
      </View>
      <Text style={{ fontFamily: FONT.sans, color: C.muted, fontSize: 13, lineHeight: 20, marginTop: 4 }}>
        {product.type} — {product.why}
      </Text>
    </View>
  );
}

/* ---- routine column ------------------------------------------------- */
function RoutineColumn({ title, steps }) {
  return (
    <View style={{ flex: 1 }}>
      <Text style={styles.kicker}>{title}</Text>
      <View style={{ marginTop: 16, gap: 12 }}>
        {steps.map((step, i) => (
          <View key={i} style={{ flexDirection: "row", gap: 10 }}>
            <Text style={{ fontFamily: FONT.serif, color: C.sage, fontSize: 14, width: 14 }}>{i + 1}</Text>
            <Text style={{ fontFamily: FONT.sans, color: C.ink, fontSize: 14, lineHeight: 21, flex: 1 }}>
              {step}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

/* ---- buttons -------------------------------------------------------- */
function PrimaryButton({ label: text, onPress, style }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        {
          borderRadius: 999,
          backgroundColor: C.ink,
          paddingVertical: 16,
          paddingHorizontal: 32,
          alignItems: "center",
          opacity: pressed ? 0.85 : 1,
        },
        style,
      ]}
    >
      <Text style={{ fontFamily: FONT.sansMed, color: C.bg, fontSize: 15 }}>{text}</Text>
    </Pressable>
  );
}

function GhostButton({ label: text, onPress }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        borderRadius: 999,
        borderWidth: 1,
        borderColor: C.ink,
        paddingVertical: 16,
        paddingHorizontal: 32,
        opacity: pressed ? 0.7 : 1,
      })}
    >
      <Text style={{ fontFamily: FONT.sansMed, color: C.ink, fontSize: 15 }}>{text}</Text>
    </Pressable>
  );
}

function TextLink({ label: text, onPress }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}>
      <Text style={{ fontFamily: FONT.sans, fontSize: 14, color: C.muted, textDecorationLine: "underline" }}>
        {text}
      </Text>
    </Pressable>
  );
}

/* ================================================================== *
 * App
 * ================================================================== */
export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <Root />
    </SafeAreaProvider>
  );
}

function Root() {
  const insets = useSafeAreaInsets();
  const [stage, setStage] = useState("intro"); // intro | capture | analyzing | error | results
  const [result, setResult] = useState(null);

  const [fontsLoaded] = useFonts({
    Fraunces_400Regular,
    Fraunces_500Medium,
    Inter_400Regular,
    Inter_500Medium,
  });

  if (!fontsLoaded) {
    return <View style={{ flex: 1, backgroundColor: C.bg }} />;
  }

  return (
    <View style={{ flex: 1, backgroundColor: C.bg, paddingTop: insets.top, paddingBottom: insets.bottom }}>
      {stage === "intro" && <Intro onStart={() => setStage("capture")} />}
      {stage === "capture" && (
        <Capture
          onAnalyzing={() => setStage("analyzing")}
          onResult={(r) => {
            setResult(r);
            setStage("results");
          }}
          onError={() => setStage("error")}
        />
      )}
      {stage === "analyzing" && <Analyzing />}
      {stage === "error" && <ErrorState onRetry={() => setStage("capture")} />}
      {stage === "results" && result && (
        <Results result={result} onRescan={() => setStage("capture")} />
      )}
    </View>
  );
}

/* ---- intro ---------------------------------------------------------- */
function Intro({ onStart }) {
  return (
    <View style={[styles.screen, { alignItems: "center", justifyContent: "center" }]}>
      <Reveal style={{ alignItems: "center" }}>
        <Text style={{ fontFamily: FONT.sans, color: C.faint, fontSize: 11, letterSpacing: 3.6 }}>
          CLARITY
        </Text>
        <Text
          style={{
            fontFamily: FONT.serif,
            color: C.ink,
            fontSize: 42,
            lineHeight: 47,
            textAlign: "center",
            marginTop: 32,
          }}
        >
          A quiet read on{"\n"}your skin.
        </Text>
        <Text
          style={{
            fontFamily: FONT.sans,
            color: C.muted,
            fontSize: 15,
            lineHeight: 25,
            textAlign: "center",
            marginTop: 24,
            maxWidth: 300,
          }}
        >
          One selfie. A clarity score, the areas worth focusing on, and a simple
          routine to get there.
        </Text>
        <View style={{ marginTop: 48 }}>
          <PrimaryButton label="Scan my skin" onPress={onStart} />
        </View>
        <Text
          style={{
            fontFamily: FONT.sans,
            color: C.faint,
            fontSize: 12,
            lineHeight: 19,
            textAlign: "center",
            marginTop: 24,
            maxWidth: 280,
          }}
        >
          Your photo is analyzed for this scan only and never stored.
        </Text>
      </Reveal>
    </View>
  );
}

/* ---- capture -------------------------------------------------------- */
function Capture({ onAnalyzing, onResult, onError }) {
  const cameraRef = useRef(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [cameraReady, setCameraReady] = useState(false);

  useEffect(() => {
    if (permission && !permission.granted && permission.canAskAgain) {
      requestPermission();
    }
  }, [permission, requestPermission]);

  const run = useCallback(
    async (promise) => {
      onAnalyzing();
      try {
        const { base64, mediaType } = await promise;
        const parsed = await analyzeImage(base64, mediaType);
        onResult(parsed);
      } catch {
        onError();
      }
    },
    [onAnalyzing, onError, onResult]
  );

  const capture = useCallback(() => {
    if (!cameraRef.current) return;
    run(
      (async () => {
        const photo = await cameraRef.current.takePictureAsync({
          base64: true,
          quality: 0.7,
          skipProcessing: false,
        });
        return { base64: photo.base64, mediaType: "image/jpeg" };
      })()
    );
  }, [run]);

  const pickPhoto = useCallback(() => {
    run(
      (async () => {
        const res = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ["images"],
          base64: true,
          quality: 0.7,
        });
        if (res.canceled || !res.assets || !res.assets[0]?.base64) {
          throw new Error("cancelled");
        }
        const asset = res.assets[0];
        const mediaType =
          asset.mimeType && asset.mimeType.startsWith("image/")
            ? asset.mimeType
            : "image/jpeg";
        return { base64: asset.base64, mediaType };
      })()
    );
  }, [run]);

  const granted = permission?.granted;

  return (
    <View style={[styles.screen, { paddingTop: 24 }]}>
      <View style={{ alignItems: "center" }}>
        <Text style={{ fontFamily: FONT.serif, color: C.ink, fontSize: 26 }}>Center your face</Text>
        <Text style={{ fontFamily: FONT.sans, color: C.muted, fontSize: 14, marginTop: 10, textAlign: "center" }}>
          Face a window, no harsh shadows.
        </Text>
      </View>

      <View style={{ flex: 1, justifyContent: "center", marginVertical: 24 }}>
        <View style={styles.viewport}>
          {granted ? (
            <>
              <CameraView
                ref={cameraRef}
                style={StyleSheet.absoluteFill}
                facing="front"
                onCameraReady={() => setCameraReady(true)}
              />
              <Svg style={StyleSheet.absoluteFill} viewBox="0 0 300 400" preserveAspectRatio="none">
                <Ellipse
                  cx="150"
                  cy="185"
                  rx="98"
                  ry="128"
                  fill="none"
                  stroke="rgba(255,255,255,0.85)"
                  strokeWidth="1.5"
                  strokeDasharray="4 7"
                />
              </Svg>
              {!cameraReady && (
                <View style={[StyleSheet.absoluteFill, styles.center]}>
                  <Text style={{ fontFamily: FONT.sans, color: C.muted, fontSize: 13 }}>
                    Waking the camera…
                  </Text>
                </View>
              )}
            </>
          ) : (
            <View style={[StyleSheet.absoluteFill, styles.center, { padding: 24 }]}>
              <Text style={{ fontFamily: FONT.serif, color: C.ink, fontSize: 20 }}>Camera is off</Text>
              <Text
                style={{
                  fontFamily: FONT.sans,
                  color: C.muted,
                  fontSize: 14,
                  lineHeight: 22,
                  textAlign: "center",
                  marginTop: 12,
                }}
              >
                Allow camera access, or upload a clear, well-lit selfie instead.
              </Text>
            </View>
          )}
        </View>
      </View>

      <View style={{ alignItems: "center", gap: 20, paddingBottom: 8 }}>
        {granted && <PrimaryButton label="Capture" onPress={capture} style={{ alignSelf: "stretch" }} />}
        <TextLink
          label={granted ? "Upload a photo instead" : "Upload a photo"}
          onPress={pickPhoto}
        />
      </View>
    </View>
  );
}

/* ---- analyzing ------------------------------------------------------ */
const ANALYZING_LINES = [
  "Reading the light on your skin…",
  "Looking at tone and texture…",
  "Noticing where skin is calm…",
  "Composing your routine…",
];

function Analyzing() {
  const [i, setI] = useState(0);
  const spin = useRef(new Animated.Value(0)).current;
  const fade = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(spin, {
        toValue: 1,
        duration: 1100,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, [spin]);

  useEffect(() => {
    const id = setInterval(() => {
      Animated.sequence([
        Animated.timing(fade, { toValue: 0, duration: 350, useNativeDriver: true }),
        Animated.timing(fade, { toValue: 1, duration: 450, useNativeDriver: true }),
      ]).start();
      setTimeout(() => setI((v) => (v + 1) % ANALYZING_LINES.length), 350);
    }, 2200);
    return () => clearInterval(id);
  }, [fade]);

  const size = 64;
  const stroke = 3;
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const rotate = spin.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "360deg"] });

  return (
    <View style={[styles.screen, styles.center]}>
      <Animated.View style={{ transform: [{ rotate }] }}>
        <Svg width={size} height={size}>
          <Circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={C.line} strokeWidth={stroke} />
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke={C.sage}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circ}
            strokeDashoffset={circ * 0.72}
          />
        </Svg>
      </Animated.View>
      <Animated.Text
        style={{ fontFamily: FONT.serif, color: C.ink, fontSize: 19, marginTop: 32, opacity: fade }}
      >
        {ANALYZING_LINES[i]}
      </Animated.Text>
    </View>
  );
}

/* ---- error ---------------------------------------------------------- */
function ErrorState({ onRetry }) {
  return (
    <View style={[styles.screen, styles.center]}>
      <Text style={{ fontFamily: FONT.serif, color: C.ink, fontSize: 28 }}>Let's retake that</Text>
      <Text
        style={{
          fontFamily: FONT.sans,
          color: C.muted,
          fontSize: 15,
          lineHeight: 25,
          textAlign: "center",
          marginTop: 16,
          maxWidth: 300,
        }}
      >
        Try softer, even lighting — face a window and keep your whole face in frame.
      </Text>
      <View style={{ marginTop: 40 }}>
        <PrimaryButton label="Try again" onPress={onRetry} />
      </View>
    </View>
  );
}

/* ---- results -------------------------------------------------------- */
function Results({ result, onRescan }) {
  const concerns = Array.isArray(result.concerns) ? result.concerns : [];
  const sorted = [...concerns].sort(
    (a, b) =>
      (SEVERITY_ORDER[b.severity] ?? 0) - (SEVERITY_ORDER[a.severity] ?? 0) ||
      a.score - b.score
  );
  const focus = sorted.filter((c) => c.severity !== "minimal");
  const calm = sorted.filter((c) => c.severity === "minimal");
  const recs = focus
    .filter((c) => Array.isArray(c.products) && c.products.length > 0)
    .slice(0, 4);
  const routine = result.routine || { am: [], pm: [] };

  return (
    <ScrollView
      contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 24, paddingBottom: 56 }}
      showsVerticalScrollIndicator={false}
    >
      {/* hero */}
      <View style={{ alignItems: "center" }}>
        <ScoreRing value={clamp(Math.round(result.overallClarity), 0, 100)} />
        <Text
          style={{
            fontFamily: FONT.serif,
            color: C.ink,
            fontSize: 20,
            lineHeight: 29,
            textAlign: "center",
            marginTop: 28,
            maxWidth: 340,
          }}
        >
          {result.summary}
        </Text>
      </View>

      {/* focus */}
      {focus.length > 0 && (
        <View style={{ marginTop: 56 }}>
          <Text style={styles.kicker}>AREAS TO FOCUS ON</Text>
          <View style={{ marginTop: 20, gap: 16 }}>
            {focus.map((c, idx) => (
              <ConcernCard key={c.name} concern={c} delay={idx * 90} />
            ))}
          </View>
        </View>
      )}

      {/* calm */}
      {calm.length > 0 && (
        <Reveal delay={focus.length * 90} style={styles.calmRow}>
          <Text style={{ fontFamily: FONT.sansMed, color: C.sage, fontSize: 13 }}>
            Looking good:{" "}
            <Text style={{ fontFamily: FONT.sans, color: C.muted }}>
              {calm.map((c) => label(c.name)).join(", ")}.
            </Text>
          </Text>
        </Reveal>
      )}

      {/* recommendations */}
      {recs.length > 0 && (
        <View style={{ marginTop: 56 }}>
          <Text style={styles.kicker}>RECOMMENDED</Text>
          <View style={{ marginTop: 20, gap: 32 }}>
            {recs.map((c) => (
              <View key={c.name}>
                <Text style={{ fontFamily: FONT.serifMed, color: C.ink, fontSize: 18 }}>
                  {label(c.name)}
                </Text>
                <View style={{ marginTop: 8 }}>
                  {c.products.slice(0, 3).map((p, i) => (
                    <ProductRow key={i} product={p} />
                  ))}
                </View>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* routine */}
      {(routine.am?.length || routine.pm?.length) ? (
        <View style={{ marginTop: 56 }}>
          <Text style={styles.kicker}>YOUR ROUTINE</Text>
          <View style={[styles.card, { marginTop: 20, flexDirection: "row", gap: 28, padding: 24 }]}>
            <RoutineColumn title="MORNING" steps={routine.am || []} />
            <RoutineColumn title="EVENING" steps={routine.pm || []} />
          </View>
        </View>
      ) : null}

      {/* disclaimer */}
      <Text
        style={{
          fontFamily: FONT.sans,
          color: C.faint,
          fontSize: 11.5,
          lineHeight: 18,
          marginTop: 48,
        }}
      >
        Cosmetic and informational only — not medical advice. See a dermatologist
        for any skin condition or concern.
      </Text>

      <View style={{ marginTop: 40, alignItems: "center" }}>
        <GhostButton label="Scan again" onPress={onRescan} />
      </View>
    </ScrollView>
  );
}

/* ---- styles --------------------------------------------------------- */
const styles = StyleSheet.create({
  screen: { flex: 1, paddingHorizontal: 24 },
  center: { alignItems: "center", justifyContent: "center" },
  kicker: {
    fontFamily: FONT.sans,
    color: C.faint,
    fontSize: 11,
    letterSpacing: 2.4,
  },
  card: {
    backgroundColor: C.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: C.line,
    padding: 20,
  },
  viewport: {
    width: "100%",
    aspectRatio: 3 / 4,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: C.line,
    backgroundColor: C.viewport,
    overflow: "hidden",
  },
  calmRow: {
    marginTop: 16,
    borderRadius: 18,
    backgroundColor: C.sageSoft,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
});

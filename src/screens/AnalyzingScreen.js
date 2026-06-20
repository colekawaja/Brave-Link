import React, { useEffect, useRef, useState } from "react";
import { Animated, Easing, View } from "react-native";
import Svg, { Defs, LinearGradient, Stop, Circle } from "react-native-svg";
import { colors, space } from "../theme/tokens";
import { Serif } from "../components/Type";
import Aura from "../components/Aura";

const LINES = [
  "Reading the light on your skin…",
  "Looking at tone and texture…",
  "Noticing where skin is calm…",
  "Composing your routine…",
];

/* Two concentric arcs sweeping at different speeds — calm, indeterminate. */
export default function AnalyzingScreen() {
  const [i, setI] = useState(0);
  const spinA = useRef(new Animated.Value(0)).current;
  const spinB = useRef(new Animated.Value(0)).current;
  const fade = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const loop = (val, dur, dir = 1) =>
      Animated.loop(
        Animated.timing(val, {
          toValue: dir,
          duration: dur,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      );
    loop(spinA, 1500, 1).start();
    loop(spinB, 2600, 1).start();
  }, [spinA, spinB]);

  useEffect(() => {
    const id = setInterval(() => {
      Animated.sequence([
        Animated.timing(fade, { toValue: 0, duration: 360, useNativeDriver: true }),
        Animated.timing(fade, { toValue: 1, duration: 460, useNativeDriver: true }),
      ]).start();
      setTimeout(() => setI((v) => (v + 1) % LINES.length), 360);
    }, 2300);
    return () => clearInterval(id);
  }, [fade]);

  const size = 96;
  const rA = 42;
  const rB = 30;
  const cA = 2 * Math.PI * rA;
  const cB = 2 * Math.PI * rB;
  const rotA = spinA.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "360deg"] });
  const rotB = spinB.interpolate({ inputRange: [0, 1], outputRange: ["360deg", "0deg"] });

  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: space.xxl }}>
      <View style={{ position: "absolute" }} pointerEvents="none">
        <Aura size={300} color="#8FA982" opacity={0.35} id="analyzeAura" />
      </View>

      <View style={{ width: size, height: size, alignItems: "center", justifyContent: "center" }}>
        <Animated.View style={{ position: "absolute", transform: [{ rotate: rotA }] }}>
          <Svg width={size} height={size}>
            <Defs>
              <LinearGradient id="arcA" x1="0" y1="0" x2="1" y2="1">
                <Stop offset="0%" stopColor={colors.sage} stopOpacity={0} />
                <Stop offset="100%" stopColor={colors.sage} stopOpacity={1} />
              </LinearGradient>
            </Defs>
            <Circle
              cx={size / 2}
              cy={size / 2}
              r={rA}
              fill="none"
              stroke="url(#arcA)"
              strokeWidth={3}
              strokeLinecap="round"
              strokeDasharray={`${cA * 0.32} ${cA}`}
            />
          </Svg>
        </Animated.View>
        <Animated.View style={{ position: "absolute", transform: [{ rotate: rotB }] }}>
          <Svg width={size} height={size}>
            <Circle
              cx={size / 2}
              cy={size / 2}
              r={rB}
              fill="none"
              stroke={colors.line}
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeDasharray={`${cB * 0.22} ${cB}`}
            />
          </Svg>
        </Animated.View>
      </View>

      <Animated.View style={{ opacity: fade, marginTop: space.h1 }}>
        <Serif style={{ textAlign: "center", color: colors.ink }}>{LINES[i]}</Serif>
      </Animated.View>
    </View>
  );
}

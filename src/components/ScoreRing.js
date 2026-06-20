import React, { useEffect, useRef, useState } from "react";
import { Animated, View } from "react-native";
import Svg, { Defs, LinearGradient, Stop, Circle } from "react-native-svg";
import { FONT } from "../theme/fonts";
import { colors, motion } from "../theme/tokens";
import { clamp, scoreGradient, scoreGlow } from "../lib/format";
import useReducedMotion from "../lib/useReducedMotion";
import Aura from "./Aura";

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

/* The hero: a gradient ring that fills and counts up over a soft glow. */
export default function ScoreRing({ value, size = 248, compact = false }) {
  const stroke = compact ? 9 : 12;
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const target = clamp(value, 0, 100);
  const numSize = compact ? Math.round(size * 0.34) : 80;

  const reduced = useReducedMotion();
  const progress = useRef(new Animated.Value(0)).current;
  const intro = useRef(new Animated.Value(0)).current;
  const [shown, setShown] = useState(0);

  useEffect(() => {
    const id = progress.addListener(({ value: v }) => setShown(Math.round(v * target)));
    if (reduced) {
      intro.setValue(1);
      progress.setValue(1);
      return () => progress.removeListener(id);
    }
    Animated.timing(intro, {
      toValue: 1,
      duration: 520,
      easing: motion.ease,
      useNativeDriver: true,
    }).start();
    Animated.timing(progress, {
      toValue: 1,
      duration: 1300,
      delay: 250,
      easing: motion.ease,
      useNativeDriver: false,
    }).start();
    return () => progress.removeListener(id);
  }, [progress, intro, target, reduced]);

  const introScale = intro.interpolate({ inputRange: [0, 1], outputRange: [0.94, 1] });

  const dashoffset = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [circ, circ * (1 - target / 100)],
  });

  const grad = scoreGradient(target);

  return (
    <Animated.View
      style={{
        width: size,
        height: size,
        alignItems: "center",
        justifyContent: "center",
        opacity: intro,
        transform: [{ scale: introScale }],
      }}
    >
      <View style={{ position: "absolute" }}>
        <Aura size={size + 96} color={scoreGlow(target)} opacity={compact ? 0.35 : 0.45} />
      </View>

      <Svg width={size} height={size} style={{ transform: [{ rotate: "-90deg" }] }}>
        <Defs>
          <LinearGradient id="ringGrad" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0%" stopColor={grad.from} />
            <Stop offset="100%" stopColor={grad.to} />
          </LinearGradient>
        </Defs>
        <Circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={colors.lineSoft} strokeWidth={stroke} />
        <Circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={colors.line} strokeWidth={stroke} opacity={0.6} />
        <AnimatedCircle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="url(#ringGrad)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={dashoffset}
        />
      </Svg>

      <View style={{ position: "absolute", alignItems: "center" }}>
        <Animated.Text
          style={{
            fontFamily: FONT.serif,
            color: colors.ink,
            fontSize: numSize,
            lineHeight: numSize + 4,
            letterSpacing: -1,
          }}
        >
          {shown}
        </Animated.Text>
        <Animated.Text
          style={{
            fontFamily: FONT.sansMed,
            color: colors.ink3,
            fontSize: compact ? 9.5 : 11,
            letterSpacing: compact ? 2 : 2.8,
            marginTop: 4,
          }}
        >
          SKIN CLARITY
        </Animated.Text>
      </View>
    </Animated.View>
  );
}

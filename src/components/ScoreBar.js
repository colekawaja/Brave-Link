import React, { useEffect, useRef } from "react";
import { Animated } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { colors, motion } from "../theme/tokens";
import { clamp, scoreGradient } from "../lib/format";

/* A slim track with a gradient fill that eases out to its value. */
export default function ScoreBar({ value }) {
  const a = useRef(new Animated.Value(0)).current;
  const v = clamp(value, 0, 100);
  const grad = scoreGradient(v);

  useEffect(() => {
    Animated.timing(a, {
      toValue: v,
      duration: 1000,
      delay: 160,
      easing: motion.ease,
      useNativeDriver: false,
    }).start();
  }, [a, v]);

  const width = a.interpolate({ inputRange: [0, 100], outputRange: ["0%", "100%"] });

  return (
    <Animated.View
      style={{
        height: 5,
        borderRadius: 999,
        backgroundColor: colors.lineSoft,
        overflow: "hidden",
      }}
    >
      <Animated.View style={{ width, height: 5, borderRadius: 999, overflow: "hidden" }}>
        <LinearGradient
          colors={[grad.from, grad.to]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{ flex: 1 }}
        />
      </Animated.View>
    </Animated.View>
  );
}

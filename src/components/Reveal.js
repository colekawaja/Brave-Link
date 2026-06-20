import React, { useEffect, useRef } from "react";
import { Animated } from "react-native";
import { motion } from "../theme/tokens";

/* Choreographed entrance: fade + a small rise, with a stagger delay. */
export default function Reveal({
  delay = 0,
  distance = 12,
  duration = motion.duration.base,
  style,
  children,
}) {
  const t = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(t, {
      toValue: 1,
      duration,
      delay,
      easing: motion.ease,
      useNativeDriver: true,
    }).start();
  }, [t, delay, duration]);

  return (
    <Animated.View
      style={[
        style,
        {
          opacity: t,
          transform: [
            {
              translateY: t.interpolate({
                inputRange: [0, 1],
                outputRange: [distance, 0],
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

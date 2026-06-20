import React, { useEffect, useRef } from "react";
import { Animated } from "react-native";
import { motion } from "../theme/tokens";
import useReducedMotion from "../lib/useReducedMotion";

/* Choreographed entrance: fade + a small rise, with a stagger delay.
 * Respects the OS "Reduce Motion" setting. */
export default function Reveal({
  delay = 0,
  distance = 12,
  duration = motion.duration.base,
  style,
  children,
}) {
  const reduced = useReducedMotion();
  const t = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (reduced) {
      t.setValue(1);
      return;
    }
    const anim = Animated.timing(t, {
      toValue: 1,
      duration,
      delay,
      easing: motion.ease,
      useNativeDriver: true,
    });
    anim.start();
    return () => anim.stop();
  }, [t, delay, duration, reduced]);

  return (
    <Animated.View
      style={[
        style,
        {
          opacity: t,
          transform: [
            { translateY: t.interpolate({ inputRange: [0, 1], outputRange: [distance, 0] }) },
          ],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
}

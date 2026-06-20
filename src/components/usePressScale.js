import { useRef } from "react";
import { Animated } from "react-native";

/* A gentle spring scale for pressable surfaces (cards, rows). */
export default function usePressScale(to = 0.985) {
  const scale = useRef(new Animated.Value(1)).current;
  const onPressIn = () =>
    Animated.spring(scale, { toValue: to, useNativeDriver: true, speed: 40, bounciness: 0 }).start();
  const onPressOut = () =>
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 28, bounciness: 6 }).start();
  return { scale, onPressIn, onPressOut };
}

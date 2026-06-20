import React, { useRef, useState } from "react";
import {
  Animated,
  LayoutAnimation,
  Platform,
  Pressable,
  UIManager,
  View,
} from "react-native";
import { colors, radius, shadow, space } from "../theme/tokens";
import { Heading, Small } from "./Type";
import { Caret } from "./icons";
import { tapLight } from "../lib/haptics";
import usePressScale from "./usePressScale";

if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const expand = {
  duration: 240,
  create: { type: "easeInEaseOut", property: "opacity" },
  update: { type: "easeInEaseOut" },
  delete: { type: "easeInEaseOut", property: "opacity" },
};

/* A tappable card that expands to reveal its children. */
export default function Collapsible({ title, accent, meta, defaultOpen = false, children }) {
  const [open, setOpen] = useState(defaultOpen);
  const rot = useRef(new Animated.Value(defaultOpen ? 1 : 0)).current;
  const { scale, onPressIn, onPressOut } = usePressScale(0.99);

  const toggle = () => {
    tapLight();
    LayoutAnimation.configureNext(expand);
    Animated.timing(rot, {
      toValue: open ? 0 : 1,
      duration: 220,
      useNativeDriver: true,
    }).start();
    setOpen((o) => !o);
  };

  const spin = rot.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "180deg"] });

  return (
    <Animated.View
      style={[
        {
          backgroundColor: colors.surface,
          borderRadius: radius.card,
          borderWidth: 1,
          borderColor: colors.line,
          overflow: "hidden",
          transform: [{ scale }],
        },
        shadow.card,
      ]}
    >
      <Pressable
        onPress={toggle}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        style={({ pressed }) => ({
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: space.xl,
          paddingVertical: space.lg,
          backgroundColor: pressed ? colors.surfaceAlt : "transparent",
        })}
      >
        {accent ? (
          <View
            style={{
              width: 8,
              height: 8,
              borderRadius: 4,
              backgroundColor: accent,
              marginRight: 10,
            }}
          />
        ) : null}
        <Heading style={{ flex: 1, fontSize: 18 }}>{title}</Heading>
        {meta ? <Small style={{ color: colors.ink3, marginRight: 8 }}>{meta}</Small> : null}
        <Animated.View style={{ transform: [{ rotate: spin }] }}>
          <Caret />
        </Animated.View>
      </Pressable>

      {open && (
        <View style={{ paddingHorizontal: space.xl, paddingBottom: space.lg }}>{children}</View>
      )}
    </Animated.View>
  );
}

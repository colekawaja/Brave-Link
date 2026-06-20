import React, { useRef, useState } from "react";
import { Animated, LayoutAnimation, Linking, Pressable, View } from "react-native";
import { FONT } from "../theme/fonts";
import { colors, radius, shadow, space } from "../theme/tokens";
import { Body, Small, Tiny } from "./Type";
import { Caret } from "./icons";
import { tapLight } from "../lib/haptics";

/* A bold statistic with a tap-to-expand explanation + source. */
export default function ScienceCard({ fact, defaultOpen = false, tint = false }) {
  const [open, setOpen] = useState(defaultOpen);
  const rot = useRef(new Animated.Value(defaultOpen ? 1 : 0)).current;

  const toggle = () => {
    tapLight();
    LayoutAnimation.configureNext(LayoutAnimation.create(230, "easeInEaseOut", "opacity"));
    Animated.timing(rot, { toValue: open ? 0 : 1, duration: 210, useNativeDriver: true }).start();
    setOpen((o) => !o);
  };
  const spin = rot.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "180deg"] });

  return (
    <View
      style={[
        {
          backgroundColor: tint ? colors.sageSoft : colors.surface,
          borderRadius: radius.card,
          borderWidth: 1,
          borderColor: tint ? "transparent" : colors.line,
          overflow: "hidden",
        },
        !tint && shadow.card,
      ]}
    >
      <Pressable onPress={toggle} style={{ padding: space.xl }}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Body
            style={{
              fontFamily: FONT.serif,
              color: colors.sageDeep,
              fontSize: 40,
              lineHeight: 42,
              letterSpacing: -0.5,
            }}
          >
            {fact.stat}
          </Body>
          <Body style={{ flex: 1, color: colors.ink, fontSize: 15, lineHeight: 21, marginLeft: space.lg }}>
            {fact.headline}
          </Body>
          <Animated.View style={{ transform: [{ rotate: spin }], marginLeft: 8 }}>
            <Caret />
          </Animated.View>
        </View>

        {open && (
          <View style={{ marginTop: space.lg }}>
            <Small style={{ color: colors.ink2, lineHeight: 22 }}>{fact.detail}</Small>
            {fact.url ? (
              <Pressable
                onPress={() => Linking.openURL(fact.url).catch(() => {})}
                style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1, marginTop: 10 })}
              >
                <Tiny style={{ color: colors.sageDeep, fontFamily: FONT.sansMed }}>{fact.source} ↗</Tiny>
              </Pressable>
            ) : (
              <Tiny style={{ color: colors.ink3, marginTop: 10 }}>{fact.source}</Tiny>
            )}
          </View>
        )}
      </Pressable>
    </View>
  );
}

import React, { useRef, useState } from "react";
import { Animated, LayoutAnimation, Linking, Pressable, View } from "react-native";
import { FONT } from "../theme/fonts";
import { colors, radius, space } from "../theme/tokens";
import { Body, Small, Tiny } from "./Type";
import { Caret, Sparkle } from "./icons";
import { evidenceFor } from "../lib/evidence";

function EvidenceNote({ evidence }) {
  const [open, setOpen] = useState(false);
  const rot = useRef(new Animated.Value(0)).current;

  const toggle = () => {
    LayoutAnimation.configureNext(LayoutAnimation.create(220, "easeInEaseOut", "opacity"));
    Animated.timing(rot, { toValue: open ? 0 : 1, duration: 200, useNativeDriver: true }).start();
    setOpen((o) => !o);
  };
  const spin = rot.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "180deg"] });

  return (
    <View style={{ marginTop: 10 }}>
      <Pressable
        onPress={toggle}
        style={({ pressed }) => ({
          flexDirection: "row",
          alignItems: "center",
          gap: 6,
          alignSelf: "flex-start",
          opacity: pressed ? 0.6 : 1,
        })}
      >
        <Sparkle size={13} color={colors.sage} />
        <Small style={{ fontFamily: FONT.sansMed, color: colors.sage, fontSize: 12.5 }}>
          The evidence
        </Small>
        <Animated.View style={{ transform: [{ rotate: spin }] }}>
          <Caret size={14} color={colors.sage} />
        </Animated.View>
      </Pressable>

      {open && (
        <View
          style={{
            marginTop: 10,
            backgroundColor: colors.sageSoft,
            borderRadius: radius.card - 6,
            padding: space.lg,
          }}
        >
          <View
            style={{
              alignSelf: "flex-start",
              backgroundColor: colors.white,
              borderRadius: radius.chip,
              paddingHorizontal: 10,
              paddingVertical: 4,
            }}
          >
            <Tiny style={{ fontFamily: FONT.sansSemi, color: colors.sageDeep, letterSpacing: 0.3 }}>
              {evidence.stat}
            </Tiny>
          </View>
          <Small style={{ color: colors.ink, marginTop: 10, lineHeight: 21 }}>{evidence.claim}</Small>
          <Pressable
            onPress={() => Linking.openURL(evidence.url).catch(() => {})}
            style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1, marginTop: 10 })}
          >
            <Tiny style={{ color: colors.sageDeep, fontFamily: FONT.sansMed }}>
              {evidence.source} ↗
            </Tiny>
          </Pressable>
        </View>
      )}
    </View>
  );
}

export default function ProductRow({ product, first }) {
  const evidence = evidenceFor(product);
  return (
    <View
      style={{
        paddingVertical: space.lg,
        borderTopWidth: first ? 0 : 1,
        borderTopColor: colors.lineSoft,
      }}
    >
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", gap: space.md }}>
        <Body style={{ flex: 1, fontFamily: FONT.sansSemi, color: colors.ink, fontSize: 15 }}>
          {product.example}
        </Body>
        <View
          style={{
            backgroundColor: colors.surfaceAlt,
            borderRadius: radius.chip,
            paddingHorizontal: 9,
            paddingVertical: 4,
          }}
        >
          <Tiny style={{ color: colors.ink2, fontFamily: FONT.sansMed }}>{product.ingredient}</Tiny>
        </View>
      </View>
      <Small style={{ marginTop: 5, color: colors.ink2 }}>
        {product.type} — {product.why}
      </Small>
      {evidence && <EvidenceNote evidence={evidence} />}
    </View>
  );
}

import React from "react";
import { View } from "react-native";
import { colors, radius, space } from "../theme/tokens";
import { Title, Body } from "../components/Type";
import { PrimaryButton } from "../components/Button";
import { Moon } from "../components/icons";
import Reveal from "../components/Reveal";

/* Shown when the once-a-day scan has already been used. */
export default function LimitScreen({ onClose }) {
  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: space.xxl }}>
      <Reveal style={{ alignItems: "center" }}>
        <View
          style={{
            width: 64,
            height: 64,
            borderRadius: 32,
            backgroundColor: colors.sageSoft,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Moon size={26} />
        </View>
        <Title style={{ textAlign: "center", marginTop: space.xl }}>That's your scan for today</Title>
        <Body style={{ textAlign: "center", color: colors.ink2, marginTop: space.lg, maxWidth: 320 }}>
          Skin changes slowly, so Clarity gives you one scan a day — it keeps your
          progress meaningful and your routine consistent. Come back tomorrow for
          your next read.
        </Body>
        <View style={{ marginTop: space.h1 }}>
          <PrimaryButton label="Back to dashboard" onPress={onClose} />
        </View>
      </Reveal>
    </View>
  );
}

import React from "react";
import { View } from "react-native";
import { colors, space } from "../theme/tokens";
import { Title, Body } from "../components/Type";
import { PrimaryButton } from "../components/Button";
import Reveal from "../components/Reveal";

export default function ErrorScreen({ onRetry }) {
  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: space.xxl }}>
      <Reveal style={{ alignItems: "center" }}>
        <Title>Let's retake that</Title>
        <Body style={{ textAlign: "center", maxWidth: 300, marginTop: space.lg, color: colors.ink2 }}>
          Try softer, even lighting — face a window and keep your whole face in
          frame.
        </Body>
        <View style={{ marginTop: space.h1 }}>
          <PrimaryButton label="Try again" onPress={onRetry} />
        </View>
      </Reveal>
    </View>
  );
}

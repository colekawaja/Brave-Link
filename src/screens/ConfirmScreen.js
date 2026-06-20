import React from "react";
import { Image, StyleSheet, View } from "react-native";
import { colors, radius, shadow, space } from "../theme/tokens";
import { Title, Body } from "../components/Type";
import { PrimaryButton, TextLink, IconButton } from "../components/Button";
import { ChevronLeft } from "../components/icons";
import Reveal from "../components/Reveal";

/* A deliberate "use this / retake" step so people don't analyze a bad shot. */
export default function ConfirmScreen({ image, onUse, onRetake }) {
  const uri = image ? `data:${image.mediaType};base64,${image.base64}` : null;

  return (
    <View style={{ flex: 1, paddingHorizontal: space.xxl }}>
      <View style={{ flexDirection: "row", alignItems: "center", height: 48 }}>
        <View style={{ marginLeft: -8 }}>
          <IconButton onPress={onRetake}>
            <ChevronLeft />
          </IconButton>
        </View>
      </View>

      <Reveal style={{ alignItems: "center", marginTop: space.sm }}>
        <Title>Looks good?</Title>
        <Body style={{ marginTop: space.sm, color: colors.ink2, textAlign: "center", maxWidth: 300 }}>
          Make sure your whole face is in frame and evenly lit.
        </Body>
      </Reveal>

      <Reveal delay={120} style={{ flex: 1, justifyContent: "center", marginVertical: space.xxl }}>
        <View style={[styles.viewport, shadow.lift]}>
          {uri ? (
            <Image source={{ uri }} style={StyleSheet.absoluteFill} resizeMode="cover" />
          ) : null}
        </View>
      </Reveal>

      <Reveal delay={220} style={{ alignItems: "center", gap: space.lg, paddingBottom: space.lg }}>
        <PrimaryButton label="Use this photo" full onPress={onUse} />
        <TextLink label="Retake" onPress={onRetake} />
      </Reveal>
    </View>
  );
}

const styles = StyleSheet.create({
  viewport: {
    width: "100%",
    aspectRatio: 3 / 4,
    borderRadius: radius.viewport,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.line,
    overflow: "hidden",
  },
});

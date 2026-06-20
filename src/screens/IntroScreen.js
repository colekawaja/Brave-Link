import React, { useEffect, useRef } from "react";
import { Animated, Easing, ScrollView, View } from "react-native";
import { colors, space } from "../theme/tokens";
import { Display, Body, Kicker, Tiny } from "../components/Type";
import { PrimaryButton, TextLink } from "../components/Button";
import { Sparkle } from "../components/icons";
import ScienceCard from "../components/ScienceCard";
import Reveal from "../components/Reveal";
import Aura from "../components/Aura";
import { SCIENCE } from "../lib/scienceFacts";
import { hasApiKey } from "../lib/anthropic";
import useReducedMotion from "../lib/useReducedMotion";

/* The front page — an editorial hero with one telling, citable statistic. */
export default function IntroScreen({ onStart, onPreview }) {
  const reduced = useReducedMotion();
  const breathe = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (reduced) {
      breathe.setValue(0.5);
      return;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(breathe, { toValue: 1, duration: 4200, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        Animated.timing(breathe, { toValue: 0, duration: 4200, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [breathe, reduced]);

  const scale = breathe.interpolate({ inputRange: [0, 1], outputRange: [1, 1.08] });
  const opacity = breathe.interpolate({ inputRange: [0, 1], outputRange: [0.7, 1] });

  return (
    <ScrollView
      contentContainerStyle={{ flexGrow: 1, justifyContent: "center", paddingHorizontal: space.xxl, paddingVertical: space.h1 }}
      showsVerticalScrollIndicator={false}
    >
      <Animated.View style={{ position: "absolute", top: "12%", alignSelf: "center", transform: [{ scale }], opacity }} pointerEvents="none">
        <Aura size={440} color="#8FA982" opacity={0.4} id="introAura" />
      </Animated.View>

      <Reveal delay={120} style={{ alignItems: "center" }}>
        <Kicker style={{ letterSpacing: 4 }}>CLARITY</Kicker>
      </Reveal>

      <Reveal delay={240} style={{ alignItems: "center", marginTop: space.h2 }}>
        <Display style={{ textAlign: "center" }}>A quiet read{"\n"}on your skin.</Display>
      </Reveal>

      <Reveal delay={360} style={{ alignItems: "center", marginTop: space.xl }}>
        <Body style={{ textAlign: "center", maxWidth: 300, color: colors.ink2 }}>
          One selfie. A clarity score, the areas worth focusing on, and a simple routine to get there.
        </Body>
      </Reveal>

      <Reveal delay={480} style={{ marginTop: space.h1 }}>
        <ScienceCard fact={SCIENCE[0]} tint />
      </Reveal>

      <Reveal delay={620} style={{ alignItems: "center", marginTop: space.h1 }}>
        <PrimaryButton label="Scan my skin" onPress={onStart} />
      </Reveal>

      {onPreview && (
        <Reveal delay={700} style={{ alignItems: "center", marginTop: space.lg }}>
          <TextLink label="Preview with sample data" icon={<Sparkle size={14} />} onPress={onPreview} />
        </Reveal>
      )}

      <Reveal delay={780} style={{ alignItems: "center", marginTop: space.xl }}>
        <Tiny style={{ textAlign: "center", maxWidth: 280 }}>
          Your photo is analyzed for this scan only and never stored.
        </Tiny>
      </Reveal>

      {__DEV__ && (
        <Reveal delay={860} style={{ alignItems: "center", marginTop: space.lg }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
            <View
              style={{
                width: 7,
                height: 7,
                borderRadius: 4,
                backgroundColor: hasApiKey ? colors.sage : colors.gold,
              }}
            />
            <Tiny style={{ color: colors.ink3 }}>
              {hasApiKey ? "API key connected" : "Demo mode — no API key"}
            </Tiny>
          </View>
        </Reveal>
      )}
    </ScrollView>
  );
}

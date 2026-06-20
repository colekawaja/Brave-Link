import React, { useEffect, useRef } from "react";
import { Animated, Easing, View } from "react-native";
import { colors, space } from "../theme/tokens";
import { Display, Body, Kicker, Tiny } from "../components/Type";
import { PrimaryButton } from "../components/Button";
import Reveal from "../components/Reveal";
import Aura from "../components/Aura";

/* A calm hero — a softly breathing aura behind an editorial headline. */
export default function IntroScreen({ onStart }) {
  const breathe = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(breathe, {
          toValue: 1,
          duration: 4200,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(breathe, {
          toValue: 0,
          duration: 4200,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [breathe]);

  const scale = breathe.interpolate({ inputRange: [0, 1], outputRange: [1, 1.08] });
  const opacity = breathe.interpolate({ inputRange: [0, 1], outputRange: [0.75, 1] });

  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: space.xxl }}>
      <Animated.View
        style={{ position: "absolute", top: "18%", transform: [{ scale }], opacity }}
        pointerEvents="none"
      >
        <Aura size={460} color="#8FA982" opacity={0.4} id="introAura" />
      </Animated.View>

      <Reveal delay={120} style={{ alignItems: "center" }}>
        <Kicker style={{ letterSpacing: 4 }}>CLARITY</Kicker>
      </Reveal>

      <Reveal delay={240} style={{ alignItems: "center", marginTop: space.h2 }}>
        <Display style={{ textAlign: "center" }}>A quiet read{"\n"}on your skin.</Display>
      </Reveal>

      <Reveal delay={360} style={{ alignItems: "center", marginTop: space.xxl }}>
        <Body style={{ textAlign: "center", maxWidth: 300, color: colors.ink2 }}>
          One selfie. A clarity score, the areas worth focusing on, and a simple
          routine to get there.
        </Body>
      </Reveal>

      <Reveal delay={520} style={{ marginTop: space.giant }}>
        <PrimaryButton label="Scan my skin" onPress={onStart} />
      </Reveal>

      <Reveal delay={680} style={{ alignItems: "center", marginTop: space.xxl }}>
        <Tiny style={{ textAlign: "center", maxWidth: 280 }}>
          Your photo is analyzed for this scan only and never stored.
        </Tiny>
      </Reveal>
    </View>
  );
}

import React from "react";
import { View } from "react-native";
import { colors, radius, shadow, space } from "../theme/tokens";
import { FONT } from "../theme/fonts";
import { Kicker, Title, Body, Small, Tiny } from "../components/Type";
import { ApplePayButton, TextLink } from "../components/Button";
import { Check } from "../components/icons";
import Reveal from "../components/Reveal";

const BENEFITS = [
  "Your personalized, evidence-based routine",
  "Every concern scored, explained and tracked",
  "Weekly re-scans to watch your skin improve",
];

/* Shown once the scan is ready — gates the results behind a quick purchase. */
export default function PaywallScreen({ onPay, onCancel }) {
  return (
    <View style={{ flex: 1, justifyContent: "center", paddingHorizontal: space.xxl }}>
      <Reveal style={{ alignItems: "center" }}>
        <Kicker style={{ letterSpacing: 3 }}>YOUR RESULTS ARE READY</Kicker>
        <Title style={{ textAlign: "center", marginTop: space.md }}>
          Unlock your full{"\n"}skin analysis
        </Title>
      </Reveal>

      <Reveal delay={140}>
        <View
          style={[
            {
              marginTop: space.h1,
              backgroundColor: colors.surface,
              borderRadius: radius.card,
              borderWidth: 1,
              borderColor: colors.line,
              padding: space.xxl,
            },
            shadow.card,
          ]}
        >
          <View style={{ flexDirection: "row", alignItems: "baseline", justifyContent: "center", gap: 6 }}>
            <Body style={{ fontFamily: FONT.serif, color: colors.ink, fontSize: 52, lineHeight: 56 }}>$5</Body>
            <Body style={{ color: colors.ink3, fontSize: 16 }}>/ week</Body>
          </View>

          <View style={{ marginTop: space.xl, gap: space.md }}>
            {BENEFITS.map((b) => (
              <View key={b} style={{ flexDirection: "row", alignItems: "flex-start", gap: 10 }}>
                <View
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: 11,
                    backgroundColor: colors.sageSoft,
                    alignItems: "center",
                    justifyContent: "center",
                    marginTop: 1,
                  }}
                >
                  <Check size={14} />
                </View>
                <Body style={{ flex: 1, color: colors.ink, fontSize: 14.5 }}>{b}</Body>
              </View>
            ))}
          </View>

          <View style={{ marginTop: space.xl }}>
            <ApplePayButton full onPress={onPay} />
          </View>

          <Tiny style={{ textAlign: "center", marginTop: space.md }}>
            Cancel anytime · sandbox demo — no real charge
          </Tiny>
        </View>
      </Reveal>

      <Reveal delay={260} style={{ alignItems: "center", marginTop: space.xl }}>
        <TextLink label="Maybe later" onPress={onCancel} />
      </Reveal>
    </View>
  );
}

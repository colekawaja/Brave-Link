import React from "react";
import { View } from "react-native";
import { FONT } from "../theme/fonts";
import { colors, radius, shadow, space } from "../theme/tokens";
import { Kicker, Body } from "./Type";
import { Sun, Moon } from "./icons";
import Reveal from "./Reveal";

function Column({ icon, title, steps, base }) {
  return (
    <View style={{ flex: 1 }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 7 }}>
        {icon}
        <Kicker>{title}</Kicker>
      </View>
      <View style={{ marginTop: space.lg, gap: space.md }}>
        {steps.map((step, i) => (
          <Reveal key={i} delay={base + i * 60} distance={6}>
            <View style={{ flexDirection: "row", gap: 10 }}>
              <Body style={{ fontFamily: FONT.serif, color: colors.sage, width: 14 }}>{i + 1}</Body>
              <Body style={{ flex: 1, color: colors.ink, fontSize: 14, lineHeight: 21 }}>{step}</Body>
            </View>
          </Reveal>
        ))}
      </View>
    </View>
  );
}

export default function RoutineCard({ am = [], pm = [] }) {
  return (
    <View
      style={[
        {
          flexDirection: "row",
          gap: space.h2,
          backgroundColor: colors.surface,
          borderRadius: radius.card,
          borderWidth: 1,
          borderColor: colors.line,
          padding: space.xxl,
        },
        shadow.card,
      ]}
    >
      <Column icon={<Sun />} title="MORNING" steps={am} base={60} />
      <View style={{ width: 1, backgroundColor: colors.lineSoft }} />
      <Column icon={<Moon />} title="EVENING" steps={pm} base={120} />
    </View>
  );
}

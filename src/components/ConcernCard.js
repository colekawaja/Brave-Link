import React from "react";
import { View } from "react-native";
import { FONT } from "../theme/fonts";
import { colors, radius, shadow, space } from "../theme/tokens";
import { Heading, Body } from "./Type";
import { label, scoreColor } from "../lib/format";
import SeverityChip from "./Chip";
import ScoreBar from "./ScoreBar";
import Reveal from "./Reveal";

export default function ConcernCard({ concern, delay }) {
  return (
    <Reveal delay={delay}>
      <View
        style={[
          {
            backgroundColor: colors.surface,
            borderRadius: radius.card,
            borderWidth: 1,
            borderColor: colors.line,
            padding: space.xl,
          },
          shadow.card,
        ]}
      >
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
          <View style={{ flex: 1, paddingRight: space.md }}>
            <Heading>{label(concern.name)}</Heading>
            <View style={{ marginTop: space.sm, alignSelf: "flex-start" }}>
              <SeverityChip severity={concern.severity} score={concern.score} />
            </View>
          </View>
          <Body
            style={{
              fontFamily: FONT.serif,
              fontSize: 34,
              lineHeight: 36,
              color: scoreColor(concern.score),
              letterSpacing: -0.5,
            }}
          >
            {concern.score}
          </Body>
        </View>

        <View style={{ marginTop: space.lg }}>
          <ScoreBar value={concern.score} />
        </View>

        <Body style={{ marginTop: space.lg, color: colors.ink2 }}>{concern.note}</Body>
      </View>
    </Reveal>
  );
}

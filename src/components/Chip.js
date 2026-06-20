import React from "react";
import { View } from "react-native";
import { FONT } from "../theme/fonts";
import { colors, radius } from "../theme/tokens";
import { Small } from "./Type";
import { scoreColor } from "../lib/format";

/* Severity as a soft pill with a score-tinted dot. */
export default function SeverityChip({ severity, score }) {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        borderRadius: radius.chip,
        backgroundColor: colors.surfaceAlt,
        paddingHorizontal: 10,
        paddingVertical: 5,
      }}
    >
      <View
        style={{
          width: 6,
          height: 6,
          borderRadius: 3,
          backgroundColor: scoreColor(score),
        }}
      />
      <Small
        style={{
          fontFamily: FONT.sansMed,
          fontSize: 11.5,
          color: colors.ink2,
          textTransform: "capitalize",
        }}
      >
        {severity}
      </Small>
    </View>
  );
}

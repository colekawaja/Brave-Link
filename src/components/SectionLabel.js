import React from "react";
import { View } from "react-native";
import { colors } from "../theme/tokens";
import { Kicker } from "./Type";

export default function SectionLabel({ children }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
      <Kicker>{children}</Kicker>
      <View style={{ flex: 1, height: 1, backgroundColor: colors.line }} />
    </View>
  );
}

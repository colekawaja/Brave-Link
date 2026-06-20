import React from "react";
import Svg, { Defs, RadialGradient, Stop, Circle } from "react-native-svg";

/* A soft, score-tinted radial glow placed behind the hero. */
export default function Aura({ size = 320, color = "#7E9A74", opacity = 0.5, id = "aura" }) {
  return (
    <Svg width={size} height={size} pointerEvents="none">
      <Defs>
        <RadialGradient id={id} cx="50%" cy="50%" r="50%">
          <Stop offset="0%" stopColor={color} stopOpacity={opacity} />
          <Stop offset="55%" stopColor={color} stopOpacity={opacity * 0.35} />
          <Stop offset="100%" stopColor={color} stopOpacity={0} />
        </RadialGradient>
      </Defs>
      <Circle cx={size / 2} cy={size / 2} r={size / 2} fill={`url(#${id})`} />
    </Svg>
  );
}

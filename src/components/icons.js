import React from "react";
import Svg, { Path, Circle, Line, G } from "react-native-svg";
import { colors } from "../theme/tokens";

/* Fine-lined icons drawn to a 24px grid. */

export function ChevronLeft({ size = 22, color = colors.ink }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M15 5l-7 7 7 7"
        stroke={color}
        strokeWidth={1.6}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function ImageIcon({ size = 18, color = colors.ink2 }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M4 5h16v14H4zM4 16l4.5-4.5 3 3L16 10l4 4"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Circle cx="9" cy="9" r="1.4" fill={color} />
    </Svg>
  );
}

export function Sun({ size = 18, color = colors.gold }) {
  const rays = [];
  for (let i = 0; i < 8; i++) {
    const a = (i * Math.PI) / 4;
    const x1 = 12 + Math.cos(a) * 7.5;
    const y1 = 12 + Math.sin(a) * 7.5;
    const x2 = 12 + Math.cos(a) * 10;
    const y2 = 12 + Math.sin(a) * 10;
    rays.push(
      <Line
        key={i}
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
      />
    );
  }
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="4.4" stroke={color} strokeWidth={1.5} />
      <G>{rays}</G>
    </Svg>
  );
}

export function Moon({ size = 18, color = colors.sage }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M20 14.5A8 8 0 119.5 4a6.3 6.3 0 0010.5 10.5z"
        stroke={color}
        strokeWidth={1.5}
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function Sparkle({ size = 16, color = colors.sage }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 3c.6 4.2 1.8 5.4 6 6-4.2.6-5.4 1.8-6 6-.6-4.2-1.8-5.4-6-6 4.2-.6 5.4-1.8 6-6z"
        fill={color}
      />
    </Svg>
  );
}

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

export function Caret({ size = 18, color = colors.ink3 }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M6 9l6 6 6-6"
        stroke={color}
        strokeWidth={1.7}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function Check({ size = 16, color = colors.sage }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M5 12.5l4.2 4.2L19 7"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function AppleLogo({ size = 18, color = "#FFFFFF" }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M16.4 12.6c0-2.3 1.9-3.4 2-3.5-1.1-1.6-2.8-1.8-3.4-1.8-1.4-.1-2.8.9-3.5.9-.7 0-1.8-.8-3-.8-1.5 0-3 .9-3.8 2.3-1.6 2.8-.4 7 1.2 9.3.8 1.1 1.7 2.4 2.9 2.3 1.2 0 1.6-.7 3-.7 1.4 0 1.8.7 3 .7 1.2 0 2-1.1 2.8-2.2.9-1.3 1.2-2.5 1.3-2.6-.1 0-2.5-1-2.5-3.8z"
        fill={color}
      />
      <Path
        d="M14.3 5.5c.6-.8 1-1.8.9-2.9-.9 0-2 .6-2.6 1.4-.6.7-1.1 1.7-.9 2.8 1 .1 2-.5 2.6-1.3z"
        fill={color}
      />
    </Svg>
  );
}

export function GoogleG({ size = 18 }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48">
      <Path
        fill="#4285F4"
        d="M45.1 24.5c0-1.6-.1-2.8-.4-4H24v7.3h12.1c-.2 1.9-1.6 4.8-4.6 6.7l-.1.3 6.7 5.2.5.1c4.2-3.9 6-9.6 6-15.6z"
      />
      <Path
        fill="#34A853"
        d="M24 46c6.1 0 11.2-2 14.9-5.5l-7.1-5.5c-1.9 1.3-4.5 2.3-7.8 2.3-5.9 0-11-4-12.8-9.5l-.3.1-6.9 5.4-.1.3C7.5 41 15.1 46 24 46z"
      />
      <Path
        fill="#FBBC05"
        d="M11.2 27.8c-.5-1.4-.7-2.8-.7-4.3s.3-3 .7-4.3l-.1-.3-7-5.4-.2.1C2.5 16.4 2 20.1 2 23.5s.5 7.1 1.9 9.9l7.3-5.6z"
      />
      <Path
        fill="#EA4335"
        d="M24 9.7c4.2 0 7 1.8 8.6 3.3l6.3-6.1C35.1 3.2 30.1 1 24 1 15.1 1 7.5 6 3.9 13.6l7.3 5.6C13 13.7 18.1 9.7 24 9.7z"
      />
    </Svg>
  );
}

export function Gear({ size = 20, color = colors.ink2 }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="3" stroke={color} strokeWidth={1.5} />
      <Path
        d="M12 2.5v2M12 19.5v2M21.5 12h-2M4.5 12h-2M18.7 5.3l-1.4 1.4M6.7 17.3l-1.4 1.4M18.7 18.7l-1.4-1.4M6.7 6.7L5.3 5.3"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
      />
    </Svg>
  );
}

export function Arrow({ size = 14, color = colors.sage, down = false }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ transform: [{ rotate: down ? "180deg" : "0deg" }] }}>
      <Path
        d="M12 19V5M6 11l6-6 6 6"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

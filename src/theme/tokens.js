import { Easing } from "react-native";

/* ------------------------------------------------------------------ *
 * Design tokens — the single source of truth for Clarity's look.
 * A warm, editorial, clinical-luxe system. One accent, layered
 * surfaces, fine hairlines, deliberate motion.
 * ------------------------------------------------------------------ */

export const colors = {
  // canvas (a soft vertical warmth, applied as a gradient)
  canvasTop: "#F8F5EF",
  canvasBottom: "#EDE7DA",

  // ink
  ink: "#1A1714",
  ink2: "#5C544A",
  ink3: "#988F80",

  // structure
  line: "#E7E1D4",
  lineSoft: "#F0EBE0",
  surface: "#FCFBF7",
  surfaceAlt: "#F6F2EA",

  // accent
  sage: "#5F7257",
  sageDeep: "#4C5E45",
  sageSoft: "#E9EEE3",
  gold: "#C49A57",

  white: "#FFFFFF",
  shadow: "#3A3024",
};

export const space = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  h3: 28,
  h2: 32,
  h1: 40,
  giant: 56,
  hero: 72,
};

export const radius = {
  card: 22,
  pill: 999,
  viewport: 30,
  chip: 999,
};

// Soft, large-radius shadows — used sparingly, Apple-style.
export const shadow = {
  card: {
    shadowColor: colors.shadow,
    shadowOpacity: 0.07,
    shadowRadius: 28,
    shadowOffset: { width: 0, height: 14 },
    elevation: 3,
  },
  button: {
    shadowColor: "#171410",
    shadowOpacity: 0.2,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 12 },
    elevation: 7,
  },
  lift: {
    shadowColor: colors.shadow,
    shadowOpacity: 0.1,
    shadowRadius: 36,
    shadowOffset: { width: 0, height: 18 },
    elevation: 5,
  },
};

// Motion — one expressive ease-out for entrances, one symmetric curve.
export const motion = {
  ease: Easing.bezier(0.22, 1, 0.36, 1),
  easeInOut: Easing.bezier(0.65, 0, 0.35, 1),
  duration: { fast: 320, base: 560, slow: 820 },
  stagger: 80,
};

/* Pure helpers: clamping, the score color system, and label maps. */

export const clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, n));

const hsl = (h, s, l) =>
  `hsl(${Math.round(h)}, ${Math.round(s)}%, ${Math.round(l)}%)`;

// Hue glides amber/gold (low) → calm sage-green (high). Never red.
function scoreHue(value) {
  return 36 + (clamp(value, 0, 100) / 100) * 76; // 36 → 112
}

export function scoreColor(value) {
  const t = clamp(value, 0, 100) / 100;
  return hsl(scoreHue(value), 46 - t * 14, 48 - t * 6);
}

// Two stops for a soft gradient (lighter top → deeper bottom).
export function scoreGradient(value) {
  const t = clamp(value, 0, 100) / 100;
  const h = scoreHue(value);
  return {
    from: hsl(h + 8, 54 - t * 16, 60 - t * 6),
    to: hsl(h - 4, 48 - t * 12, 43 - t * 4),
  };
}

// A faint, score-tinted glow color (used behind the hero ring).
export function scoreGlow(value) {
  const h = scoreHue(value);
  return hsl(h, 48, 62);
}

const LABELS = { Pigmentation: "Dark spots", "Under-eye": "Under-eye" };
export const label = (name) => LABELS[name] || name;

export const SEVERITY_ORDER = {
  minimal: 0,
  mild: 1,
  moderate: 2,
  notable: 3,
};

# Clarity

A calm, minimal **skin-analysis phone app** (iOS + Android, built with Expo /
React Native). Take one selfie and Clarity returns a **Skin Clarity Score**,
per-concern sub-scores, a few reputable product suggestions, and a simple
AM/PM routine.

The headline metric is *visible skin health* — clarity, calmness, evenness,
texture. It is supportive and constructive, never a judgment of the person.

## How it works

1. **Intro** → **Capture** (native front camera with a soft oval guide, or pick
   a photo from the library) → **Analyzing** → **Results**.
2. On capture, the selfie is sent as a base64 image to the Anthropic Messages
   API (`claude-opus-4-8`) with a cosmetic skin-analysis prompt.
3. The model returns JSON: an overall clarity score, eight concern sub-scores
   with severity and notes, product recommendations, and a routine. Clarity
   renders it with a quiet, editorial layout — an animated score ring, staggered
   cards, and a single AM/PM routine.

All state lives in React state — the photo is analyzed for the scan only and is
never stored.

## Architecture

The app is organized as a small, layered codebase under `src/`:

```
App.js                 entry — gradient canvas, fonts, stage routing
src/
  theme/               design tokens (color, type, spacing, shadow, motion) + fonts
  lib/                 anthropic (prompt + request), format helpers, haptics
  hooks/               useAnalysis — owns the intro→capture→results flow
  components/          design system: Type, Button, ScoreRing, ScoreBar,
                       ConcernCard, RoutineCard, Chip, Aura, icons, Reveal
  screens/             Intro, Capture, Analyzing, Error, Results
```

Everything visual flows from `src/theme/tokens.js` — one accent, layered warm
surfaces, fine hairlines, soft shadows, and a single expressive motion curve.
The score color glides amber → sage-green (never red) and drives the hero ring,
the glow behind it, the concern bars, and the severity dots.

## Evidence-based recommendations

Each recommended product can be expanded to show **"The evidence"** — a concise,
cited finding from the dermatology literature (`src/lib/evidence.js`), matched to
the product's active ingredient. Sources are real peer-reviewed studies, e.g.:

- **Sunscreen** — daily users showed 24% less skin aging over 4.5 years
  ([Hughes et al., 2013, *Annals of Internal Medicine*](https://pubmed.ncbi.nlm.nih.gov/23732711/)).
- **Niacinamide** — 12-week double-blind reductions in pigmentation and fine
  lines ([Bissett et al., 2005](https://pubmed.ncbi.nlm.nih.gov/16029679/)).
- **Retinoids** — up to ~80% more dermal collagen across RCTs
  ([tretinoin meta-analysis](https://pmc.ncbi.nlm.nih.gov/articles/PMC12615114/)).
- **Vitamin C, azelaic acid, AHAs, salicylic/benzoyl** — see `evidence.js`.

Figures summarize published findings for a lay reader and are educational, not
personalized medical advice. Scoring is intentionally calibrated to be
conservative, so there are always concrete areas to improve on.

## Payment

After a scan completes, results are gated behind a paywall ($5 / week) with an
Apple Pay-style button (`src/screens/PaywallScreen.js`). In Expo Go the purchase
is **simulated** — real Apple Pay needs StoreKit / in-app purchase via a dev
build (e.g. RevenueCat or `expo-in-app-purchases`), which can't run in Expo Go.
Once "purchased," results unlock for the rest of the session.

## Run it

```bash
npm install
```

Then pick whichever is easiest — **none of these require Xcode**:

**On your phone (best — real camera).** Install **Expo Go** from the App Store /
Google Play, run `npx expo start`, and scan the QR code (phone and computer on
the same Wi-Fi). On a locked-down network, use `npx expo start --tunnel`.

**In your computer's browser (no phone needed).**

```bash
npx expo start --web
```

Opens at `http://localhost:8081`. The browser will ask for camera permission;
"Upload a photo instead" also works.

**In a simulator (requires Xcode or Android Studio).** Press `i` for the iOS
Simulator or `a` for an Android emulator. Note the iOS Simulator has no camera,
so use the upload option there.

### API key

On a device there is no artifact environment to inject credentials, so the
Anthropic key comes from an Expo public env var. Create a `.env` file:

```bash
echo "EXPO_PUBLIC_ANTHROPIC_API_KEY=sk-ant-..." > .env
npx expo start -c
```

> Note: calling the Anthropic API directly from the device embeds the key in
> the app. That's fine for a personal build or demo; for production, proxy the
> request through a small backend instead of shipping the key.

## Build a standalone app

Use [EAS Build](https://docs.expo.dev/build/introduction/):

```bash
npx eas build -p ios      # or -p android
```

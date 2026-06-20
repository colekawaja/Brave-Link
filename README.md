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

## The single-file app

The whole experience is one self-contained component: [`App.js`](App.js)
(default export, functional components + hooks, native primitives —
`expo-camera`, `react-native-svg`, native fonts via `@expo-google-fonts`). The
rest of the project is just the Expo scaffolding needed to run it.

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

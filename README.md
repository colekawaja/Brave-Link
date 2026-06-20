# Clarity

A calm, minimal skin-analysis web app. Take one selfie and Clarity returns a
**Skin Clarity Score**, per-concern sub-scores, a few reputable product
suggestions, and a simple AM/PM routine.

The headline metric is *visible skin health* — clarity, calmness, evenness,
texture. It is supportive and constructive, never a judgment of the person.

## How it works

1. **Intro** → **Capture** (front camera with a soft oval guide, or upload a
   photo) → **Analyzing** → **Results**.
2. On capture, the selfie is sent as a base64 image to the Anthropic Messages
   API (`claude-opus-4-8`) with a cosmetic skin-analysis prompt.
3. The model returns JSON: an overall clarity score, eight concern sub-scores
   with severity and notes, product recommendations, and a routine. Clarity
   renders it with a quiet, editorial layout.

All state lives in React memory — the photo is analyzed for the scan only and
is never stored.

## The single-file app

The whole experience is one self-contained component: [`src/App.jsx`](src/App.jsx)
(default export, functional components + hooks, Tailwind for layout). The rest
of the project is just the Vite scaffolding needed to run it.

## Run locally

```bash
npm install
npm run dev
```

The API call uses a keyless `fetch` to `api.anthropic.com`, matching the
artifact environment where auth is injected for you. To run the live analysis
during local development, provide a key:

```bash
echo "VITE_ANTHROPIC_API_KEY=sk-ant-..." > .env.local
npm run dev
```

When the env var is present, the app adds the `x-api-key`,
`anthropic-version`, and `anthropic-dangerous-direct-browser-access` headers.
Camera capture requires a secure context (`localhost` is fine).

## Build

```bash
npm run build && npm run preview
```

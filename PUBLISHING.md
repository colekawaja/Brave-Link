# Shipping Clarity to the App Store

The app is feature-complete and runs today in Expo Go / the browser with a
**simulated** payment + login and the API key read from `.env`. Those three
things must be swapped for production-grade equivalents before a public launch.
None of them are code-only — each needs an account you own. Here's the exact
order.

## 0. Prerequisites (accounts)
- **Apple Developer Program** — $99/year (required for the App Store + in-app purchases).
- **Expo / EAS account** — free tier is fine to start (for building a real app binary).
- A **RevenueCat** account — free up to substantial revenue (handles Apple/Google subscriptions).
- A **backend** for the API key — a single serverless function (Cloudflare Workers / Vercel / Supabase Edge Functions). Free tiers cover early usage.

## 1. Move the Anthropic key off the device (do this first)
Today the key is `EXPO_PUBLIC_ANTHROPIC_API_KEY`, which is **embedded in the app
bundle** — anyone could extract it from a shipped build. For production:
1. Stand up a tiny proxy endpoint (e.g. `POST /analyze`) that holds the key as a
   server secret and forwards the image to Anthropic.
2. Point `src/lib/anthropic.js` at that endpoint instead of `api.anthropic.com`,
   and drop the key/`x-api-key` header from the client.
3. Add basic auth (the user's account token) + rate limiting so only your app's
   signed-in users can call it.

## 2. Real accounts (login)
The current login stores an account locally on the device. For real, multi-device
accounts:
- **Google Sign-In:** `expo-auth-session` + a Google OAuth **client ID** (iOS +
  web). Swap the simulated `onSignIn` in `AccountScreen` for the real flow.
- **Email:** use a backend auth provider (Supabase Auth or Firebase Auth) for
  real accounts + optional verification. Wire it into `AppContext` in place of
  the local `signIn`.

## 3. Real payments (subscription)
Apple requires digital subscriptions to use **StoreKit / in-app purchase** — you
cannot use Stripe/Apple Pay for this. Easiest path is **RevenueCat**:
1. `npx expo install react-native-purchases` (this is a native module — it needs
   a **dev build**, not Expo Go; see step 4).
2. Create a `$5/week` auto-renewing subscription in **App Store Connect** and add
   it to RevenueCat.
3. Replace the simulated `onPay` in `PaywallScreen` with
   `Purchases.purchasePackage(...)`, and set `subscribe()` only after a verified
   purchase. Gate `subscribed` on RevenueCat's `customerInfo.entitlements`.

## 4. Build a real app (leave Expo Go)
Native modules (purchases, Google auth) don't run in Expo Go.
```bash
npm install -g eas-cli
eas login
eas build:configure
eas build --platform ios --profile preview   # installable test build (TestFlight)
```
Test the real purchase + login flows in **TestFlight**, then:
```bash
eas submit --platform ios
```
and fill out App Store Connect (screenshots, privacy, description) to go live.

## What already works without any of the above
- The full UX, camera/upload, analysis, results, dashboard, daily-scan limit,
  and the calendar — all functional in Expo Go / browser.
- With your own `.env` key, real analyses run end-to-end (for your own testing).

The simulated payment + login are intentionally kept so you can keep demoing in
Expo Go while the production accounts are set up.

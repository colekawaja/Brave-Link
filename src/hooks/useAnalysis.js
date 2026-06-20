import { useCallback, useRef, useState } from "react";
import { analyzeImage, hasApiKey } from "../lib/anthropic";
import { SAMPLE_RESULT } from "../lib/sampleResult";
import { notifySuccess } from "../lib/haptics";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/* Owns the flow: intro → capture → analyzing → [paywall] → results | error.
 * Falls back to sample data (demo mode) when no API key is configured, and
 * gates results behind a one-time purchase per session. */
export default function useAnalysis() {
  const [stage, setStage] = useState("intro");
  const [result, setResult] = useState(null);
  const [demo, setDemo] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const subRef = useRef(false);

  // Once a scan is ready, show results if subscribed, otherwise the paywall.
  const reveal = useCallback(() => {
    setStage(subRef.current ? "results" : "paywall");
  }, []);

  const purchase = useCallback(() => {
    subRef.current = true;
    setSubscribed(true);
    setStage("results");
    notifySuccess();
  }, []);

  const showSample = useCallback(
    async (delay = 1700) => {
      setStage("analyzing");
      await sleep(delay);
      setResult(SAMPLE_RESULT);
      setDemo(true);
      reveal();
    },
    [reveal]
  );

  // From the intro: jump straight to a sample, skipping the camera.
  const preview = useCallback(() => showSample(1500), [showSample]);

  const analyze = useCallback(
    async (base64, mediaType) => {
      if (!hasApiKey) {
        showSample();
        return;
      }
      setStage("analyzing");
      setDemo(false);
      try {
        const parsed = await analyzeImage(base64, mediaType);
        setResult(parsed);
        reveal();
      } catch {
        setStage("error");
      }
    },
    [reveal, showSample]
  );

  return { stage, setStage, result, demo, subscribed, analyze, preview, purchase };
}

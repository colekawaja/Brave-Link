import { useCallback, useState } from "react";
import { analyzeImage, hasApiKey } from "../lib/anthropic";
import { SAMPLE_RESULT } from "../lib/sampleResult";
import { notifySuccess } from "../lib/haptics";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/* Owns the flow: intro → capture → analyzing → results | error.
 * Falls back to sample data (demo mode) when no API key is configured,
 * and exposes preview() so the UI can be explored with no key at all. */
export default function useAnalysis() {
  const [stage, setStage] = useState("intro");
  const [result, setResult] = useState(null);
  const [demo, setDemo] = useState(false);

  const showSample = useCallback(async (delay = 1700) => {
    setStage("analyzing");
    await sleep(delay);
    setResult(SAMPLE_RESULT);
    setDemo(true);
    setStage("results");
    notifySuccess();
  }, []);

  // From the intro: jump straight to a sample, skipping the camera.
  const preview = useCallback(() => showSample(1500), [showSample]);

  const analyze = useCallback(
    async (base64, mediaType) => {
      if (!hasApiKey) {
        // No key — show the sample so the flow is still explorable.
        showSample();
        return;
      }
      setStage("analyzing");
      setDemo(false);
      try {
        const parsed = await analyzeImage(base64, mediaType);
        setResult(parsed);
        setStage("results");
        notifySuccess();
      } catch {
        setStage("error");
      }
    },
    [showSample]
  );

  return { stage, setStage, result, demo, analyze, preview, hasApiKey };
}

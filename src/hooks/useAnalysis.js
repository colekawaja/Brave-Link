import { useCallback, useState } from "react";
import { analyzeImage } from "../lib/anthropic";
import { notifySuccess } from "../lib/haptics";

/* Owns the flow: intro → capture → analyzing → results | error. */
export default function useAnalysis() {
  const [stage, setStage] = useState("intro"); // intro | capture | analyzing | error | results
  const [result, setResult] = useState(null);

  const analyze = useCallback(async (base64, mediaType) => {
    setStage("analyzing");
    try {
      const parsed = await analyzeImage(base64, mediaType);
      setResult(parsed);
      setStage("results");
      notifySuccess();
    } catch {
      setStage("error");
    }
  }, []);

  return { stage, setStage, result, analyze };
}

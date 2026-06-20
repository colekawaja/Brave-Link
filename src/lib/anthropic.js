/* The analysis pipeline: prompt, request, parse. */

export const MODEL = "claude-opus-4-8";

// On a device there is no artifact environment to inject auth, so the key
// comes from an Expo public env var.
const API_KEY = process.env.EXPO_PUBLIC_ANTHROPIC_API_KEY;

// Whether a real analysis is possible. When false, the app runs in demo mode.
export const hasApiKey = Boolean(API_KEY);

export const ANALYSIS_PROMPT = `You are a cosmetic skin-analysis assistant. Analyze ONLY the visible skin in this
selfie, for cosmetic skincare purposes (not medical diagnosis). Be encouraging and
constructive. Never comment on attractiveness, symmetry, age, weight, or facial
features unrelated to skin condition.

Return ONLY valid JSON (no markdown, no preamble) matching exactly this schema:
{
  "overallClarity": <int 0-100, higher = clearer, calmer, more even skin>,
  "summary": "<1 supportive sentence>",
  "concerns": [
    {
      "name": "<Breakouts|Redness|Texture|Pores|Pigmentation|Hydration|Under-eye|Oiliness>",
      "score": <int 0-100, higher = better>,
      "severity": "<minimal|mild|moderate|notable>",
      "note": "<one short, kind sentence>",
      "products": [
        { "type": "<e.g. Salicylic acid cleanser>",
          "example": "<reputable named product>",
          "ingredient": "<key active>",
          "why": "<6-10 words>" }
      ]
    }
  ],
  "routine": { "am": ["<step>", ...], "pm": ["<step>", ...] }
}

Rules: include all 8 categories in "concerns". For "minimal" severity, leave
"products" as an empty array. Always include SPF in the AM routine. If no clear
face/skin is visible or lighting is too poor to assess, return exactly:
{ "error": "retake" }`;

function buildHeaders() {
  const headers = { "Content-Type": "application/json" };
  if (API_KEY) {
    headers["x-api-key"] = API_KEY;
    headers["anthropic-version"] = "2023-06-01";
    // Allow the call to run from a browser preview; harmless on native.
    headers["anthropic-dangerous-direct-browser-access"] = "true";
  }
  return headers;
}

export async function analyzeImage(base64, mediaType) {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: buildHeaders(),
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 4096,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: { type: "base64", media_type: mediaType, data: base64 },
            },
            { type: "text", text: ANALYSIS_PROMPT },
          ],
        },
      ],
    }),
  });
  if (!res.ok) throw new Error("request failed");
  const data = await res.json();
  const textBlock = (data.content || []).find((b) => b.type === "text");
  let raw = (textBlock ? textBlock.text : "").trim();
  raw = raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
  const parsed = JSON.parse(raw);
  if (parsed.error === "retake" || typeof parsed.overallClarity !== "number") {
    throw new Error("retake");
  }
  return parsed;
}

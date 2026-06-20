import React, { useCallback, useEffect, useRef, useState } from "react";

/* ------------------------------------------------------------------ *
 * Clarity — a calm, minimal skin-analysis tool.
 * One selfie in, a Skin Clarity Score and a quiet routine out.
 * Single-file React, default export. Tailwind for layout; brand
 * colors live in inline styles so the palette stays exact and the
 * file stays self-contained.
 * ------------------------------------------------------------------ */

/* ---- palette -------------------------------------------------------- */
const C = {
  bg: "#F4F1EA", // warm bone
  surface: "#FBFAF4", // card
  ink: "#1F1C18", // near-black
  muted: "#6E665B", // soft brown-grey
  faint: "#9A9184", // tertiary text
  line: "#E5DFD2", // single hairline
  sage: "#76876C", // restrained accent
  sageSoft: "#EBEEE6",
};

const SERIF = "'Fraunces', Georgia, 'Times New Roman', serif";
const SANS = "'Inter', system-ui, -apple-system, sans-serif";

/* The vision model. Opus 4.8 — the most capable Opus-tier model. */
const MODEL = "claude-opus-4-8";

const ANALYSIS_PROMPT = `You are a cosmetic skin-analysis assistant. Analyze ONLY the visible skin in this
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

/* Friendlier display labels for a couple of category names. */
const LABELS = {
  Pigmentation: "Dark spots",
  "Under-eye": "Under-eye",
};
const label = (name) => LABELS[name] || name;

const SEVERITY_ORDER = { minimal: 0, mild: 1, moderate: 2, notable: 3 };

/* ---- small helpers -------------------------------------------------- */
const clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, n));

// Calm green (high) → warm amber (low). Never red.
function scoreColor(value) {
  const t = clamp(value, 0, 100) / 100;
  const hue = 38 + t * 72; // 38 amber → 110 sage-green
  const sat = 34 - t * 4;
  const light = 46 - t * 4;
  return `hsl(${hue.toFixed(0)} ${sat.toFixed(0)}% ${light.toFixed(0)}%)`;
}

const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

// Count a number up to `target` with gentle easing.
function useCountUp(target, duration = 1150, delay = 150) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    let raf;
    let start;
    const tick = (ts) => {
      if (start === undefined) start = ts;
      const elapsed = ts - start - delay;
      if (elapsed <= 0) {
        raf = requestAnimationFrame(tick);
        return;
      }
      const p = clamp(elapsed / duration, 0, 1);
      setValue(Math.round(easeOutCubic(p) * target));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration, delay]);
  return value;
}

/* ---- score ring (hero) --------------------------------------------- */
function ScoreRing({ value }) {
  const size = 232;
  const stroke = 10;
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const shown = useCountUp(value);
  const offset = circ * (1 - clamp(shown, 0, 100) / 100);
  const color = scoreColor(shown);

  return (
    <div
      className="relative mx-auto flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={C.line}
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          style={{ transition: "stroke 600ms ease" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span
          style={{
            fontFamily: SERIF,
            color: C.ink,
            fontSize: 72,
            lineHeight: 1,
            fontWeight: 500,
            letterSpacing: "-0.02em",
          }}
        >
          {shown}
        </span>
        <span
          className="mt-2 uppercase"
          style={{
            fontFamily: SANS,
            color: C.faint,
            fontSize: 11,
            letterSpacing: "0.22em",
          }}
        >
          Skin Clarity
        </span>
      </div>
    </div>
  );
}

/* ---- severity chip -------------------------------------------------- */
function SeverityChip({ severity }) {
  return (
    <span
      className="rounded-full px-2.5 py-1 capitalize"
      style={{
        fontFamily: SANS,
        fontSize: 11,
        letterSpacing: "0.02em",
        color: C.muted,
        background: C.sageSoft,
      }}
    >
      {severity}
    </span>
  );
}

/* ---- thin score bar ------------------------------------------------- */
function ScoreBar({ value }) {
  const [w, setW] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setW(clamp(value, 0, 100)), 80);
    return () => clearTimeout(t);
  }, [value]);
  return (
    <div
      className="h-1 w-full overflow-hidden rounded-full"
      style={{ background: C.line }}
    >
      <div
        className="h-full rounded-full"
        style={{
          width: `${w}%`,
          background: scoreColor(value),
          transition: "width 900ms cubic-bezier(0.22,1,0.36,1)",
        }}
      />
    </div>
  );
}

/* ---- concern card --------------------------------------------------- */
function ConcernCard({ concern, delay }) {
  return (
    <div
      className="clarity-rise rounded-2xl p-5"
      style={{
        background: C.surface,
        border: `1px solid ${C.line}`,
        animationDelay: `${delay}ms`,
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3
            style={{
              fontFamily: SERIF,
              color: C.ink,
              fontSize: 19,
              fontWeight: 500,
            }}
          >
            {label(concern.name)}
          </h3>
        </div>
        <div className="flex items-center gap-3">
          <SeverityChip severity={concern.severity} />
          <span
            style={{
              fontFamily: SERIF,
              color: scoreColor(concern.score),
              fontSize: 22,
              fontWeight: 500,
            }}
          >
            {concern.score}
          </span>
        </div>
      </div>
      <div className="mt-3">
        <ScoreBar value={concern.score} />
      </div>
      <p
        className="mt-3"
        style={{ fontFamily: SANS, color: C.muted, fontSize: 14, lineHeight: 1.6 }}
      >
        {concern.note}
      </p>
    </div>
  );
}

/* ---- product line --------------------------------------------------- */
function ProductRow({ product }) {
  return (
    <div className="py-3" style={{ borderTop: `1px solid ${C.line}` }}>
      <div className="flex items-baseline justify-between gap-3">
        <span
          style={{ fontFamily: SANS, color: C.ink, fontSize: 14, fontWeight: 500 }}
        >
          {product.example}
        </span>
        <span
          className="shrink-0"
          style={{ fontFamily: SANS, color: C.faint, fontSize: 12 }}
        >
          {product.ingredient}
        </span>
      </div>
      <p
        className="mt-1"
        style={{ fontFamily: SANS, color: C.muted, fontSize: 13, lineHeight: 1.55 }}
      >
        {product.type} — {product.why}
      </p>
    </div>
  );
}

/* ---- routine column ------------------------------------------------- */
function RoutineColumn({ title, steps }) {
  return (
    <div>
      <h4
        className="uppercase"
        style={{
          fontFamily: SANS,
          color: C.faint,
          fontSize: 11,
          letterSpacing: "0.22em",
        }}
      >
        {title}
      </h4>
      <ol className="mt-4 space-y-3">
        {steps.map((step, i) => (
          <li key={i} className="flex gap-3">
            <span
              style={{ fontFamily: SERIF, color: C.sage, fontSize: 14, width: 16 }}
            >
              {i + 1}
            </span>
            <span
              style={{
                fontFamily: SANS,
                color: C.ink,
                fontSize: 14,
                lineHeight: 1.5,
              }}
            >
              {step}
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}

/* ---- primary button ------------------------------------------------- */
function PrimaryButton({ children, onClick, style }) {
  return (
    <button
      onClick={onClick}
      className="rounded-full px-8 py-4 transition-opacity duration-200 hover:opacity-90 active:opacity-80"
      style={{
        fontFamily: SANS,
        fontSize: 15,
        fontWeight: 500,
        letterSpacing: "0.01em",
        color: C.bg,
        background: C.ink,
        ...style,
      }}
    >
      {children}
    </button>
  );
}

/* ---- section title -------------------------------------------------- */
function SectionTitle({ children }) {
  return (
    <h2
      className="uppercase"
      style={{
        fontFamily: SANS,
        color: C.faint,
        fontSize: 11,
        letterSpacing: "0.22em",
      }}
    >
      {children}
    </h2>
  );
}

/* ================================================================== *
 * App
 * ================================================================== */
export default function App() {
  // intro | capture | analyzing | results | error
  const [stage, setStage] = useState("intro");
  const [result, setResult] = useState(null);

  return (
    <div className="min-h-full w-full" style={{ background: C.bg }}>
      {/* self-contained motion */}
      <style>{`
        @keyframes clarityRise {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes clarityFade {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes claritySpin { to { transform: rotate(360deg); } }
        .clarity-rise { opacity: 0; animation: clarityRise 620ms cubic-bezier(0.22,1,0.36,1) forwards; }
        .clarity-fade { opacity: 0; animation: clarityFade 700ms ease forwards; }
        @media (prefers-reduced-motion: reduce) {
          .clarity-rise, .clarity-fade { animation-duration: 1ms; }
        }
      `}</style>

      <div className="mx-auto flex min-h-full w-full max-w-md flex-col px-6">
        {stage === "intro" && <Intro onStart={() => setStage("capture")} />}
        {stage === "capture" && (
          <Capture
            onResult={(r) => {
              setResult(r);
              setStage("results");
            }}
            onAnalyzing={() => setStage("analyzing")}
            onError={() => setStage("error")}
            stageIsAnalyzing={false}
          />
        )}
        {stage === "analyzing" && <Analyzing />}
        {stage === "error" && (
          <ErrorState onRetry={() => setStage("capture")} />
        )}
        {stage === "results" && result && (
          <Results result={result} onRescan={() => setStage("capture")} />
        )}
      </div>
    </div>
  );
}

/* ---- intro ---------------------------------------------------------- */
function Intro({ onStart }) {
  return (
    <div className="clarity-fade flex flex-1 flex-col items-center justify-center py-16 text-center">
      <span
        className="uppercase"
        style={{
          fontFamily: SANS,
          color: C.faint,
          fontSize: 11,
          letterSpacing: "0.34em",
        }}
      >
        Clarity
      </span>
      <h1
        className="mt-8"
        style={{
          fontFamily: SERIF,
          color: C.ink,
          fontSize: 42,
          lineHeight: 1.1,
          fontWeight: 400,
          letterSpacing: "-0.015em",
        }}
      >
        A quiet read on
        <br />
        your skin.
      </h1>
      <p
        className="mt-6 max-w-xs"
        style={{ fontFamily: SANS, color: C.muted, fontSize: 15, lineHeight: 1.65 }}
      >
        One selfie. A clarity score, the areas worth focusing on, and a simple
        routine to get there.
      </p>
      <div className="mt-12">
        <PrimaryButton onClick={onStart}>Scan my skin</PrimaryButton>
      </div>
      <p
        className="mt-6 max-w-xs"
        style={{ fontFamily: SANS, color: C.faint, fontSize: 12, lineHeight: 1.6 }}
      >
        Your photo is analyzed for this scan only and never stored.
      </p>
    </div>
  );
}

/* ---- capture -------------------------------------------------------- */
function Capture({ onResult, onAnalyzing, onError }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const fileRef = useRef(null);
  const [cameraReady, setCameraReady] = useState(false);
  const [cameraFailed, setCameraFailed] = useState(false);

  const stopStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function start() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user" },
          audio: false,
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play().catch(() => {});
        }
        setCameraReady(true);
      } catch {
        setCameraFailed(true);
      }
    }
    start();
    return () => {
      cancelled = true;
      stopStream();
    };
  }, [stopStream]);

  const analyze = useCallback(
    async (base64, mediaType) => {
      stopStream();
      onAnalyzing();
      try {
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
                    source: {
                      type: "base64",
                      media_type: mediaType,
                      data: base64,
                    },
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
        // strip code fences if present
        raw = raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
        const parsed = JSON.parse(raw);
        if (parsed.error === "retake" || typeof parsed.overallClarity !== "number") {
          onError();
          return;
        }
        onResult(parsed);
      } catch {
        onError();
      }
    },
    [onAnalyzing, onError, onResult, stopStream]
  );

  const capture = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;
    const w = video.videoWidth || 720;
    const h = video.videoHeight || 960;
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, w, h);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
    analyze(dataUrl.split(",")[1], "image/jpeg");
  }, [analyze]);

  const onFile = useCallback(
    (e) => {
      const file = e.target.files && e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        const url = String(reader.result || "");
        const match = url.match(/^data:(image\/[a-zA-Z+]+);base64,(.*)$/);
        if (!match) {
          onError();
          return;
        }
        analyze(match[2], match[1]);
      };
      reader.onerror = () => onError();
      reader.readAsDataURL(file);
    },
    [analyze, onError]
  );

  return (
    <div className="clarity-fade flex flex-1 flex-col py-12">
      <div className="text-center">
        <h2
          style={{
            fontFamily: SERIF,
            color: C.ink,
            fontSize: 26,
            fontWeight: 400,
            letterSpacing: "-0.01em",
          }}
        >
          Center your face
        </h2>
        <p
          className="mx-auto mt-3 max-w-xs"
          style={{ fontFamily: SANS, color: C.muted, fontSize: 14 }}
        >
          Face a window, no harsh shadows.
        </p>
      </div>

      {/* camera viewport with oval guide */}
      <div className="mt-8 flex flex-1 items-center justify-center">
        {!cameraFailed ? (
          <div
            className="relative w-full overflow-hidden rounded-3xl"
            style={{
              aspectRatio: "3 / 4",
              background: "#E9E4D8",
              border: `1px solid ${C.line}`,
            }}
          >
            <video
              ref={videoRef}
              playsInline
              muted
              className="h-full w-full object-cover"
              style={{ transform: "scaleX(-1)", opacity: cameraReady ? 1 : 0, transition: "opacity 500ms ease" }}
            />
            {/* soft oval guide */}
            <svg
              className="pointer-events-none absolute inset-0 h-full w-full"
              viewBox="0 0 300 400"
              preserveAspectRatio="none"
            >
              <ellipse
                cx="150"
                cy="185"
                rx="98"
                ry="128"
                fill="none"
                stroke="rgba(255,255,255,0.85)"
                strokeWidth="1.5"
                strokeDasharray="4 7"
              />
            </svg>
            {!cameraReady && (
              <div
                className="absolute inset-0 flex items-center justify-center"
                style={{ fontFamily: SANS, color: C.muted, fontSize: 13 }}
              >
                Waking the camera…
              </div>
            )}
          </div>
        ) : (
          <div
            className="flex w-full flex-col items-center justify-center rounded-3xl px-6 text-center"
            style={{
              aspectRatio: "3 / 4",
              background: C.surface,
              border: `1px solid ${C.line}`,
            }}
          >
            <p
              style={{
                fontFamily: SERIF,
                color: C.ink,
                fontSize: 20,
                fontWeight: 400,
              }}
            >
              No camera here
            </p>
            <p
              className="mt-3 max-w-xs"
              style={{ fontFamily: SANS, color: C.muted, fontSize: 14, lineHeight: 1.6 }}
            >
              Upload a clear, well-lit selfie instead.
            </p>
          </div>
        )}
      </div>

      {/* actions */}
      <div className="mt-8 flex flex-col items-center gap-5 pb-2">
        {!cameraFailed && (
          <PrimaryButton onClick={capture} style={{ width: "100%" }}>
            Capture
          </PrimaryButton>
        )}
        <button
          onClick={() => fileRef.current && fileRef.current.click()}
          className="transition-opacity hover:opacity-70"
          style={{
            fontFamily: SANS,
            fontSize: 14,
            color: C.muted,
            textDecoration: "underline",
            textUnderlineOffset: "3px",
          }}
        >
          {cameraFailed ? "Upload a photo" : "Upload a photo instead"}
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={onFile}
        />
      </div>

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}

/* Build request headers. In the artifact environment auth is handled for
 * you, so no key is sent. For local dev, an optional Vite env var lets the
 * call work against the real API. */
function buildHeaders() {
  const headers = { "Content-Type": "application/json" };
  const key =
    typeof import.meta !== "undefined" &&
    import.meta.env &&
    import.meta.env.VITE_ANTHROPIC_API_KEY;
  if (key) {
    headers["x-api-key"] = key;
    headers["anthropic-version"] = "2023-06-01";
    headers["anthropic-dangerous-direct-browser-access"] = "true";
  }
  return headers;
}

/* ---- analyzing ------------------------------------------------------ */
const ANALYZING_LINES = [
  "Reading the light on your skin…",
  "Looking at tone and texture…",
  "Noticing where skin is calm…",
  "Composing your routine…",
];

function Analyzing() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setI((v) => (v + 1) % ANALYZING_LINES.length), 2200);
    return () => clearInterval(id);
  }, []);
  const size = 64;
  const stroke = 3;
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  return (
    <div className="flex flex-1 flex-col items-center justify-center py-16 text-center">
      <svg
        width={size}
        height={size}
        style={{ animation: "claritySpin 1100ms linear infinite" }}
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={C.line}
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={C.sage}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={circ * 0.72}
        />
      </svg>
      <p
        key={i}
        className="clarity-fade mt-8"
        style={{ fontFamily: SERIF, color: C.ink, fontSize: 19, fontWeight: 400 }}
      >
        {ANALYZING_LINES[i]}
      </p>
    </div>
  );
}

/* ---- error ---------------------------------------------------------- */
function ErrorState({ onRetry }) {
  return (
    <div className="clarity-fade flex flex-1 flex-col items-center justify-center py-16 text-center">
      <h2
        style={{
          fontFamily: SERIF,
          color: C.ink,
          fontSize: 28,
          fontWeight: 400,
          letterSpacing: "-0.01em",
        }}
      >
        Let's retake that
      </h2>
      <p
        className="mt-4 max-w-xs"
        style={{ fontFamily: SANS, color: C.muted, fontSize: 15, lineHeight: 1.65 }}
      >
        Try softer, even lighting — face a window and keep your whole face in
        frame.
      </p>
      <div className="mt-10">
        <PrimaryButton onClick={onRetry}>Try again</PrimaryButton>
      </div>
    </div>
  );
}

/* ---- results -------------------------------------------------------- */
function Results({ result, onRescan }) {
  const concerns = Array.isArray(result.concerns) ? result.concerns : [];

  // Full cards for anything beyond "minimal"; collapse the calm ones.
  const sorted = [...concerns].sort(
    (a, b) =>
      (SEVERITY_ORDER[b.severity] ?? 0) - (SEVERITY_ORDER[a.severity] ?? 0) ||
      a.score - b.score
  );
  const focus = sorted.filter((c) => c.severity !== "minimal");
  const calm = sorted.filter((c) => c.severity === "minimal");

  // Recommendations: the concerns that matter most and carry products.
  const recs = focus.filter((c) => Array.isArray(c.products) && c.products.length > 0).slice(0, 4);

  const routine = result.routine || { am: [], pm: [] };

  return (
    <div className="flex flex-1 flex-col pb-16 pt-12">
      {/* hero */}
      <div className="clarity-fade flex flex-col items-center text-center">
        <ScoreRing value={clamp(Math.round(result.overallClarity), 0, 100)} />
        <p
          className="mt-7 max-w-sm"
          style={{ fontFamily: SERIF, color: C.ink, fontSize: 20, lineHeight: 1.45, fontWeight: 400 }}
        >
          {result.summary}
        </p>
      </div>

      {/* focus cards */}
      {focus.length > 0 && (
        <section className="mt-14">
          <SectionTitle>Areas to focus on</SectionTitle>
          <div className="mt-5 space-y-4">
            {focus.map((c, idx) => (
              <ConcernCard key={c.name} concern={c} delay={idx * 90} />
            ))}
          </div>
        </section>
      )}

      {/* calm summary row */}
      {calm.length > 0 && (
        <div
          className="clarity-rise mt-4 rounded-2xl px-5 py-4"
          style={{ background: C.sageSoft, animationDelay: `${focus.length * 90}ms` }}
        >
          <span
            style={{ fontFamily: SANS, color: C.sage, fontSize: 13, fontWeight: 500 }}
          >
            Looking good:{" "}
          </span>
          <span style={{ fontFamily: SANS, color: C.muted, fontSize: 13 }}>
            {calm.map((c) => label(c.name)).join(", ")}.
          </span>
        </div>
      )}

      {/* recommendations */}
      {recs.length > 0 && (
        <section className="mt-14">
          <SectionTitle>Recommended</SectionTitle>
          <div className="mt-5 space-y-8">
            {recs.map((c) => (
              <div key={c.name}>
                <h3
                  style={{ fontFamily: SERIF, color: C.ink, fontSize: 18, fontWeight: 500 }}
                >
                  {label(c.name)}
                </h3>
                <div className="mt-2">
                  {c.products.slice(0, 3).map((p, i) => (
                    <ProductRow key={i} product={p} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* routine */}
      {(routine.am?.length || routine.pm?.length) && (
        <section className="mt-14">
          <SectionTitle>Your routine</SectionTitle>
          <div
            className="mt-5 grid grid-cols-2 gap-8 rounded-2xl p-6"
            style={{ background: C.surface, border: `1px solid ${C.line}` }}
          >
            <RoutineColumn title="Morning" steps={routine.am || []} />
            <RoutineColumn title="Evening" steps={routine.pm || []} />
          </div>
        </section>
      )}

      {/* disclaimer */}
      <p
        className="mt-12"
        style={{ fontFamily: SANS, color: C.faint, fontSize: 11.5, lineHeight: 1.6 }}
      >
        Cosmetic and informational only — not medical advice. See a
        dermatologist for any skin condition or concern.
      </p>

      {/* scan again */}
      <div className="mt-10 flex justify-center">
        <button
          onClick={onRescan}
          className="rounded-full px-8 py-4 transition-opacity hover:opacity-80"
          style={{
            fontFamily: SANS,
            fontSize: 15,
            fontWeight: 500,
            color: C.ink,
            background: "transparent",
            border: `1px solid ${C.ink}`,
          }}
        >
          Scan again
        </button>
      </div>
    </div>
  );
}

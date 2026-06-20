/* ------------------------------------------------------------------ *
 * Evidence library — concise, citable findings from the dermatology
 * literature, matched to a product's active ingredient. Figures are
 * drawn from published peer-reviewed studies and summarized for a lay
 * reader; they are educational, not a personalized medical claim.
 * ------------------------------------------------------------------ */

const EVIDENCE = [
  {
    keys: ["sunscreen", "spf", "broad-spectrum", "broad spectrum", "uv"],
    stat: "−24% skin aging",
    claim:
      "In a 4.5-year randomized trial of 903 adults, people using sunscreen daily showed 24% less skin aging than those using it occasionally.",
    source: "Hughes et al., 2013 · Annals of Internal Medicine",
    url: "https://pubmed.ncbi.nlm.nih.gov/23732711/",
  },
  {
    keys: ["niacinamide", "nicotinamide", "vitamin b3"],
    stat: "12-week RCT",
    claim:
      "In a 12-week double-blind study, 5% niacinamide significantly reduced hyperpigmentation, fine lines, blotchiness and sallowness.",
    source: "Bissett et al., 2005 · Dermatologic Surgery",
    url: "https://pubmed.ncbi.nlm.nih.gov/16029679/",
  },
  {
    keys: ["retino", "tretinoin", "adapalene", "retinal", "retinaldehyde"],
    stat: "+80% collagen",
    claim:
      "Across 8 randomized trials (1,361 patients), topical tretinoin significantly improved photodamage; controlled studies show up to ~80% more dermal collagen.",
    source: "Tretinoin RCT meta-analysis · 2024",
    url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC12615114/",
  },
  {
    keys: ["salicylic", "bha", "beta hydroxy"],
    stat: "−66% lesions",
    claim:
      "A pore-clearing BHA: salicylic-acid regimens reduced inflammatory acne by about 66% over 12 weeks, with less dryness than benzoyl peroxide.",
    source: "Randomized acne trials · JAAD",
    url: "https://www.jaad.org/article/S0190-9622(03)03386-3/fulltext",
  },
  {
    keys: ["benzoyl"],
    stat: "~half of lesions",
    claim:
      "In randomized trials, benzoyl peroxide cut inflammatory acne lesions roughly in half over 10–12 weeks; pairing it with salicylic acid more than doubled clearance of clogged pores.",
    source: "Acne RCT meta-analysis · NIH",
    url: "https://www.ncbi.nlm.nih.gov/books/NBK78892/",
  },
  {
    keys: ["vitamin c", "ascorbic", "vit c", "l-ascorbic"],
    stat: "+74% smoother",
    claim:
      "In a 3-month daily trial, topical vitamin C improved skin-surface texture by ~74% versus control, with biopsy-confirmed new collagen.",
    source: "Controlled vitamin C trials · 1999",
    url: "https://pubmed.ncbi.nlm.nih.gov/10522500/",
  },
  {
    keys: ["azela"],
    stat: "matched hydroquinone",
    claim:
      "15–20% azelaic acid significantly reduces redness and post-acne dark marks; at 20% it matched hydroquinone for melasma in trials.",
    source: "Azelaic acid systematic review · 2023",
    url: "https://onlinelibrary.wiley.com/doi/10.1111/jocd.15923",
  },
  {
    keys: ["glycolic", "lactic", "mandelic", "aha", "alpha hydroxy", "alpha-hydroxy"],
    stat: "71–76% improved",
    claim:
      "In a double-blind trial, 71–76% of people improved at least one grade of photodamage with 8% glycolic or lactic acid, versus 40% on placebo.",
    source: "Stiller et al. · double-blind AHA trial",
    url: "https://pubmed.ncbi.nlm.nih.gov/8651713/",
  },
  {
    keys: ["hyaluron"],
    stat: "measurable hydration",
    claim:
      "Topical hyaluronic acid measurably increases skin hydration and softens the look of fine lines within weeks in controlled studies.",
    source: "Topical hyaluronic acid trials",
    url: "https://pubmed.ncbi.nlm.nih.gov/24910564/",
  },
  {
    keys: ["ceramide"],
    stat: "barrier repair",
    claim:
      "Ceramide-containing moisturizers restore the skin barrier and reduce water loss in clinical testing — the foundation of calmer, more resilient skin.",
    source: "Barrier-repair clinical studies",
    url: "https://pubmed.ncbi.nlm.nih.gov/31573754/",
  },
];

/* Find the best-matching evidence for a product (checks ingredient + type). */
export function evidenceFor(product) {
  if (!product) return null;
  const hay = `${product.ingredient || ""} ${product.type || ""} ${product.example || ""}`.toLowerCase();
  for (const e of EVIDENCE) {
    if (e.keys.some((k) => hay.includes(k))) return e;
  }
  return null;
}

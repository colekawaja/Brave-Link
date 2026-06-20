/* A realistic sample analysis so the full UI can be explored without an
 * API key. Mirrors the exact shape the model returns. */
export const SAMPLE_RESULT = {
  overallClarity: 61,
  summary: "There's healthy, even-toned skin to build on — focusing on texture and dark spots should lift your score noticeably.",
  concerns: [
    {
      name: "Texture",
      score: 54,
      severity: "moderate",
      note: "Some unevenness across the cheeks that gentle exfoliation can smooth.",
      products: [
        {
          type: "Lactic acid exfoliant",
          example: "The Ordinary Lactic Acid 5%",
          ingredient: "Lactic acid",
          why: "Gently resurfaces for smoother, softer skin",
        },
        {
          type: "Leave-on BHA",
          example: "Paula's Choice 2% BHA Liquid",
          ingredient: "Salicylic acid",
          why: "Clears pores and refines rough patches",
        },
      ],
    },
    {
      name: "Pigmentation",
      score: 58,
      severity: "moderate",
      note: "A little uneven tone in spots — brightening actives and daily SPF help.",
      products: [
        {
          type: "Vitamin C serum",
          example: "La Roche-Posay Pure Vitamin C",
          ingredient: "Vitamin C",
          why: "Brightens and evens tone over time",
        },
        {
          type: "Daily sunscreen",
          example: "La Roche-Posay Anthelios SPF 50",
          ingredient: "Broad-spectrum SPF",
          why: "Prevents new spots from deepening",
        },
      ],
    },
    {
      name: "Breakouts",
      score: 64,
      severity: "mild",
      note: "A few active spots — a salicylic cleanser keeps things clear.",
      products: [
        {
          type: "Salicylic acid cleanser",
          example: "CeraVe SA Smoothing Cleanser",
          ingredient: "Salicylic acid",
          why: "Keeps pores clear without stripping",
        },
      ],
    },
    {
      name: "Pores",
      score: 66,
      severity: "mild",
      note: "Slightly visible around the nose — niacinamide helps them look refined.",
      products: [
        {
          type: "Niacinamide serum",
          example: "The Ordinary Niacinamide 10%",
          ingredient: "Niacinamide",
          why: "Minimizes the look of pores and oil",
        },
      ],
    },
    {
      name: "Oiliness",
      score: 69,
      severity: "mild",
      note: "A gentle shine through the T-zone, well within a healthy range.",
      products: [],
    },
    {
      name: "Redness",
      score: 80,
      severity: "minimal",
      note: "Skin looks calm with very little visible redness.",
      products: [],
    },
    {
      name: "Hydration",
      score: 82,
      severity: "minimal",
      note: "Looks well-hydrated and supple.",
      products: [],
    },
    {
      name: "Under-eye",
      score: 78,
      severity: "minimal",
      note: "Bright and rested under the eyes.",
      products: [],
    },
  ],
  routine: {
    am: [
      "Gentle cleanser",
      "Vitamin C serum",
      "Lightweight moisturizer",
      "Sunscreen SPF 50",
    ],
    pm: [
      "Salicylic acid cleanser",
      "Lactic acid exfoliant (2–3x / week)",
      "Niacinamide serum",
      "Moisturizer",
    ],
  },
};

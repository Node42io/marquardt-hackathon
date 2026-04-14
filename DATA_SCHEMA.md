# Data Schema — what the orchestrator should emit

This file is the canonical JSON shape the React app consumes. The **source of truth** for types is `app/src/types/index.ts` — this file is a human-readable summary with schema rationale and field-level notes on what goes wrong when a field is missing.

See `DATA_AUGMENTATION_LOG.md` for each specific gap we had to fix after extraction and how to prevent it upstream.

---

## File layout

```
app/src/data/
├── overview.json                    OverviewData          ← company profile, portfolio summary (NEW)
├── product.json                     ProductDecomposition
├── functionalPromise.json           FunctionalPromiseData
├── constraints.json                 ConstraintsData
├── homeMarketCompetition.json       HomeMarketCompetition
├── marketDiscovery.json             MarketDiscovery
├── ranking.json                     RankingData
├── sources.json                     SourcesRegistry (keyed map, not array)
├── researchedSources.json           { version, generatedAt, sources: [ResearchedSource] }
└── markets/
    ├── index.json                   MarketIndexEntry[]
    └── {slug}/
        ├── meta.json                MarketMeta
        ├── jtbd.json                JTBDData
        ├── odi.json                 ODIData
        ├── valueNetwork.json        ValueNetworkData
        ├── kano.json                KanoData
        ├── compatibility.json       CompatibilityData
        └── alternatives.json        AlternativesData
```

**Rule**: one slug per market. Slugs are lowercase-kebab-case, stable across runs. The slug registry is `markets/index.json`.

---

## Core utility types

### `Source`

```ts
{
  id: string;                 // short local ID, e.g. "S01"
  prefixedId: string;         // global registry key, e.g. "VN-FINFISH-FARMING-S01"
  label: string;              // human-readable citation title
  url?: string;               // clickable link (null/absent → "source pending" UI)
  quote?: string;             // optional pull-quote
  confidence?: "high" | "medium" | "low";
}
```

**Why `prefixedId`**: every source MUST be addressable from the global registry `sources.json` — this is what `<SourceFootnote sourceIds={[...]}>` looks up. IDs collide across files if not prefixed.

### `SourcesRegistry`

```ts
// sources.json — keyed by prefixedId
Record<string, Source>
```

### `ResearchedSource` (researchedSources.json)

```ts
{
  id: "RS001" ...;            // RS-prefixed global ID
  claim: string;              // the assertion the source supports
  appliesTo: string[];        // tags: "home-market-competition", "finfish-farming", etc.
  sourceName: string;
  sourceUrl: string | null;   // null for internal docs (e.g. "Marquardt briefing")
  quotedText: string;
  confidence: "high" | "medium" | "low";
  notes?: string;
}
```

---

## Home-market files (root of `app/src/data/`)

### `overview.json` ← NEW (AUG-LOG #20)

Powers the `00 Overview` page (`/overview` — default landing route). All company-profile fields must be verified against external URLs before emitting. Internal analysis outputs (composite scores, NPV/IRR estimates) are allowed but must be flagged `internal: true` so the UI can suppress source footnotes for them.

```ts
{
  company: {
    name: string;                        // legal name e.g. "Marquardt GmbH"
    legalForm: string;                   // "GmbH (private limited company)"
    ownership: string;                   // ownership structure description
    founded: number;                     // founding year
    hq: string;                          // city, region, country
    ceo: {
      name: string;
      since: string;                     // "Month YYYY" e.g. "January 2025"
      note: string;                      // 1-sentence successor context
    };
    revenue: {
      value: string;                     // "€1.35 billion" — never a raw number
      year: number;
      note: string;                      // YoY context
    };
    employees: { value: number; year: number; note: string };
    sites: number;
    countries: number;
    continents: number;
    rdIntensity: string;                 // "~10% of revenue (~€135M equivalent)"
    patentsTotal: number;                // total portfolio (active + expired)
    patentsGranted: number;              // granted subset
    primaryNaics: string;                // string — leading zeros matter
    primaryNaicsTitle: string;
  };

  globalFootprint: {
    regions: { region: string; sites: string[] }[];
  };

  divisions: [
    {
      name: string;
      type: string;                      // "Automotive" | "Automotive / E-Mobility" | ...
      description: string;
      isSubjectDivision: boolean;        // true = the division that owns the product
    }
  ];

  productGroup: {
    name: string;                        // e.g. "Sensor Solutions"
    scope: string;                       // comma-joined technology types
    families: [
      { name: string; technology: string; status: string }
    ];
  };

  product: {
    name: string;
    family: string;
    bomLevel: string;                    // "L5 (sellable product)"
    homeMarketNaics: string;
    homeMarketTitle: string;
    whitepaper?: string;                 // URL
    productPage?: string;                // URL
    variants: [
      {
        id: string;                      // "DN12" | "DN14" | "DN20" | "DN25"
        status: string;                  // "Concept" | "Development samples" | "Serial product"
        innerDiameter: string;           // "20 mm"
        flowRange: string;               // "4.2–46.6 l/min" or "—" if not yet defined
        dimensions: string;              // "L×W×H mm"
        note?: string;                   // application context
        isSerial?: boolean;              // true for the currently manufactured variant
      }
    ];
  };

  studyQuestion: {
    q1: { german: string; english: string; answer: string };
    q2: { german: string; english: string; answer: string };
  };

  portfolioPriorities: [
    {
      priority: string;                  // "1a" | "1b" | "2" | "3" | "4"
      market: string;
      fitScore: number;                  // architecture + JTBD composite
      fitLabel: string;                  // "STRONG" | "MODERATE-top" | "MODERATE" | "WEAK"
      compositeScore: number;
      timeToFirstRevenue: string;        // "9–15 months"
      hardwareDelta: string;             // "Firmware only" | "Firmware + calibration (…)"
      y5RevenueBaseM: number;            // €M, base scenario
      role: string;                      // "Beachhead" | "Scale" | "Defensive" | "Roadmap"
    }
  ];

  financials: {
    y5RevenueBase: string;               // "€58 M"
    y5RevenueUpside: string;
    y5RevenueDownside: string;
    npvBase: string;                     // "€65 M"
    npvUpside: string;
    npvDownside: string;
    irrBase: string;                     // "38%"
    irrUpside: string;
    irrDownside: string;
    breakevenBase: string;               // "Year 4"
    breakevenUpside: string;
    breakevenDownside: string;
    cumulativeInvestment: string;        // "€14 M over 3 years (NRE €9.2M + capex €4.8M)"
    discountRate: string;                // "10%"
    note: string;                        // caveat on directional nature
  };

  sources: Source[];                     // OVW-prefixed IDs; external URLs only — no internal docs
}
```

**Source restriction**: `sources[]` must contain only entries with real, clickable `url` values. Internal analysis outputs (portfolio scores, NPV/IRR) have no citable external URL — emit them without source IDs rather than fabricating a reference.

**L6 ID format note** (see AUG-LOG #19): all VN IDs in this file and in VN JSONs must use dot-notation (`L6.1`, `L6.H1`), never letter-suffix (`L6a`, `L6(H1)`). The `groupUnitsByL6()` helper in `helpers.ts` was fixed to handle non-numeric section codes, but canonical IDs should be dot-notation upstream.

---

### `product.json`

```ts
{
  productName: "Marquardt Ultrasonic Flow Sensor";
  vendorName: "Marquardt GmbH";
  christensen: { mechanism, function, outcome };          // Christensen capability abstraction
  technology: { class, underlyingMechanism, unspscCode, unspscTitle, unspscPath };
  functionalPromise: { statement, verb, object, context };
  commodityFunctionalPromise: string;                     // UNSPSC-level functional promise
  differentiators: string[];
  features: Feature[];                                    // scope: "technology" | "vendor"
  specifications: Specification[];
  constraints: Constraint[];                              // product constraints (not market constraints)
  billOfMaterials: BOMItem[];                             // 7+ items min — see AUG-LOG #9
  sources: Source[];
}
```

**Field notes**:
- `billOfMaterials` is required. Today orchestrator skips it and the UI derives from features — this is brittle. Emit a real BOM per item 9 in `DATA_AUGMENTATION_LOG.md`.
- `features[].scope`: `"technology"` or `"vendor"`. Orchestrator must split.

### `functionalPromise.json`

```ts
{
  technologyFP: FunctionalPromiseCore & { differentiators: string[] };
  commodityFP: { statement, reasoning };
  unspsc: { code, title, path };
  sources: Source[];
}
```

### `constraints.json`

```ts
{
  constraints: Constraint[];
  sources: Source[];
}
```

Each `Constraint` must have `severity` (low/medium/high/critical) AND `sourceIds[]` — the UI renders a per-constraint source footnote (TODO item 23).

### `homeMarketCompetition.json`

```ts
{
  homeNAICSCode: "333415";
  homeMarketName: "Air-Conditioning and Warm Air Heating Equipment Manufacturing";
  briefingSourceRef: {
    // TODO item 26 — briefing must be visibly flagged as source
    label: "Marquardt customer briefing";
    internal: true;
    sourceId: "RS016";
  };
  incumbents: [
    {
      technologyName: string;
      mechanism: string;                    // "Mechanism" category (item 30)
      marketShareEstimate: string;          // e.g. "dominant ~40%" with source
      marketShareSourceIds: string[];       // per-tech share sources (item 28)
      keyVendors: string[];
      strengths: string[];
      weaknesses: string[];
      switchingCost: {
        level: "low" | "medium" | "high";
        narrative: string;                  // per-tech, not global (item 29)
        sourceIds: string[];
      };
      confidence: "high" | "medium" | "low";
      sourceIds: string[];
    }
  ];
  sources: Source[];
}
```

### `marketDiscovery.json`

```ts
{
  commodityFP: string;
  searchConfig: { primaryQuery, extensionQuery, universe, ... };
  candidates: [
    {
      naicsCode: string;
      name: string;
      rationale: string;
      marketSize: { value: string, year: number, sourceId: string };
      confidence: "high" | "medium" | "low";
      alternatives: string[];
    }
  ];
  architectureDistance: [
    { slug, naics, distance, priority, rationale }
  ];
  sources: Source[];
}
```

### `ranking.json`

```ts
{
  productName, vendorName, technologyClass, unspscCode;
  weights: { odi: 0.25, fit: 0.15, constraint: 0.15, coverage: 0.15, vn: 0.10, incumbent: 0.20 };
  totalMarketsEvaluated: number;
  executiveSummary: string;
  rankedMarkets: [
    {
      rank: number;
      slug: string;                    // matches markets/{slug}/
      name: string;
      naicsCode: string;
      scores: {
        odi: number | null;            // 0-10; null allowed only for unranked markets
        fit: number | null;
        constraint: number | null;
        coverage: number | null;
        vn: number | null;
        incumbent: number | null;
        composite: number | null;      // weighted, clamped [0,10]
      };
      recommendation: "pursue" | "investigate" | "defer" | "no-go";
      recommendationRationale: string;
      entryStrategy: string[];         // bullets
      timeToEntry: string;             // e.g. "9-15 months"
      investment: string;              // e.g. "$250K-600K"
      marketSize: { value: string, sourceId: string };  // NEW per #8
    }
  ];
}
```

**Critical**: Every market with per-market analysis files MUST be in `rankedMarkets[]` — never silently drop (item 8 in AUG-LOG). If scoring isn't complete, use `null` for scores and mark `recommendation: "investigate"` with a "scoring pending" rationale.

---

## Per-market files

### `markets/index.json`

```ts
MarketIndexEntry[]: [
  {
    slug: string;
    name: string;
    naicsCode: string;
    sourceFile: string;            // which markdown stem this came from
    isReference?: boolean;         // true for flowmeters home-industry reference
  }
]
```

### `markets/{slug}/meta.json`

```ts
{
  slug, name, naicsCode;
  rank: number;
  recommendation, recommendationRationale;
  executiveSummary: string;        // 2-3 sentence market overview
  scores: { ...same 7 keys as ranking };
  entryStrategy, timeToEntry, investment;
  coreJobStatement: string;        // one-line CFJ
  isReference?: boolean;
}
```

### `markets/{slug}/jtbd.json`

```ts
{
  slug, marketName, naicsCode;
  coreJobStatement: string;                   // CFJ — sits at P1 of pyramid
  productJobStatement: string;
  anchorLevel: string;
  lPath: string[];                            // L6 → L5 → L4 path in VN
  segments: Segment[];                        // customer segments table
  alternatives: Alternative[];
  jobSteps: JobStep[];                        // ALL 8 Ulwick steps, not just relevant (#7)
  stakeholders: Stakeholder[];
  needs: never[];                             // deprecated — ODI needs live in odi.json
  sources: Source[];
}
```

#### `JobStep`

```ts
{
  stepNumber: number;                         // 1..8 — always 8 steps
  verb: string;                               // "Define" | "Locate" | "Prepare" | ...
  description: string;                        // REQUIRED — UI prepends "This step is about " (item 1, #5)
  relevant: boolean;                          // sensor-relevant or not
  isSensorRelevant?: boolean;                 // alias for `relevant`
  sensorDependencyRationale?: string;         // why sensor matters for this step
  rawStatement?: string;                      // optional full markdown row
}
```

#### `Stakeholder`

```ts
{
  id: string;                                 // stable ID so needs can link (#6)
  role: string;                               // "Farm operator" | "Plant manager" | ...
  who: string;                                // 1-line description
  pyramidLevels: string;                      // "P1, P2, P3, P4, P5" or "P1 ALL, P2 ALL" — parsed as labels
  influence?: "buyer" | "decider" | "user" | "influencer";
}
```

#### `Segment`

```ts
{
  segmentNumber: number;
  name: string;
  qualifier?: string;                         // parenthetical like "(>500 t/yr)"
  circumstance: string;                       // = characteristics, legacy alias
  characteristics?: string;
  alternativesDiffer: string;
  isTargetable: boolean;
  targetabilityReason?: string;
}
```

### `markets/{slug}/odi.json`

```ts
{
  slug, marketName, naicsCode;
  needs: ODINeed[];
  topOpportunities: string[];                 // top-N need IDs
  summary: {
    totalNeeds: number;
    underservedCount: number;                 // opportunity >= 12
    overservedCount: number;                  // satisfaction > importance (NOT opp < 10, per item 3)
    avgOpportunityScore: number;
  };
  sources: Source[];
}
```

#### `ODINeed`

```ts
{
  id: string;                                 // e.g. "NEED-001" — stable
  statement: string;                          // the desired outcome sentence
  jobStep: string;                            // REQUIRED uppercase verb ("EXECUTE" etc.) — links to Job Map (#3)
  ulwickStep?: string;                        // alias for jobStep
  dimension: string;                          // "DETECTION" | "ACCURACY" | "THROUGHPUT" | "EFFORT" | ...
  importance: number;                         // 0-10
  satisfaction: number;                       // 0-10
  opportunity: number;                        // = importance + max(0, importance − satisfaction)

  importanceRationale: string;                // REQUIRED — 1-2 sentences plain language (#4)
  satisfactionRationale: string;              // REQUIRED — 1-2 sentences plain language (#4)

  primaryStakeholder?: string;                // Populated — stakeholder `who` string from JTBD table (#6)
                                              // derived via step→role heuristic (see AUG-LOG #6)
  stakeholderIds?: string[];                  // secondary stakeholders; same `who` format

  pyramidLevel?: "P1" | "P2" | "P3" | "P4" | "P5";  // Burleson Pyramid tier (#11)

  category: string;                           // "safety" | "reliability" | "maintenance" | ...
  isOverserved: boolean;                      // = satisfaction > importance (computed, not stored — but persisting saves UI work)
  confidence?: number;                        // 0-1

  sourceIds?: string[];
}
```

**Why each field matters**:
- `jobStep` gates the Job Map's per-step aggregation. Missing → Job Map shows 0 needs per step (#3).
- `importanceRationale` + `satisfactionRationale` gate the ODI detail panel (TODO item 2, item 8). Missing → "rationale pending" placeholder.
- `primaryStakeholder` gates the stakeholder badge next to each need.
- `pyramidLevel` gates the Burleson Pyramid classification (#11).

### `markets/{slug}/valueNetwork.json`

```ts
{
  slug, marketName, naicsCode;
  hierarchy: string;                          // e.g. "L6 / process / unit"
  architectureDistance: number;               // 1 = very close, 5+ = distant
  marketSize?: string;
  coreJobStatement: string;
  strategicPosition: string;                  // "primary" | "secondary" | "tertiary"
  l6Systems: [
    {
      id: string;
      name: string;
      type: string;                           // "Core" | "Horizontal"
      jobFamily: string;                      // functional job at L6 level
      description: string;                    // 2-sentence plain language (#10)
      scope?: string;                         // output types this step activates — Format B only (#17)
      category?: "core" | "horizontal";       // machine-readable type tag — Format B only (#17)
                                              // NOTE: upstream VN markdown should always emit `type: "Core"|"Horizontal"`
                                              // in a unified ## L6 — System-of-Systems Decomposition table, making
                                              // `scope` and `category` unnecessary. See AUG-LOG #17.
      l5Units: [
        {
          id: string;
          name: string;
          functionalJob: string;              // bold line shown in detail panel
          plainDescription: string;           // 2-sentence description (item 11, #10)
          marquardtPosition?: "primary" | "secondary" | "tertiary";
          dependencies?: string[];
        }
      ];
    }
  ];
  sources: Source[];
}
```

### `markets/{slug}/kano.json`

```ts
{
  slug, marketName, naicsCode;
  features: [
    {
      featureName: string;
      kanoClassification: "must_be" | "one_dimensional" | "attractive" | "indifferent" | "reverse";
      shortDescription: string;
      evidence: string;                       // rationale
      confidence: "high" | "medium" | "low";
      scores: {
        overall: number;                      // 0-10 overall fit
        // per-dimension scores (accuracy, durability, cost, integration, ...)
      };
      sourceIds: string[];
    }
  ];
  avgOverallFit: number;
  sources: Source[];
}
```

### `markets/{slug}/compatibility.json`

```ts
{
  slug, marketName, naicsCode;
  assessments: [
    {
      constraintName: string;                 // matches a constraint from constraints.json
      constraintType: string;                 // REQUIRED non-empty — badge appears only when set
      verdict: "knockout" | "mitigable" | "none";
      marketCondition: string;                // what this market's environment does
      rationale: string;
      mitigation?: string;
      mitigationCost?: "low" | "medium" | "high";
      sourceIds: string[];
    }
  ];
  result: {
    marketStatus: string;
    knockouts: number;
    mitigable: number;
    noImpact: number;
  };
  sources: Source[];
}
```

### `markets/{slug}/alternatives.json`

```ts
{
  slug, marketName, naicsCode;
  alternatives: [
    {
      technologyName: string;
      mechanism: string;                      // REQUIRED non-empty (#13)
      marketShareEstimate: string;
      keyVendors: string[];
      strengths: string[];
      weaknesses: string[];
      switchingCost: {
        level: "low" | "medium" | "high";
        narrative: string;                    // per-tech, not global (item 29)
      };
      confidence: "high" | "medium" | "low";
      sourceIds: string[];
    }
  ];
  sources: Source[];
}
```

---

## Schema rules — non-negotiable

1. **Every ID is stable across runs.** Slugs, source prefixed IDs, stakeholder IDs, constraint names — all must re-render the same after a re-run.
2. **No silent drops.** If a market has per-market analysis, it MUST be in `markets/index.json`, `ranking.json`, AND have a bundle entry in `app/src/data/index.ts` (or an auto-loader).
3. **Rationales are plain English, ≤2 sentences.** No bullet lists, no framework jargon, no "TBD" placeholders.
4. **Every claim with a source gets `sourceIds[]`.** Empty array is allowed; `null` / missing is not.
5. **Numbers are numbers.** Never stringify a score like `"6.07"` — keep as `number`. Use `null` only for genuinely missing data.
6. **Overserved = `satisfaction > importance`.** Not `opportunity < 10`. Not `importance < 3`. (TODO item 3.)
7. **Source registry is keyed, not arrayed.** `sources.json` is `Record<prefixedId, Source>` — lookups are O(1).
8. **Job steps are always 8.** `relevant: false` steps are dimmed visually, never omitted from data (#7).
9. **UNSPSC + NAICS codes are strings.** Leading zeros matter. Use `"518210"`, never `518210`.

---

## See also

- `DATA_AUGMENTATION_LOG.md` — every specific gap we patched post-extraction
- `app/src/types/index.ts` — runtime source of truth
- `app/scripts/extract-data.mjs` — current extractor (transitional; orchestrator should emit these JSONs directly)

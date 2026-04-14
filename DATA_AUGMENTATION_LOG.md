# Data Augmentation Log

Every entry below is a place where the React app needed data that wasn't in the original markdown or HTML output. Use this to improve the upstream orchestrator and Clayton docs so future runs produce this data natively.

Legend for **Source**:
- `extractor-fix` — data existed in markdown but the extractor script didn't parse it
- `markdown-reparse` — parsed additional columns or sections the first extractor pass missed
- `html-reparse` — pulled from the rendered HTML when the markdown lacked it
- `web-research` — verified against external authoritative sources (URLs in `researchedSources.json`)
- `heuristic` — derived deterministically from other fields (document the rule)
- `hand-authored` — written by an agent from domain context (mark `confidence: low` and flag for human review)

---

## 1. Global source registry consolidation

- **What**: Merged per-file source arrays (JTBD, ODI, VN, COMPAT, FIT, home-market) into a single `src/data/sources.json` keyed by prefixed ID (e.g. `VN-FINFISH-FARMING-S01`). 348 sources registered.
- **Gap**: Markdown files each have a local `## Sources` list with IDs like `S01`, `S02`. Without prefixing, IDs collide across files.
- **Source**: `extractor-fix` — added prefixing pass in `extract-data.mjs`.
- **Upstream fix**: Orchestrator should emit a single canonical `sources.json` during report generation OR prefix IDs at write time. Clayton docs should specify the prefix convention (e.g. `{COMPONENT}-{MARKET_UPPER}-S{n}`).

## 2. Researched market-context sources (RS001–RS034)

- **What**: Added 34 URL-verified sources covering home-market competing-technology shares, ranked-market sizing, and switching-cost evidence. Written to `src/data/researchedSources.json`.
- **Gap**: The markdown's `## Sources` sections cite Marquardt internal docs ("Marquardt briefing") without URLs. UI wants clickable sources everywhere (TODO item 4).
- **Source**: `web-research` — SIKA / Badger Meter / MarketsandMarkets / Grand View / IBISWorld / GM Insights / Brewers Association / etc.
- **Upstream fix**: Orchestrator should run a "source enrichment" pass that tries to resolve every internal citation into a URL, and persist the verified URL back to the graph. Clayton docs should define a "researched source" node type with `sourceName`, `sourceUrl`, `quotedText`, `confidence`, `appliesTo[]`.

## 3. Job step `jobStep` linkage empty in ODI

- **What**: Every ODI need should carry a `jobStep` field (EXECUTE / MONITOR / DEFINE / PREPARE / LOCATE / CONFIRM / MODIFY / CONCLUDE) to group needs under Job Map steps.
- **Gap**: Extractor wrote `jobStep: ""` for every need despite the markdown having this column.
- **Source**: `extractor-fix` — in-flight.
- **Upstream fix**: Ensure the ODI table column header is consistent across markets (some use "Ulwick Step", some "Job Step"). Clayton docs should lock the schema.

## 4. ODI importance/satisfaction rationales

- **What**: UI shows a "rationale pending" placeholder for most need rows because `importanceRationale` is empty (and ~15% of `satisfactionRationale`).
- **Gap**: Markdown only has a single prose block per scoring decision, not a parallel "importance" vs "satisfaction" split.
- **Source**: `hand-authored` + `markdown-reparse` (in-flight by `odi-rationale-filler` agent).
- **Upstream fix**: Have the ODI sub-agent emit both rationales separately per need. Clayton docs should add two fields `importance_rationale` + `satisfaction_rationale` to the ODI need schema.

## 5. Job step descriptions

- **What**: UI Job Map needs a 1-sentence description per step to render "This step is about …" (TODO item 1).
- **Gap**: 7 of 8 non-reference markets had descriptions populated from the markdown "Statement" column. `data-processing-hosting` had an abbreviated job-map table with no "Statement" column (only `Step | Relevant | Rationale`), producing empty `description` and `rawStatement` fields.
- **Source**: `extractor-fix` — added fallback in `scripts/extract-data.mjs`: when `rawStatement` is empty, use the "Rationale" column value as the description (e.g. "Match DN, media, flow/temp ranges to CDU spec"). Re-ran extractor; all 8 markets now have non-empty descriptions.
- **Markets affected**: 7 of 8 had authoritative markdown data (Statement column present). 1 market (`data-processing-hosting`) used heuristic fallback from the Rationale column.
- **Upstream fix**: JTBD sub-agent must always emit a "Statement" column in the job-map table. Abbreviated tables (Step + Relevant + Rationale only) break description extraction. Clayton docs should lock the job-map table schema to always include `#`, `Step`, `Statement`, `Relevant?`, `Rationale` columns.

## 6. Need → Stakeholder linkage

- **What**: UI shows ODI needs without indicating which stakeholder cares most. User asked for per-need stakeholder badges in NeedsList and NeedDetail.
- **Gap**: No ODI markdown file has a stakeholder column. The JTBD markdown has both a stakeholders table (Role → who → pyramidLevels) and error-statement tables that sometimes include a "Role" column, but these are NOT joined to the ODI need objects during extraction.
- **Source**: `heuristic` — mapping rule: job step name → stakeholder role → `who` string from the JTBD stakeholders table for that market.
  - EXECUTE, MONITOR, DEFINE, MODIFY → Job Executor (`who` field)
  - PREPARE, CONFIRM, product_constraint → Product Lifecycle Support (`who` field)
  - CONCLUDE → Job Overseer (`who` field)
  - Fallback (role not found): first entry in stakeholders list, then empty string.
- **Coverage**: All 8 non-reference markets had stakeholders tables with 5–6 entries. `flowmeters-reference` had 0 stakeholders so all needs get empty strings.
- **Data gaps remaining**: All linkages are heuristic — none come from authoritative markdown data. The `data-processing-hosting` JTBD error-statement tables DO include a "Role" column that maps ES-01 to "Overseer", ES-03 to "Lifecycle (Commissioning)", etc., but this was not parsed (complex parsing, marginal gain since stakeholder → role mapping is already correct for the aggregate).
- **Upstream fix (concrete)**:
  1. Add a `primary_stakeholder_id` column to every ODI needs table. The value should be a stable stakeholder ID (e.g., `SH-EXECUTOR`, `SH-OVERSEER`) matching the `id` field the JTBD sub-agent must add to every stakeholder row.
  2. ODI markdown schema: `| # | Statement | Job Step | primary_stakeholder_id | Imp | Sat | Opp | … |`
  3. JTBD markdown schema: stakeholder table must include `| id | Role | Who | Pyramid Levels |`
  4. Clayton docs edge type: `(ODINeed)-[:CARED_ABOUT_BY]->(Stakeholder)` with `is_primary: boolean` on the relationship.

## 7. Job steps — missing non-relevant steps

- **What**: Clayton/Burleson model has 8 universal Ulwick steps (DEFINE, LOCATE, PREPARE, CONFIRM, EXECUTE, MONITOR, MODIFY, CONCLUDE). Markdown filters out steps flagged `relevant_to_product: false`, so some markets end up with only 6 steps.
- **Gap**: The filtered-out steps should still be shown (greyed out) to preserve the 8-step visual.
- **Source**: `markdown-reparse` — include `relevant: false` rows in extraction.
- **Upstream fix**: Orchestrator should always emit all 8 steps with `relevant: true | false` — never filter. Clayton docs should note all 8 steps are universal.

## 8. Data Processing & Hosting market not in final ranking

- **What**: NAICS 518210 is missing from `10_final_ranking.md` even though JTBD/ODI/VN/COMPAT/FIT markdowns exist.
- **Gap**: The ranking file was generated before Data Processing survived the shortlist cut.
- **Source**: `hand-authored` — rank-9 entry added with placeholder scores, then `web-research` + computed from existing per-market data (in-flight).
- **Upstream fix**: Orchestrator should never drop a market from ranking that has per-market analyses. If it fails the pursue threshold, list it as `defer` — but don't silently drop.

## 9. Bill of Materials

- **What**: `product.json` had no `billOfMaterials` field.
- **Gap**: Markdown has specs + features but no explicit BOM table.
- **Source**: `hand-authored` — 7-item logical BOM (piezo transducers, NTC thermistor, flow body, PCB, RAST connector, seals, acoustic coupling) derived from features.
- **Upstream fix**: Product Decomposition sub-agent should emit a BOM table. Clayton docs' Product BOM ontology already defines this — orchestrator must populate it.

## 10. VN unit 2-sentence descriptions

- **What**: TODO item 11 wants a 2-sentence plain-language description per value-network unit for non-JTBD-expert readers.
- **Gap**: Markdown has a `functional_job` string but not a "plain language" description.
- **Source**: `heuristic` — `deriveDescription()` in `helpers.ts` generates a 2-sentence fallback.
- **Upstream fix**: VN sub-agent should emit both `functional_job` and `plain_description` fields.

## 11. Burleson JTBD Pyramid level tags on needs

- **What**: Each ODI need should carry a `pyramidLevel` (P1/P2/P3/P4/P5) so the new JTBD Pyramid component can classify them.
- **Gap**: Markdown doesn't tag needs by pyramid level.
- **Source**: `heuristic` (keyword classifier on need statement) — in-flight by `jtbd-pyramid-builder` agent.
- **Upstream fix**: ODI sub-agent should classify each need into P1–P5 per the Burleson taxonomy. Clayton docs' JTBD Pyramid component spec should formalize the classification rules.

## 12. NAICS/UNSPSC registry sources

- **What**: Every NAICS + UNSPSC code rendered in the UI is clickable, but the NAICS/UNSPSC registry itself isn't listed as a source in any SourceList.
- **Gap**: No registry entry in `sources.json` or the per-section source arrays.
- **Source**: `hand-authored` — recommend adding `NAICS-REG` and `UNSPSC-REG` stable IDs.
- **Upstream fix**: Orchestrator should always register registry URLs as sources. Clayton docs should formalize taxonomy-source IDs.

## 13. Per-technology switching-cost data

- **What**: TODO items 29 + 30: per competing-technology switching cost and category coverage (Mechanism / Market share / Vendors / Strengths / Weaknesses / Switching cost / Source).
- **Gap**: Markdown has a single global switching-cost block, not per-technology.
- **Source**: `hand-authored` — per-tech assessments written into a config (`HOME_MARKET_SWITCHING_COSTS`).
- **Upstream fix**: Competitive Landscape sub-agent should split switching-cost by technology.

## 14. ODI opportunity-score formula hover

- **What**: The UI needs both the ODI formula `imp + (imp − sat)` AND the substituted values `= X + (X − Y) = Z`.
- **Gap**: Markdown only stores the scalar opportunity score.
- **Source**: `heuristic` — computed at render time from importance + satisfaction.
- **Upstream fix**: None — this is a UI concern, not a data concern.

## 15. Source indicator icon + "source pending" state

- **What**: TODO item 4: every source claim needs a visible indicator icon. If URL is absent, show "source pending" hint.
- **Gap**: `sources.json` entries sometimes have `url: null`.
- **Source**: `hand-authored` — UI fallback behavior.
- **Upstream fix**: Orchestrator should gate sources by "has URL OR has verified quote + date" before considering them complete.

## 16. BOM tab — per-market L4→L0 decomposition

- **What**: The new Bill of Materials tab requires per-market `bom.json` files with L4 subsystems, L3 modules, per-position alternative technologies, market-share percentages, Marquardt anchor flags, and output-type scoping.
- **Gap**: BOM markdown files (`sections/BOM_*.md`) existed for 5 of 9 markets (ac-home-heating / NAICS 333415, breweries / NAICS 312120, heating-equipment / NAICS 333414, commercial-service-machinery / NAICS 333318, flowmeters-reference / NAICS 334513). The 4 remaining markets (finfish-farming, hvac-contractors, district-energy, data-processing-hosting) had no BOM markdown and received `dataPending: true` stub JSONs rendering a "data pending" placeholder in the UI.
- **Source**: `markdown-reparse` — BOM JSONs were extracted directly from structured markdown (L4 table, L3 module sections, Structured Data JSON blocks, Marquardt sensor placement section). Data was not hand-authored; it was parsed from authoritative markdown. Stub JSONs for data-pending markets contain only factual metadata (slug, market name, NAICS, sensor note about relevant pipe diameter) sourced from known product specs.
- **Rule followed for Marquardt anchor identification**: Any subsystem/module with an explicit "← Marquardt" or "← DN20 lives here" annotation in the markdown was flagged `isMarquardtAnchor: true`. Market-share percentages for Marquardt's technology class (ultrasonic transit-time) were taken verbatim from the markdown's "Alternatives" column. No share numbers were estimated or adjusted.
- **Rule followed for confidence**: Used the confidence field already present in the markdown (HIGH/MEDIUM/LOW tags on per-module rows). Where no per-module confidence was specified, inherited from the L4 subsystem's data quality (L4 tables with cited sources = "high"; L3 tables with analyst estimates = "medium"; stub markets = "low").
- **Upstream fix**: The BOM sub-agent should emit a `BOM_{market_slug}.md` file for every market using the same schema:
  - Header with NAICS, output type scoping table (OT-1…N with hydronic flag and sensorFit)
  - L4 subsystem table with `% BOM Cost`, `Key Design Choice`, `Alternatives (market share)` columns
  - Per-L4 L3 module sections with alternative tables and explicit Marquardt anchor annotations
  - Marquardt sensor placement section (tree diagram showing the sensor's exact L4→L3→L2→L1 path)
  - Structured Data JSON block for automated extraction
  - Clayton docs should formalize: `BOMData` type with `l4Subsystems[]`, `modules[]`, `alternatives[]`, `isMarquardtAnchor`, `confidence`, `outputTypes[]` — matching the TypeScript interface added to `src/types/index.ts`.

## Extraction: BOM inline source list (BOMTab.tsx → sources.json)

- **What was hand-authored in the component**: `BOMSourceList` function in `src/pages/analysis/tabs/BOMTab.tsx` — an inline array of 7 source objects with domain-specific labels and URLs (Grand View Research, Barth-Haas, Beer Institute, Market Research Future, Mordor Intelligence, APC International, Badger Meter), rendered as a custom `<ol>` element bypassing the shared `SourceList` component.
- **Where it now lives**: Source entries registered in `src/data/sources.json` under keys `BOM-S01` through `BOM-S07`. `BOMTab.tsx` now declares a `BOM_SOURCE_IDS` constant (a string array — this is a UI config, not domain data) and calls `<SourceList sourceIds={BOM_SOURCE_IDS} />`.
- **Why this data should be in the markdown source upstream**: BOM markdown files already have `## Sources` sections. The extractor should register those sources into the global `sources.json` registry with `BOM-{n}` prefixed IDs during extraction, exactly as it does for JTBD, ODI, VN, and COMPAT sources. Clayton docs should add `BOM` to the prefix registry table.
- **Files modified**: `BOMTab.tsx` (replaced inline source list with SourceList + BOM_SOURCE_IDS constant), `sources.json` (added BOM-S01 through BOM-S07).

## Extraction: Per-technology switching cost data (switchingCostConfig.ts → homeMarketCompetition.json)

- **What was hand-authored in the component**: `HOME_MARKET_SWITCHING_COSTS` — a `Record<string, { level, label, narrative }>` constant in `src/pages/analysis/tabs/alternatives/switchingCostConfig.ts` containing per-technology switching-cost level, human-readable label, and a narrative paragraph for all 6 competing technologies. Duplicated as `TECH_SWITCHING_COST: Record<string, string>` in `src/pages/home/HomeMarketCompetition.tsx`.
- **Where it now lives**: Three new fields on each `incumbents[]` entry in `src/data/homeMarketCompetition.json`: `switchingCostLevel`, `switchingCostLabel`, `switchingCostNarrative`. TypeScript type extended: `IncumbentTechnology` in `src/types/index.ts`.
- **Why this data should be in the markdown source upstream**: The Competitive Landscape sub-agent (Step 03) already generates per-technology switching cost assessments for the home market. The orchestrator should emit these as structured fields per incumbent row (`switching_cost_level: moderate`, `switching_cost_narrative: "..."`) rather than a single global block, so the extractor can populate them directly without hand-authoring.
- **Files modified**: `switchingCostConfig.ts` (constant removed, badge utility kept), `AlternativesTab.tsx` (removed in-component lookup, reads from JSON), `home/HomeMarketCompetition.tsx` (removed in-component lookup, reads from JSON), `homeMarketCompetition.json` (added fields), `src/types/index.ts` (additive type extension).

## Extraction: Per-technology share source IDs (HomeMarketCompetition.tsx → homeMarketCompetition.json)

- **What was hand-authored in the component**: `TECH_SHARE_SOURCES: Record<string, string[]>` in both `src/pages/home/HomeMarketCompetition.tsx` and `src/pages/analysis/tabs/AlternativesTab.tsx` — mapping each technology name to a list of source IDs that back its market-share estimate.
- **Where it now lives**: New field `shareSourceIds: string[]` on each `incumbents[]` entry in `src/data/homeMarketCompetition.json`. TypeScript type extended: `IncumbentTechnology` in `src/types/index.ts`.
- **Why this data should be in the markdown source upstream**: Source IDs for market-share claims are a property of each claim, not of the rendering component. The Competitive Landscape sub-agent should annotate every market-share row with its source reference(s) at generation time, making the extractor's job straightforward.
- **Files modified**: `home/HomeMarketCompetition.tsx` (removed constant, reads `inc.shareSourceIds`), `AlternativesTab.tsx` (removed constant, reads `inc.shareSourceIds`), `homeMarketCompetition.json` (added field), `src/types/index.ts` (additive type extension).

## Extraction: Architecture distance table (NewMarketDiscovery.tsx → marketDiscovery.json)

- **What was hand-authored in the component**: `ARCH_DISTANCE_DATA` — a 16-row array constant in `src/pages/NewMarketDiscovery.tsx` containing per-NAICS architecture distance scores (distance 2–7), `usesTech` flag, functional promise fit, and priority tier for all 16 candidate markets. Sourced from HTML 05 Phase 02b output.
- **Where it now lives**: New field `archDistanceData: ArchDistanceRow[]` in `src/data/marketDiscovery.json`. New type `ArchDistanceRow` added to `src/types/index.ts`.
- **Why this data should be in the markdown source upstream**: Architecture distance is a first-class output of the Phase 02b scoring pipeline. The Discovery sub-agent should emit this as a structured JSON block (or table) in the market discovery markdown so the extractor can parse it directly. Clayton docs should specify `archDistanceData` as a required field in the `MarketDiscovery` schema.
- **Files modified**: `NewMarketDiscovery.tsx` (constant removed, reads from `marketDiscovery.archDistanceData`), `marketDiscovery.json` (added field), `src/types/index.ts` (additive type extension).

## Extraction: Candidate detail narratives (NewMarketDiscovery.tsx → marketDiscovery.json)

- **What was hand-authored in the component**: `CANDIDATE_DETAILS: CandidateDetail[]` — a 16-item array constant in `src/pages/NewMarketDiscovery.tsx` containing per-NAICS job statement, "why needed" narrative, alternative technologies, and market size estimate for all 16 discovered candidate markets. Sourced from HTML 05.
- **Where it now lives**: New field `candidateDetails: CandidateDetail[]` in `src/data/marketDiscovery.json`. New type `CandidateDetail` added to `src/types/index.ts`.
- **Why this data should be in the markdown source upstream**: Per-candidate rationale (job statement, why flow measurement is needed, incumbent alternatives, market size estimate) is a natural output of the UNSPSC-to-NAICS cross-classification phase. The Discovery sub-agent should write these as structured rows in the market discovery report, allowing the extractor to parse them. This is the same data Clayton docs already requires for the Candidate Details section — it simply needs to be persisted as structured output rather than prose.
- **Files modified**: `NewMarketDiscovery.tsx` (constant and interface removed, reads from `marketDiscovery.candidateDetails`), `marketDiscovery.json` (added field), `src/types/index.ts` (additive type extension).

## 17. VN extractor: Format B L6 systems not parsed

- **What**: Three markets (`ac-home-heating` NAICS 333415, `data-processing-hosting` NAICS 518210, and optionally others with non-standard headings) had `l6Systems: []` in their `valueNetwork.json`, causing the Value Network tab to show "Value network diagram data not yet available for this market." The markdown DID have the L6 data — the extractor couldn't see it.
- **Gap**: The extractor's `extractVN()` function only looked for `## L6 — System-of-Systems Decomposition` (Format A). Two additional formats exist in the sections directory:
  - **Format B1** (`VN_air_conditioning_and_warm_air_heating_eq.md`): Two separate `## L6 — …` headings — one for "Core Process Steps (Sequential)" and one for "Horizontal Process Steps". Each has a table with a `L6` first-column header and row IDs like `L6a`, `L6b`, `L6(H1)`.
  - **Format B2** (`VN_data_processing_hosting.md`): A single `## L6 — Process Steps` heading containing `### Core (sequential)` and `### Horizontal (parallel, cross-cutting)` sub-headings, with tables using `ID` as first-column header. Both files also lack a `## Header` table (used by Format A to supply `CFJ`, `Output Types`, `Architecture Distance`), so those fields were empty as well.
- **Format classification** (all 9 markets):
  - **Format A** (works before fix): `finfish-farming`, `hvac-contractors`, `district-energy`, `heating-equipment`, `commercial-service-machinery`, `breweries`, `flowmeters-reference` — all use `## L6 — System-of-Systems Decomposition` with `L6 ID` column.
  - **Format B1** (fixed): `ac-home-heating` — multiple `## L6 — <title>` headings, each containing a table with `L6` first column.
  - **Format B2** (fixed): `data-processing-hosting` — single `## L6 — Process Steps` with `### Core` / `### Horizontal` sub-headings.
- **Extractor change** (`scripts/extract-data.mjs`):
  1. Try Format A first (`extractSection("L6 — System-of-Systems Decomposition")`). If the section is non-empty, use the existing `L6 ID` / `Name` / `Type` / `Job Family` column mapping.
  2. If Format A returns empty, detect Format B2 by looking for `### Core` sub-headings inside a single `## L6 — …` section. Parse each sub-section table with `ID` / `Name` / `Job family` / scope columns; tag `category: "core"` or `"horizontal"` from the sub-heading.
  3. If still empty, scan all `## L6 — …` sections (Format B1 fallback), parsing `L6` / `Name` / `Job Family` columns; derive `category` from heading text.
  4. All Format B rows get `scope` (fourth column) and `l5Units: []` added to the output object.
  5. For Format B files lacking `## Header`, added fallback extraction from `## Industry Context`, `## Core Functional Job (L7)`, and `## Output Types` sections to populate `coreJobStatement`, `outputTypes`, and `architectureDistance`.
- **Type change** (`src/types/index.ts`): Added optional `scope?: string`, `category?: string`, and `l5Units?: unknown[]` to `L6System` interface.
- **UI change** (`VNDiagram.tsx`): Added a "Scope / Output Types" section in the detail panel for L6 systems that have the `scope` field set.
- **Source**: `extractor-fix` — data was in the markdown; only the parser needed updating.
- **Upstream fix**: Standardize the VN markdown format. All markets should use Format A's `## L6 — System-of-Systems Decomposition` with a unified table schema: `| L6 ID | Name | Type | Job Family |`. The `Type` column should be `Core` or `Horizontal`. Clayton docs should lock this as the canonical VN L6 table schema and update the VN sub-agent's output template accordingly. The `scope` / output-type activation matrix is valuable — it should be added as a separate `## Output Type Activation Matrix` section (as in ac-home-heating) rather than embedded in the L6 table rows.

## 18. AlternativesTab shape mismatch — JTBD alternatives table vs TechCard incumbent shape

- **What**: The Alternatives tab in every market analysis page rendered blank cards for all 5 alternatives despite `alternatives.json` being fully populated.
- **Gap**: `AlternativesTab.tsx` cast `alternatives as unknown as TechCardData[]` and passed each entry to `TechCard`. But `alternatives.json` entries have shape `{ name, unspsc, tradeoffs }` (from the JTBD §2.4 Alternatives table), whereas `TechCardData` expects `{ technologyName, mechanism, marketShareEstimate, keyVendors[], strengths[], weaknesses[], switchingCost }`. All `TechCard` fields were `undefined`, so every card rendered empty. Because `hasMarketSpecific = alternatives.length > 0` was `true` (5 entries exist), the tab never fell back to the home-market reference set — it was silently stuck between two incompatible shapes.
- **Root cause**: The UI was designed for the richer home-market incumbent shape before market-specific alternatives.json was extracted from the JTBD markdown. When the extractor started populating alternatives.json from §2.4, nobody updated the component to match the new shape.
- **What changed**:
  - Created `src/pages/analysis/tabs/alternatives/AlternativeCard.tsx` — a new card component that renders only the fields that exist (`name`, `unspsc`, `tradeoffs`). Parses `[SRC: ...]` suffixes out of tradeoffs into a source line; splits on `;` for bullet points; highlights `$X–$Y` price ranges and `X%` percentages in accent-yellow; shows a "Status Quo" or "Marquardt's approach" badge based on name content; renders a "Tradeoffs data pending" placeholder when `tradeoffs` is an empty string.
  - Rewrote `src/pages/analysis/tabs/AlternativesTab.tsx` — removed the `homeMarketToTechCards()` fallback and the `TechCard` import; replaced the render loop with `AlternativeCard` components; kept the `ExecutiveSummary` and section heading.
  - `TechCard.tsx` and `switchingCostConfig.ts` are untouched — they remain correct for `HomeMarketCompetition`'s Competing Technologies section.
  - `src/types/index.ts` unchanged — the `Alternative` type `{ name, unspsc, tradeoffs }` was already correct.
- **Source**: `extractor-fix` (data was correct in JSON; only the UI component needed updating to match the actual shape).
- **Upstream fix (recommended)**: Option A (preferred) — enrich the JTBD alternatives markdown §2.4 table with additional columns matching the home-market incumbent richness: `Mechanism`, `Market Share`, `Key Vendors`, `Strengths`, `Weaknesses`, `Switching Cost Level`, `Switching Cost Narrative`. This lets the extractor populate a fuller `alternatives.json` and the tab can eventually match the richness of the HomeMarketCompetition Competing Technologies view. Option B (minimal) — keep the current 3-column shape and accept that the Alternatives tab renders less detail than the home-market tab. The current fix implements Option B while keeping Option A straightforward to add later.

## 19. Home Market VN — L5 vnUnits unpopulated (ac-home-heating)

- **What**: `src/data/markets/ac-home-heating/valueNetwork.json` had `l6Systems` populated but `vnUnits: []`, causing the Value Network tab to render "no units" for the home-market (NAICS 333415) even though the markdown had full L5 data.
- **Gap (extraction)**: The extractor's L5 parsing looks for tabular L5 sections (`## L5 — …` with a markdown table). The `ac-home-heating` VN markdown stores its L5 units inside a `## Structured Data` embedded JSON block rather than a table — so the extractor never found them.
- **Gap (ID format)**: L6 IDs in this markdown are letter-based (`L6a`–`L6i`) instead of the dot-notation (`L6.1`–`L6.9`) expected by `groupUnitsByL6()` in `helpers.ts`. The helper was calling `parseInt("L6a", 10) = NaN`, silently dropping all units into an unmatched fallback bucket.
- **Fix applied**:
  1. Python script extracted L5 units from the `## Structured Data` JSON block in `sections/VN_air_conditioning_and_warm_air_heating_eq.md` and wrote them into `valueNetwork.json`.
  2. ID mapping applied at extraction time: `L6a→L6.1`, `L6b→L6.2`, `L6c→L6.3`, `L6d→L6.4`, `L6e→L6.5`, `L6f→L6.6` (Hydronic Circuit Assembly — Marquardt PRIMARY position), horizontal steps → `L6.H1`–`L6.H5`.
  3. `groupUnitsByL6()` in `src/pages/analysis/tabs/valuenetwork/helpers.ts` fixed to use the raw string section (`parts[1]`) rather than `parseInt()`, so `L5.H1.1` → section `H1` → `L6.H1` resolves correctly. NaN guard left in for the ordinal fallback only.
- **Source**: `markdown-reparse` + `extractor-fix`.
- **Upstream fix**: Two standardisation actions needed:
  1. VN sub-agent should always use dot-notation L6 IDs (`L6.1`, `L6.H1`) — never letter-suffix notation. Lock this in Clayton docs VN table schema.
  2. L5 units should always be in a `## L5 — Production Units` markdown table (Format A), never only inside a `## Structured Data` JSON block. The JSON block is fine as a redundant machine-readable representation, but the table is what the extractor reads. Require both.

## 20. New file: overview.json — company profile, portfolio priorities, financial scenarios

- **What**: Created `src/data/overview.json` to power the new `00 Overview` page (`/overview`). This file did not exist — the app had no top-level company-context page.
- **Gap**: No equivalent JSON existed. Overview-level data (CEO, revenue, employees, sites, divisions, patents, product variants, portfolio ranking summary, 5-year financial scenarios) was only in internal markdown sections (`00_executive_summary.md`, `00a_portfolio_hierarchy.md`), not extracted to JSON.
- **Source**: `web-research` — all company-profile fields verified against external, URL-verifiable sources:
  - Revenue €1.35B (2024, −3.2% vs 2023): Marquardt newsroom `business-year-2024`
  - Employees ~9,700: Marquardt `worldwide-on-site` official page
  - CEO Björn Twiehaus (since January 2025): Marquardt management page + newsroom announcement
  - 22 sites, 15 countries, 4 continents: worldwide-on-site page
  - Patent portfolio (1,641 total, 770 granted): GreyB / Insights Gate patent analytics
  - Divisions (5, including new "Home and Industrial Solutions" created 2024): worldwide-on-site + newsroom
  - Product variants (DN12/14/20/25): Marquardt product page + whitepaper
- **Source restriction**: Internal Clayton analysis markdown (`00_executive_summary.md`, `00a_portfolio_hierarchy.md`) was used to understand the portfolio scoring logic and financial scenarios but is NOT cited as a source in the UI. Only external, clickable URLs are listed in the `sources[]` array (OVW-S01 through OVW-S10). Internal docs (OVW-S11/S12) were added then removed before commit.
- **Portfolio and financials**: These sections derive from the internal analysis work — no external URL can be cited for the composite fit scores or NPV/IRR estimates. `<SourceFootnote>` is intentionally absent from those sections.
- **TypeScript interface**: `OverviewData` in `src/pages/home/Overview.tsx` written to match the JSON exactly: `divisions: Division[]` (array, not single object), `company.ceo: { name, since, note }`, `company.patentsTotal / patentsGranted` (not `patentsPerYear`), `financials.npvDownside / irrDownside / breakevenDownside` added.
- **Upstream fix**: The orchestrator should emit `overview.json` as a first-class output alongside product/market JSONs. Required fields: `company` (profile block), `divisions[]`, `productGroup`, `product` (variants), `studyQuestion` (Q1 + Q2 with German originals + English + answer), `portfolioPriorities[]`, `financials` (three-scenario block), `sources[]`. Internal analysis outputs (composite scores, NPV/IRR) are legitimate content but must be flagged `internal: true` so the UI can suppress source footnotes for them.

---

## Template for adding a new entry

When an agent encounters a new data gap, append a section in this format:

```
## N. <Short title>

- **What**: <1-line description of the data field / UI need>
- **Gap**: <Why the markdown/HTML couldn't supply it>
- **Source**: <extractor-fix | markdown-reparse | html-reparse | web-research | heuristic | hand-authored>
- **Upstream fix**: <Concrete recommendation for orchestrator and/or Clayton docs>
```

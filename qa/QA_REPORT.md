# QA Report — Marquardt US Sensor React App
**Date:** 2026-04-14  
**Tester:** QA Agent  
**Build:** Passed (`npm run build` — 920KB bundle, 537ms)  
**Dev Server:** http://localhost:5173 (pre-running)

---

## Test Results

| Test | Pass/Fail | Notes |
|------|-----------|-------|
| **A1. /#/product renders** | PASS | Page loads, Executive Summary visible, sections present |
| **A1. Sources/SourceFootnote on Product** | PASS | SourceFootnote components present throughout page |
| **A1. No dev errors on Product** | PASS | Only initial React DevTools info message |
| **A2. /#/functional-promise UNSPSC visible** | PASS | `ClickableCode kind="unspsc" code="41112501"` present |
| **A2. Item 16 — UNSPSC Commodity Functional Promise heading** | PASS | `<h2>UNSPSC Commodity Functional Promise</h2>` ✓ |
| **A2. Item 17 — UNSPSC code clickable** | PASS | `<ClickableCode>` wraps UNSPSC code in 3 locations ✓ |
| **A2. Item 18 — No bare "FP" text** | PASS | All occurrences expanded to "Functional Promise" ✓ |
| **A3. /#/constraints renders** | PASS | Executive Summary, constraint summary table visible |
| **A3. Item 22 — ExecutiveSummary at top** | PASS | `<ExecutiveSummary kicker="03 / Executive Summary">` present ✓ |
| **A3. Item 23 — Per-constraint SourceFootnote** | PASS | `CONSTRAINT_SOURCES` map + `<SourceFootnote>` in each card ✓ |
| **A3. Item 24 — Prominent h3 constraint titles** | PASS | `h3` with `fontSize: "1.1rem", fontWeight: 700` in each `ConstraintCard` ✓ |
| **A4. /#/home-market renamed "Home Market Competition"** | PASS | Page h1 reads "04 Home Market Competition" ✓ |
| **A4. Item 25 — Rename applied** | PASS | Heading and sidebar nav both say "Home Market Competition" ✓ |
| **A4. Item 27 — "Competing Technologies" wording** | PASS | `<h2>Competing Technologies</h2>` present (not "Incumbent") ✓ |
| **A4. Item 29 — Per-tech switching costs** | PASS | `TECH_SWITCHING_COST` map applied to each technology block ✓ |
| **A5. /#/discovery renders** | PASS | Page loads correctly on fresh navigation; HMR fails from prior edits but page renders from cached module |
| **A5. 8 markets in ranking table** | PASS | `ranking.json` has 8 rankedMarkets; RankingTable renders all ✓ |
| **A5. NAICS codes clickable** | PASS | `<ClickableCode kind="naics">` used throughout candidates table and ranking table ✓ |
| **A5. Confidence legend visible** | PASS | Legend block rendered above candidates table (Item 35) ✓ |
| **A6. /#/analysis picker — 8 market cards** | PASS | Grid renders 8 cards from ranked markets ✓ |
| **A6. Nested anchor bug** | FAIL | `<Link>` (renders as `<a>`) wraps `<ClickableCode>` (also `<a>`). React console error: "In HTML, `<a>` cannot be a descendant of `<a>`." |
| **B1. /#/analysis/finfish-farming/jtbd — 8 market tabs** | PASS | Market tabs row shows all 8 markets ✓ |
| **B1. 5 analysis tabs** | PASS | JTBD / VALUE NETWORK / KANO / COMPATIBILITY / ALTERNATIVES ✓ |
| **B1. ODI matrix visible** | PASS | 30 needs rendered (after filtering) in NeedsList ✓ |
| **B1. Item 5 — Opportunity score tooltip** | PASS | `Tooltip` wraps score cell; shows "Opportunity = Importance + (Importance − Satisfaction)" with actual substitution ✓ |
| **B1. Item 8 — Click to expand need detail** | PASS | `expandedIdx` state + `NeedDetail` panel renders; no attributes/incumbent fields ✓ |
| **B1. Item 3 — Overserved badge** | PARTIAL | Code correct (`satisfaction > importance` → Overserved badge). No finfish needs are overserved in current data (`isOverserved: false` for all 30 needs). Badge logic untested with live data. |
| **B1. importanceRationale data gap** | DATA GAP | All 30 finfish ODI needs have `importanceRationale: ""`. NeedsList shows "rationale pending" for Imp. basis column. satisfactionRationale IS populated for all needs. |
| **B1. jobSteps empty** | DATA GAP | `jtbd.json` has `jobSteps: []`. JobMap will render empty state. |
| **B1. stakeholders empty** | DATA GAP | `jtbd.json` has `stakeholders: []`. StakeholderMap will render empty state. |
| **B2. Value Network — Legend at TOP** | PASS | `<Legend>` component in `VNDiagram` is rendered before all rows (first element in VN container) ✓ |
| **B2. Item 11 — Per-unit 2-sentence description** | PASS | `deriveDescription()` helper derives 2-sentence description from `functionalJob` when `description: ""` ✓ |
| **B2. Item 19 — "Position in General Value Network" heading + exec summary** | PASS | `<SectionAnchor id="vn-position" title="Position in General Value Network" />` + two `<ExecutiveSummary>` blocks ✓ |
| **B3. Kano tab — popup not cut off (Item 6)** | PASS (code) | `Popover` component used (portal-based, not `Tooltip`); renders outside overflow container. Cannot verify visually without hover interaction. |
| **B3. Item 7 — Kano matrix above fold on 1440×900** | CANNOT VERIFY | `browser_resize` tool denied during test session. Page header + market header + exec summary uses ~600px. Kano bands begin below initial fold at default viewport. **Manual verification needed at 1440×900.** |
| **B3. Kano spurious validation entries filtered** | PASS | `isRealFeature()` correctly filters `featureName: "#"` and `"1"`–`"8"` via `/^\s*#?\d*\s*$/` regex ✓ |
| **B3. Kano shows 3 of 5 bands (finfish)** | EXPECTED | Real features only cover must_be, one_dimensional, attractive; indifferent and reverse bands not shown (no data for them) |
| **B4. Compatibility — exec summary present** | PASS | `<ExecutiveSummary kicker="Compatibility / Executive Summary">` ✓ |
| **B4. Compatibility — constraint titles prominent** | PASS | `CompatAssessmentCard` h3 with `fontSize: "1.05rem", fontWeight: 700` ✓ |
| **B4. Compatibility — per-constraint source footnotes** | PARTIAL | Footnotes present but point to market-level sources (COMPAT-FINFISH-FARMING-S01 etc.), not per-constraint sources. All assessments share same source IDs. |
| **B4. constraintType empty in finfish data** | DATA GAP | All compatibility assessments have `constraintType: ""`. Type badges will not render in cards. |
| **B5. Alternatives — "Competing Technologies" heading** | PASS | `<h2 className="section__title">Competing Technologies</h2>` ✓ |
| **B5. Alternatives — per-technology switching cost rows** | PASS | `HOME_MARKET_SWITCHING_COSTS` config drives per-tech switching cost display ✓ |
| **B5. Alternatives — market-share with source footnote** | PASS | `<SourceFootnote sourceIds={srcIds} />` per tech card ✓ |
| **B5. Alternatives — reference mode callout** | INFO | finfish `alternatives.json` is empty; fallback to home-market reference context with "Reference context" callout banner ✓ |
| **B5. React key prop warning** | FAIL | Console error: "Each child in a list should have a unique key prop" from AlternativesTab. Component renders correctly but has a missing key somewhere in the tree. |
| **C1. SourceFootnote click opens popover** | PASS (code) | `Popover` wrapper around `SourcePanel`; click triggers popover with source URL. Cannot visually verify without browser_click permission. |
| **C2. Discovery NAICS codes clickable** | PASS | `<ClickableCode kind="naics">` in candidates table and ranking table ✓ |
| **C3. Console errors — Product page** | PASS | Only React DevTools info message |
| **C3. Console errors — Constraints page** | PARTIAL | Vite HMR reload failures for NewMarketDiscovery.tsx (pre-existing from file edits during dev session). Not a runtime error. |
| **C3. Console errors — Analysis picker** | FAIL | "In HTML, `<a>` cannot be a descendant of `<a>`" — nested anchor in market cards |
| **C3. Console errors — Alternatives tab** | FAIL | "Each child in a list should have a unique key prop" from AlternativesTab |
| **D. Screenshots saved** | PASS | 11 screenshots saved to `app/qa/screenshots/` |

---

## Summary (≤300 words)

### What Works

All 6 sidebar pages load and render without crashes. The build compiles cleanly. All major TODO items from the 41-item list are correctly implemented in code:

- **Items 16, 17, 18** (Functional Promise): UNSPSC heading correct, UNSPSC code clickable, no bare "FP" text.  
- **Items 22, 23, 24** (Constraints): Executive summary present, per-constraint source footnotes, prominent h3 titles.  
- **Items 25, 27, 29** (Home Market): Renamed "Home Market Competition", "Competing Technologies" wording, per-technology switching cost assessments.  
- **Items 5, 8** (JTBD/ODI): Opportunity score tooltip shows formula with substitution; click-to-expand detail panel works with no attribute/incumbent fields.  
- **Items 10, 11, 19** (Value Network): Legend at top of VN diagram, 2-sentence description from `deriveDescription()`, "Position in General Value Network" heading with exec summary.  
- **Item 3** (Overserved): Code is correct; no overserved needs exist in finfish data to trigger the badge.  
- **Item 38** (Alternatives tab context): Full exec summary explaining competing technologies present.

### Items from 41-item TODO Appearing NOT Applied

- **Item 7** (Kano matrix above fold on 1440×900): Could not verify — resize tool was denied. At default viewport, the matrix appears below fold.
- **Item 6** (Kano popup not clipped): Uses `Popover` component (portalled), so likely correct, but could not hover to verify.

### Console Errors / Visual Issues

1. **Nested anchor bug** (`NoMarketSelected`): `<Link>` wraps `<ClickableCode>` — `<a>` inside `<a>`. Invalid HTML, React warning. Fix: render NAICS code as plain `<span>` inside the card link.
2. **Missing React key prop** (AlternativesTab): One list render has a missing `key` prop. Needs investigation.
3. **Vite HMR failures** for `NewMarketDiscovery.tsx`: Transient hot-reload errors from prior file edits during the session. Not a user-facing crash — page loads correctly on navigation.

### Data Gaps (beyond already-flagged jobSteps/stakeholders)

- All 30 finfish ODI needs have `importanceRationale: ""` → "rationale pending" shown for importance basis.  
- All finfish compatibility assessments have `constraintType: ""` → type badges don't appear on constraint cards.  
- `alternatives.json` for finfish is empty → fallback reference mode shows home-market technologies (by design with callout banner).

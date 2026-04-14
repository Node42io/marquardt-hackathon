// ─────────────────────────────────────────────────────────────────────────────
// Marquardt US Sensor — Shared TypeScript Interfaces
// Source of truth: app/src/data/*.json + app/src/data/markets/{slug}/*.json
// ─────────────────────────────────────────────────────────────────────────────

// ─── Utility ─────────────────────────────────────────────────────────────────

export interface Source {
  id: string; // e.g. "S01"
  label: string; // human-readable title or citation
  url?: string; // clickable link (absent if not available)
  quote?: string; // optional pull-quote from the source
  prefixedId?: string; // e.g. "PROD-S01" — global registry key
}

// ─── Product Decomposition ────────────────────────────────────────────────────

export interface ChristensenAbstraction {
  mechanism: string;
  function: string;
  outcome: string;
}

export interface TechnologyClassification {
  class: string;
  underlyingMechanism: string;
  unspscCode: string;
  unspscTitle: string;
  unspscPath: string;
}

export interface FunctionalPromiseCore {
  statement: string;
  verb: string;
  object: string;
  context: string;
}

export type FeatureScope = "technology" | "vendor";
export type FeatureCategory =
  | "performance"
  | "integration"
  | "reliability"
  | "safety"
  | "usability"
  | "maintenance"
  | string;

export interface Feature {
  scope: FeatureScope;
  name: string;
  short: string; // one-line description
  long: string; // 2-4 sentence elaboration
  category: FeatureCategory;
}

export interface Specification {
  name: string;
  value: string;
  unit?: string;
  testCondition?: string;
}

export type ConstraintType =
  | "physical"
  | "chemical"
  | "operational"
  | "economic"
  | "regulatory"
  | "environmental"
  | string;

export type ConstraintSeverity = "low" | "medium" | "high" | "critical" | string;

export interface Constraint {
  name: string;
  constraintType: ConstraintType;
  description: string;
  severity?: ConstraintSeverity;
  thresholdValue: string | null;
  thresholdUnit: string | null;
  isAbsolute: boolean;
  affectedMarketsHint?: string[];
  sourceIds?: string[];
  rationale?: string;
  mitigation?: string;
}

export interface BOMItem {
  id: string;
  component: string;
  function: string;
  category: string;
  keyAttribute: string;
}

export interface ProductDecomposition {
  productName: string;
  vendorName: string;
  christensen: ChristensenAbstraction;
  technology: TechnologyClassification;
  functionalPromise: FunctionalPromiseCore;
  commodityFunctionalPromise: string;
  differentiators: string[];
  features: Feature[];
  specifications: Specification[];
  constraints: Constraint[];
  /** Bill of Materials — 7 logical sensor components derived from product features. */
  billOfMaterials?: BOMItem[];
  sources: Source[];
}

// ─── Functional Promise ───────────────────────────────────────────────────────

export interface FPProduct extends FunctionalPromiseCore {
  differentiators: string[];
}

export interface FPCommodity {
  statement: string;
  commodity: string;
  unspscCode: string;
  reasoning: string;
  fpExtension: string;
  fpExtensionDomains: string[];
}

export interface BOMPosition {
  level: string; // e.g. "L5"
  position: string; // e.g. "Component"
  parentSubsystem: string;
  grandparentSystem: string;
}

export type ComplementCriticality = "essential" | "enhancing" | "optional" | string;

export interface Complement {
  name: string;
  criticality: ComplementCriticality;
  description: string;
}

export interface FunctionalPromiseData {
  productFP: FPProduct;
  commodityFP: FPCommodity;
  bomPosition: BOMPosition;
  complements: Complement[];
  sources: Source[];
}

// ─── Constraints (file) ───────────────────────────────────────────────────────

export interface ConstraintsData {
  constraints: Constraint[];
  sources: Source[];
}

// ─── Home Market Competition ──────────────────────────────────────────────────

export type MarketShareEstimate = "dominant" | "significant" | "niche" | "emerging" | string;

export interface IncumbentTechnology {
  technologyName: string;
  mechanism: string;
  marketShareEstimate: MarketShareEstimate;
  /** Source IDs backing the market-share estimate for this technology. */
  shareSourceIds?: string[];
  keyVendors: string[];
  strengths: string[];
  weaknesses: string[];
  confidence: number;
  /** Switching cost severity level for this technology. */
  switchingCostLevel?: "very-low" | "low" | "moderate" | "high";
  /** Human-readable switching cost label (e.g. "Low–Moderate"). */
  switchingCostLabel?: string;
  /** Per-technology switching cost narrative paragraph. */
  switchingCostNarrative?: string;
}

export interface PositioningRow {
  technology: string;
  share: string;
  pressureDrop: string;
  movingParts: string;
  accuracy: string;
  unitCost: string;
  continuousOutput: string;
  heatMeterReady: string;
}

export interface HomeMarketCompetition {
  marketName: string;
  naicsCode: string;
  naicsTitle: string;
  functionalNeed: string;
  switchingCost: string;
  switchingCostFactors: Record<string, string>;
  incumbents: IncumbentTechnology[];
  positioningTable: PositioningRow[];
  sources: Source[];
}

// ─── Market Discovery ─────────────────────────────────────────────────────────

export interface MarketCandidate {
  naics: string;
  title: string;
  fpFit: string;
  adoption: string;
  discoverySource: string;
  confidence: number;
}

/** Architecture-distance row from Phase 02b ranking. */
export interface ArchDistanceRow {
  naics: string;
  title: string;
  distance: number;
  usesTech: boolean;
  fpFit: string;
  priority: "HIGH" | "MEDIUM" | "LOW";
}

/** Per-NAICS candidate detail card (job, why needed, alternatives, market size). */
export interface CandidateDetail {
  naics: string;
  title: string;
  job: string;
  whyNeeded: string;
  alternatives: string;
  marketSize: string;
  confidence: number;
}

export interface MarketDiscovery {
  commodityFP: string;
  unspscContext: string;
  fpExtension: string;
  extensionDomains: string;
  candidates: MarketCandidate[];
  /** Architecture distance ranking data (Phase 02b). */
  archDistanceData?: ArchDistanceRow[];
  /** Per-NAICS candidate detail cards. */
  candidateDetails?: CandidateDetail[];
  sources: Source[];
}

// ─── Ranking ──────────────────────────────────────────────────────────────────

export interface MarketScores {
  odi: number;
  featureFit: number;
  constraintCompatibility: number;
  jobCoverage: number;
  vnHierarchy: number;
  incumbentVulnerability: number;
  composite: number;
}

export type Recommendation = "pursue" | "investigate" | "defer" | "no-go" | string;

export interface RankedMarket {
  rank: number;
  slug: string;
  marketName: string;
  naicsCode: string;
  scores: MarketScores;
  recommendation: Recommendation;
  rationale: string;
  entryStrategy: string;
  estimatedTimeToEntry: string;
  estimatedInvestment: string;
}

export interface RankingWeights {
  odi_opportunity: number;
  feature_fit: number;
  constraint_compatibility: number;
  job_coverage: number;
  vn_hierarchy: number;
  incumbent_vulnerability: number;
}

export interface RankingData {
  productName: string;
  vendorName: string;
  technologyClass: string;
  unspscCode: string;
  unspscTitle: string;
  customProductGroup: string;
  commodityFunctionalPromise: string;
  totalMarketsEvaluated: number;
  marketsEliminatedByConstraints: number;
  weights: RankingWeights;
  rankedMarkets: RankedMarket[];
  executiveSummary: string;
}

// ─── JTBD ─────────────────────────────────────────────────────────────────────

export interface JobStep {
  stepNumber: number;
  verb: string;
  description: string;
  /** True when the step is flagged as sensor-relevant in the job map table. */
  isSensorRelevant?: boolean;
  /** Why this step depends on sensor capability (from the Rationale column). */
  sensorDependencyRationale?: string;
  rawStatement: string;
  jobStep: string;
  relevant: boolean;
  rationale: string;
}

export interface Stakeholder {
  role: string;
  who: string;
  pyramidLevels: string;
}

export interface Segment {
  /** Sequential number from the table. */
  segmentNumber?: number;
  name: string;
  /** Parenthetical qualifier after the bolded name (e.g. ">500 t/yr, salmon focus"). */
  qualifier?: string;
  circumstance: string;
  alternativesDiffer: string;
  /** Parsed from "Alternatives Differ?" column — true when field starts with "Yes". */
  isTargetable?: boolean;
  /** Reason after "Yes — " in the Alternatives Differ column. */
  targetabilityReason?: string;
  /** Alias for circumstance (legacy UI compat). */
  characteristics?: string;
}

export interface Alternative {
  name: string;
  unspsc: string;
  tradeoffs: string;
}

/** Raw JTBD need (error statement level — 25 core + PRN). */
export interface JTBDNeed {
  id: string;
  statement: string;
  jobStep: string;
  errorType: string;
  importance: number;
  satisfaction: number;
  opportunity: number;
  impactCategory: string;
  productRelated: boolean;
  confidence: number;
}

export interface JTBDData {
  naicsCode: string;
  marketName: string;
  slug: string;
  coreJobStatement: string;
  productJobStatement: string;
  anchorLevel: string;
  lPath: string;
  segments: Segment[];
  alternatives: Alternative[];
  jobSteps: JobStep[];
  stakeholders: Stakeholder[];
  needs: JTBDNeed[];
  sources: Source[];
}

// ─── ODI ──────────────────────────────────────────────────────────────────────

/**
 * An Outcome-Driven Innovation need with Ulwick opportunity scoring.
 *
 * opportunity = importance + max(0, importance − satisfaction)
 * needsRationale = true means both rationale fields are empty strings and the
 * UI should render a "rationale pending" placeholder.
 */
export interface ODINeed {
  id: string;
  statement: string;
  jobStep: string;
  importance: number; // 0–10
  satisfaction: number; // 0–10
  opportunity: number; // Ulwick formula
  isUnderserved: boolean; // importance > 7 AND satisfaction < 5
  isOverserved: boolean; // importance < 3 AND satisfaction > 7
  productRelated: boolean;
  importanceRationale: string;
  satisfactionRationale: string; // pulled from recalibration table
  needsRationale?: boolean; // true → placeholder UI state
  /** Name of the stakeholder most responsible for / affected by this outcome. */
  primaryStakeholder?: string;
  /** Names of secondary stakeholders who also care about this outcome. */
  stakeholderIds?: string[];
}

export interface ODISummary {
  totalNeeds: number;
  underservedCount: number;
  overservedCount: number;
  avgOpportunityScore: number;
}

export interface ODITop5 {
  rank: number;
  needId: string;
  statement: string;
  importance: number;
  satisfaction: number;
  opportunity: number;
  zone: string;
}

export interface ODIData {
  naicsCode: string;
  marketName: string;
  slug: string;
  summary: ODISummary;
  top5Opportunities: ODITop5[];
  needs: ODINeed[];
  flaggedRationalesCount: number;
  sources: Source[];
}

// ─── Value Network ────────────────────────────────────────────────────────────

export interface L6System {
  id: string;
  name: string;
  type: string;
  jobFamily: string;
  /** Output types or scope string (Format B only). */
  scope?: string;
  /** "core" | "horizontal" — present for Format B markets. */
  category?: string;
  /** L5 child units pre-linked here (reserved for future use; always [] currently). */
  l5Units?: unknown[];
}

export interface VNUnit {
  level: string;
  id: string;
  name: string;
  functionalJob: string;
  description: string;
  dependencies: string[];
}

export interface ValueNetworkData {
  naicsCode: string;
  marketName: string;
  slug: string;
  coreJobStatement: string;
  outputTypes: string[];
  hierarchy: string;
  architectureDistance: number;
  marketSize: string;
  l6Systems: L6System[];
  vnUnits: VNUnit[];
  marquardtPosition: string;
  strategicPosition: Record<string, unknown> | null;
  sources: Source[];
}

// ─── Kano / Feature-Market Fit ────────────────────────────────────────────────

export type KanoClassification =
  | "must_be"
  | "one_dimensional"
  | "attractive"
  | "indifferent"
  | "reverse"
  | string;

export interface KanoScores {
  time: number;
  cost: number;
  safety: number;
  reliability: number;
  skill: number;
  stress: number;
  pain: number;
  confidence: number;
  delight: number;
  overall: number;
}

export interface KanoFeature {
  featureName: string;
  kanoClassification: KanoClassification;
  scores: KanoScores;
  rationale: string;
}

export interface PRNNeed {
  id: string;
  statement: string;
  sourceConstraint: string;
  importance: number;
  satisfaction: number;
  rationale: string;
}

export interface KanoData {
  naicsCode: string;
  marketName: string;
  slug: string;
  features: KanoFeature[];
  avgOverallFit: number;
  productRelatedNeeds: PRNNeed[];
  sources: Source[];
}

// ─── Constraint Compatibility ─────────────────────────────────────────────────

export type CompatVerdict = "none" | "mitigable" | "knockout" | string;

export interface CompatAssessment {
  constraintName: string;
  constraintType: string;
  threshold: string;
  verdict: CompatVerdict;
  rationale: string;
  mitigation: string;
  mitigationCost: string;
  mitigationTime: string;
}

export interface CompatResult {
  knockouts: number;
  mitigable: number;
  none: number;
  marketStatus: string;
  totalMitigationCost: string;
  totalMitigationTime: string;
}

export interface CompatibilityData {
  naicsCode: string;
  marketName: string;
  slug: string;
  operatingMedium: string;
  architectureDistance: number;
  assessments: CompatAssessment[];
  result: CompatResult;
  sources: Source[];
}

// ─── Alternatives ─────────────────────────────────────────────────────────────

export interface AlternativesData {
  naicsCode: string;
  marketName: string;
  slug: string;
  alternatives: Alternative[];
}

// ─── Market Meta ──────────────────────────────────────────────────────────────

export interface MarketMeta {
  slug: string;
  name: string;
  naicsCode: string;
  isReference: boolean;
  rank: number | null;
  scores: MarketScores | null;
  recommendation: Recommendation | null;
  rationale: string | null;
  entryStrategy: string | null;
  estimatedTimeToEntry: string | null;
  estimatedInvestment: string | null;
}

// ─── Market Index Entry ───────────────────────────────────────────────────────

export interface MarketIndexEntry {
  slug: string;
  name: string;
  naics: string;
  isReference: boolean;
  sourceFile: string;
}

// ─── Bill of Materials (per-market) ──────────────────────────────────────────

export type BOMConfidence = "high" | "medium" | "low";

export interface BOMOutputType {
  id: string;
  name: string;
  hydronic: boolean;
  sensorFit: "primary" | "secondary" | "none";
  notes: string;
}

export interface BOMAlternative {
  name: string;
  sharePct: number;
  trend: "growing" | "stable" | "declining" | "growing" | string;
  /** True when this alternative is the Marquardt product or technology */
  isMarquardt?: boolean;
}

export interface BOMModule {
  id: string;
  name: string;
  isMarquardtAnchor: boolean;
  /** Short note shown in sensor-anchor badge */
  sensorNote?: string;
  alternatives: BOMAlternative[];
}

export interface BOML4Subsystem {
  id: string;
  name: string;
  costSharePct: number;
  keyDesignChoice: string;
  isMarquardtAnchor: boolean;
  confidence: BOMConfidence;
  alternatives: BOMAlternative[];
  modules: BOMModule[];
}

export interface BOMData {
  slug: string;
  marketName: string;
  naicsCode: string;
  confidence: BOMConfidence;
  /** True when no BOM markdown has been generated for this market yet */
  dataPending: boolean;
  sensorNote: string;
  outputTypes: BOMOutputType[];
  marquardtAnchorIds: string[];
  l4Subsystems: BOML4Subsystem[];
}

// ─── Sources Registry ─────────────────────────────────────────────────────────

export type SourcesRegistry = Record<string, Source>;

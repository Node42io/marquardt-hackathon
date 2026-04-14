/** Shared types for discovery sub-components. */

export interface MarketScores {
  odi: number;
  featureFit: number;
  constraintCompatibility: number;
  jobCoverage: number;
  vnHierarchy: number;
  incumbentVulnerability: number;
  composite: number;
}

export interface RankedMarket {
  rank: number;
  slug: string;
  marketName: string;
  naicsCode: string;
  scores: MarketScores;
  recommendation: string;
  rationale: string;
  entryStrategy: string;
  estimatedTimeToEntry: string;
  estimatedInvestment: string;
}

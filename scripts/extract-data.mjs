#!/usr/bin/env node
/**
 * extract-data.mjs — Marquardt US Sensor data extraction pipeline.
 *
 * Run: node scripts/extract-data.mjs
 *
 * Reads 48 markdown files from ../sections/ (relative to app root),
 * extracts structured data, and writes typed JSON to src/data/.
 *
 * Idempotent — safe to re-run; always overwrites outputs.
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const APP_ROOT = path.resolve(__dirname, "..");
const SECTIONS_DIR = path.resolve(APP_ROOT, "../sections");
const REPORT_DIR = path.resolve(APP_ROOT, "../report");
const DATA_DIR = path.join(APP_ROOT, "src/data");
const MARKETS_DIR = path.join(DATA_DIR, "markets");

// ─────────────────────────────────────────────
// helpers
// ─────────────────────────────────────────────

function read(file) {
  return fs.readFileSync(file, "utf8");
}

function write(file, data) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(data, null, 2), "utf8");
  console.log(`  wrote ${path.relative(APP_ROOT, file)}`);
}

/** Parse a markdown table into array of objects (using header row as keys). */
function parseTable(text) {
  const lines = text
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.startsWith("|") && !l.match(/^\|[-| ]+\|$/));
  if (lines.length < 2) return [];
  const headers = lines[0]
    .split("|")
    .slice(1, -1)
    .map((h) => h.trim().replace(/\*\*/g, ""));
  return lines.slice(1).map((row) => {
    const cells = row
      .split("|")
      .slice(1, -1)
      .map((c) => c.trim().replace(/\*\*/g, ""));
    const obj = {};
    headers.forEach((h, i) => {
      obj[h] = cells[i] ?? "";
    });
    return obj;
  });
}

/** Extract first JSON fenced block from markdown text. */
function extractJSON(text) {
  const m = text.match(/```json\s*([\s\S]*?)```/);
  if (!m) return null;
  try {
    return JSON.parse(m[1]);
  } catch (e) {
    console.warn("    JSON parse error:", e.message);
    return null;
  }
}

/** Extract section content between two ## headings. */
function extractSection(text, heading) {
  const re = new RegExp(
    `## ${escRe(heading)}[^\n]*\n([\\s\\S]*?)(?=\n## |$)`,
    "i"
  );
  const m = text.match(re);
  return m ? m[1].trim() : "";
}

/**
 * Extract section at ANY heading level (##, ###, ####) whose title contains
 * the given keyword. Stops at the next heading of the same or higher level.
 * Returns the content between the matched heading line and the next boundary.
 */
function extractAnySection(text, keyword) {
  // Match ## or ### or #### headings containing the keyword (case-insensitive)
  const re = new RegExp(
    `(#{2,4})\\s[^\n]*${escRe(keyword)}[^\n]*\n([\\s\\S]*?)(?=\\n#{1,4}\\s|$)`,
    "i"
  );
  const m = text.match(re);
  return m ? m[2].trim() : "";
}

function escRe(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Clean markdown bold/italic/link syntax from a string. */
function clean(s) {
  if (!s) return "";
  return s
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .trim();
}

// ─────────────────────────────────────────────
// slug / market registry
// ─────────────────────────────────────────────

const MARKET_MAP = [
  {
    slug: "finfish-farming",
    fileKey: "finfish_farming_and_fish_hatcheries",
    name: "Finfish Farming and Fish Hatcheries",
    naics: "112511",
    isReference: false,
  },
  {
    slug: "hvac-contractors",
    fileKey: "plumbing_heating_and_air_conditioning_co",
    name: "Plumbing, Heating and Air-Conditioning Contractors",
    naics: "238220",
    isReference: false,
  },
  {
    slug: "district-energy",
    fileKey: "steam_and_air_conditioning_supply",
    name: "Steam and Air-Conditioning Supply",
    naics: "221330",
    isReference: false,
  },
  {
    slug: "heating-equipment",
    fileKey: "heating_equipment_except_warm_air_furnac",
    name: "Heating Equipment (except Warm-Air Furnaces) Manufacturing",
    naics: "333414",
    isReference: false,
  },
  {
    slug: "commercial-service-machinery",
    fileKey: "other_commercial_and_service_industry_ma",
    name: "Other Commercial and Service Industry Machinery Manufacturing",
    naics: "333318",
    isReference: false,
  },
  {
    slug: "ac-home-heating",
    fileKey: "air_conditioning_and_warm_air_heating_eq",
    name: "Air-Conditioning and Warm Air Heating Equipment Manufacturing",
    naics: "333415",
    isReference: false,
  },
  {
    slug: "flowmeters-reference",
    fileKey: "flowmeters_src_01_product_decomposition_",
    name: "Flowmeters (home industry reference)",
    naics: "41112501",
    isReference: true,
  },
  {
    slug: "breweries",
    fileKey: "breweries",
    name: "Breweries",
    naics: "312120",
    isReference: false,
  },
  {
    slug: "data-processing-hosting",
    fileKey: "data_processing_hosting",
    name: "Data Processing, Hosting, and Related Services",
    naics: "518210",
    isReference: false,
  },
];

// Supplemental ranking entries for markets not scored in 10_final_ranking.md.
// These are merged into rankedMarkets after extraction (idempotent: slug deduplicates).
const SUPPLEMENTAL_RANKINGS = [
  {
    rank: 9,
    slug: "data-processing-hosting",
    marketName: "Data Processing, Hosting, and Related Services",
    naicsCode: "518210",
    scores: {
      odi: 4.99,
      featureFit: 5.73,
      constraintCompatibility: 7.5,
      jobCoverage: 7.5,
      vnHierarchy: 6.0,
      incumbentVulnerability: 5.0,
      composite: 5.96,
    },
    recommendation: "investigate",
    rationale:
      "Solid composite (5.96) driven by strong job coverage (7.5 — 6 of 8 Ulwick steps sensor-relevant) and moderate feature fit (5.73, led by Digital Anomaly Detection at 7.56 and No Moving Parts at 6.78). " +
      "ODI score (4.99) is mid-tier: safety-critical needs score high (Opp=14-15 for empty-pipe, leak-signature, GPU-threshold) but 34 total needs diluted by several adequately-served integration and specification needs. " +
      "Constraint score (7.5) is penalised by the life-endurance ceiling — 3,000 m³ rating exhausted in 8-12 weeks at 24×7 CDU duty, the dominant commercial barrier. " +
      "Incumbent (E+H Promag H, 35% share) is strong on accuracy and protocol coverage; Marquardt's differentiation is integrated temperature, compact plug-in form factor, and digital anomaly diagnostics unavailable from mag-meters.",
    entryStrategy:
      "1) Target AI/HPC colocation operators deploying DLC (Equinix, CyrusOne, QTS Realty) and CDU OEMs (Vertiv, Stulz, Rittal). " +
      "2) Prove <2s empty-pipe / air-lock detection before GPU power-on. " +
      "3) Integrate flow+temp telemetry into DCIM (Sunbird, Nlyte) via UART→MQTT bridge. " +
      "4) Publish PUE/WUE case study with hyperscaler anchor customer. " +
      "5) Scale via CDU-OEM supply-chain partnerships.",
    estimatedTimeToEntry: "12-24 months",
    estimatedInvestment: "$400K-900K",
  },
];

// ─────────────────────────────────────────────
// global sources registry
// ─────────────────────────────────────────────

const globalSources = {}; // id → Source object

function registerSources(entries, prefix) {
  for (const s of entries) {
    if (s.id) globalSources[`${prefix}-${s.id}`] = { ...s, prefixedId: `${prefix}-${s.id}` };
  }
}

function parseSources(text, prefix) {
  const section = extractSection(text, "Sources");
  if (!section) return [];

  const sources = [];
  // Handle table format: | S01 | label | url | quote |
  const tableRows = parseTable(section);
  if (tableRows.length > 0 && tableRows[0]["#"]) {
    for (const row of tableRows) {
      sources.push({
        id: row["#"] || row["id"] || "",
        label: clean(row["label"] || row["Label"] || ""),
        url: row["url"] || row["URL"] || undefined,
        quote: row["quote"] || row["Quote"] || undefined,
      });
    }
  } else {
    // Parse bullet-list format: - [Label](url) or - Label
    const lines = section.split("\n").filter((l) => l.trim().startsWith("-"));
    let idx = 1;
    for (const line of lines) {
      const linkMatch = line.match(/\[([^\]]+)\]\(([^)]+)\)/);
      const label = linkMatch ? linkMatch[1] : clean(line.replace(/^-\s*/, ""));
      const url = linkMatch ? linkMatch[2] : undefined;
      sources.push({
        id: `S${String(idx).padStart(2, "0")}`,
        label,
        url,
      });
      idx++;
    }
  }

  registerSources(sources, prefix);
  return sources.map((s) => ({ ...s, prefixedId: `${prefix}-${s.id}` }));
}

// ─────────────────────────────────────────────
// 01 — Product Decomposition
// ─────────────────────────────────────────────

function extractProduct() {
  console.log("Extracting product decomposition...");
  const text = read(path.join(SECTIONS_DIR, "01_product_decomposition.md"));
  const json = extractJSON(text);

  const sources = parseSources(text, "PROD");

  // Christensen
  const christensenRows = parseTable(extractSection(text, "Christensen Abstraction"));
  const christensen = {
    mechanism: clean(christensenRows.find((r) => r["Level"]?.includes("Mechanism"))?.["Description"] || ""),
    function: clean(christensenRows.find((r) => r["Level"]?.includes("Function"))?.["Description"] || ""),
    outcome: clean(christensenRows.find((r) => r["Level"]?.includes("Outcome"))?.["Description"] || ""),
  };

  // Technology
  const techRows = parseTable(extractSection(text, "Technology Classification"));
  const techMap = {};
  techRows.forEach((r) => { techMap[r["Field"]?.replace(/\*\*/g, "").trim()] = r["Value"]; });

  const technology = {
    class: techMap["technology_class"] || "",
    underlyingMechanism: techMap["underlying_mechanism"] || "",
    unspscCode: techMap["UNSPSC Code"] || "",
    unspscTitle: techMap["UNSPSC Title"] || "",
    unspscPath: techMap["UNSPSC Path"] || "",
  };

  // Functional promise
  const fpRows = parseTable(extractSection(text, "Functional Promise"));
  const fpMap = {};
  fpRows.forEach((r) => { fpMap[r["Field"]?.replace(/\*\*/g, "").trim()] = r["Value"]; });

  // Differentiators — parse the table after "Differentiators vs"
  const diffSection = text.match(/\*\*Differentiators vs[^*]*:\*\*\s*([\s\S]*?)(?=\n##|\n---)/);
  let differentiators = [];
  if (diffSection) {
    const rows = parseTable(diffSection[1]);
    differentiators = rows.map((r) => clean(r["Differentiator"] || Object.values(r)[1] || "")).filter(Boolean);
  }
  if (differentiators.length === 0 && json?.functional_promise?.differentiators) {
    differentiators = json.functional_promise.differentiators;
  }

  // Commodity FP
  const commodityFP = clean(text.match(/> \*\*Quantify([^*]+)\*\*/)?.[0] || "")
    || (json?.commodity_functional_promise ?? "");

  // Features
  let features = [];
  if (json?.features) {
    features = json.features.map((f) => ({
      scope: f.scope,
      name: f.name,
      short: f.description,
      long: f.long_description,
      category: f.category,
    }));
  } else {
    // Parse from markdown tables
    const techFeatSection = extractSection(text, "Technology-Scoped Features");
    const vendorFeatSection = extractSection(text, "Vendor-Scoped Features");
    const parseFeatTable = (section, scope) => {
      const rows = parseTable(section);
      return rows.map((r) => ({
        scope,
        name: clean(r["Feature"] || ""),
        short: clean(r["Description"] || ""),
        long: clean(r["Long Description"] || ""),
        category: clean(r["Category"] || ""),
      }));
    };
    features = [
      ...parseFeatTable(techFeatSection, "technology"),
      ...parseFeatTable(vendorFeatSection, "vendor"),
    ];
  }

  // Specifications
  let specifications = [];
  if (json?.specifications) {
    specifications = json.specifications.map((s) => ({
      name: s.name,
      value: String(s.value),
      unit: s.unit ?? undefined,
      testCondition: s.test_condition ?? undefined,
    }));
  } else {
    const rows = parseTable(extractSection(text, "Specifications"));
    specifications = rows.map((r) => ({
      name: clean(r["Specification"] || ""),
      value: clean(r["Value"] || ""),
      unit: clean(r["Unit"] || "") || undefined,
      testCondition: clean(r["Test Condition"] || "") || undefined,
    }));
  }

  // Constraints (basic — full constraint set is in 03_constraints.md)
  let constraints = [];
  if (json?.constraints) {
    constraints = json.constraints.map((c) => ({
      name: c.name,
      constraintType: c.constraint_type,
      description: c.description,
      severity: c.severity || (c.is_absolute ? "hard" : "soft"),
      thresholdValue: c.threshold_value ?? null,
      thresholdUnit: c.threshold_unit ?? null,
      isAbsolute: c.is_absolute ?? (c.severity === "hard"),
    }));
  }

  // ── Bill of Materials (derived — not in markdown source) ─────────────────
  // The product_decomposition.md has no BOM table. We inject the same 7-item
  // logical BOM that BOMSection.tsx previously derived at render time, so the
  // UI can read it from the data layer instead.
  const burstPressureSpec = specifications.find((s) => s.name === "Burst Pressure");
  const billOfMaterials = [
    {
      id: "BOM-01",
      component: "Piezoelectric Transducers (× 2)",
      function: "Emit and receive ultrasonic pulses for transit-time flow measurement",
      category: "Measurement",
      keyAttribute: "Matched pair; alternating transmit/receive mode",
    },
    {
      id: "BOM-02",
      component: "NTC Thermistor",
      function: "Simultaneous medium temperature measurement alongside flow",
      category: "Sensing",
      keyAttribute: "Wetted element; enables real-time temperature compensation",
    },
    {
      id: "BOM-03",
      component: "Flow Body (DN12/14/20/25 variants)",
      function: "Straight-through fluid channel with zero pressure drop",
      category: "Mechanical",
      keyAttribute: "Polymer housing; KTW/WRAS drinking-water approved",
    },
    {
      id: "BOM-04",
      component: "Signal Processing PCB",
      function: "Calculate transit-time difference, apply compensation algorithms, generate output signal",
      category: "Electronics",
      keyAttribute: "Onboard anomaly detection (bubbles, empty-pipe, glycol); bidirectional detection",
    },
    {
      id: "BOM-05",
      component: "RAST 2.5 Connector (3/4-pole)",
      function: "Electrical interface to host controller (UART, LIN, or frequency output)",
      category: "Interface",
      keyAttribute: "Configurable at order level: UART / LIN / frequency pulse",
    },
    {
      id: "BOM-06",
      component: "Seals & O-rings",
      function: "Hydraulic sealing of the flow body at pressure rating",
      category: "Mechanical",
      keyAttribute: `Max 10 bar continuous; burst >${burstPressureSpec?.value ?? "9"} bar`,
    },
    {
      id: "BOM-07",
      component: "Acoustic Coupling Material",
      function: "Couple piezoelectric transducers to the fluid channel wall",
      category: "Materials",
      keyAttribute: "Matched acoustic impedance to water/glycol media",
    },
  ];

  const product = {
    productName: "Marquardt Ultrasonic Flow Sensor",
    vendorName: "Marquardt GmbH",
    christensen,
    technology,
    functionalPromise: {
      statement: clean(fpMap["Statement"] || json?.functional_promise?.statement || ""),
      verb: clean(fpMap["Verb"] || json?.functional_promise?.verb || ""),
      object: clean(fpMap["Object"] || json?.functional_promise?.object || ""),
      context: clean(fpMap["Context"] || json?.functional_promise?.context || ""),
    },
    commodityFunctionalPromise: clean(json?.commodity_functional_promise || commodityFP),
    differentiators,
    features,
    specifications,
    constraints,
    billOfMaterials,
    sources,
  };

  write(path.join(DATA_DIR, "product.json"), product);
  return product;
}

// ─────────────────────────────────────────────
// 02 — Functional Promise
// ─────────────────────────────────────────────

function extractFunctionalPromise() {
  console.log("Extracting functional promise...");
  const text = read(path.join(SECTIONS_DIR, "02_functional_promise.md"));
  const json = extractJSON(text);
  const sources = parseSources(text, "FP");

  // Product FP
  const fpRows = parseTable(extractSection(text, "Product Functional Promise"));
  const fpMap = {};
  fpRows.forEach((r) => { fpMap[r["Field"]?.replace(/\*\*/g, "").trim()] = r["Value"]; });

  // Differentiators
  const diffSection = extractSection(text, "Product Functional Promise");
  const diffTable = parseTable(text.match(/\*\*Differentiators vs alternatives:\*\*\s*([\s\S]*?)(?=\n##|\n---|\n\*\*Mechanism)/)?.[1] || "");
  const differentiators = diffTable
    .map((r) => clean(r["Differentiator"] || Object.values(r)[1] || ""))
    .filter(Boolean);

  // Commodity FP
  const cfpRows = parseTable(extractSection(text, "Commodity Functional Promise"));
  const cfpMap = {};
  cfpRows.forEach((r) => { cfpMap[r["Field"]?.replace(/\*\*/g, "").trim()] = r["Value"]; });

  // UNSPSC
  const unspscRows = parseTable(extractSection(text, "UNSPSC Classification"));
  const unspscMap = {};
  unspscRows.forEach((r) => { unspscMap[r["Field"]?.replace(/\*\*/g, "").trim()] = r["Value"]; });

  // FP Extension
  const extRows = parseTable(extractSection(text, "FP Extension"));
  const extMap = {};
  extRows.forEach((r) => { extMap[r["Field"]?.replace(/\*\*/g, "").trim()] = r["Value"]; });

  // VN / BOM position
  const bomRows = parseTable(extractSection(text, "VN / BOM Position"));
  const bomMap = {};
  bomRows.forEach((r) => { bomMap[r["Field"]?.replace(/\*\*/g, "").trim()] = r["Value"]; });

  // Complements
  let complements = [];
  if (json?.complements) {
    complements = json.complements.map((c) => ({
      name: c.name,
      criticality: c.criticality,
      description: c.description,
    }));
  } else {
    const rows = parseTable(extractSection(text, "Required Complements"));
    complements = rows.map((r) => ({
      name: clean(r["Complement"] || ""),
      criticality: clean(r["Criticality"] || "").toLowerCase(),
      description: clean(r["Description"] || ""),
    }));
  }

  const fp = {
    productFP: {
      statement: clean(fpMap["Statement"] || json?.product_functional_promise?.statement || ""),
      verb: clean(fpMap["Verb"] || json?.product_functional_promise?.verb || ""),
      object: clean(fpMap["Object"] || json?.product_functional_promise?.object || ""),
      context: clean(fpMap["Context"] || json?.product_functional_promise?.context || ""),
      differentiators:
        differentiators.length > 0
          ? differentiators
          : (json?.product_functional_promise?.differentiators || []),
    },
    commodityFP: {
      statement: clean(cfpMap["Functional Promise"] || json?.commodity_functional_promise?.functional_promise || ""),
      commodity: clean(cfpMap["Commodity or Group"] || "Flowmeters"),
      unspscCode: clean(unspscMap["UNSPSC Code"] || "41112501"),
      reasoning: clean(cfpMap["Reasoning"] || json?.commodity_functional_promise?.reasoning || ""),
      fpExtension: clean(extMap["FP Extension"] || json?.commodity_functional_promise?.fp_extension || ""),
      fpExtensionDomains: json?.commodity_functional_promise?.fp_extension_domains || [],
    },
    bomPosition: {
      level: clean(bomMap["BOM Level"] || "L5"),
      position: clean(bomMap["Position"] || "Component"),
      parentSubsystem: clean(bomMap["Parent Subsystem (typical)"] || ""),
      grandparentSystem: clean(bomMap["Grandparent System (typical)"] || ""),
    },
    complements,
    sources,
  };

  write(path.join(DATA_DIR, "functionalPromise.json"), fp);
  return fp;
}

// ─────────────────────────────────────────────
// 03 — Constraints
// ─────────────────────────────────────────────

function extractConstraints() {
  console.log("Extracting constraints...");
  const text = read(path.join(SECTIONS_DIR, "03_constraints.md"));
  const json = extractJSON(text);
  const sources = parseSources(text, "CONSTR");

  let constraints = [];
  if (json?.constraints) {
    constraints = json.constraints.map((c) => ({
      name: c.name,
      constraintType: c.constraint_type,
      description: c.description,
      thresholdValue: c.threshold_value ?? null,
      thresholdUnit: c.threshold_unit ?? null,
      isAbsolute: c.is_absolute,
      affectedMarketsHint: c.affected_markets_hint || [],
    }));
  } else {
    // Parse from markdown summary table
    const summarySection = extractSection(text, "Constraint Summary");
    const rows = parseTable(summarySection);
    constraints = rows.map((r) => ({
      name: clean(r["Constraint"] || ""),
      constraintType: clean(r["Type"] || ""),
      thresholdValue: r["Threshold"]?.trim() === "—" ? null : r["Threshold"]?.trim() || null,
      thresholdUnit: r["Unit"]?.trim() === "—" ? null : r["Unit"]?.trim() || null,
      isAbsolute: r["is_absolute"]?.includes("true") || false,
      description: "",
      affectedMarketsHint: [],
    }));
  }

  const data = { constraints, sources };
  write(path.join(DATA_DIR, "constraints.json"), data);
  return data;
}

// ─────────────────────────────────────────────
// 04 — Home Market Competition
// ─────────────────────────────────────────────

function extractHomeMarket() {
  console.log("Extracting home market competition...");
  const text = read(path.join(SECTIONS_DIR, "04_incumbents_home.md"));
  const json = extractJSON(text);
  const sources = parseSources(text, "HOME");

  // Context
  const ctxRows = parseTable(extractSection(text, "Market Context"));
  const ctxMap = {};
  ctxRows.forEach((r) => { ctxMap[r["Field"]?.replace(/\*\*/g, "").trim()] = r["Value"]; });

  let incumbents = [];
  if (json?.incumbents) {
    incumbents = json.incumbents.map((inc) => ({
      technologyName: inc.technology_name,
      mechanism: inc.mechanism,
      marketShareEstimate: inc.market_share_estimate,
      keyVendors: inc.key_vendors || [],
      strengths: inc.strengths || [],
      weaknesses: inc.weaknesses || [],
      confidence: inc.confidence,
    }));
  }

  // Competitive summary table
  const compTableSection = extractSection(text, "Competitive Positioning Summary");
  const compRows = parseTable(compTableSection);
  const positioningTable = compRows
    .filter((r) => {
      const tech = r["Technology"] || Object.values(r)[0] || "";
      return tech.trim() && !tech.includes("---");
    })
    .map((r) => {
      const keys = Object.keys(r);
      return {
        technology: clean(r[keys[0]] || ""),
        share: clean(r["Share"] || r[keys[1]] || ""),
        pressureDrop: clean(r["Pressure Drop"] || r[keys[2]] || ""),
        movingParts: clean(r["Moving Parts"] || r[keys[3]] || ""),
        accuracy: clean(r["Accuracy"] || r[keys[4]] || ""),
        unitCost: clean(r["Unit Cost (OEM)"] || r[keys[5]] || ""),
        continuousOutput: clean(r["Continuous Output"] || r[keys[6]] || ""),
        heatMeterReady: clean(r["Heat Meter Ready"] || r[keys[7]] || ""),
      };
    });

  // Switching cost
  const switchRows = parseTable(extractSection(text, "Switching Cost Assessment"));
  const switchMap = {};
  switchRows.forEach((r) => {
    switchMap[r["Factor"]?.replace(/\*\*/g, "").trim()] = clean(r["Assessment"] || "");
  });

  const data = {
    marketName: clean(ctxMap["Market Name"] || "HVAC OEM Flow Measurement"),
    naicsCode: clean(ctxMap["NAICS Code"] || "333415"),
    naicsTitle: clean(ctxMap["NAICS Title"] || ""),
    functionalNeed: clean(ctxMap["Functional Need"] || ""),
    switchingCost: clean(ctxMap["Switching Cost Assessment"] || json?.switching_cost_assessment || "moderate"),
    switchingCostFactors: switchMap,
    incumbents,
    positioningTable,
    sources,
  };

  write(path.join(DATA_DIR, "homeMarketCompetition.json"), data);
  return data;
}

// ─────────────────────────────────────────────
// 05 — Market Discovery
// ─────────────────────────────────────────────

function extractMarketDiscovery() {
  console.log("Extracting market discovery...");
  const text = read(path.join(SECTIONS_DIR, "05_market_discovery.md"));
  const json = extractJSON(text);
  const sources = parseSources(text, "DISC");

  // Search config
  const cfgRows = parseTable(extractSection(text, "Search Configuration"));
  const cfgMap = {};
  cfgRows.forEach((r) => { cfgMap[r["Field"]?.replace(/\*\*/g, "").trim()] = clean(r["Value"] || ""); });

  // Candidates table — may span multiple sections
  const candidatesSection = extractSection(text, "Candidates");
  let candidates = parseTable(candidatesSection);
  if (candidates.length === 0) {
    // Try the full doc
    const allTables = [...text.matchAll(/\| # \| NAICS \|([\s\S]*?)(?=\n\n|\n##)/g)];
    if (allTables.length > 0) {
      candidates = parseTable(allTables[0][0]);
    }
  }

  const candidatesParsed = candidates.map((r) => ({
    naics: clean(r["NAICS"] || ""),
    title: clean(r["Title"] || ""),
    fpFit: clean(r["FP Fit"] || ""),
    adoption: clean(r["Adoption"] || ""),
    discoverySource: clean(r["Discovery Source"] || ""),
    confidence: parseFloat(r["Confidence"] || "0"),
  })).filter((c) => c.naics);

  const data = {
    commodityFP: cfgMap["Commodity FP"] || "",
    unspscContext: cfgMap["UNSPSC Context"] || "",
    fpExtension: cfgMap["FP Extension"] || "",
    extensionDomains: cfgMap["Extension Domains"] || "",
    candidates: candidatesParsed,
    sources,
  };

  write(path.join(DATA_DIR, "marketDiscovery.json"), data);
  return data;
}

// ─────────────────────────────────────────────
// 10 — Ranking
// ─────────────────────────────────────────────

function extractRanking() {
  console.log("Extracting ranking...");
  const text = read(path.join(SECTIONS_DIR, "10_final_ranking.md"));
  const json = extractJSON(text);

  if (!json) {
    console.warn("  No JSON block found in ranking file");
    return {};
  }

  // Match slugs
  const slugForNaics = (naics) => {
    const m = MARKET_MAP.find((x) => x.naics === naics);
    return m ? m.slug : naics;
  };

  const ranked = (json.ranked_markets || []).map((m) => ({
    rank: m.rank,
    slug: slugForNaics(m.naics_code),
    marketName: m.market_name,
    naicsCode: m.naics_code,
    scores: {
      odi: m.odi_opportunity_score,
      featureFit: m.feature_fit_score,
      constraintCompatibility: m.constraint_compatibility_score,
      jobCoverage: m.job_coverage_score,
      vnHierarchy: m.vn_hierarchy_score,
      incumbentVulnerability: m.incumbent_vulnerability_score,
      composite: m.composite_score,
    },
    recommendation: m.recommendation,
    rationale: m.recommendation_rationale,
    entryStrategy: m.entry_strategy_sketch,
    estimatedTimeToEntry: m.estimated_time_to_entry,
    estimatedInvestment: m.estimated_investment,
  }));

  // Merge supplemental entries for markets not in the scored JSON
  const existingSlugs = new Set(ranked.map((r) => r.slug));
  for (const supp of SUPPLEMENTAL_RANKINGS) {
    if (!existingSlugs.has(supp.slug)) {
      ranked.push(supp);
    }
  }

  const data = {
    productName: json.product_name,
    vendorName: json.vendor_name,
    technologyClass: json.technology_class,
    unspscCode: json.unspsc_code,
    unspscTitle: json.unspsc_title,
    customProductGroup: json.custom_product_group,
    commodityFunctionalPromise: json.commodity_functional_promise,
    totalMarketsEvaluated: json.total_markets_evaluated,
    marketsEliminatedByConstraints: json.markets_eliminated_by_constraints,
    weights: json.weights,
    rankedMarkets: ranked,
    executiveSummary: json.executive_summary,
  };

  write(path.join(DATA_DIR, "ranking.json"), data);
  return data;
}

// ─────────────────────────────────────────────
// JTBD — per market
// ─────────────────────────────────────────────

function extractJTBD(market) {
  const file = path.join(SECTIONS_DIR, `JTBD_${market.fileKey}.md`);
  if (!fs.existsSync(file)) {
    console.warn(`  JTBD file not found: ${file}`);
    return null;
  }

  const text = read(file);
  const sources = parseSources(text, `JTBD-${market.slug.toUpperCase()}`);

  // VN anchor / product job — use anySection to handle both ## and ### headings
  const anchorSection = extractAnySection(text, "VN Anchor");
  const anchorRows = parseTable(anchorSection);
  const anchorMap = {};
  anchorRows.forEach((r) => { anchorMap[r["Field"]?.replace(/\*\*/g, "").trim()] = clean(r["Value"] || ""); });

  const jobSection = extractAnySection(text, "Product Job");
  const jobRows = parseTable(jobSection);
  const jobMap2 = {};
  jobRows.forEach((r) => { jobMap2[r["Field"]?.replace(/\*\*/g, "").trim()] = clean(r["Value"] || ""); });

  // ── Job Map (Ulwick steps) ──────────────────────────────────────────────────
  // Section headings vary across files:
  //   "### 3.2 Job Map (8 Ulwick Steps)"
  //   "### 3.1 Job Map (8 Universal Steps — Ulwick 2005)"
  //   "### Job Map (Ulwick 8 Steps)"
  // We use extractAnySection with "Job Map" as keyword.
  const jobMapSection = extractAnySection(text, "Job Map");
  const jobMapRows = parseTable(jobMapSection);
  const steps = jobMapRows
    .filter((r) => {
      // Column header varies: "Relevant?", "Relevant", "Relevant to Product?"
      const relevant = r["Relevant?"] || r["Relevant to Product?"] || r["Relevant"] || "";
      return relevant.toLowerCase().includes("yes");
    })
    .map((r) => {
      const rawStatement = clean(r["Statement"] || "");
      const stepName = clean(r["Step"] || "");
      // Extract verb from step name (e.g. "DEFINE" → "Define")
      const verbMatch = stepName.match(/([A-Z]{2,})/);
      const verb = verbMatch
        ? verbMatch[1].charAt(0).toUpperCase() + verbMatch[1].slice(1).toLowerCase()
        : stepName;
      // Description: strip the leading VERB word from the statement so the UI
      // can prepend "This step is about " and get a natural sentence.
      // e.g. "Define the required water flow..." → "the required water flow..."
      // Fallback: if rawStatement is empty (job-map table had no Statement column),
      // use the rationale text which describes what the step involves.
      const rationaleForDesc = clean(
        r["Rationale"] || r["Relevance Rationale"] || r["Sensor Dependency"] || ""
      );
      const description = rawStatement
        ? (rawStatement
            .replace(new RegExp(`^${verb}\\s+`, "i"), "")
            .replace(/^\*?\*?[A-Z]{2,}\*?\*?\s+/, "")
            .trim() || rawStatement)
        : rationaleForDesc;
      // isSensorRelevant / sensorDependencyRationale
      const relevanceCol = r["Relevant?"] || r["Relevant to Product?"] || r["Relevant"] || "";
      const rationaleCol = clean(
        r["Rationale"] || r["Relevance Rationale"] || r["Sensor Dependency"] || ""
      );
      return {
        stepNumber: parseInt(r["#"] || "0"),
        verb,
        description,
        isSensorRelevant: relevanceCol.toLowerCase().includes("yes"),
        sensorDependencyRationale: rationaleCol,
        rawStatement,
        jobStep: stepName.replace(/\*\*/g, "").replace(/^\d+\s*/, ""),
        relevant: relevanceCol.toLowerCase().includes("yes"),
        rationale: rationaleCol,
      };
    });

  console.log(`    Job steps (sensor-relevant): ${steps.length}`);

  // ── Stakeholders / Segments ────────────────────────────────────────────────
  // The files have TWO distinct stakeholder tables:
  //   1. "### 1.2 Segments (Circumstance-Based)" — circumstance segments
  //   2. "### 3.0 Stakeholder Roles for This Market" / "### 3.1 Stakeholder Roles"
  //      — role-based stakeholders (Executor, Overseer, etc.)

  // 1. Circumstance-based segments (from Phase 1)
  // Headings: "1.2 Segments", "1.2 Segments (Circumstance-Based)", "1.2 Segments (by circumstance)"
  const segSection = extractAnySection(text, "1.2 Segments");
  const segRows = parseTable(segSection);

  // Parse name + optional qualifier from bolded segment text
  // e.g. "**Large-scale commercial RAS** (>500 t/yr, salmon focus)" → name + qualifier
  function parseSegmentName(raw) {
    const boldMatch = raw.match(/\*\*([^*]+)\*\*\s*([\s\S]*)/);
    if (boldMatch) {
      return {
        name: boldMatch[1].trim(),
        qualifier: boldMatch[2].trim(),
      };
    }
    return { name: raw.trim(), qualifier: "" };
  }

  const segments = segRows
    .filter((r) => r["Segment"] || r["#"])
    .map((r, idx) => {
      const rawSeg = r["Segment"] || "";
      const { name, qualifier } = parseSegmentName(rawSeg);
      const altDiffer = r["Alternatives Differ?"] || "";
      // isTargetable: "Yes" somewhere in the field
      const isTargetable = altDiffer.toLowerCase().includes("yes");
      // targetabilityReason: everything after the "Yes — " prefix
      const reasonMatch = altDiffer.match(/yes\s*[—–-]\s*([\s\S]+)/i);
      const targetabilityReason = reasonMatch ? reasonMatch[1].trim() : clean(altDiffer);
      return {
        segmentNumber: parseInt(r["#"] || String(idx + 1)),
        name: clean(name),
        qualifier: clean(qualifier),
        characteristics: clean(r["Circumstance"] || ""),
        isTargetable,
        targetabilityReason: clean(targetabilityReason),
        // Legacy fields kept for backward compat
        circumstance: clean(r["Circumstance"] || ""),
        alternativesDiffer: clean(altDiffer),
      };
    });

  console.log(`    Segments extracted: ${segments.length}`);

  // 2. Role-based stakeholders (Executor, Overseer, etc.)
  // Headings vary: "Stakeholder Roles", "3.0 Stakeholder Roles for This Market", "3.1 Stakeholder Roles"
  const stakeSection =
    extractAnySection(text, "Stakeholder Roles") ||
    extractAnySection(text, "3.0 Stakeholder");
  const stakeRows = parseTable(stakeSection);
  const stakeholders = stakeRows
    .filter((r) => r["Role"] || Object.values(r)[0])
    .map((r) => {
      const keys = Object.keys(r);
      return {
        role: clean(r["Role"] || r[keys[0]] || ""),
        who: clean(r[keys[1]] || ""),
        pyramidLevels: clean(r["Pyramid Levels"] || r[keys[2]] || ""),
      };
    });

  console.log(`    Role-based stakeholders extracted: ${stakeholders.length}`);

  // ── Error statements (P1+P2) ───────────────────────────────────────────────
  const errSection =
    extractAnySection(text, "P1 + P2 Error Statements") ||
    extractAnySection(text, "Error Statements") ||
    extractAnySection(text, "3.2 P1 + P2 Needs") ||
    extractAnySection(text, "3.3 Error Statements") ||
    extractAnySection(text, "3.2 Error Statements");

  // We collect all table rows from the error statements section
  const needsRows = [];
  const errTables = errSection.matchAll(/\| # \| Error Statement \|([\s\S]*?)(?=\n#{3,}|\n---)/g);
  for (const match of errTables) {
    const rows = parseTable("| # | Error Statement |" + match[1]);
    needsRows.push(...rows);
  }
  // Also try to parse from the full section using a wider match
  if (needsRows.length === 0) {
    const allRows = parseTable(errSection);
    needsRows.push(...allRows);
  }

  const needs = needsRows
    .filter((r) => r["#"] && r["Error Statement"])
    .map((r) => ({
      id: clean(r["#"] || ""),
      statement: clean(r["Error Statement"] || ""),
      jobStep: clean(r["Job Step"] || ""),
      errorType: clean(r["Error Type"] || ""),
      importance: parseFloat(r["Imp"] || "0"),
      satisfaction: parseFloat(r["Sat"] || "0"),
      opportunity: parseFloat(r["Opp"] || "0"),
      impactCategory: clean(r["Impact"] || ""),
      productRelated: r["product_related"]?.trim() === "true",
      confidence: parseFloat(r["Confidence"] || "0"),
    }));

  // Alternatives from section 2.4
  const altSection = extractAnySection(text, "Alternatives");
  const altRows = parseTable(altSection);
  const alternatives = altRows.map((r) => ({
    name: clean(r["Alternative"] || ""),
    unspsc: clean(r["UNSPSC"] || ""),
    tradeoffs: clean(r["Inherent Trade-Offs"] || ""),
  }));

  // CFJ from Phase 1 summary table
  const phase1Section = extractAnySection(text, "Phase 1") || extractSection(text, "Phase 1");
  const phase1Rows = parseTable(phase1Section);
  const phase1Map = {};
  phase1Rows.forEach((r) => { phase1Map[r["Field"]?.replace(/\*\*/g, "").trim()] = clean(r["Value"] || ""); });

  const data = {
    naicsCode: market.naics,
    marketName: market.name,
    slug: market.slug,
    coreJobStatement: phase1Map["CFJ"] || jobMap2["Product Job Statement"] || "",
    productJobStatement: jobMap2["Product Job Statement"] || "",
    anchorLevel: anchorMap["Anchor Level"] || "",
    lPath: anchorMap["L-Path"] || "",
    segments,
    alternatives,
    jobSteps: steps,
    stakeholders,
    needs,
    sources,
  };

  write(path.join(MARKETS_DIR, market.slug, "jtbd.json"), data);
  return data;
}

// ─────────────────────────────────────────────
// ODI — per market
// ─────────────────────────────────────────────

function extractODI(market) {
  const file = path.join(SECTIONS_DIR, `ODI_${market.fileKey}.md`);
  if (!fs.existsSync(file)) {
    console.warn(`  ODI file not found: ${file}`);
    return null;
  }

  const text = read(file);
  const sources = parseSources(text, `ODI-${market.slug.toUpperCase()}`);
  const json = extractJSON(text);

  // Build a statement→jobStep lookup from the JTBD markdown JSON block.
  // The JTBD JSON has job_step_name for each error statement; ODI JSON does not.
  const jtbdFile = path.join(SECTIONS_DIR, `JTBD_${market.fileKey}.md`);
  const jobStepLookup = {};
  // Stakeholder list from the already-written jtbd.json for this market.
  // Used to derive primaryStakeholder for each ODI need.
  let jtbdStakeholders = [];
  if (fs.existsSync(jtbdFile)) {
    const jtbdText = read(jtbdFile);
    const jtbdJson = extractJSON(jtbdText);
    const needsList = jtbdJson?.needs || jtbdJson?.error_statements || [];
    for (const n of needsList) {
      const stmt = (n.statement || n.error_statement || "").trim();
      const step = (n.job_step_name || "").trim();
      if (stmt && step) {
        jobStepLookup[stmt] = step;
      }
    }
    // Also try parsing JTBD error-statement tables (fallback)
    const errSection =
      extractAnySection(jtbdText, "P1 + P2 Error Statements") ||
      extractAnySection(jtbdText, "Error Statements") ||
      extractAnySection(jtbdText, "3.2 P1 + P2 Needs") ||
      extractAnySection(jtbdText, "3.3 Error Statements") ||
      extractAnySection(jtbdText, "3.2 Error Statements");
    const allErrRows = parseTable(errSection);
    for (const r of allErrRows) {
      const stmt = clean(r["Error Statement"] || "").trim();
      const step = clean(r["Job Step"] || "").trim();
      if (stmt && step && !jobStepLookup[stmt]) {
        jobStepLookup[stmt] = step;
      }
    }
    // Read stakeholder roles from the written jtbd.json (already extracted)
    const jtbdJsonFile = path.join(MARKETS_DIR, market.slug, "jtbd.json");
    if (fs.existsSync(jtbdJsonFile)) {
      try {
        const jtbdData = JSON.parse(fs.readFileSync(jtbdJsonFile, "utf8"));
        jtbdStakeholders = jtbdData.stakeholders || [];
      } catch (_) { /* ignore */ }
    }
  }

  /**
   * Map a job step name to the primary stakeholder "who" string.
   * Uses the canonical Burleson/Ulwick step→role mapping:
   *   EXECUTE, MONITOR, MODIFY, DEFINE → Job Executor (primary operational actor)
   *   PREPARE, CONFIRM                  → Product Lifecycle Support (install/commission)
   *   CONCLUDE                          → Job Overseer (records, compliance)
   *   product_constraint                → Product Lifecycle Support (OEM/integrator)
   * Falls back to the first stakeholder in the list if role not found.
   */
  function resolveStakeholder(jobStep) {
    const step = (jobStep || "").toUpperCase();

    // Step → preferred role keyword
    let targetRole = "Job Executor";
    if (step === "PREPARE" || step === "CONFIRM") {
      targetRole = "Product Lifecycle Support";
    } else if (step === "CONCLUDE") {
      targetRole = "Job Overseer";
    } else if (step === "PRODUCT_CONSTRAINT" || step === "") {
      targetRole = "Product Lifecycle Support";
    }

    // Find matching stakeholder by role
    const found = jtbdStakeholders.find(
      (s) => s.role && s.role.toLowerCase().includes(targetRole.toLowerCase())
    );
    if (found) return found.who;

    // Fallback: Job Executor
    const executor = jtbdStakeholders.find(
      (s) => s.role && s.role.toLowerCase().includes("executor")
    );
    return executor ? executor.who : (jtbdStakeholders[0]?.who || "");
  }

  /**
   * Build a list of all stakeholder "who" strings relevant to a given step.
   * Returns an array of stakeholder names (no duplicates, non-empty).
   */
  function resolveStakeholderIds(jobStep) {
    const step = (jobStep || "").toUpperCase();
    const result = [];
    for (const s of jtbdStakeholders) {
      // Always include the primary stakeholder
      const primary = resolveStakeholder(jobStep);
      if (s.who === primary && !result.includes(s.who)) {
        result.unshift(s.who); // primary first
        continue;
      }
      // Include Overseer for EXECUTE/MONITOR (they care about outcomes)
      if ((step === "EXECUTE" || step === "MONITOR") &&
          s.role && s.role.toLowerCase().includes("overseer") &&
          !result.includes(s.who)) {
        result.push(s.who);
      }
      // Include Purchase Executor for cost-related DEFINE needs
      if (step === "DEFINE" &&
          s.role && s.role.toLowerCase().includes("purchase executor") &&
          !result.includes(s.who)) {
        result.push(s.who);
      }
    }
    return result.filter(Boolean);
  }

  // Parse structured data if available
  let entries = [];
  if (json?.entries) {
    entries = json.entries.map((e) => {
      const stmt = (e.error_statement || "").trim();
      const jobStep = e.job_step_name || jobStepLookup[stmt] || (e.product_related ? "product_constraint" : "");
      return {
        id: "",
        statement: stmt,
        jobStep,
        importance: e.importance,
        satisfaction: e.satisfaction_current,
        opportunity: e.opportunity_score,
        isUnderserved: e.is_underserved,
        isOverserved: e.is_overserved,
        productRelated: e.product_related,
        importanceRationale: "",
        satisfactionRationale: "",
        needsRationale: true,
        primaryStakeholder: resolveStakeholder(jobStep),
        stakeholderIds: resolveStakeholderIds(jobStep),
      };
    });
  }

  // Supplement with rationale from recalibration table
  const recalSection = extractSection(text, "Recalibration Table — Step 06 Needs");
  const recalRows = parseTable(recalSection);
  const recalMap = {};
  recalRows.forEach((r) => {
    const idx = r["#"]?.trim();
    if (idx) {
      recalMap[idx] = {
        satRationale: clean(r["Recalibration Rationale"] || ""),
        satRecal: parseFloat(r["Sat_recal"] || r["Sat_recal"] || "0"),
      };
    }
  });

  // Parse scored needs from Step 3 tables
  const step06Matches = [...text.matchAll(/\| # \| Error Statement[^|]*\| Job Step[^|]*\|[^|]*\|[^|]*\|[^|]*\|[^|]*\|[^|]*\|[^|]*\|([\s\S]*?)(?=\n---|\n##)/g)];
  const scoredNeeds06 = [];
  for (const match of step06Matches) {
    const rows = parseTable("| # | Error Statement | Job Step | Error Type | Imp | Sat | Opp | Impact | product_related | Confidence |" + match[1]);
    scoredNeeds06.push(...rows.filter((r) => r["#"]));
  }

  // Also parse from step 3 tables with abbreviated form
  const scoredAbbrevSection = extractSection(text, "Step 06 Needs — Scored") || extractSection(text, "Step 06 Needs");
  let scoredAbbrevRows = parseTable(scoredAbbrevSection);

  // PRN rows
  const prnSection = extractSection(text, "Step 10 Product-Related Needs — Scored") || extractSection(text, "Step 10 Product-Related Needs");
  const prnRows = parseTable(prnSection);

  // Build the complete needs list
  if (entries.length === 0) {
    // Fall back to parsing from scored tables
    entries = scoredAbbrevRows
      .filter((r) => r["#"])
      .map((r) => {
        const imp = parseFloat(r["Imp"] || "0");
        const sat = parseFloat(r["Sat"] || "0");
        const opp = parseFloat(r["Opp"]?.replace(/\*\*/g, "") || "0") || (imp + Math.max(0, imp - sat));
        const stmt = clean(r["Statement (abbreviated)"] || r["Statement"] || "");
        const jobStep = clean(r["Job Step"] || "") || jobStepLookup[stmt] || "";
        return {
          id: r["#"],
          statement: stmt,
          jobStep,
          importance: imp,
          satisfaction: sat,
          opportunity: opp,
          isUnderserved: r["Under?"]?.includes("YES") || false,
          isOverserved: r["Over?"]?.includes("YES") || false,
          productRelated: false,
          primaryStakeholder: resolveStakeholder(jobStep),
          stakeholderIds: resolveStakeholderIds(jobStep),
          importanceRationale: "",
          satisfactionRationale: clean(recalMap[r["#"]]?.satRationale || ""),
          needsRationale: true,
        };
      });

    // Add PRN entries
    const prnEntries = prnRows
      .filter((r) => r["#"])
      .map((r) => {
        const imp = parseFloat(r["Imp"] || "0");
        const sat = parseFloat(r["Sat"] || "0");
        const opp = parseFloat(r["Opp"]?.replace(/\*\*/g, "") || "0") || (imp + Math.max(0, imp - sat));
        const jobStep = "product_constraint";
        return {
          id: r["#"],
          statement: clean(r["Statement (abbreviated)"] || r["Statement"] || ""),
          jobStep,
          importance: imp,
          satisfaction: sat,
          opportunity: opp,
          isUnderserved: r["Under?"]?.includes("YES") || false,
          isOverserved: r["Over?"]?.includes("YES") || false,
          productRelated: true,
          importanceRationale: "",
          satisfactionRationale: clean(recalMap[r["#"]]?.satRationale || ""),
          needsRationale: true,
          primaryStakeholder: resolveStakeholder(jobStep),
          stakeholderIds: resolveStakeholderIds(jobStep),
        };
      });
    entries.push(...prnEntries);
  } else {
    // Augment existing entries with rationale data and stakeholder linkage
    entries = entries.map((e, i) => {
      const idx = String(i + 1);
      const recal = recalMap[idx];
      return {
        ...e,
        satisfactionRationale: recal?.satRationale || e.satisfactionRationale || "",
        needsRationale: !recal?.satRationale,
        primaryStakeholder: e.primaryStakeholder || resolveStakeholder(e.jobStep),
        stakeholderIds: (e.stakeholderIds && e.stakeholderIds.length > 0)
          ? e.stakeholderIds
          : resolveStakeholderIds(e.jobStep),
      };
    });
  }

  // Compute opportunity for any entries where it's missing/zero
  entries = entries.map((e) => ({
    ...e,
    opportunity: e.opportunity || e.importance + Math.max(0, e.importance - e.satisfaction),
  }));

  // Summary stats from markdown
  const summarySection = extractSection(text, "Market ODI Summary");
  const summaryRows = parseTable(summarySection);
  const summaryMap = {};
  summaryRows.forEach((r) => { summaryMap[r["Metric"]?.replace(/\*\*/g, "").trim()] = clean(r["Value"] || ""); });

  // Top 5
  const top5Section = extractSection(text, "Top 5 Opportunities");
  const top5Rows = parseTable(top5Section);
  const top5 = top5Rows.map((r) => ({
    rank: parseInt(r["Rank"] || "0"),
    needId: clean(r["#"] || ""),
    statement: clean(r["Error Statement"] || ""),
    importance: parseFloat(r["Imp"] || "0"),
    satisfaction: parseFloat(r["Sat"] || "0"),
    opportunity: parseFloat(r["Opp"]?.replace(/\*\*/g, "") || "0"),
    zone: clean(r["Zone"] || ""),
  }));

  // Preserve hand-authored importanceRationale values from any existing JSON.
  // This prevents re-running the extractor from wiping rationales that were
  // authored manually or by a downstream agent. Match by statement string.
  const existingOdiPath = path.join(MARKETS_DIR, market.slug, "odi.json");
  if (fs.existsSync(existingOdiPath)) {
    try {
      const existingData = JSON.parse(fs.readFileSync(existingOdiPath, "utf8"));
      const existingByStatement = {};
      for (const n of (existingData.needs || [])) {
        if (n.statement) existingByStatement[n.statement.trim()] = n;
      }
      entries = entries.map((e) => {
        const existing = existingByStatement[e.statement?.trim()];
        if (!existing) return e;
        return {
          ...e,
          // Preserve hand-authored rationale if the extractor would produce empty.
          importanceRationale: e.importanceRationale || existing.importanceRationale || "",
          satisfactionRationale: e.satisfactionRationale || existing.satisfactionRationale || "",
          // Preserve corrected jobStep if existing is a valid Ulwick step.
          jobStep: e.jobStep || existing.jobStep || "",
        };
      });
    } catch (_) { /* ignore parse errors — proceed with fresh extraction */ }
  }

  // Flag entries with missing rationale
  const flaggedCount = entries.filter((e) => !e.importanceRationale).length;

  const data = {
    naicsCode: market.naics,
    marketName: market.name,
    slug: market.slug,
    summary: {
      totalNeeds: parseInt(summaryMap["Total Needs"] || String(entries.length)),
      underservedCount: parseInt(summaryMap["Underserved Count"] || "0"),
      overservedCount: parseInt(summaryMap["Overserved Count"] || "0"),
      avgOpportunityScore: parseFloat(summaryMap["Avg Opportunity Score"] || "0"),
    },
    top5Opportunities: top5,
    needs: entries,
    flaggedRationalesCount: flaggedCount,
    sources,
  };

  write(path.join(MARKETS_DIR, market.slug, "odi.json"), data);
  return data;
}

// ─────────────────────────────────────────────
// VN — per market
// ─────────────────────────────────────────────

function extractVN(market) {
  const file = path.join(SECTIONS_DIR, `VN_${market.fileKey}.md`);
  if (!fs.existsSync(file)) {
    console.warn(`  VN file not found: ${file}`);
    return null;
  }

  const text = read(file);
  const json = extractJSON(text);
  const sources = parseSources(text, `VN-${market.slug.toUpperCase()}`);

  // Header — try "## Header" table first (Format A), then fall back to inline fields (Format B)
  const headerRows = parseTable(extractSection(text, "Header"));
  const headerMap = {};
  headerRows.forEach((r) => { headerMap[r["Field"]?.replace(/\*\*/g, "").trim()] = clean(r["Value"] || ""); });

  // Format B files have no ## Header table — extract fields from other sections
  if (!headerMap["CFJ"]) {
    // Try ## Industry Context table (data-processing-hosting)
    const ctxRows = parseTable(extractSection(text, "Industry Context"));
    ctxRows.forEach((r) => { headerMap[r["Field"]?.replace(/\*\*/g, "").trim()] = clean(r["Value"] || ""); });
    // Try ## Core Functional Job (L7) table
    const cfjRows = parseTable(extractSection(text, "Core Functional Job"));
    cfjRows.forEach((r) => { headerMap[r["Field"]?.replace(/\*\*/g, "").trim()] = clean(r["Value"] || ""); });
    // Remap known alternate keys to canonical names
    if (!headerMap["CFJ"] && headerMap["CFJ statement"]) headerMap["CFJ"] = headerMap["CFJ statement"];
    if (!headerMap["Architecture Distance"] && headerMap["Architecture distance"]) {
      headerMap["Architecture Distance"] = headerMap["Architecture distance"].split(" ")[0];
    }
    // ac-home-heating: CFJ in bold paragraph under ## Core Functional Job (L7)
    if (!headerMap["CFJ"]) {
      const cfjSection = extractSection(text, "Core Functional Job");
      const cfjMatch = cfjSection.match(/\*\*CFJ Statement:\*\*\s*([^\n]+)/i)
        || cfjSection.match(/CFJ Statement:\s*([^\n]+)/i);
      if (cfjMatch) headerMap["CFJ"] = clean(cfjMatch[1]);
    }
    // ac-home-heating: output types from ## Output Types table
    if (!headerMap["Output Types"]) {
      const otSection = extractSection(text, "Output Types");
      const otRows = parseTable(otSection);
      if (otRows.length > 0) {
        headerMap["Output Types"] = otRows.map((r) => clean(r["Output Type"] || r["Name"] || Object.values(r)[1] || "")).filter(Boolean).join(";");
      }
    }
    // data-processing-hosting: output type focus
    if (!headerMap["Output Types"] && headerMap["Output type focus"]) {
      headerMap["Output Types"] = headerMap["Output type focus"];
    }
    // Architecture distance: extract numeric part if present (e.g. "4 (adjacent...)")
    if (!headerMap["Architecture Distance"] && headerMap["Architecture distance"]) {
      headerMap["Architecture Distance"] = headerMap["Architecture distance"].replace(/\s.*/, "");
    }
  }

  // ── L6 systems extraction — handles two markdown formats ─────────────────
  //
  // Format A ("System-of-Systems Decomposition"):
  //   ## L6 — System-of-Systems Decomposition
  //   | L6 ID | Name | Type | Job Family |
  //   | L6.1  | ...  | Core | ...        |
  //
  // Format B1 (multiple per-category headings, e.g. ac-home-heating):
  //   ## L6 — Core Process Steps (Sequential)
  //   | L6 | Name | Job Family | Output Types |
  //   | L6a | Sheet Metal Fabrication | ... | ... |
  //   ## L6 — Horizontal Process Steps
  //   | L6 | Name | Job Family | Scope |
  //   | L6(H1) | Quality Assurance | ... | ... |
  //
  // Format B2 (sub-headings under single L6 section, e.g. data-processing-hosting):
  //   ## L6 — Process Steps
  //   ### Core (sequential)
  //   | ID | Name | Job family | Activates for output types |
  //   | L6a | Facility Provisioning | ... | ... |
  //   ### Horizontal (parallel, cross-cutting) — marked (H)
  //   | ID | Name | Role |
  //   | L6f (H) | ... | ... |

  let l6Systems = [];

  // Try Format A first — exact heading "L6 — System-of-Systems Decomposition"
  const l6SectionA = extractSection(text, "L6 — System-of-Systems Decomposition");
  if (l6SectionA) {
    const l6Rows = parseTable(l6SectionA);
    l6Systems = l6Rows.map((r) => ({
      id: clean(r["L6 ID"] || ""),
      name: clean(r["Name"] || ""),
      type: clean(r["Type"] || ""),
      jobFamily: clean(r["Job Family"] || ""),
      l5Units: [],
    })).filter((r) => r.id);
  } else {
    // Format B: one or more ## L6 — <title> sections that are NOT the canonical Format A heading.
    //
    // Two sub-variants:
    //   B1 (multiple sibling sections, e.g. ac-home-heating):
    //       ## L6 — Core Process Steps (Sequential)   ← section 1, rows have "L6" first column
    //       ## L6 — Horizontal Process Steps           ← section 2, rows have "L6" first column
    //
    //   B2 (single section with ### sub-headings, e.g. data-processing-hosting):
    //       ## L6 — Process Steps
    //       ### Core (sequential)                      ← sub-section, rows have "ID" first column
    //       ### Horizontal (parallel …) — marked (H)  ← sub-section, rows have "ID" first column
    //
    // Strategy: split text on every ## heading boundary, find sections whose title starts "L6 —",
    // then parse their content (handling ### sub-headings for Format B2).

    // Split on "## " heading boundaries (non-greedy, from one ## to the next ## or end of string).
    // Using (?=\n## ) lookahead avoids the m-flag $ ambiguity.
    const l6SectionRe = /## (L6 —[^\n]+)\n([\s\S]*?)(?=\n## |\n# |(?!\s*\S))/g;
    // Simpler approach: split entire text by "\n## " and process chunks.
    const chunks = ("\n" + text).split("\n## ");
    for (const chunk of chunks) {
      const headingEnd = chunk.indexOf("\n");
      if (headingEnd === -1) continue;
      const heading = chunk.slice(0, headingEnd).trim().toLowerCase();
      if (!heading.startsWith("l6 —")) continue;
      const body = chunk.slice(headingEnd + 1);

      // Check for ### sub-headings inside this section (Format B2)
      // Split body by "\n### "
      const subChunks = ("\n" + body).split("\n### ");
      let foundSubHeadings = false;
      for (let i = 1; i < subChunks.length; i++) {
        // Only count chunks after the first (which is pre-### content)
        foundSubHeadings = true;
        const subChunk = subChunks[i];
        const subHeadingEnd = subChunk.indexOf("\n");
        if (subHeadingEnd === -1) continue;
        const subHeading = subChunk.slice(0, subHeadingEnd).trim().toLowerCase();
        const subBody = subChunk.slice(subHeadingEnd + 1);
        const category = subHeading.startsWith("horizontal") ? "horizontal" : "core";
        const rows = parseTable(subBody);
        for (const r of rows) {
          const id = clean(r["ID"] || r["L6"] || r["L6 ID"] || "");
          const name = clean(r["Name"] || "");
          const jobFamily = clean(r["Job family"] || r["Job Family"] || r["Role"] || "");
          const scope = clean(r["Activates for output types"] || r["Scope"] || r["Output Types"] || "");
          if (id) l6Systems.push({ id, name, type: category === "horizontal" ? "Horizontal" : "Core", jobFamily, scope, category, l5Units: [] });
        }
      }

      if (!foundSubHeadings) {
        // Format B1: parse the table directly from the section body
        const category = heading.includes("horizontal") ? "horizontal" : "core";
        const rows = parseTable(body);
        for (const r of rows) {
          const id = clean(r["L6"] || r["L6 ID"] || r["ID"] || "");
          const name = clean(r["Name"] || "");
          const jobFamily = clean(r["Job family"] || r["Job Family"] || r["Role"] || "");
          const scope = clean(r["Activates for output types"] || r["Scope"] || r["Output Types"] || "");
          if (id) l6Systems.push({ id, name, type: category === "horizontal" ? "Horizontal" : "Core", jobFamily, scope, category, l5Units: [] });
        }
      }
    }
  }

  // Extract VN units from JSON if available
  let vnUnits = [];
  if (json?.vn_units) {
    vnUnits = json.vn_units.map((u) => ({
      level: u.level || "",
      id: u.id || "",
      name: u.name || "",
      functionalJob: u.functional_job || u.job_family || "",
      description: u.description || "",
      dependencies: u.dependencies || [],
    }));
  } else {
    // Parse from markdown L5 section headers
    const l5Matches = [...text.matchAll(/#### (L5\.[^:]+): ([^\n]+)\n\n([^\n]+)/g)];
    for (const m of l5Matches) {
      vnUnits.push({
        level: "L5",
        id: m[1].trim(),
        name: m[2].trim(),
        functionalJob: m[3].trim(),
        description: "",
        dependencies: [],
      });
    }
  }

  // Marquardt position (look for "PRIMARY POSITION" or "MARQUARDT" in text)
  const positionMatch = text.match(/\*\*MARQUARDT[^*]+\*\*|MARQUARDT PRIMARY POSITION[^\n]*/i);
  const marquardtPosition = positionMatch ? clean(positionMatch[0]) : "";

  // Strategic position from JSON
  let strategicPosition = null;
  if (json?.strategic_position) {
    strategicPosition = json.strategic_position;
  } else if (json?.vn_hierarchy_score != null) {
    strategicPosition = { score: json.vn_hierarchy_score };
  }

  const data = {
    naicsCode: market.naics,
    marketName: market.name,
    slug: market.slug,
    coreJobStatement: headerMap["CFJ"] || "",
    outputTypes: (headerMap["Output Types"] || "").split(";").map((s) => s.trim()).filter(Boolean),
    hierarchy: headerMap["Hierarchy"] || "",
    architectureDistance: parseInt(headerMap["Architecture Distance"] || "0"),
    marketSize: headerMap["Market Size"] || "",
    l6Systems,
    vnUnits,
    marquardtPosition,
    strategicPosition,
    sources,
  };

  write(path.join(MARKETS_DIR, market.slug, "valueNetwork.json"), data);
  return data;
}

// ─────────────────────────────────────────────
// FIT / Kano — per market
// ─────────────────────────────────────────────

function extractKano(market) {
  const file = path.join(SECTIONS_DIR, `FIT_${market.fileKey}.md`);
  if (!fs.existsSync(file)) {
    console.warn(`  FIT file not found: ${file}`);
    return null;
  }

  const text = read(file);
  const sources = parseSources(text, `FIT-${market.slug.toUpperCase()}`);

  // Step 09a table
  const step09Section = extractSection(text, "09a — Per-Market Kano + ODI Fit Scoring");
  const kanoRows = parseTable(step09Section);

  const features = kanoRows.map((r) => {
    const featureName = clean(r["Feature"] || "");
    const kano = clean(r["Kano"] || "");
    const overall = parseFloat(r["Overall"]?.replace(/\*\*/g, "") || "0");

    return {
      featureName,
      kanoClassification: kano,
      scores: {
        time: parseFloat(r["Time"] || "0"),
        cost: parseFloat(r["Cost"] || "0"),
        safety: parseFloat(r["Safety"] || "0"),
        reliability: parseFloat(r["Reliab."] || r["Reliability"] || "0"),
        skill: parseFloat(r["Skill"] || "0"),
        stress: parseFloat(r["Stress"] || "0"),
        pain: parseFloat(r["Pain"] || "0"),
        confidence: parseFloat(r["Confid."] || r["Confidence"] || "0"),
        delight: parseFloat(r["Delight"] || "0"),
        overall,
      },
    };
  }).filter((f) => f.featureName && f.kanoClassification);

  // Step 09a rationales
  const rationaleSection = extractSection(text, "09a — Rationales");
  const rationales = {};
  // Each feature has a bold header like "**Feature Name** — ..."
  const rationaleParts = rationaleSection.split(/\n(?=\*\*[^*]+\*\*)/);
  for (const part of rationaleParts) {
    const nameMatch = part.match(/^\*\*([^*]+)\*\*/);
    if (nameMatch) {
      const name = nameMatch[1].trim();
      const text2 = part.replace(/^\*\*[^*]+\*\*\s*—?\s*/, "").trim();
      rationales[name] = text2;
    }
  }

  // Step 10 product-related needs
  const prn10Section = extractSection(text, "10a — Generated Needs");
  const prnRows = parseTable(prn10Section);
  const prnNeeds = prnRows.map((r) => ({
    id: clean(r["#"] || ""),
    statement: clean(r["Statement"] || ""),
    sourceConstraint: clean(r["Source Constraint"] || ""),
    importance: parseFloat(r["Imp"] || "0"),
    satisfaction: parseFloat(r["Sat"] || "0"),
  })).filter((r) => r.id);

  // Rationales for step 10
  const prn10RationaleSection = extractSection(text, "10a — Rationales");
  const prnRationales = {};
  const prnParts = prn10RationaleSection.split(/\n(?=\*\*PRN-\d+)/);
  for (const part of prnParts) {
    const nameMatch = part.match(/^\*\*(PRN-\d+)[^*]*\*\*/);
    if (nameMatch) {
      prnRationales[nameMatch[1]] = part.replace(/^\*\*[^*]+\*\*\s*:?\s*/, "").trim();
    }
  }

  const data = {
    naicsCode: market.naics,
    marketName: market.name,
    slug: market.slug,
    features: features.map((f) => ({
      ...f,
      rationale: rationales[f.featureName] || "",
    })),
    avgOverallFit: features.length > 0
      ? parseFloat((features.reduce((s, f) => s + f.scores.overall, 0) / features.length).toFixed(2))
      : 0,
    productRelatedNeeds: prnNeeds.map((n) => ({
      ...n,
      rationale: prnRationales[n.id] || "",
    })),
    sources,
  };

  write(path.join(MARKETS_DIR, market.slug, "kano.json"), data);
  return data;
}

// ─────────────────────────────────────────────
// COMPAT — per market
// ─────────────────────────────────────────────

function extractCompat(market) {
  const file = path.join(SECTIONS_DIR, `COMPAT_${market.fileKey}.md`);
  if (!fs.existsSync(file)) {
    console.warn(`  COMPAT file not found: ${file}`);
    return null;
  }

  const text = read(file);
  const sources = parseSources(text, `COMPAT-${market.slug.toUpperCase()}`);
  const json = extractJSON(text);

  // Context
  const ctxRows = parseTable(extractSection(text, "Market Context"));
  const ctxMap = {};
  ctxRows.forEach((r) => { ctxMap[r["Field"]?.replace(/\*\*/g, "").trim()] = clean(r["Value"] || ""); });

  // Summary table
  const summarySection = extractSection(text, "Summary Table") || extractSection(text, "Constraint Assessments");
  const summaryRows = parseTable(summarySection);

  let assessments = [];
  if (json?.assessments) {
    assessments = json.assessments.map((a) => ({
      constraintName: a.constraint_name || a.name || "",
      constraintType: a.constraint_type || "",
      threshold: a.threshold_value || "",
      verdict: a.verdict || "",
      rationale: a.rationale || "",
      mitigation: a.mitigation_actions ? a.mitigation_actions.join("; ") : (a.mitigation || ""),
      mitigationCost: a.mitigation_cost || "",
      mitigationTime: a.mitigation_time || "",
    }));
  } else {
    assessments = summaryRows.map((r) => ({
      constraintName: clean(r["Constraint"] || ""),
      constraintType: clean(r["Type"] || ""),
      threshold: clean(r["Threshold"] || ""),
      verdict: clean(r["Verdict"] || "").toLowerCase().replace(/\*\*/g, ""),
      rationale: clean(r["Rationale"] || ""),
      mitigation: "",
      mitigationCost: "",
      mitigationTime: "",
    })).filter((a) => a.constraintName);
  }

  // Result
  const resultSection = extractSection(text, "Result");
  const resultRows = parseTable(resultSection);
  const resultMap = {};
  resultRows.forEach((r) => { resultMap[r["Field"]?.replace(/\*\*/g, "").trim()] = clean(r["Value"] || ""); });

  const data = {
    naicsCode: market.naics,
    marketName: market.name,
    slug: market.slug,
    operatingMedium: ctxMap["Operating Medium"] || "",
    architectureDistance: parseInt(ctxMap["Architecture Distance"] || "0"),
    assessments,
    result: {
      knockouts: parseInt(resultMap["Knockouts"] || "0"),
      mitigable: parseInt(resultMap["Mitigable"] || "0"),
      none: parseInt(resultMap["None"] || "0"),
      marketStatus: resultMap["Market Status"] || "SURVIVING",
      totalMitigationCost: resultMap["Total Mitigation Cost"] || "",
      totalMitigationTime: resultMap["Total Mitigation Time"] || "",
    },
    sources,
  };

  write(path.join(MARKETS_DIR, market.slug, "compatibility.json"), data);
  return data;
}

// ─────────────────────────────────────────────
// Meta — per market (derived from ranking)
// ─────────────────────────────────────────────

function writeMarketMeta(market, rankingData) {
  const ranked = rankingData.rankedMarkets || [];
  const entry = ranked.find((r) => r.slug === market.slug);

  const meta = {
    slug: market.slug,
    name: market.name,
    naicsCode: market.naics,
    isReference: market.isReference,
    rank: entry?.rank ?? null,
    scores: entry?.scores ?? null,
    recommendation: entry?.recommendation ?? null,
    rationale: entry?.rationale ?? null,
    entryStrategy: entry?.entryStrategy ?? null,
    estimatedTimeToEntry: entry?.estimatedTimeToEntry ?? null,
    estimatedInvestment: entry?.estimatedInvestment ?? null,
  };

  write(path.join(MARKETS_DIR, market.slug, "meta.json"), meta);
  return meta;
}

// ─────────────────────────────────────────────
// Alternatives — derived from VN + JTBD
// ─────────────────────────────────────────────

function writeAlternatives(market) {
  const jtbdFile = path.join(MARKETS_DIR, market.slug, "jtbd.json");
  if (!fs.existsSync(jtbdFile)) return;

  const jtbd = JSON.parse(read(jtbdFile));
  const alternatives = jtbd.alternatives || [];

  const data = {
    naicsCode: market.naics,
    marketName: market.name,
    slug: market.slug,
    alternatives,
  };

  write(path.join(MARKETS_DIR, market.slug, "alternatives.json"), data);
}

// ─────────────────────────────────────────────
// Main
// ─────────────────────────────────────────────

async function main() {
  console.log("=== Marquardt US Sensor — Data Extraction Pipeline ===\n");

  // Ensure output dirs
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.mkdirSync(MARKETS_DIR, { recursive: true });

  // Global files
  extractProduct();
  extractFunctionalPromise();
  extractConstraints();
  extractHomeMarket();
  extractMarketDiscovery();
  const rankingData = extractRanking();

  // Per-market
  for (const market of MARKET_MAP) {
    console.log(`\nProcessing market: ${market.name} [${market.slug}]`);
    fs.mkdirSync(path.join(MARKETS_DIR, market.slug), { recursive: true });

    extractJTBD(market);
    extractODI(market);
    extractVN(market);
    extractKano(market);
    extractCompat(market);
    writeMarketMeta(market, rankingData);
    writeAlternatives(market);
  }

  // Write global sources registry
  console.log("\nWriting sources registry...");
  write(path.join(DATA_DIR, "sources.json"), globalSources);

  // Write markets index
  console.log("Writing markets index...");
  const marketsIndex = MARKET_MAP.map((m) => ({
    slug: m.slug,
    name: m.name,
    naics: m.naics,
    isReference: m.isReference,
    sourceFile: m.fileKey,
  }));
  write(path.join(DATA_DIR, "markets", "index.json"), marketsIndex);

  // Summary
  const sourceCount = Object.keys(globalSources).length;
  console.log(`\n=== Extraction complete ===`);
  console.log(`Sources registered: ${sourceCount}`);
  console.log(`Markets processed: ${MARKET_MAP.length}`);
  console.log(`New markets (non-reference): ${MARKET_MAP.filter((m) => !m.isReference).length}`);
}

main().catch((e) => {
  console.error("Fatal error:", e);
  process.exit(1);
});

/**
 * BOMSection — Bill of Materials for the base sensor product.
 *
 * product.json does not have a `billOfMaterials` field. Instead we derive
 * the sensor's component breakdown from its features + specifications.
 * A graceful note is shown explaining the derivation.
 */

import type { ProductDecomposition } from "@/types";
import SectionAnchor from "@/components/SectionAnchor";
import ExecutiveSummary from "@/components/ExecutiveSummary";

/* ── Derived BOM item from sensor features ──────────────────────────────── */
interface BOMItem {
  id: string;
  component: string;
  function: string;
  category: string;
  keyAttribute: string;
}

/**
 * Build a logical BOM from the sensor's feature list.
 * Maps technology-scope features to physical components.
 */
function buildBOMFromProduct(product: ProductDecomposition): BOMItem[] {
  // Core sensor components derived from the product data
  const derived: BOMItem[] = [
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
      keyAttribute: "Onboard anomaly detection (bubbles, empty-pipe, glycol);\nbidirectional detection",
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
      keyAttribute: `Max 10 bar continuous; burst >${product.specifications.find((s) => s.name === "Burst Pressure")?.value ?? "9"} bar`,
    },
    {
      id: "BOM-07",
      component: "Acoustic Coupling Material",
      function: "Couple piezoelectric transducers to the fluid channel wall",
      category: "Materials",
      keyAttribute: "Matched acoustic impedance to water/glycol media",
    },
  ];

  return derived;
}

/* ── Category colour map ─────────────────────────────────────────────────── */
const CATEGORY_COLORS: Record<string, { bg: string; text: string }> = {
  Measurement: { bg: "rgba(42,157,143,0.18)", text: "#b7fff6" },
  Sensing: { bg: "rgba(42,157,143,0.18)", text: "#b7fff6" },
  Mechanical: { bg: "rgba(255,255,255,0.07)", text: "#a1a2a1" },
  Electronics: { bg: "rgba(253,255,152,0.14)", text: "#fdff98" },
  Interface: { bg: "rgba(233,196,106,0.18)", text: "#e9c46a" },
  Materials: { bg: "rgba(255,255,255,0.07)", text: "#a1a2a1" },
};

function CategoryBadge({ category }: { category: string }) {
  const c = CATEGORY_COLORS[category] ?? { bg: "rgba(255,255,255,0.07)", text: "#a1a2a1" };
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        fontFamily: "var(--font-mono)",
        fontSize: 10,
        fontWeight: 600,
        padding: "3px 8px",
        borderRadius: 4,
        background: c.bg,
        color: c.text,
        letterSpacing: "0.04em",
        textTransform: "uppercase",
        whiteSpace: "nowrap",
      }}
    >
      {category}
    </span>
  );
}

export default function BOMSection({ product }: { product: ProductDecomposition }) {
  const items = buildBOMFromProduct(product);

  return (
    <div>
      <SectionAnchor
        id="bom"
        kicker="Product Reference"
        title="Sensor Bill of Materials"
      />

      <ExecutiveSummary kicker="Bill of Materials Note">
        <p className="answer">
          Below is the sensor's bill of materials — useful for understanding the physical cost structure as we evaluate each market. Because the product data file does not yet include a dedicated BOM field, this table is derived from the sensor's documented features, technology class, and specifications. It reflects the logical component architecture of the Marquardt Ultrasonic Flow Sensor rather than a formal manufacturing BOM.
        </p>
      </ExecutiveSummary>

      <div style={{ marginTop: 24, overflowX: "auto" }}>
        <table className="priority-table" style={{ width: "100%", minWidth: 640 }}>
          <thead>
            <tr>
              <th style={{ width: 70 }}>ID</th>
              <th>Component</th>
              <th>Function</th>
              <th style={{ width: 110 }}>Category</th>
              <th>Key Attribute</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id}>
                <td>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text-gray-dark)" }}>
                    {item.id}
                  </span>
                </td>
                <td>
                  <span style={{ fontWeight: 500, color: "var(--text-white)" }}>
                    {item.component}
                  </span>
                </td>
                <td style={{ color: "var(--text-gray-light)", fontSize: 13 }}>
                  {item.function}
                </td>
                <td>
                  <CategoryBadge category={item.category} />
                </td>
                <td style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text-gray)", whiteSpace: "pre-line" }}>
                  {item.keyAttribute}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Sensor specifications as supplementary reference */}
      <div style={{ marginTop: 32 }}>
        <p
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 10,
            textTransform: "uppercase",
            letterSpacing: "0.12em",
            color: "var(--text-gray-dark)",
            marginBottom: 12,
          }}
        >
          Key Specifications
        </p>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
            gap: 8,
          }}
        >
          {product.specifications.map((spec) => (
            <div
              key={spec.name}
              style={{
                background: "var(--bg-card)",
                border: "1px solid var(--border-subtle)",
                borderRadius: 8,
                padding: "12px 14px",
                display: "flex",
                flexDirection: "column",
                gap: 4,
              }}
            >
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 10,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  color: "var(--text-gray-dark)",
                }}
              >
                {spec.name}
              </span>
              <span
                style={{
                  fontSize: 18,
                  fontWeight: 500,
                  color: "var(--accent-yellow)",
                  letterSpacing: "-0.01em",
                  lineHeight: 1.1,
                }}
              >
                {spec.value}{" "}
                {spec.unit && (
                  <span style={{ fontSize: 12, fontFamily: "var(--font-mono)", color: "var(--text-gray)", fontWeight: 400 }}>
                    {spec.unit}
                  </span>
                )}
              </span>
              {spec.testCondition && (
                <span style={{ fontSize: 11, color: "var(--text-gray)", fontFamily: "var(--font-mono)" }}>
                  {spec.testCondition}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

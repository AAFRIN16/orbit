import { useEffect } from "react";
import { motion } from "framer-motion";
import { useTelemetry } from "../hooks/useTelemetry";
import Navbar from "../components/Navbar";
import HealthRing from "../components/HealthRing";
import ShapChart from "../components/ShapChart";
import ExportPDF from "../components/ExportPDF";
import ExplanationPanel from "../components/ExplanationPanel";

const FEATURE_ICONS: Record<string, string> = {
  battery_level: "🔋", solar_input: "☀️", power_load: "⚡",
  battery_voltage: "🔌", temperature: "🌡️", eclipse: "🌑",
};

export default function Analysis() {
  const { telemetry, anomaly, explain, loading, pdfLoading, error,
          scenario, runAnalysis, exportPDF, setScenario } = useTelemetry();

  useEffect(() => { runAnalysis("none", 200); }, []);

  const healthScore = anomaly ? Math.round((1 - anomaly.mean_score) * 100) : 100;
  const isAnomalous = anomaly ? anomaly.max_score > 0.65 : false;
  const systemStatus = isAnomalous ? "critical" : anomaly && anomaly.mean_score > 0.4 ? "warning" : "nominal";

  const SCENARIOS = ["none", "solar_failure", "battery_degradation", "load_spike", "thermal_anomaly"];

  return (
    <div style={{ minHeight: "100vh", background: "#070b14" }}>
      <Navbar systemStatus={systemStatus} />
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <div className="max-w-7xl mx-auto p-6">

          <div className="flex items-start justify-between mb-8 flex-wrap gap-4">
            <div>
              <h1 style={{ fontSize: "1.8rem", fontWeight: 800, color: "white",
                letterSpacing: "-0.02em", marginBottom: 6 }}>
                Anomaly Analysis & Explainability Engine
              </h1>
              <p style={{ color: "rgba(107,195,201,0.7)", fontSize: "0.85rem" }}>
                SHAP-powered root cause detection · Isolation Forest ML
              </p>
            </div>
            <div className="flex gap-2 flex-wrap">
              {SCENARIOS.map(s => (
                <button key={s} onClick={() => { setScenario(s); runAnalysis(s, 200); }}
                  style={{
                    padding: "6px 14px", borderRadius: 6, fontSize: "0.75rem", fontWeight: 600,
                    background: scenario === s ? "#6bc3c9" : "transparent",
                    color: scenario === s ? "#070b14" : "#6bc3c9",
                    border: "1px solid #6bc3c9", cursor: "pointer",
                  }}>
                  {s === "none" ? "Normal" : s.replace("_", " ")}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div style={{ background: "#ef444422", border: "1px solid #ef4444", color: "#ef4444",
              padding: "12px 16px", borderRadius: 8, marginBottom: 20, fontSize: "0.85rem" }}>
              ⚠️ {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {[
              {
                label: "Anomaly Score",
                value: anomaly ? `${Math.round(anomaly.max_score * 100)}%` : "--",
                color: isAnomalous ? "#d46981" : "#6bc3c9",
              },
              {
                label: "Top Feature",
                value: explain?.top_feature ?? "--",
                sub: explain ? `${explain.top_contribution.toFixed(1)}% contribution` : "",
                color: "#6bc3c9",
              },
              {
                label: "Model F1 Score",
                value: anomaly ? `${Math.round(anomaly.metrics.f1_score * 100)}%` : "--",
                color: anomaly && anomaly.metrics.f1_score > 0.7 ? "#10b981" : "#f59e0b",
              },
            ].map(card => (
              <div key={card.label} style={{ background: "#0d1424",
                border: "1px solid rgba(107,195,201,0.12)", borderRadius: 10, padding: 20 }}>
                <div style={{ fontSize: "0.6rem", color: "#6bc3c9", letterSpacing: "0.15em",
                  textTransform: "uppercase", fontWeight: 600, marginBottom: 8 }}>{card.label}</div>
                <div style={{ fontSize: "1.75rem", fontWeight: 700, color: card.color }}>{card.value}</div>
                {card.sub && <div style={{ color: "#d46981", fontSize: "0.75rem", marginTop: 2 }}>{card.sub}</div>}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <div className="lg:col-span-2">
              {explain ? <ShapChart shap_values={explain.shap_values} /> :
                <div style={{ background: "#0d1424", borderRadius: 10, padding: 40,
                  textAlign: "center", color: "rgba(199,231,233,0.3)" }}>
                  {loading ? "⏳ Loading SHAP values..." : "No SHAP data yet"}
                </div>}
            </div>

            <div className="flex flex-col gap-4">
              <div style={{ background: "#0d1424", border: "1px solid rgba(107,195,201,0.12)",
                borderRadius: 10, padding: 20, display: "flex", flexDirection: "column",
                alignItems: "center", gap: 8 }}>
                <div style={{ fontSize: "0.6rem", color: "#6bc3c9", letterSpacing: "0.15em",
                  textTransform: "uppercase", fontWeight: 600 }}>Health Score</div>
                <HealthRing score={healthScore} />
              </div>

              {anomaly && (
                <div style={{ background: "#0d1424", border: "1px solid rgba(107,195,201,0.12)",
                  borderRadius: 10, padding: 20 }}>
                  <div style={{ fontSize: "0.6rem", color: "#6bc3c9", letterSpacing: "0.15em",
                    textTransform: "uppercase", fontWeight: 600, marginBottom: 12 }}>Model Performance</div>
                  {[
                    { label: "Precision", value: anomaly.metrics.precision },
                    { label: "Recall", value: anomaly.metrics.recall },
                    { label: "F1 Score", value: anomaly.metrics.f1_score },
                  ].map(m => {
                    const pct = Math.round(m.value * 100);
                    const color = pct > 70 ? "#10b981" : pct > 40 ? "#f59e0b" : "#ef4444";
                    return (
                      <div key={m.label} className="mb-3">
                        <div className="flex justify-between mb-1">
                          <span style={{ fontSize: "0.75rem", color: "rgba(199,231,233,0.6)" }}>{m.label}</span>
                          <span style={{ fontSize: "0.75rem", color, fontWeight: 700 }}>{pct}%</span>
                        </div>
                        <div style={{ height: 5, background: "#161e30", borderRadius: 3, overflow: "hidden" }}>
                          <div style={{ width: `${pct}%`, height: "100%", background: color,
                            borderRadius: 3, transition: "width 0.6s" }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {explain && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
              {Object.entries(explain.shap_values)
                .sort(([, a], [, b]) => b - a)
                .map(([feat, val]) => {
                  const isTop = feat === explain.top_feature;
                  return (
                    <div key={feat} style={{
                      background: "#0d1424",
                      border: `1px solid ${isTop ? "rgba(212,105,129,0.4)" : "rgba(107,195,201,0.12)"}`,
                      borderRadius: 10, padding: 16,
                      boxShadow: isTop ? "0 0 20px rgba(212,105,129,0.15)" : undefined,
                    }}>
                      <div className="flex items-center justify-between mb-3">
                        <span style={{ fontSize: "1.2rem" }}>{FEATURE_ICONS[feat] ?? "📊"}</span>
                        {isTop && (
                          <span style={{ fontSize: "0.6rem", color: "#d46981",
                            border: "1px solid #d46981", borderRadius: 4,
                            padding: "1px 6px", fontWeight: 600 }}>TOP</span>
                        )}
                      </div>
                      <div style={{ fontSize: "0.7rem", color: "#6bc3c9",
                        fontWeight: 600, marginBottom: 4 }}>{feat}</div>
                      <div style={{ fontSize: "1.2rem", fontWeight: 700,
                        color: isTop ? "#d46981" : "white" }}>{val.toFixed(1)}%</div>
                      <div style={{ marginTop: 8, height: 4, background: "#161e30",
                        borderRadius: 2, overflow: "hidden" }}>
                        <div style={{
                          width: `${val}%`, height: "100%", borderRadius: 2,
                          background: isTop
                            ? "linear-gradient(90deg,#d46981,#eeb4be)"
                            : "linear-gradient(90deg,#6bc3c9,#aadbde)",
                          transition: "width 0.6s",
                        }} />
                      </div>
                    </div>
                  );
                })}
            </div>
          )}

          {anomaly && explain && (
            <div className="mb-6">
              <ExplanationPanel
                scenario={scenario}
                anomalyScore={anomaly.max_score}
                anomalyCount={anomaly.anomaly_count}
                topFeature={explain.top_feature}
                healthScore={healthScore}
                isAnomalous={isAnomalous} />
            </div>
          )}

          <ExportPDF
            onExport={exportPDF}
            loading={pdfLoading}
            hasData={telemetry.length > 0 && !!anomaly && !!explain} />

        </div>
      </motion.div>
    </div>
  );
}
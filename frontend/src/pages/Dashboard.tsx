import { useEffect } from "react";
import { motion } from "framer-motion";
import { useTelemetry } from "../hooks/useTelemetry";
import Navbar from "../components/Navbar";
import StatusCard from "../components/StatusCard";
import TelemetryChart from "../components/TelemetryChart";
import AnomalyIndicator from "../components/AnomalyIndicator";
import HealthRing from "../components/HealthRing";
import ControlPanel from "../components/ControlPanel";
import ExportPDF from "../components/ExportPDF";
import ExplanationPanel from "../components/ExplanationPanel";

export default function Dashboard() {
  const { telemetry, anomaly, explain, loading, pdfLoading, error,
          scenario, runAnalysis, exportPDF, setScenario } = useTelemetry();

  useEffect(() => { runAnalysis("none", 200); }, []);

  const latest = telemetry[telemetry.length - 1];
  const healthScore = anomaly ? Math.round((1 - anomaly.mean_score) * 100) : 100;
  const isAnomalous = anomaly ? anomaly.max_score > 0.65 : false;
  const systemStatus = isAnomalous ? "critical" : anomaly && anomaly.mean_score > 0.4 ? "warning" : "nominal";

  return (
    <div style={{ minHeight: "100vh", background: "#070b14" }}>
      <Navbar systemStatus={systemStatus} />
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>

        {error && (
          <div style={{ background: "#ef444422", border: "1px solid #ef4444", color: "#ef4444",
            padding: "12px 24px", fontSize: "0.85rem" }}>
            ⚠️ {error}
          </div>
        )}

        {/* Hero Banner */}
        <div style={{
          background: "linear-gradient(135deg, #070b14 0%, #0d1424 50%, #0a1520 100%)",
          borderBottom: "1px solid rgba(107,195,201,0.1)", padding: "28px 32px"
        }}>
          <div className="max-w-7xl mx-auto flex flex-wrap items-center gap-8">
            <HealthRing score={healthScore} />
            <div className="flex-1">
              <div style={{ fontSize: "1.8rem", fontWeight: 800, letterSpacing: "-0.02em",
                color: isAnomalous ? "#d46981" : "#10b981" }}>
                {isAnomalous ? "⚠️ ANOMALY DETECTED" : "✅ SYSTEMS NOMINAL"}
              </div>
              <div style={{ fontFamily: "monospace", color: "#6bc3c9", fontSize: "1.2rem", fontWeight: 700 }}>
                SCORE: {anomaly ? Math.round(anomaly.max_score * 100) : 0}%
              </div>
              <div style={{ color: "rgba(199,231,233,0.5)", fontSize: "0.8rem", marginTop: 4 }}>
                Scenario: <span style={{ color: "#6bc3c9" }}>{scenario.toUpperCase()}</span>
              </div>
            </div>
            <div className="flex gap-4">
              {[
                { label: "Total Anomalies", value: anomaly?.anomaly_count ?? 0, color: "#d46981" },
                { label: "Data Points", value: telemetry.length, color: "#6bc3c9" },
              ].map(s => (
                <div key={s.label} style={{ textAlign: "center", background: "#0d1424",
                  border: `1px solid ${s.color}33`, borderRadius: 10, padding: "12px 20px" }}>
                  <div style={{ fontSize: "1.4rem", fontWeight: 700, color: s.color }}>{s.value}</div>
                  <div style={{ fontSize: "0.6rem", color: "rgba(199,231,233,0.4)",
                    letterSpacing: "0.1em", textTransform: "uppercase" }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto p-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

            {/* Main content */}
            <div className="lg:col-span-3 flex flex-col gap-6">

              {latest && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <StatusCard icon="🔋" label="Battery" value={latest.battery_level.toFixed(1)} unit="%" />
                  <StatusCard icon="☀️" label="Solar Input" value={latest.solar_input.toFixed(1)} unit="W" />
                  <StatusCard icon="⚡" label="Power Load" value={latest.power_load.toFixed(1)} unit="W" />
                  <StatusCard icon="🔌" label="Voltage" value={latest.battery_voltage.toFixed(2)} unit="V" />
                  <StatusCard icon="🌡️" label="Temperature" value={latest.temperature.toFixed(1)} unit="°C"
                    accentColor={latest.temperature > 45 ? "#d46981" : "#6bc3c9"} />
                  <StatusCard icon="🌑" label="Eclipse" value={latest.eclipse ? "YES" : "NO"} unit=""
                    accentColor={latest.eclipse ? "#8b5cf6" : "#6bc3c9"} />
                </div>
              )}

              {telemetry.length > 0 && (
                <>
                  <TelemetryChart data={telemetry} title="Battery & Solar"
                    lines={[{ key: "battery_level", color: "#6bc3c9", name: "Battery %" },
                            { key: "solar_input", color: "#aadbde", name: "Solar W" }]} />
                  <TelemetryChart data={telemetry} title="Load & Temperature"
                    lines={[{ key: "power_load", color: "#d46981", name: "Load W" },
                            { key: "temperature", color: "#e9a2ae", name: "Temp °C" }]} />
                  <TelemetryChart data={telemetry} title="Battery Voltage"
                    lines={[{ key: "battery_voltage", color: "#9bd5d9", name: "Voltage V" }]} />
                </>
              )}

              {anomaly && (
                <AnomalyIndicator
                  score={anomaly.max_score}
                  count={anomaly.anomaly_count}
                  isAnomalous={isAnomalous} />
              )}

              {/* Plain English Explanation */}
              {anomaly && explain && (
                <ExplanationPanel
                  scenario={scenario}
                  anomalyScore={anomaly.max_score}
                  anomalyCount={anomaly.anomaly_count}
                  topFeature={explain.top_feature}
                  healthScore={healthScore}
                  isAnomalous={isAnomalous} />
              )}

              <ExportPDF
                onExport={exportPDF}
                loading={pdfLoading}
                hasData={telemetry.length > 0 && !!anomaly && !!explain} />
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <ControlPanel
                scenario={scenario}
                onScenarioChange={setScenario}
                onRun={() => runAnalysis(scenario, 200)}
                onReport={exportPDF}
                loading={loading}
                reportLoading={pdfLoading} />
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
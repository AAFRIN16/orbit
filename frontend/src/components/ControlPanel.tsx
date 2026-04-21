interface ControlPanelProps {
    scenario: string;
    onScenarioChange: (s: string) => void;
    onRun: () => void;
    onReport: () => void;
    loading: boolean;
    reportLoading: boolean;
  }
  
  const SCENARIOS = [
    { key: "none", label: "Normal", color: "#6bc3c9" },
    { key: "solar_failure", label: "Solar Failure", color: "#d46981" },
    { key: "battery_degradation", label: "Battery Degradation", color: "#f59e0b" },
    { key: "load_spike", label: "Load Spike", color: "#f97316" },
    { key: "thermal_anomaly", label: "Thermal Anomaly", color: "#8b5cf6" },
  ];
  
  export default function ControlPanel({ scenario, onScenarioChange, onRun, onReport, loading, reportLoading }: ControlPanelProps) {
    return (
      <div style={{ background: "#0d1424", border: "1px solid rgba(107,195,201,0.12)", borderRadius: 10, padding: 20 }}>
        <div style={{ fontSize: "0.6rem", color: "#6bc3c9", letterSpacing: "0.15em", fontWeight: 600, textTransform: "uppercase", marginBottom: 16 }}>
          ⚡ Inject Scenario
        </div>
  
        <div className="flex flex-col gap-2 mb-5">
          {SCENARIOS.map(s => {
            const active = scenario === s.key;
            return (
              <button key={s.key} onClick={() => onScenarioChange(s.key)}
                style={{
                  padding: "8px 12px", borderRadius: 7, fontSize: "0.8rem", fontWeight: 600,
                  background: active ? `${s.color}22` : "transparent",
                  border: `1px solid ${active ? s.color : s.color + "44"}`,
                  color: s.color, cursor: "pointer",
                  boxShadow: active ? `0 0 12px ${s.color}33` : "none",
                  transition: "all 0.2s", textAlign: "left",
                }}>
                {s.label}
              </button>
            );
          })}
        </div>
  
        <button onClick={onRun} disabled={loading}
          style={{
            width: "100%", padding: "10px 0", borderRadius: 8, fontWeight: 700, fontSize: "0.85rem",
            background: loading ? "rgba(107,195,201,0.15)" : "#6bc3c9",
            color: loading ? "#6bc3c9" : "#070b14", border: "none", cursor: loading ? "not-allowed" : "pointer",
            boxShadow: loading ? "none" : "0 0 16px rgba(107,195,201,0.35)",
            marginBottom: 10, transition: "all 0.2s",
          }}>
          {loading ? "⏳ Running..." : "⚡ RUN ANALYSIS"}
        </button>
  
        <button onClick={onReport} disabled={reportLoading || loading}
          style={{
            width: "100%", padding: "10px 0", borderRadius: 8, fontWeight: 700, fontSize: "0.85rem",
            background: "transparent", color: "#d46981",
            border: "1px solid #d46981", cursor: (reportLoading || loading) ? "not-allowed" : "pointer",
            boxShadow: "none", transition: "all 0.2s",
            opacity: (reportLoading || loading) ? 0.5 : 1,
          }}>
          {reportLoading ? "⏳ Generating..." : "🛰️ GENERATE REPORT"}
        </button>
      </div>
    );
  }
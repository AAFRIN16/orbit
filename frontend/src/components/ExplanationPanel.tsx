interface ExplanationPanelProps {
    scenario: string;
    anomalyScore: number;
    anomalyCount: number;
    topFeature: string;
    healthScore: number;
    isAnomalous: boolean;
  }
  
  const FEATURE_PLAIN: Record<string, string> = {
    battery_level: "battery charge level",
    solar_input: "solar panel power output",
    power_load: "electrical power consumption",
    battery_voltage: "battery voltage",
    temperature: "system temperature",
    eclipse: "whether the satellite is in Earth's shadow",
  };
  
  const SCENARIO_PLAIN: Record<string, string> = {
    none: "normal orbital operation",
    solar_failure: "a solar panel failure",
    battery_degradation: "progressive battery degradation",
    load_spike: "a sudden power load spike",
    thermal_anomaly: "a thermal overheating anomaly",
  };
  
  export default function ExplanationPanel({
    scenario, anomalyScore, anomalyCount, topFeature, healthScore, isAnomalous
  }: ExplanationPanelProps) {
    const scorePct = Math.round(anomalyScore * 100);
    const featurePlain = FEATURE_PLAIN[topFeature] ?? topFeature;
    const scenarioPlain = SCENARIO_PLAIN[scenario] ?? scenario;
  
    const statusColor = isAnomalous ? "#c0392b" : anomalyScore > 0.4 ? "#e67e22" : "#27ae60";
    const statusLabel = isAnomalous ? "⚠️ Anomaly Detected" : anomalyScore > 0.4 ? "⚡ Elevated Risk" : "✅ All Good";
  
    const explanation = isAnomalous
      ? `The satellite's power system is currently showing signs of stress under ${scenarioPlain}. 
         Out of ${anomalyCount} detected anomalous readings, the most unusual behavior was observed 
         in the ${featurePlain}. Think of it like a warning light on your car dashboard — something 
         is not behaving the way it normally should. The system's overall health is rated at 
         ${healthScore} out of 100, which means it needs attention. The anomaly score of ${scorePct}% 
         tells us how far the current readings are from what we'd expect during a healthy orbit.`
      : anomalyScore > 0.4
      ? `The satellite is operating under ${scenarioPlain} and showing slightly unusual readings. 
         The ${featurePlain} is the parameter behaving most differently from normal. 
         While not critical yet, this is worth monitoring — like a slight fever that hasn't 
         become serious. The health score of ${healthScore}/100 and anomaly score of ${scorePct}% 
         suggest the system is under mild stress but still functioning.`
      : `The satellite's power system is operating normally under ${scenarioPlain}. 
         All six monitored parameters — battery charge, solar input, power consumption, 
         voltage, temperature, and eclipse state — are behaving as expected. 
         The health score of ${healthScore}/100 confirms the system is in good shape. 
         The anomaly score of ${scorePct}% is low, meaning the AI detected no significant 
         deviations from normal orbital behavior. No action is required.`;
  
    return (
      <div style={{
        background: "#0d1424",
        border: `1px solid ${statusColor}44`,
        borderLeft: `4px solid ${statusColor}`,
        borderRadius: 10,
        padding: 24,
        boxShadow: `0 0 20px ${statusColor}11`,
      }}>
        {/* Header */}
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <div>
            <div style={{ fontSize: "0.6rem", color: "#6bc3c9", letterSpacing: "0.15em",
              fontWeight: 600, textTransform: "uppercase", marginBottom: 4 }}>
              🧠 Plain English Explanation
            </div>
            <div style={{ color: statusColor, fontWeight: 700, fontSize: "1rem" }}>
              {statusLabel}
            </div>
          </div>
          <div style={{
            background: `${statusColor}22`,
            border: `1px solid ${statusColor}`,
            color: statusColor,
            padding: "6px 14px",
            borderRadius: 20,
            fontSize: "0.75rem",
            fontWeight: 700,
          }}>
            Health: {healthScore}/100
          </div>
        </div>
  
        {/* Explanation Text */}
        <p style={{
          color: "rgba(199,231,233,0.8)",
          fontSize: "0.92rem",
          lineHeight: 1.9,
          margin: 0,
          fontStyle: "normal",
        }}>
          {explanation}
        </p>
  
        {/* Key Facts Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-5">
          {[
            { label: "Anomaly Score", value: `${scorePct}%`, color: statusColor },
            { label: "Health Score", value: `${healthScore}/100`, color: healthScore > 75 ? "#27ae60" : healthScore > 50 ? "#e67e22" : "#c0392b" },
            { label: "Top Factor", value: topFeature.replace("_", " "), color: "#6bc3c9" },
            { label: "Scenario", value: scenario === "none" ? "Normal" : scenario.replace("_", " "), color: "#aadbde" },
          ].map(f => (
            <div key={f.label} style={{
              background: "#111827",
              border: "1px solid rgba(107,195,201,0.1)",
              borderRadius: 8,
              padding: "10px 14px",
            }}>
              <div style={{ fontSize: "0.55rem", color: "rgba(199,231,233,0.4)",
                letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 4 }}>
                {f.label}
              </div>
              <div style={{ color: f.color, fontWeight: 700, fontSize: "0.85rem",
                textTransform: "capitalize" }}>
                {f.value}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }
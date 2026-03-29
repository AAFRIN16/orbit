interface AnomalyIndicatorProps {
    score: number;
    count: number;
    isAnomalous: boolean;
  }
  
  export default function AnomalyIndicator({ score, count, isAnomalous }: AnomalyIndicatorProps) {
    const pct = Math.round(score * 100);
    const color = isAnomalous ? "#ef4444" : score > 0.4 ? "#f59e0b" : "#10b981";
    const label = isAnomalous ? "ANOMALY DETECTED" : score > 0.4 ? "ELEVATED RISK" : "SYSTEMS NOMINAL";
  
    return (
      <div style={{ background: "#0d1424", border: `1px solid ${color}33`, borderRadius: 10, padding: 20,
        boxShadow: isAnomalous ? `0 0 20px ${color}22` : undefined }}>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-3 h-3 rounded-full animate-pulse" style={{ background: color }} />
          <span style={{ color, fontSize: "1rem", fontWeight: 700, letterSpacing: "0.05em" }}>{label}</span>
          <div className="ml-auto px-2 py-0.5 rounded-full"
               style={{ background: "#d4698122", border: "1px solid #d46981", color: "#d46981", fontSize: "0.7rem", fontWeight: 600 }}>
            {count} anomalies
          </div>
        </div>
        <div style={{ fontSize: "0.6rem", color: "#6bc3c9", letterSpacing: "0.12em", marginBottom: 6, textTransform: "uppercase" }}>
          Anomaly Score
        </div>
        <div className="flex items-center gap-4">
          <div style={{ flex: 1, height: 8, background: "#161e30", borderRadius: 4, overflow: "hidden" }}>
            <div style={{
              width: `${pct}%`, height: "100%", borderRadius: 4,
              background: "linear-gradient(90deg, #d46981, #eeb4be)",
              transition: "width 0.6s ease"
            }} />
          </div>
          <span style={{ color: "#d46981", fontFamily: "monospace", fontWeight: 700, fontSize: "1.1rem" }}>{pct}%</span>
        </div>
      </div>
    );
  }
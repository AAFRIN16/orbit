interface ExportPDFProps {
  onExport: () => void;
  loading: boolean;
  hasData: boolean;
}

export default function ExportPDF({ onExport, loading, hasData }: ExportPDFProps) {
  return (
    <div style={{
      background: "#0d1424",
      border: "1px solid rgba(107,195,201,0.2)",
      borderRadius: 10,
      borderTop: "3px solid #6bc3c9",
      overflow: "hidden",
    }}>
      <div className="flex items-center justify-between px-5 py-4"
           style={{ borderBottom: "1px solid rgba(107,195,201,0.1)" }}>
        <div>
          <div style={{ fontSize: "0.6rem", color: "#6bc3c9", letterSpacing: "0.15em",
            fontWeight: 600, textTransform: "uppercase" }}>
            📊 Export Report
          </div>
          <div style={{ color: "rgba(199,231,233,0.4)", fontSize: "0.7rem", marginTop: 2 }}>
            Download full telemetry & anomaly report as PDF
          </div>
        </div>
        <span style={{ fontSize: "2rem" }}>📄</span>
      </div>

      {/* What's included */}
      <div style={{ padding: "16px 20px", borderBottom: "1px solid rgba(107,195,201,0.08)" }}>
        <div style={{ fontSize: "0.6rem", color: "#6bc3c9", letterSpacing: "0.12em",
          textTransform: "uppercase", fontWeight: 600, marginBottom: 10 }}>
          Report includes
        </div>
        <div className="grid grid-cols-2 gap-2">
          {[
            "🔋 Telemetry Snapshot",
            "⚠️ Anomaly Status",
            "🔍 SHAP Feature Analysis",
            "📈 Model Performance",
            "🌡️ Subsystem Readings",
            "🛰️ Scenario Details",
          ].map(item => (
            <div key={item} style={{
              fontSize: "0.75rem",
              color: "rgba(199,231,233,0.6)",
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}>
              <div style={{ width: 4, height: 4, borderRadius: "50%",
                background: "#6bc3c9", flexShrink: 0 }} />
              {item}
            </div>
          ))}
        </div>
      </div>

      <div className="px-5 py-4">
        <button
          onClick={onExport}
          disabled={loading || !hasData}
          style={{
            width: "100%",
            padding: "12px 0",
            borderRadius: 8,
            fontWeight: 700,
            fontSize: "0.9rem",
            background: loading || !hasData
              ? "rgba(107,195,201,0.1)"
              : "linear-gradient(90deg, #6bc3c9, #9bd5d9)",
            color: loading || !hasData ? "rgba(107,195,201,0.4)" : "#070b14",
            border: loading || !hasData ? "1px solid rgba(107,195,201,0.2)" : "none",
            cursor: loading || !hasData ? "not-allowed" : "pointer",
            boxShadow: loading || !hasData ? "none" : "0 0 20px rgba(107,195,201,0.3)",
            transition: "all 0.2s",
          }}>
          {loading ? "⏳ Generating PDF..." : !hasData ? "⏳ Waiting for data..." : "📊 DOWNLOAD PDF REPORT"}
        </button>
        {!hasData && (
          <p style={{ color: "rgba(199,231,233,0.3)", fontSize: "0.7rem",
            textAlign: "center", marginTop: 8 }}>
            Run analysis first to enable export
          </p>
        )}
      </div>
    </div>
  );
}
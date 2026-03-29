import { motion } from "framer-motion";
import Navbar from "../components/Navbar";

const TECH = [
  { icon: "🐍", name: "Python", desc: "Backend runtime" },
  { icon: "⚡", name: "FastAPI", desc: "REST API framework" },
  { icon: "🤖", name: "Isolation Forest", desc: "Anomaly detection ML" },
  { icon: "🔍", name: "SHAP", desc: "Explainability engine" },
  { icon: "📄", name: "ReportLab", desc: "PDF generation" },
  { icon: "⚛️", name: "React + TS", desc: "Frontend framework" },
  { icon: "📊", name: "Recharts", desc: "Data visualization" },
  { icon: "🎨", name: "Tailwind CSS", desc: "Utility styling" },
  { icon: "🌀", name: "Framer Motion", desc: "Animations" },
  { icon: "🔧", name: "Vite", desc: "Build tooling" },
];

const STEPS = [
  { icon: "🛰️", title: "Telemetry Simulation", desc: "Physics-based orbit simulation with 90-min period, 35% eclipse fraction, and realistic power dynamics." },
  { icon: "🤖", title: "Anomaly Detection", desc: "Isolation Forest ML model trained on 400 normal samples, normalizing scores 0–1 with 5% contamination threshold." },
  { icon: "🔍", title: "SHAP Explainability", desc: "TreeExplainer computes per-feature contributions, identifying root causes of detected anomalies." },
  { icon: "📊", title: "PDF Report Export", desc: "Download a full mission report as a styled PDF including telemetry, SHAP analysis, and model performance." },
];

const SCENARIOS = [
  { icon: "☀️", name: "Solar Failure", desc: "Solar input drops to 15% of normal after 60% orbit completion.", color: "#d46981" },
  { icon: "🔋", name: "Battery Degradation", desc: "Progressive capacity loss starting at 40% orbit, reaching 40% reduction.", color: "#f59e0b" },
  { icon: "⚡", name: "Load Spike", desc: "Sudden 80% power surge between 50–65% of orbit cycle.", color: "#f97316" },
  { icon: "🌡️", name: "Thermal Anomaly", desc: "Temperature surge of up to 30°C above baseline after 70% orbit.", color: "#8b5cf6" },
];

export default function About() {
  return (
    <div style={{ minHeight: "100vh", background: "#070b14" }}>
      <Navbar systemStatus="nominal" />
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>

        {/* Hero */}
        <div style={{
          background: "linear-gradient(135deg, #070b14 0%, #0d1424 50%, #0a1520 100%)",
          padding: "60px 32px", textAlign: "center",
          borderBottom: "1px solid rgba(107,195,201,0.1)"
        }}>
          <h1 style={{ fontSize: "3.5rem", fontWeight: 800, color: "white",
            letterSpacing: "-0.03em",
            textShadow: "0 0 40px rgba(107,195,201,0.4)", marginBottom: 16 }}>
            ORBIT
          </h1>
          <p style={{ color: "rgba(199,231,233,0.7)", fontSize: "1rem",
            maxWidth: 600, margin: "0 auto 24px" }}>
            Cognitive Digital Twin for Satellite Power Subsystem Health Monitoring
          </p>
          <div className="flex justify-center gap-3 flex-wrap">
            <span style={{ background: "rgba(107,195,201,0.15)", border: "1px solid #6bc3c9",
              color: "#6bc3c9", padding: "6px 16px", borderRadius: 20,
              fontSize: "0.8rem", fontWeight: 600 }}>
              📊 PDF Report Export
            </span>
            <span style={{ background: "rgba(107,195,201,0.15)", border: "1px solid #6bc3c9",
              color: "#6bc3c9", padding: "6px 16px", borderRadius: 20,
              fontSize: "0.8rem", fontWeight: 600 }}>
              🤖 Isolation Forest ML
            </span>
          </div>
        </div>

        <div className="max-w-5xl mx-auto p-8 flex flex-col gap-10">

          {/* What is CDT */}
          <div style={{ borderLeft: "3px solid #6bc3c9", paddingLeft: 20 }}>
            <h2 style={{ color: "white", fontWeight: 700, fontSize: "1.2rem", marginBottom: 10 }}>
              What is a Cognitive Digital Twin?
            </h2>
            <p style={{ color: "rgba(199,231,233,0.65)", lineHeight: 1.8, fontSize: "0.9rem" }}>
              A Cognitive Digital Twin is a real-time virtual replica of a physical system enhanced
              with AI and machine learning. ORBIT creates a digital mirror of a satellite's power
              subsystem — continuously simulating telemetry, detecting anomalies using ML, explaining
              root causes via SHAP, and exporting detailed PDF health reports.
            </p>
          </div>

          {/* Data Flow */}
          <div>
            <h2 style={{ color: "white", fontWeight: 700, fontSize: "1.2rem", marginBottom: 16 }}>
              Data Flow
            </h2>
            <div className="flex items-center gap-2 flex-wrap">
              {["🛰️ Simulator", "🤖 ML Model", "🔍 SHAP", "📊 PDF Export", "💻 Dashboard"].map((node, i, arr) => (
                <div key={node} className="flex items-center gap-2">
                  <div style={{ background: "#0d1424", border: "1px solid rgba(107,195,201,0.3)",
                    borderRadius: 8, padding: "10px 16px", color: "#6bc3c9",
                    fontSize: "0.85rem", fontWeight: 600 }}>
                    {node}
                  </div>
                  {i < arr.length - 1 && (
                    <motion.span
                      animate={{ x: [0, 4, 0] }}
                      transition={{ repeat: Infinity, duration: 1.2 }}
                      style={{ color: "#6bc3c9", fontSize: "1.2rem" }}>
                      →
                    </motion.span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Tech Stack */}
          <div>
            <h2 style={{ color: "white", fontWeight: 700, fontSize: "1.2rem", marginBottom: 16 }}>
              Tech Stack
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {TECH.map(t => (
                <motion.div key={t.name} whileHover={{ y: -4 }}
                  style={{ background: "#0d1424", border: "1px solid rgba(107,195,201,0.12)",
                    borderRadius: 10, padding: 16, textAlign: "center", cursor: "default" }}>
                  <div style={{ fontSize: "1.5rem", marginBottom: 8 }}>{t.icon}</div>
                  <div style={{ color: "white", fontWeight: 600, fontSize: "0.8rem", marginBottom: 2 }}>{t.name}</div>
                  <div style={{ color: "rgba(199,231,233,0.4)", fontSize: "0.7rem" }}>{t.desc}</div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* How It Works */}
          <div>
            <h2 style={{ color: "white", fontWeight: 700, fontSize: "1.2rem", marginBottom: 20 }}>
              How It Works
            </h2>
            <div className="flex flex-col gap-0">
              {STEPS.map((step, i) => (
                <div key={step.title} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div style={{ width: 36, height: 36, borderRadius: "50%",
                      background: "#6bc3c922", border: "2px solid #6bc3c9",
                      display: "flex", alignItems: "center",
                      justifyContent: "center", fontSize: "1rem", flexShrink: 0 }}>
                      {step.icon}
                    </div>
                    {i < STEPS.length - 1 && (
                      <div style={{ width: 2, height: 40,
                        background: "rgba(107,195,201,0.2)", margin: "4px 0" }} />
                    )}
                  </div>
                  <div style={{ paddingTop: 6, paddingBottom: i < STEPS.length - 1 ? 20 : 0 }}>
                    <div style={{ color: "white", fontWeight: 600, marginBottom: 4 }}>{step.title}</div>
                    <div style={{ color: "rgba(199,231,233,0.55)", fontSize: "0.85rem", lineHeight: 1.7 }}>
                      {step.desc}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Scenarios */}
          <div>
            <h2 style={{ color: "white", fontWeight: 700, fontSize: "1.2rem", marginBottom: 16 }}>
              Anomaly Scenarios
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {SCENARIOS.map(s => (
                <div key={s.name} style={{ background: "#0d1424",
                  border: `1px solid ${s.color}44`, borderRadius: 10, padding: 18 }}>
                  <div className="flex items-center gap-3 mb-2">
                    <span style={{ fontSize: "1.4rem" }}>{s.icon}</span>
                    <span style={{ color: s.color, fontWeight: 700 }}>{s.name}</span>
                  </div>
                  <p style={{ color: "rgba(199,231,233,0.55)", fontSize: "0.85rem", lineHeight: 1.7 }}>
                    {s.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer style={{ borderTop: "1px solid rgba(107,195,201,0.1)",
          padding: "20px 32px", textAlign: "center", marginTop: 20 }}>
          <p style={{ color: "rgba(199,231,233,0.4)", fontSize: "0.8rem" }}>
            Built for satellite health monitoring ·{" "}
            <span style={{ color: "#6bc3c9" }}>ORBIT</span> Cognitive Digital Twin
          </p>
        </footer>

      </motion.div>
    </div>
  );
}
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

const TEAL_COLORS = ["#6bc3c9", "#8ccfd4", "#aadbde", "#9bd5d9", "#7cc9ce", "#b8e1e4"];
const ROSE_COLORS = ["#d46981", "#e28f9f", "#eeb4be", "#e9a2ae", "#dc7c90", "#f3c7ce"];

export default function ShapChart({ shap_values }: { shap_values: Record<string, number> }) {
  const data = Object.entries(shap_values)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload?.length) return null;
    return (
      <div style={{ background: "#111827", border: "1px solid rgba(107,195,201,0.3)", borderRadius: 8, padding: "10px 14px" }}>
        <p style={{ color: "#6bc3c9", fontSize: "0.75rem" }}>{payload[0].payload.name}</p>
        <p style={{ color: "#d46981", fontWeight: 700 }}>{payload[0].value.toFixed(2)}%</p>
      </div>
    );
  };

  return (
    <div style={{ background: "#0d1424", border: "1px solid rgba(107,195,201,0.1)", borderRadius: 10, padding: 20 }}>
      <div style={{ fontSize: "0.6rem", color: "#6bc3c9", letterSpacing: "0.15em", fontWeight: 600, textTransform: "uppercase", marginBottom: 4 }}>
        Feature Contribution to Anomaly Detection
      </div>
      <div style={{ color: "rgba(199,231,233,0.4)", fontSize: "0.75rem", marginBottom: 16 }}>
        SHAP-powered root cause analysis
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} layout="vertical" margin={{ left: 20 }}>
          <XAxis type="number" tick={{ fill: "rgba(199,231,233,0.4)", fontSize: 10 }} axisLine={false} tickLine={false} />
          <YAxis dataKey="name" type="category" tick={{ fill: "rgba(199,231,233,0.7)", fontSize: 11 }} axisLine={false} tickLine={false} width={110} />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="value" radius={[0, 4, 4, 0]}>
            {data.map((_, i) => (
              <Cell key={i} fill={i % 2 === 0 ? TEAL_COLORS[i % TEAL_COLORS.length] : ROSE_COLORS[i % ROSE_COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
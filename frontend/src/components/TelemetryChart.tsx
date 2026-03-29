import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

interface TelemetryChartProps {
  data: any[];
  lines: { key: string; color: string; name: string }[];
  title: string;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "#111827", border: "1px solid rgba(107,195,201,0.3)", borderRadius: 8, padding: "10px 14px" }}>
      <p style={{ color: "#6bc3c9", fontSize: "0.7rem", marginBottom: 6 }}>{label}</p>
      {payload.map((p: any) => (
        <p key={p.dataKey} style={{ color: p.color, fontSize: "0.8rem", margin: "2px 0" }}>
          {p.name}: <strong>{typeof p.value === "number" ? p.value.toFixed(2) : p.value}</strong>
        </p>
      ))}
    </div>
  );
};

export default function TelemetryChart({ data, lines, title }: TelemetryChartProps) {
  const sliced = data.filter((_, i) => i % 2 === 0);

  return (
    <div style={{ background: "#0d1424", border: "1px solid rgba(107,195,201,0.1)", borderRadius: 10, padding: 16 }}>
      <div style={{ fontSize: "0.6rem", color: "#6bc3c9", letterSpacing: "0.15em", fontWeight: 600, textTransform: "uppercase", marginBottom: 12 }}>
        {title}
      </div>
      <ResponsiveContainer width="100%" height={180}>
        <LineChart data={sliced}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(107,195,201,0.05)" />
          <XAxis dataKey="timestamp" hide />
          <YAxis tick={{ fill: "rgba(199,231,233,0.4)", fontSize: 10 }} axisLine={false} tickLine={false} />
          <Tooltip content={<CustomTooltip />} />
          {lines.map(l => (
            <Line key={l.key} type="monotone" dataKey={l.key} stroke={l.color}
              name={l.name} dot={false} strokeWidth={1.5} />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
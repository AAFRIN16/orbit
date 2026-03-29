interface StatusCardProps {
    icon: string;
    label: string;
    value: number | string;
    unit: string;
    accentColor?: string;
  }
  
  export default function StatusCard({ icon, label, value, unit, accentColor = "#6bc3c9" }: StatusCardProps) {
    return (
      <div style={{
        background: "#0d1424",
        border: "1px solid rgba(107,195,201,0.12)",
        borderLeft: `3px solid ${accentColor}`,
        borderRadius: "10px",
        padding: "16px 18px",
        boxShadow: "0 4px 24px rgba(0,0,0,0.4)",
      }}>
        <div style={{ fontSize: "0.6rem", color: "#6bc3c9", letterSpacing: "0.15em", fontWeight: 600, textTransform: "uppercase", marginBottom: 8 }}>
          {icon} {label}
        </div>
        <div className="flex items-end gap-2">
          <span style={{ fontSize: "1.75rem", fontWeight: 700, color: "white", lineHeight: 1 }}>{value}</span>
          <span style={{ color: "rgba(199,231,233,0.5)", fontSize: "0.8rem", marginBottom: 3 }}>{unit}</span>
        </div>
      </div>
    );
  }
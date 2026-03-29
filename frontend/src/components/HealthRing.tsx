export default function HealthRing({ score }: { score: number }) {
    const radius = 54;
    const circumference = 2 * Math.PI * radius;
    const progress = (score / 100) * circumference;
    const color = score > 75 ? "#10b981" : score > 50 ? "#f59e0b" : "#ef4444";
  
    return (
      <div className="relative flex items-center justify-center" style={{ width: 130, height: 130 }}>
        <svg width="130" height="130" style={{ transform: "rotate(-90deg)" }}>
          <circle cx="65" cy="65" r={radius} fill="none" stroke="rgba(107,195,201,0.1)" strokeWidth="10" />
          <circle cx="65" cy="65" r={radius} fill="none" stroke={color} strokeWidth="10"
            strokeDasharray={`${progress} ${circumference}`}
            strokeLinecap="round"
            style={{ transition: "stroke-dasharray 0.8s ease" }} />
        </svg>
        <div className="absolute text-center">
          <div style={{ fontSize: "1.6rem", fontWeight: 700, color: "white" }}>{score}</div>
          <div style={{ fontSize: "0.55rem", color: "#6bc3c9", letterSpacing: "0.12em" }}>HEALTH</div>
        </div>
      </div>
    );
  }
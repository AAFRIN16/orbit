import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";

export default function Navbar({ systemStatus }: { systemStatus: "nominal" | "warning" | "critical" }) {
  const [utc, setUtc] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const tick = () => setUtc(new Date().toUTCString().slice(17, 25));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const links = [
    { path: "/", label: "Dashboard" },
    { path: "/analysis", label: "Analysis" },
    { path: "/about", label: "About" },
  ];

  const statusColor = systemStatus === "nominal" ? "#10b981" : systemStatus === "warning" ? "#f59e0b" : "#ef4444";
  const statusLabel = systemStatus === "nominal" ? "NOMINAL" : systemStatus === "warning" ? "WARNING" : "CRITICAL";

  return (
    <nav style={{ background: "#0a0f1e", borderBottom: "1px solid rgba(107,195,201,0.15)" }}
         className="sticky top-0 z-50 px-6 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <span className="text-2xl">🛰️</span>
          <div>
            <span className="text-white font-bold text-lg tracking-tight">ORBIT</span>
            <div style={{ color: "#6bc3c9", fontSize: "0.55rem", letterSpacing: "0.15em" }} className="uppercase font-semibold">
              Cognitive Digital Twin
            </div>
          </div>
        </div>

        {/* Center nav */}
        <div className="hidden md:flex items-center gap-8">
          {links.map(l => {
            const active = location.pathname === l.path;
            return (
              <Link key={l.path} to={l.path}
                style={{
                  color: active ? "#6bc3c9" : "rgba(199,231,233,0.5)",
                  borderBottom: active ? "2px solid #6bc3c9" : "2px solid transparent",
                  paddingBottom: "2px",
                  fontSize: "0.875rem",
                  fontWeight: 500,
                  transition: "all 0.2s",
                  textDecoration: "none",
                }}>
                {l.label}
              </Link>
            );
          })}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-4">
          <span style={{ color: "#aadbde", fontFamily: "monospace", fontSize: "0.8rem" }}>{utc} UTC</span>
          <div className="flex items-center gap-2 px-3 py-1 rounded-full"
               style={{ background: "rgba(16,185,129,0.1)", border: `1px solid ${statusColor}` }}>
            <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: statusColor }} />
            <span style={{ color: statusColor, fontSize: "0.7rem", fontWeight: 600, letterSpacing: "0.1em" }}>
              {statusLabel}
            </span>
          </div>
          <button className="md:hidden text-white" onClick={() => setMenuOpen(o => !o)}>☰</button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden mt-2 flex flex-col gap-2 px-4 pb-3">
          {links.map(l => (
            <Link key={l.path} to={l.path}
              style={{ color: location.pathname === l.path ? "#6bc3c9" : "rgba(199,231,233,0.5)", textDecoration: "none" }}
              onClick={() => setMenuOpen(false)}>
              {l.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}
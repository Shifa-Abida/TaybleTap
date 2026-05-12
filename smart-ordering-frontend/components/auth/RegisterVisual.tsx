"use client";
import { Icon, IC } from "./AuthShared";

export function RegisterVisual({ animate }: { animate: boolean }) {
  const steps = [
    { icon: "\uD83C\uDFEA", label: "Register Restaurant", done: true, active: false },
    { icon: "\uD83C\uDF7D\uFE0F", label: "Add Menu Items", done: true, active: false },
    { icon: "\uD83D\uDCF1", label: "Generate QR Codes", done: false, active: true },
    { icon: "\uD83D\uDCCA", label: "Go Live & Earn", done: false, active: false },
  ];
  const stats = [
    { label: "Restaurants joined", val: "500+", icon: "\uD83C\uDFEA" },
    { label: "Orders processed", val: "2.4M", icon: "\uD83D\uDCE6" },
    { label: "Avg setup time", val: "8 min", icon: "\u26A1" },
  ];

  return (
    <div style={{ position: "relative", width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 20 }}>
      {/* Glow */}
      <div style={{ position: "absolute", width: 300, height: 300, borderRadius: "50%", background: "radial-gradient(circle, rgba(245,166,35,0.18) 0%, transparent 70%)", filter: "blur(50px)", animation: "floatY 10s ease-in-out infinite" }} />

      {/* Onboarding steps card */}
      <div style={{
        width: 310, borderRadius: 22, overflow: "hidden",
        background: "white", boxShadow: "0 24px 70px rgba(26,18,8,0.14), 0 0 0 1px rgba(0,0,0,0.05)",
        animation: animate ? "dashCard 0.75s 0.2s both" : "none",
        position: "relative", zIndex: 2,
      }}>
        <div style={{ padding: "16px 18px", borderBottom: "1px solid rgba(0,0,0,0.06)", display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 30, height: 30, borderRadius: 9, background: "linear-gradient(135deg, #E8572A, #F5A623)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Icon d={IC.utensils} size={14} color="white" />
          </div>
          <div>
            <p style={{ fontSize: 13, fontWeight: 600, color: "#1A1208" }}>Setup Progress</p>
            <p style={{ fontSize: 10, color: "#9C8B78" }}>You&apos;re almost live \uD83D\uDE80</p>
          </div>
          <div style={{ marginLeft: "auto" }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "var(--primary)", background: "rgba(232,87,42,0.08)", padding: "3px 9px", borderRadius: 20 }}>75%</span>
          </div>
        </div>

        {/* Progress bar */}
        <div style={{ height: 3, background: "rgba(0,0,0,0.06)" }}>
          <div style={{
            height: "100%", borderRadius: 2,
            background: "linear-gradient(90deg, var(--primary), var(--gold))",
            width: "75%",
            animation: animate ? "progressBar 1.2s 0.6s ease both" : "none",
          } as React.CSSProperties} />
        </div>

        <div style={{ padding: "14px 18px", display: "flex", flexDirection: "column", gap: 10 }}>
          {steps.map((s, i) => (
            <div key={s.label} style={{
              display: "flex", alignItems: "center", gap: 12,
              padding: "10px 12px", borderRadius: 11,
              background: s.active ? "rgba(232,87,42,0.05)" : "transparent",
              border: s.active ? "1.5px solid rgba(232,87,42,0.2)" : "1.5px solid transparent",
              animation: animate ? `stepIn 0.4s ${0.4 + i * 0.12}s both` : "none",
            }}>
              <div style={{
                width: 32, height: 32, borderRadius: 9, flexShrink: 0,
                display: "flex", alignItems: "center", justifyContent: "center",
                background: s.done ? "rgba(45,158,107,0.1)" : s.active ? "rgba(232,87,42,0.08)" : "rgba(0,0,0,0.04)",
                fontSize: 16,
              }}>
                {s.done ? <Icon d={IC.check} size={16} color="#2D9E6B" sw={2.5} /> : s.icon}
              </div>
              <span style={{ fontSize: 13, fontWeight: s.active ? 600 : 500, color: s.done ? "#9C8B78" : "#1A1208", textDecoration: s.done ? "line-through" : "none" }}>
                {s.label}
              </span>
              {s.active && (
                <div style={{ marginLeft: "auto" }}>
                  <div style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--primary)", animation: "pulse 1.4s ease-in-out infinite" }} />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Stats strip */}
      <div style={{ width: 310, display: "flex", gap: 8, animation: animate ? "dashCard 0.7s 0.9s both" : "none", position: "relative", zIndex: 2 }}>
        {stats.map(s => (
          <div key={s.label} style={{
            flex: 1, background: "white", borderRadius: 14, padding: "11px 10px", textAlign: "center",
            boxShadow: "0 4px 16px rgba(26,18,8,0.07)", border: "1px solid rgba(0,0,0,0.05)",
          }}>
            <span style={{ fontSize: 18 }}>{s.icon}</span>
            <p style={{ fontSize: 15, fontWeight: 700, color: "#1A1208", fontFamily: "var(--font-display)", marginTop: 4, lineHeight: 1 }}>{s.val}</p>
            <p style={{ fontSize: 9, color: "#9C8B78", marginTop: 2, lineHeight: 1.3 }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Floating AI badge */}
      <div style={{
        position: "absolute", top: "6%", right: "4%",
        background: "linear-gradient(135deg, #E8572A, #F5A623)",
        borderRadius: 100, padding: "8px 14px",
        display: "flex", alignItems: "center", gap: 7, zIndex: 3,
        boxShadow: "0 6px 20px rgba(232,87,42,0.3)",
        animation: animate ? "notifPop 0.5s 1.3s both, floatYAlt 6s 2s ease-in-out infinite" : "none",
      }}>
        <Icon d={IC.spark} size={13} color="white" />
        <span style={{ fontSize: 11, fontWeight: 700, color: "white", letterSpacing: "0.06em" }}>AI-Powered</span>
      </div>

      {/* Floating QR badge */}
      <div style={{
        position: "absolute", bottom: "10%", left: "2%",
        background: "white", borderRadius: 14, padding: "10px 13px",
        display: "flex", alignItems: "center", gap: 10, zIndex: 3,
        boxShadow: "0 8px 24px rgba(26,18,8,0.1)", border: "1px solid rgba(0,0,0,0.06)",
        animation: animate ? "notifPop 0.6s 1.7s both, floatY 7s 2.3s ease-in-out infinite" : "none",
        minWidth: 148,
      }}>
        <div style={{ width: 32, height: 32, borderRadius: 9, background: "rgba(232,87,42,0.08)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Icon d={IC.qr} size={18} color="var(--primary)" />
        </div>
        <div>
          <p style={{ fontSize: 12, fontWeight: 600, color: "#1A1208" }}>QR Ready</p>
          <p style={{ fontSize: 10, color: "#9C8B78" }}>Table 1-12 generated</p>
        </div>
      </div>
    </div>
  );
}

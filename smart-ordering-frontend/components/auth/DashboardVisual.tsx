"use client";
import { useEffect } from "react";

export function DashboardVisual({ animate }: { animate: boolean }) {
  useEffect(() => {
    if (!animate) return;
  }, [animate]);

  const orders = [
    { table: "Table 4", item: "Biryani \u00D7 2", status: "Preparing", dot: "#F5A623" },
    { table: "Table 7", item: "Butter Paneer", status: "Ready \u2713", dot: "#2D9E6B" },
    { table: "Table 1", item: "Tandoori Platter", status: "New", dot: "#E8572A" },
  ];
  const bars = [38, 62, 48, 82, 55, 91, 70];
  const stats = [
    { label: "Orders", val: "47", color: "#E8572A" },
    { label: "Revenue", val: "\u20B98.2k", color: "#2D9E6B" },
    { label: "Tables", val: "12", color: "#7C5CBF" },
    { label: "Pending", val: "5", color: "#F5A623" },
  ];

  return (
    <div style={{ position: "relative", width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
      {/* Glowing halo */}
      <div style={{ position: "absolute", width: 320, height: 320, borderRadius: "50%", background: "radial-gradient(circle, rgba(232,87,42,0.18) 0%, transparent 70%)", filter: "blur(40px)", animation: "floatY 8s ease-in-out infinite" }} />

      {/* Main dashboard card */}
      <div style={{
        width: 310, borderRadius: 22, overflow: "hidden",
        background: "white", boxShadow: "0 28px 80px rgba(26,18,8,0.16), 0 0 0 1px rgba(0,0,0,0.05)",
        animation: animate ? "dashCard 0.8s 0.3s both, floatY 7s 1s ease-in-out infinite" : "none",
        position: "relative", zIndex: 2,
      }}>
        {/* Browser chrome */}
        <div style={{ padding: "11px 14px", background: "#FAFAF8", borderBottom: "1px solid rgba(0,0,0,0.06)", display: "flex", alignItems: "center", gap: 8 }}>
          {["#FF5F57","#FEBC2E","#28C840"].map(c => <div key={c} style={{ width: 9, height: 9, borderRadius: "50%", background: c }} />)}
          <div style={{ flex: 1, background: "#F0ECE6", borderRadius: 5, padding: "3px 10px", fontSize: 10, color: "#9C8B78", textAlign: "center" }}>
            taybletap.app/dashboard
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#22C55E", animation: "pulse 1.8s ease-in-out infinite" }} />
            <span style={{ fontSize: 10, color: "#22C55E", fontWeight: 600 }}>Live</span>
          </div>
        </div>

        <div style={{ padding: 14 }}>
          {/* Stats grid */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 12 }}>
            {stats.map(s => (
              <div key={s.label} style={{ background: "#FDF6EF", borderRadius: 10, padding: "10px 11px", border: "1px solid rgba(0,0,0,0.05)" }}>
                <p style={{ fontFamily: "var(--font-display)", fontSize: 19, fontWeight: 700, color: s.color, lineHeight: 1 }}>{s.val}</p>
                <p style={{ fontSize: 10, color: "#9C8B78", fontWeight: 500, marginTop: 2 }}>{s.label}</p>
              </div>
            ))}
          </div>

          {/* Mini bar chart */}
          <div style={{ background: "#FDF6EF", borderRadius: 10, padding: "10px 11px", marginBottom: 12, border: "1px solid rgba(0,0,0,0.05)" }}>
            <p style={{ fontSize: 10, fontWeight: 600, color: "#9C8B78", marginBottom: 8 }}>Orders this week</p>
            <div style={{ display: "flex", alignItems: "flex-end", gap: 4, height: 42 }}>
              {bars.map((h, i) => (
                <div key={i} style={{ flex: 1, borderRadius: "3px 3px 0 0", height: `${h}%`, background: i === 5 ? "var(--primary)" : "rgba(232,87,42,0.18)", transition: "height 0.5s ease" }} />
              ))}
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
              {["M","T","W","T","F","S","S"].map((d, i) => (
                <span key={i} style={{ fontSize: 9, color: i === 5 ? "var(--primary)" : "#9C8B78", flex: 1, textAlign: "center", fontWeight: i === 5 ? 700 : 400 }}>{d}</span>
              ))}
            </div>
          </div>

          {/* Live orders */}
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {orders.map((o, i) => (
              <div key={o.table} style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "8px 10px", borderRadius: 9, background: "#FAFAF8", border: "1px solid rgba(0,0,0,0.05)",
                animation: animate ? `dashCard 0.5s ${0.5 + i * 0.15}s both` : "none",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 6, height: 6, borderRadius: "50%", background: o.dot, flexShrink: 0 }} />
                  <div>
                    <p style={{ fontSize: 11, fontWeight: 600, color: "#1A1208" }}>{o.table}</p>
                    <p style={{ fontSize: 10, color: "#9C8B78" }}>{o.item}</p>
                  </div>
                </div>
                <span style={{ fontSize: 10, fontWeight: 700, color: o.dot, background: o.dot + "15", padding: "2px 7px", borderRadius: 20 }}>{o.status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Floating notifications */}
      {[
        { emoji: "\uD83C\uDF5B", text: "New order", sub: "Table 3 \u00B7 \u20B9280", top: "8%", left: "2%", delay: "1.1s" },
        { emoji: "\u2705", text: "Payment done", sub: "Table 6 \u00B7 \u20B9450", bottom: "14%", right: "0%", delay: "1.6s" },
        { emoji: "\u2B50", text: "4.9 rating", sub: "TaybleTap", top: "42%", right: "-2%", delay: "2s" },
      ].map((n, i) => (
        <div key={i} style={{
          position: "absolute", top: n.top, left: n.left, right: n.right, bottom: n.bottom,
          background: "white", borderRadius: 12, padding: "9px 13px",
          display: "flex", alignItems: "center", gap: 9, zIndex: 3,
          boxShadow: "0 8px 24px rgba(26,18,8,0.1), 0 0 0 1px rgba(0,0,0,0.05)",
          animation: animate ? `notifPop 0.6s ${n.delay} both, floatY ${5 + i}s 2s ease-in-out infinite` : "none",
          minWidth: 148,
        }}>
          <span style={{ fontSize: 20 }}>{n.emoji}</span>
          <div>
            <p style={{ fontSize: 12, fontWeight: 600, color: "#1A1208", lineHeight: 1.2 }}>{n.text}</p>
            <p style={{ fontSize: 10, color: "#9C8B78" }}>{n.sub}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

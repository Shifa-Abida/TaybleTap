"use client";
import { useState, useRef, ReactNode } from "react";

// ─── Icon helper ──────────────────────────────────────────────────────────────
export const Icon = ({ d, size = 20, color = "currentColor", fill = "none", sw = 1.8 }: { d: string; size?: number; color?: string; fill?: string; sw?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={color}
    strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <path d={d} />
  </svg>
);

// ─── Icon paths ───────────────────────────────────────────────────────────────
export const IC = {
  utensils: "M3 2v7c0 1.1.9 2 2 2h4a2 2 0 002-2V2M7 2v20M21 15V2a5 5 0 00-5 5v6c0 1.1.9 2 2 2h3v7",
  arrow: "M5 12h14M12 5l7 7-7 7",
  arrowLeft: "M19 12H5M12 19l-7-7 7-7",
  eye: "M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8zM12 9a3 3 0 100 6 3 3 0 000-6z",
  eyeOff: "M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24M1 1l22 22",
  mail: "M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2zM22 6l-10 7L2 6",
  lock: "M19 11H5a2 2 0 00-2 2v7a2 2 0 002 2h14a2 2 0 002-2v-7a2 2 0 00-2-2zM7 11V7a5 5 0 0110 0v4",
  user: "M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z",
  building: "M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2zM9 22V12h6v10",
  phone: "M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 014.75 12a19.79 19.79 0 01-3-8.59A2 2 0 013.72 1.5h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9a16 16 0 006 6l.91-.91a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z",
  check: "M20 6L9 17l-5-5",
  star: "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z",
  clock: "M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10zM12 6v6l4 2",
  shield: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z",
  qr: "M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM18 14h3v3h-3zM14 14h3v3h-3zM14 18h3v3h-3z",
  spark: "M12 3c-1 2.5-3 4.5-5.5 5.5C9 9.5 11 11.5 12 14c1-2.5 3-4.5 5.5-5.5C15 7.5 13 5.5 12 3z",
  map: "M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z M12 7a3 3 0 100 6 3 3 0 000-6z",
};

// ─── Logo ─────────────────────────────────────────────────────────────────────
export function Logo({ size = "md", onClick }: { size?: "sm" | "md"; onClick?: () => void }) {
  const s = size === "sm" ? { wrap: 32, icon: 15, text: 18 } : { wrap: 40, icon: 18, text: 22 };
  return (
    <div onClick={onClick} style={{ display: "inline-flex", alignItems: "center", gap: 10, cursor: onClick ? "pointer" : "default" }}>
      <div style={{
        width: s.wrap, height: s.wrap, borderRadius: 12,
        background: "linear-gradient(135deg, #E8572A, #F5A623)",
        display: "flex", alignItems: "center", justifyContent: "center",
        boxShadow: "0 4px 14px rgba(232,87,42,0.3)",
      }}>
        <Icon d={IC.utensils} size={s.icon} color="white" />
      </div>
      <span style={{ fontFamily: "var(--font-display)", fontSize: s.text, fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.01em" }}>
        Tayble<span style={{ color: "var(--primary)" }}>Tap</span>
      </span>
    </div>
  );
}

// ─── Animated Orbs ────────────────────────────────────────────────────────────
export function AnimatedOrbs({ variant = "warm" }: { variant?: "warm" | "dark" }) {
  const orbs = variant === "dark" ? [
    { w: 420, h: 420, top: "-12%", left: "-8%", bg: "rgba(232,87,42,0.18)", anim: "orb1 18s ease-in-out infinite" },
    { w: 320, h: 320, top: "45%", right: "-6%", bg: "rgba(245,166,35,0.14)", anim: "orb2 22s ease-in-out infinite" },
    { w: 240, h: 240, bottom: "-6%", left: "30%", bg: "rgba(255,122,77,0.12)", anim: "orb3 14s ease-in-out infinite" },
  ] : [
    { w: 500, h: 500, top: "-18%", right: "-10%", bg: "rgba(245,166,35,0.13)", anim: "orb1 20s ease-in-out infinite" },
    { w: 360, h: 360, bottom: "-10%", left: "-6%", bg: "rgba(232,87,42,0.09)", anim: "orb2 16s ease-in-out infinite" },
    { w: 260, h: 260, top: "40%", left: "20%", bg: "rgba(245,166,35,0.07)", anim: "orb3 12s ease-in-out infinite" },
  ];
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
      {orbs.map((o, i) => (
        <div key={i} style={{
          position: "absolute", borderRadius: "50%",
          width: o.w, height: o.h,
          top: o.top, left: o.left, right: o.right, bottom: o.bottom,
          background: o.bg, filter: "blur(70px)", animation: o.anim,
        } as React.CSSProperties} />
      ))}
      <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle, rgba(232,87,42,0.055) 1px, transparent 1px)", backgroundSize: "36px 36px" }} />
    </div>
  );
}

// ─── Testimonial Ticker ───────────────────────────────────────────────────────
export function TestimonialTicker() {
  const items = [
    "\u2B50 \u201CSetup took under 10 minutes!\u201D \u2014 Spice Garden",
    "\uD83D\uDD25 \u201COrders up 3\u00D7 in first week!\u201D \u2014 Caf\u00E9 Bombay",
    "\u2705 \u201CNo more order mistakes!\u201D \u2014 Dosa House",
    "\uD83D\uDCB0 \u201CSaved \u20B915k on printing menus!\u201D \u2014 The Curry Leaf",
    "\uD83D\uDCCA \u201CRevenue analytics changed everything!\u201D \u2014 Naan Stop",
  ];
  const all = [...items, ...items];
  return (
    <div style={{ overflow: "hidden", position: "absolute", bottom: 24, left: 0, right: 0, zIndex: 5 }}>
      <div style={{ display: "flex", gap: 28, animation: "tickerScroll 28s linear infinite", width: "max-content" }}>
        {all.map((t, i) => (
          <span key={i} style={{ fontSize: 12, color: "rgba(255,255,255,0.55)", fontWeight: 500, whiteSpace: "nowrap", padding: "0 8px" }}>{t}</span>
        ))}
      </div>
    </div>
  );
}

// ─── Password Strength ────────────────────────────────────────────────────────
export function PasswordStrength({ pw }: { pw: string }) {
  const score = pw.length === 0 ? 0
    : pw.length < 6 ? 1
    : pw.length < 10 ? ((/[A-Z]/.test(pw) || /\d/.test(pw)) ? 2 : 1)
    : (/[A-Z]/.test(pw) && /\d/.test(pw) && /[^A-Za-z0-9]/.test(pw)) ? 4 : 3;
  const labels = ["", "Weak", "Fair", "Good", "Strong"];
  const colors = ["", "#E8572A", "#F5A623", "#2D9E6B", "#2D9E6B"];
  if (!pw) return null;
  return (
    <div style={{ marginTop: 8 }}>
      <div style={{ display: "flex", gap: 4, marginBottom: 5 }}>
        {[1,2,3,4].map(i => (
          <div key={i} className="strength-bar">
            <div className="strength-fill" style={{ width: score >= i ? "100%" : "0%", background: colors[score] }} />
          </div>
        ))}
      </div>
      <span style={{ fontSize: 11, color: colors[score], fontWeight: 600 }}>{labels[score]} password</span>
    </div>
  );
}

// ─── Field ────────────────────────────────────────────────────────────────────
export function Field({ label, type = "text", icon, placeholder, value, onChange, extra }: {
  label: string; type?: string; icon?: string; placeholder?: string;
  value: string; onChange: (v: string) => void; extra?: ReactNode;
}) {
  const [show, setShow] = useState(false);
  const isPass = type === "password";
  return (
    <div style={{ marginBottom: 18 }}>
      <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 7 }}>{label}</label>
      <div style={{ position: "relative" }}>
        {icon && (
          <div style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}>
            <Icon d={icon} size={16} color="var(--text-muted)" />
          </div>
        )}
        <input
          className={`tt-input${icon ? " has-icon" : ""}`}
          type={isPass && show ? "text" : type}
          placeholder={placeholder}
          value={value}
          onChange={e => onChange(e.target.value)}
          style={isPass ? { paddingRight: 44 } : {}}
        />
        {isPass && (
          <button type="button" onClick={() => setShow(s => !s)} style={{
            position: "absolute", right: 13, top: "50%", transform: "translateY(-50%)",
            background: "none", border: "none", cursor: "pointer", padding: 2,
          }}>
            <Icon d={show ? IC.eyeOff : IC.eye} size={16} color="var(--text-muted)" />
          </button>
        )}
      </div>
      {extra}
    </div>
  );
}

// ─── Social Buttons ───────────────────────────────────────────────────────────
export function SocialButtons({ label = "Or continue with" }: { label?: string }) {
  return (
    <div style={{ marginBottom: 22 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
        <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
        <span style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 500, whiteSpace: "nowrap" }}>{label}</span>
        <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
      </div>
      <div style={{ display: "flex", gap: 10 }}>
        {[{ label: "Google", emoji: "G" }, { label: "Facebook", emoji: "f" }].map(s => (
          <button key={s.label} type="button" className="tt-social-btn">
            <span style={{ fontSize: 15, fontWeight: 800, fontFamily: "serif" }}>{s.emoji}</span>
            {s.label}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Ripple Hook ──────────────────────────────────────────────────────────────
export function useRipple() {
  const ref = useRef<HTMLButtonElement>(null);
  const triggerRipple = (e: React.MouseEvent) => {
    const btn = ref.current;
    if (!btn) return;
    const rect = btn.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const el = document.createElement("span");
    el.className = "ripple-el";
    const size = Math.max(rect.width, rect.height) * 1.6;
    el.style.cssText = `width:${size}px;height:${size}px;left:${x - size / 2}px;top:${y - size / 2}px;`;
    btn.appendChild(el);
    setTimeout(() => el.remove(), 600);
  };
  return { ref, triggerRipple };
}

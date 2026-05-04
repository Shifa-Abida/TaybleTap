"use client";
import { useState, useEffect, useRef } from "react";

// ─── CSS Variables & Global Styles ────────────────────────────────────────────
const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400;1,600&family=DM+Sans:wght@300;400;500;600&display=swap');

    :root {
      --primary: #E8572A;
      --primary-light: #FF7A4D;
      --primary-dark: #C43E18;
      --gold: #F5A623;
      --gold-light: #FFD27A;
      --green: #2D9E6B;
      --bg: #FEFCF9;
      --bg-warm: #FDF6EF;
      --bg-card: #FFFFFF;
      --border: rgba(0,0,0,0.07);
      --border-hover: rgba(232,87,42,0.3);
      --text-primary: #1A1208;
      --text-secondary: #5C4A38;
      --text-muted: #9C8B78;
      --font-display: 'Cormorant Garamond', serif;
      --font-body: 'DM Sans', sans-serif;
      --shadow-sm: 0 2px 8px rgba(26,18,8,0.06);
      --shadow-md: 0 8px 24px rgba(26,18,8,0.08);
      --shadow-lg: 0 20px 60px rgba(26,18,8,0.12);
      --shadow-orange: 0 8px 30px rgba(232,87,42,0.22);
    }

    * { box-sizing: border-box; margin: 0; padding: 0; }

    body, #root {
      font-family: var(--font-body);
      background: var(--bg);
      color: var(--text-primary);
      overflow-x: hidden;
    }

    .gradient-text {
      background: linear-gradient(135deg, var(--primary) 0%, var(--gold) 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .pill {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 6px 14px;
      border-radius: 100px;
      font-size: 11px;
      font-weight: 600;
      letter-spacing: 0.08em;
      text-transform: uppercase;
    }

    .btn-primary {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 14px 28px;
      border-radius: 14px;
      background: var(--primary);
      color: white;
      font-family: var(--font-body);
      font-size: 14px;
      font-weight: 600;
      border: none;
      cursor: pointer;
      transition: all 0.25s ease;
      box-shadow: var(--shadow-orange);
    }
    .btn-primary:hover {
      background: var(--primary-dark);
      transform: translateY(-1px);
      box-shadow: 0 12px 40px rgba(232,87,42,0.32);
    }

    .btn-outline {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 13px 24px;
      border-radius: 14px;
      background: white;
      color: var(--text-primary);
      font-family: var(--font-body);
      font-size: 14px;
      font-weight: 500;
      border: 1px solid var(--border);
      cursor: pointer;
      transition: all 0.2s ease;
      box-shadow: var(--shadow-sm);
    }
    .btn-outline:hover {
      border-color: var(--border-hover);
      transform: translateY(-1px);
    }

    @keyframes float {
      0%, 100% { transform: translateY(0px); }
      50% { transform: translateY(-10px); }
    }
    @keyframes floatAlt {
      0%, 100% { transform: translateY(-6px); }
      50% { transform: translateY(4px); }
    }
    @keyframes pulse-ring {
      0% { transform: scale(1); opacity: 0.6; }
      100% { transform: scale(1.5); opacity: 0; }
    }
    @keyframes count-up {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes slide-in {
      from { opacity: 0; transform: translateX(-20px); }
      to { opacity: 1; transform: translateX(0); }
    }
    @keyframes shimmer {
      0% { background-position: -200% center; }
      100% { background-position: 200% center; }
    }
    @keyframes orbit {
      from { transform: rotate(0deg) translateX(80px) rotate(0deg); }
      to { transform: rotate(360deg) translateX(80px) rotate(-360deg); }
    }
    @keyframes fadeInUp {
      from { opacity: 0; transform: translateY(24px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes spin-slow {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
    @keyframes marquee {
      from { transform: translateX(0); }
      to { transform: translateX(-50%); }
    }

    .fade-in-up { animation: fadeInUp 0.7s ease forwards; }
    .fade-in-up-1 { animation: fadeInUp 0.7s 0.1s ease both; }
    .fade-in-up-2 { animation: fadeInUp 0.7s 0.25s ease both; }
    .fade-in-up-3 { animation: fadeInUp 0.7s 0.4s ease both; }
    .fade-in-up-4 { animation: fadeInUp 0.7s 0.55s ease both; }

    .card {
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: 20px;
      transition: all 0.3s ease;
    }
    .card:hover {
      border-color: var(--border-hover);
      box-shadow: var(--shadow-md);
      transform: translateY(-3px);
    }

    section { position: relative; }

    .noise-bg::before {
      content: '';
      position: absolute;
      inset: 0;
      background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.03'/%3E%3C/svg%3E");
      pointer-events: none;
      z-index: 0;
    }

    ::-webkit-scrollbar { width: 6px; }
    ::-webkit-scrollbar-track { background: var(--bg); }
    ::-webkit-scrollbar-thumb { background: rgba(232,87,42,0.3); border-radius: 3px; }
  `}</style>
);

// ─── Icons ────────────────────────────────────────────────────────────────────
const Icon = ({ path, size = 20, color = "currentColor", fill = "none" }: {path: string, size?: number, color?: string, fill?: string}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d={path} />
  </svg>
);

const icons = {
  menu: "M4 6h16M4 12h16M4 18h16",
  x: "M18 6L6 18M6 6l12 12",
  utensils: "M3 2v7c0 1.1.9 2 2 2h4a2 2 0 002-2V2M7 2v20M21 15V2v0a5 5 0 00-5 5v6c0 1.1.9 2 2 2h3zm0 0v7",
  star: "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z",
  arrow: "M5 12h14M12 5l7 7-7 7",
  trendUp: "M23 6l-9.5 9.5-5-5L1 18",
  clock: "M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10zM12 6v6l4 2",
  check: "M22 11.08V12a10 10 0 11-5.93-9.14M22 4L12 14.01l-3-3",
  checkCircle: "M22 11.08V12a10 10 0 11-5.93-9.14M22 4L12 14.01l-3-3",
  qr: "M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM18 14h3v3h-3zM14 14h3v3h-3zM14 18h3v3h-3z",
  dashboard: "M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z",
  creditCard: "M1 4h22v16H1zM1 10h22",
  chart: "M18 20V10M12 20V4M6 20v-6",
  users: "M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75M9 7a4 4 0 100 8 4 4 0 000-8z",
  pencil: "M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z",
  sparkles: "M12 3c-1 2.5-3 4.5-5.5 5.5C9 9.5 11 11.5 12 14c1-2.5 3-4.5 5.5-5.5C15 7.5 13 5.5 12 3zM5 14c-.5 1.5-1.5 2.5-3 3 1.5.5 2.5 1.5 3 3 .5-1.5 1.5-2.5 3-3-1.5-.5-2.5-1.5-3-3zM19 3c-.5 1.5-1.5 2.5-3 3 1.5.5 2.5 1.5 3 3 .5-1.5 1.5-2.5 3-3-1.5-.5-2.5-1.5-3-3z",
  play: "M5 3l14 9-14 9V3z",
  shield: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z",
  flame: "M8.5 14.5A2.5 2.5 0 0011 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 11-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 002.5 3z",
  heart: "M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z",
  logIn: "M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4M10 17l5-5-5-5M15 12H3",
  userPlus: "M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8zM20 8v6M23 11h-6",
  shoppingBag: "M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4zM3 6h18M16 10a4 4 0 01-8 0",
  plus: "M12 5v14M5 12h14",
  alertTriangle: "M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0zM12 9v4M12 17h.01",
  fileX: "M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8zM14 2v6h6M9 15l6-6M15 15l-6-6",
  barChart: "M12 20V10M18 20V4M6 20v-6",
};

// ─── Navbar ───────────────────────────────────────────────────────────────────
function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  return (
    <nav style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
      padding: "0 24px",
      transition: "all 0.3s ease",
      background: scrolled ? "rgba(254,252,249,0.92)" : "transparent",
      backdropFilter: scrolled ? "blur(20px)" : "none",
      borderBottom: scrolled ? "1px solid rgba(0,0,0,0.05)" : "none",
    }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", height: 72 }}>
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
          <div style={{
            width: 38, height: 38, borderRadius: 12,
            background: "linear-gradient(135deg, var(--primary), var(--gold))",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 4px 12px rgba(232,87,42,0.3)",
          }}>
            <Icon path={icons.utensils} size={18} color="white" />
          </div>
          <span style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 700, color: "var(--text-primary)" }}>
            Tayble<span style={{ color: "var(--primary)" }}>Tap</span>
          </span>
        </div>

        {/* Desktop nav */}
        <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
          {["Features", "How It Works", "Demo", "Pricing"].map(link => (
            <a key={link} href={`#${link.toLowerCase().replace(/ /g, "-")}`}
              style={{ fontSize: 14, fontWeight: 500, color: "var(--text-secondary)", textDecoration: "none", transition: "color 0.2s" }}
              onMouseEnter={e => e.currentTarget.style.color = "var(--primary)"}
              onMouseLeave={e => e.currentTarget.style.color = "var(--text-secondary)"}>
              {link}
            </a>
          ))}
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <button className="btn-outline" style={{ padding: "10px 18px", fontSize: 13 }}>
            <Icon path={icons.logIn} size={15} color="var(--primary)" /> Login
          </button>
          <button className="btn-primary" style={{ padding: "10px 20px", fontSize: 13 }}>
            Register Free
          </button>
        </div>
      </div>
    </nav>
  );
}

// ─── Hero ─────────────────────────────────────────────────────────────────────
function HeroSection() {
  return (
    <section id="home" style={{
      minHeight: "100vh", display: "flex", alignItems: "center",
      paddingTop: 100, paddingBottom: 80, paddingLeft: 24, paddingRight: 24,
      background: "var(--bg-warm)",
      overflow: "hidden",
      position: "relative",
    }}>
      {/* Background orbs */}
      <div style={{
        position: "absolute", top: "-20%", right: "-10%",
        width: 700, height: 700, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(245,166,35,0.12) 0%, transparent 70%)",
        animation: "float 18s ease-in-out infinite",
        pointerEvents: "none",
      }} />
      <div style={{
        position: "absolute", bottom: "-10%", left: "-5%",
        width: 500, height: 500, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(232,87,42,0.08) 0%, transparent 70%)",
        animation: "floatAlt 14s ease-in-out infinite",
        pointerEvents: "none",
      }} />

      {/* Decorative grid pattern */}
      <div style={{
        position: "absolute", inset: 0,
        backgroundImage: `radial-gradient(circle, rgba(232,87,42,0.06) 1px, transparent 1px)`,
        backgroundSize: "40px 40px",
        pointerEvents: "none",
      }} />

      <div style={{ maxWidth: 1100, margin: "0 auto", width: "100%", position: "relative", zIndex: 1 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80, alignItems: "center" }}>

          {/* Left */}
          <div>
            <div className="fade-in-up pill" style={{ background: "rgba(232,87,42,0.08)", color: "var(--primary)", marginBottom: 24 }}>
              <Icon path={icons.star} size={11} color="var(--primary)" fill="var(--primary)" />
              Trusted by 500+ Restaurants
            </div>

            <h1 className="fade-in-up-1" style={{
              fontFamily: "var(--font-display)", fontSize: 62, fontWeight: 700,
              lineHeight: 1.08, color: "var(--text-primary)", marginBottom: 24,
              letterSpacing: "-0.02em",
            }}>
              Boost your sales.
              <br />
              Cut the chaos.
              <br />
              <em className="gradient-text" style={{ fontStyle: "italic" }}>Let AI handle orders.</em>
            </h1>

            <p className="fade-in-up-2" style={{ fontSize: 16, color: "var(--text-secondary)", lineHeight: 1.7, maxWidth: 460, marginBottom: 36 }}>
              Let customers scan, browse, order — all from their table. Manage everything from one powerful dashboard built for Indian restaurants.
            </p>

            <div className="fade-in-up-3" style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 44 }}>
              <button className="btn-primary" style={{ fontSize: 15, padding: "15px 30px" }}>
                Register Restaurant <Icon path={icons.arrow} size={16} color="white" />
              </button>
              <button className="btn-outline" style={{ fontSize: 15, padding: "15px 26px" }}>
                <Icon path={icons.play} size={15} color="var(--primary)" fill="var(--primary)" /> Watch Demo
              </button>
            </div>

            <div className="fade-in-up-4" style={{ display: "flex", gap: 28, flexWrap: "wrap" }}>
              {[
                { icon: icons.star, label: "4.9 Rating", color: "#F5A623" },
                { icon: icons.trendUp, label: "3× Faster Orders", color: "var(--green)" },
                { icon: icons.clock, label: "Setup in 10 min", color: "var(--primary)" },
              ].map(s => (
                <div key={s.label} style={{ display: "flex", alignItems: "center", gap: 7 }}>
                  <Icon path={s.icon} size={15} color={s.color} />
                  <span style={{ fontSize: 13, fontWeight: 500, color: "var(--text-secondary)" }}>{s.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Dashboard card */}
          <div style={{ position: "relative", display: "flex", justifyContent: "center", alignItems: "center", height: 480 }}>
            {/* Glowing ring behind card */}
            <div style={{
              position: "absolute", width: 280, height: 280, borderRadius: "50%",
              background: "radial-gradient(circle, rgba(232,87,42,0.12) 0%, transparent 70%)",
              filter: "blur(30px)",
            }} />

            {/* Main dashboard card */}
            <div style={{
              width: 300, borderRadius: 24, overflow: "hidden",
              background: "white", boxShadow: "0 24px 80px rgba(26,18,8,0.14)",
              border: "1px solid rgba(0,0,0,0.05)",
              animation: "float 7s ease-in-out infinite",
              position: "relative", zIndex: 2,
            }}>
              {/* Browser bar */}
              <div style={{ padding: "12px 16px", background: "#FAFAF8", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ display: "flex", gap: 5 }}>
                  {["#FF5F57","#FEBC2E","#28C840"].map(c => <div key={c} style={{ width: 10, height: 10, borderRadius: "50%", background: c }} />)}
                </div>
                <div style={{ flex: 1, background: "#F1EDE8", borderRadius: 6, padding: "4px 10px", fontSize: 11, color: "var(--text-muted)", textAlign: "center" }}>
                  taybletap.app/dashboard
                </div>
              </div>

              {/* Dashboard content */}
              <div style={{ padding: 16 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                  <div>
                    <p style={{ fontSize: 10, color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 2 }}>TaybleTap</p>
                    <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>Today&apos;s Overview</p>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                    <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#22C55E", animation: "pulse-ring 1.5s ease-out infinite" }} />
                    <span style={{ fontSize: 11, color: "#22C55E", fontWeight: 600 }}>Live</span>
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 14 }}>
                  {[
                    { label: "Orders", value: "47", color: "var(--primary)" },
                    { label: "Revenue", value: "₹8.2k", color: "var(--green)" },
                    { label: "Pending", value: "5", color: "#F43F5E" },
                    { label: "Tables", value: "12", color: "var(--text-primary)" },
                  ].map(s => (
                    <div key={s.label} style={{ background: "var(--bg-warm)", borderRadius: 12, padding: "10px 12px", border: "1px solid var(--border)" }}>
                      <p style={{ fontSize: 18, fontWeight: 700, color: s.color, fontFamily: "var(--font-display)", lineHeight: 1 }}>{s.value}</p>
                      <p style={{ fontSize: 10, color: "var(--text-muted)", fontWeight: 500, marginTop: 2 }}>{s.label}</p>
                    </div>
                  ))}
                </div>

                {["Chicken Biryani", "Paneer Masala", "Garlic Naan"].map((item, i) => (
                  <div key={item} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "7px 10px", background: "var(--bg-warm)", borderRadius: 8, marginBottom: 4, border: "1px solid var(--border)" }}>
                    <span style={{ fontSize: 12, fontWeight: 500, color: "var(--text-primary)" }}>{item}</span>
                    <span style={{
                      fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 20,
                      background: i === 0 ? "rgba(45,158,107,0.1)" : "rgba(232,87,42,0.1)",
                      color: i === 0 ? "var(--green)" : "var(--primary)"
                    }}>
                      {i === 0 ? "Done" : "Pending"}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Floating notification cards */}
            {[
              { emoji: "🍛", name: "Chicken Biryani", sub: "Table 4 · ₹280", style: { top: "8%", left: "-15%", animationDelay: "1s" } },
              { emoji: "🧾", name: "New Order #47", sub: "Table 7 · ₹520", style: { bottom: "25%", right: "-15%", animationDelay: "2s" } },
              { emoji: "✅", name: "Payment Done", sub: "Table 2 · ₹340", style: { bottom: "8%", left: "-5%", animationDelay: "1.5s" } },
            ].map(card => (
              <div key={card.name} style={{
                position: "absolute", ...card.style,
                background: "white", borderRadius: 14, padding: "10px 14px",
                display: "flex", alignItems: "center", gap: 10,
                boxShadow: "0 8px 24px rgba(26,18,8,0.1)",
                border: "1px solid var(--border)",
                animation: `float 5s ease-in-out infinite`,
                animationDelay: card.style.animationDelay,
                zIndex: 3, minWidth: 160,
              }}>
                <span style={{ fontSize: 22 }}>{card.emoji}</span>
                <div>
                  <p style={{ fontSize: 12, fontWeight: 600, color: "var(--text-primary)" }}>{card.name}</p>
                  <p style={{ fontSize: 10, color: "var(--text-muted)" }}>{card.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Marquee / Social Proof ───────────────────────────────────────────────────
function MarqueeBanner() {
  const items = ["500+ Restaurants", "AI-Powered Search", "Real-Time Orders", "UPI Payments", "QR Code Generator", "Live Dashboard", "Zero App Download", "Instant Updates"];
  return (
    <div style={{ background: "var(--primary)", padding: "14px 0", overflow: "hidden", position: "relative" }}>
      <div style={{ display: "flex", animation: "marquee 25s linear infinite", width: "max-content" }}>
        {[...items, ...items].map((item, i) => (
          <span key={i} style={{ whiteSpace: "nowrap", color: "white", fontSize: 13, fontWeight: 600, padding: "0 32px", opacity: 0.9 }}>
            ★ {item}
          </span>
        ))}
      </div>
    </div>
  );
}

// ─── Problem Section ──────────────────────────────────────────────────────────
function ProblemSection() {
  const problems = [
    { icon: icons.clock, title: "Long Waiting Time", desc: "Customers wait ages for a waiter, leading to frustration and poor reviews.", color: "#FF5F5F" },
    { icon: icons.alertTriangle, title: "Manual Order Mistakes", desc: "Handwritten orders get misread — wrong dishes damage customer trust.", color: "#F5A623" },
    { icon: icons.fileX, title: "Outdated Printed Menus", desc: "Every price change means costly, slow reprinting of physical menus.", color: "var(--primary)" },
    { icon: icons.barChart, title: "No Order Visibility", desc: "Kitchen staff have no clarity on which orders are pending or ready.", color: "#A78BFA" },
  ];

  return (
    <section id="features" style={{ padding: "100px 24px", background: "white" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 64 }}>
          <div className="pill" style={{ background: "rgba(232,87,42,0.08)", color: "var(--primary)", marginBottom: 16, display: "inline-flex" }}>
            The Real Problem
          </div>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: 48, fontWeight: 700, color: "var(--text-primary)", lineHeight: 1.15, marginBottom: 16 }}>
            Why Restaurants Need{" "}
            <span className="gradient-text"><em>Smarter Ordering</em></span>
          </h2>
          <p style={{ color: "var(--text-secondary)", fontSize: 16, maxWidth: 480, margin: "0 auto", lineHeight: 1.6 }}>
            Traditional ordering is slowing your business down. Here&apos;s what&apos;s holding you back.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 20 }}>
          {problems.map((p) => (
            <div key={p.title} className="card" style={{ padding: 28, position: "relative", overflow: "hidden" }}>
              <div style={{
                position: "absolute", top: -20, right: -20, width: 80, height: 80, borderRadius: "50%",
                background: p.color + "10",
              }} />
              <div style={{
                width: 48, height: 48, borderRadius: 14,
                background: p.color + "15",
                display: "flex", alignItems: "center", justifyContent: "center",
                marginBottom: 18,
              }}>
                <Icon path={p.icon} size={22} color={p.color} />
              </div>
              <h3 style={{ fontSize: 16, fontWeight: 600, color: "var(--text-primary)", marginBottom: 10 }}>{p.title}</h3>
              <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.6 }}>{p.desc}</p>
              <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg, ${p.color}40, transparent)`, borderRadius: "0 0 20px 20px" }} />
            </div>
          ))}
        </div>

        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginTop: 48, gap: 8 }}>
          <p style={{ fontSize: 14, color: "var(--text-muted)", fontWeight: 500 }}>Here&apos;s how we solve all of this</p>
          <div style={{ color: "var(--primary)", fontSize: 24, animation: "float 2s ease-in-out infinite" }}>↓</div>
        </div>
      </div>
    </section>
  );
}

// ─── Solution Section ─────────────────────────────────────────────────────────
function SolutionSection() {
  const features = [
    { icon: icons.qr, title: "Digital QR Menu", desc: "Customers scan and browse instantly — no app download needed.", color: "#FF6B35" },
    { icon: icons.pencil, title: "Easy Menu Management", desc: "Add, edit, or remove dishes in seconds from your dashboard.", color: "#A78BFA" },
    { icon: icons.dashboard, title: "Live Order Dashboard", desc: "See every order in real-time. Update status and notify kitchen instantly.", color: "#38BDF8" },
    { icon: icons.creditCard, title: "UPI Payment Support", desc: "Customers pay via UPI QR — cashless and effortless.", color: "#22C55E" },
    { icon: icons.chart, title: "Sales Analytics", desc: "Understand top dishes, peak hours, and revenue trends at a glance.", color: "#F5A623" },
    { icon: icons.users, title: "Customer Insights", desc: "Track repeat customers, popular dishes, and order history.", color: "#F472B6" },
  ];

  return (
    <section id="how-it-works" style={{ padding: "100px 24px", background: "var(--bg-warm)" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 64 }}>
          <div className="pill" style={{ background: "rgba(232,87,42,0.08)", color: "var(--primary)", marginBottom: 16, display: "inline-flex" }}>
            The Solution
          </div>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: 48, fontWeight: 700, color: "var(--text-primary)", lineHeight: 1.15 }}>
            Everything Your Restaurant Needs
            <br />
            <span className="gradient-text"><em>In One System</em></span>
          </h2>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
          {features.map((f) => (
            <div key={f.title} className="card" style={{
              padding: 28,
              background: "white",
              position: "relative", overflow: "hidden",
              cursor: "pointer",
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = f.color + "50"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; }}>
              <div style={{
                width: 52, height: 52, borderRadius: 16,
                background: f.color + "14",
                display: "flex", alignItems: "center", justifyContent: "center",
                marginBottom: 20, transition: "transform 0.3s",
              }}>
                <Icon path={f.icon} size={24} color={f.color} />
              </div>
              <h3 style={{ fontSize: 17, fontWeight: 600, color: "var(--text-primary)", marginBottom: 10 }}>{f.title}</h3>
              <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.65 }}>{f.desc}</p>
              <div style={{
                position: "absolute", bottom: -40, right: -40, width: 100, height: 100, borderRadius: "50%",
                background: f.color + "08",
              }} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const var_gold = "#F5A623";

// ─── How It Works ─────────────────────────────────────────────────────────────
function HowItWorks() {
  const steps = [
    { num: "01", icon: icons.userPlus, title: "Register Your Restaurant", desc: "Create your free account in minutes. Add your restaurant name, logo, and contact details.", color: "var(--primary)" },
    { num: "02", icon: icons.pencil, title: "Add Your Menu Items", desc: "Upload dish names, descriptions, prices, and categories. Update anytime — no reprinting needed.", color: var_gold },
    { num: "03", icon: icons.qr, title: "Generate Table QR Codes", desc: "Get a unique QR code per table. Print and place them. Customers scan to open your interactive menu.", color: "var(--green)" },
    { num: "04", icon: icons.shoppingBag, title: "Start Receiving Orders", desc: "Orders appear instantly in your dashboard. Track status and manage billing in real-time.", color: "#A78BFA" },
  ];

  return (
    <section id="pricing" style={{ padding: "100px 24px", background: "white" }}>
      <div style={{ maxWidth: 760, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 72 }}>
          <div className="pill" style={{ background: "rgba(232,87,42,0.08)", color: "var(--primary)", marginBottom: 16, display: "inline-flex" }}>
            Simple Setup
          </div>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: 48, fontWeight: 700, color: "var(--text-primary)", lineHeight: 1.15 }}>
            Get Started in{" "}
            <span className="gradient-text"><em>4 Easy Steps</em></span>
          </h2>
        </div>

        <div style={{ position: "relative" }}>
          {/* Timeline line */}
          <div style={{
            position: "absolute", left: 30, top: 32, bottom: 32, width: 2,
            background: "linear-gradient(180deg, var(--primary) 0%, var(--gold) 100%)",
            opacity: 0.2,
          }} />

          <div style={{ display: "flex", flexDirection: "column", gap: 44 }}>
            {steps.map((step) => (
              <div key={step.num} style={{ display: "flex", gap: 28, alignItems: "flex-start" }}>
                <div style={{
                  width: 60, height: 60, borderRadius: 18, flexShrink: 0,
                  background: step.color,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  boxShadow: `0 8px 20px ${step.color === "var(--primary)" ? "rgba(232,87,42,0.25)" : "rgba(0,0,0,0.1)"}`,
                  position: "relative", zIndex: 1,
                }}>
                  <Icon path={step.icon} size={24} color="white" />
                </div>
                <div style={{ flex: 1, paddingTop: 6 }}>
                  <span className="pill" style={{ background: "rgba(232,87,42,0.08)", color: "var(--primary)", marginBottom: 10, display: "inline-flex", fontSize: 10, padding: "4px 10px" }}>
                    Step {step.num}
                  </span>
                  <h3 style={{ fontSize: 20, fontFamily: "var(--font-display)", fontWeight: 700, color: "var(--text-primary)", marginBottom: 8 }}>{step.title}</h3>
                  <p style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.65 }}>{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Dashboard Preview ────────────────────────────────────────────────────────
function DashboardPreview() {
  const [counts, setCounts] = useState({ orders: 0, revenue: 0, pending: 0, tables: 0 });
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        const targets = { orders: 47, revenue: 8240, pending: 5, tables: 12 };
        const duration = 1500;
        const steps = 60;
        let step = 0;
        const timer = setInterval(() => {
          step++;
          const progress = step / steps;
          setCounts({
            orders: Math.round(targets.orders * progress),
            revenue: Math.round(targets.revenue * progress),
            pending: Math.round(targets.pending * progress),
            tables: Math.round(targets.tables * progress),
          });
          if (step >= steps) clearInterval(timer);
        }, duration / steps);
        obs.disconnect();
      }
    }, { threshold: 0.3 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  const orders = [
    { table: "Table 3", item: "Biryani × 2, Lassi × 2", status: "Preparing", color: "var(--primary)" },
    { table: "Table 7", item: "Paneer Masala, Naan × 3", status: "Ready", color: "var(--green)" },
    { table: "Table 1", item: "Tandoori Platter", status: "New", color: "#A78BFA" },
  ];

  return (
    <section id="demo" ref={ref} style={{ padding: "100px 24px", background: "var(--bg-warm)" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <div className="pill" style={{ background: "rgba(232,87,42,0.08)", color: "var(--primary)", marginBottom: 16, display: "inline-flex" }}>
            Live Dashboard
          </div>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: 48, fontWeight: 700, color: "var(--text-primary)", lineHeight: 1.15, marginBottom: 14 }}>
            Your Restaurant,{" "}
            <span className="gradient-text"><em>All in One View</em></span>
          </h2>
          <p style={{ color: "var(--text-secondary)", fontSize: 16, maxWidth: 440, margin: "0 auto", lineHeight: 1.6 }}>
            Monitor orders, track revenue, and manage your menu from one powerful dashboard.
          </p>
        </div>

        {/* Dashboard Mockup */}
        <div style={{
          background: "white", borderRadius: 28, overflow: "hidden",
          boxShadow: "0 30px 100px rgba(26,18,8,0.12)",
          border: "1px solid var(--border)",
        }}>
          {/* Top bar */}
          <div style={{ padding: "16px 24px", background: "#FAFAF8", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 32, height: 32, borderRadius: 10, background: "linear-gradient(135deg, var(--primary), var(--gold))", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ fontSize: 14 }}>🍽️</span>
              </div>
              <div>
                <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>TaybleTap — Dashboard</p>
                <p style={{ fontSize: 11, color: "var(--text-muted)" }}>taybletap.app/dashboard</p>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#22C55E" }} />
              <span style={{ fontSize: 12, fontWeight: 600, color: "#22C55E" }}>Live</span>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: 0 }}>
            {/* Stats column */}
            <div style={{ padding: 24, borderRight: "1px solid var(--border)" }}>
              <p style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.07em", color: "var(--text-muted)", marginBottom: 16 }}>Today&apos;s Overview</p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                {[
                  { label: "Orders", value: counts.orders, color: "var(--primary)", prefix: "" },
                  { label: "Revenue", value: counts.revenue, color: "var(--green)", prefix: "₹", toK: true },
                  { label: "Pending", value: counts.pending, color: "#F43F5E", prefix: "" },
                  { label: "Tables Active", value: counts.tables, color: "#A78BFA", prefix: "" },
                ].map(s => (
                  <div key={s.label} style={{ background: "var(--bg-warm)", borderRadius: 14, padding: "14px 12px", border: "1px solid var(--border)" }}>
                    <p style={{ fontSize: 22, fontWeight: 700, color: s.color, fontFamily: "var(--font-display)", lineHeight: 1 }}>
                      {s.prefix}{s.toK && s.value > 999 ? (s.value / 1000).toFixed(1) + "k" : s.value}
                    </p>
                    <p style={{ fontSize: 10, color: "var(--text-muted)", fontWeight: 500, marginTop: 4 }}>{s.label}</p>
                  </div>
                ))}
              </div>

              {/* Bar chart teaser */}
              <div style={{ marginTop: 20, padding: "14px", background: "var(--bg-warm)", borderRadius: 14, border: "1px solid var(--border)" }}>
                <p style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)", marginBottom: 12 }}>Orders Today</p>
                <div style={{ display: "flex", alignItems: "flex-end", gap: 4, height: 50 }}>
                  {[30, 60, 45, 80, 55, 90, 70].map((h, i) => (
                    <div key={i} style={{
                      flex: 1, borderRadius: "3px 3px 0 0",
                      height: `${h}%`,
                      background: i === 5 ? "var(--primary)" : "rgba(232,87,42,0.2)",
                      transition: "height 0.5s ease",
                    }} />
                  ))}
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
                  {["M","T","W","T","F","S","S"].map((d, i) => (
                    <span key={i} style={{ fontSize: 9, color: i === 5 ? "var(--primary)" : "var(--text-muted)", flex: 1, textAlign: "center", fontWeight: i === 5 ? 700 : 400 }}>{d}</span>
                  ))}
                </div>
              </div>
            </div>

            {/* Orders + QR column */}
            <div style={{ padding: 24 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                <p style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.07em", color: "var(--text-muted)" }}>Live Orders</p>
                <span className="pill" style={{ background: "rgba(232,87,42,0.08)", color: "var(--primary)", fontSize: 10, padding: "4px 10px" }}>3 active</span>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
                {orders.map((order) => (
                  <div key={order.table} style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    padding: "14px 16px", borderRadius: 14, background: "var(--bg-warm)",
                    border: "1px solid var(--border)",
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div style={{
                        width: 36, height: 36, borderRadius: 10,
                        background: order.color + "15",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontFamily: "var(--font-display)", fontSize: 16, fontWeight: 700, color: order.color,
                      }}>
                        {order.table.split(" ")[1]}
                      </div>
                      <div>
                        <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>{order.table}</p>
                        <p style={{ fontSize: 11, color: "var(--text-secondary)" }}>{order.item}</p>
                      </div>
                    </div>
                    <span className="pill" style={{ background: order.color + "12", color: order.color, fontSize: 10, padding: "4px 12px" }}>
                      {order.status}
                    </span>
                  </div>
                ))}
              </div>

              {/* QR preview */}
              <div style={{
                display: "flex", alignItems: "center", gap: 14, padding: "16px 18px",
                borderRadius: 14, background: "linear-gradient(135deg, rgba(232,87,42,0.05), rgba(245,166,35,0.05))",
                border: "1px solid rgba(232,87,42,0.15)",
              }}>
                <div style={{
                  width: 48, height: 48, borderRadius: 14,
                  background: "linear-gradient(135deg, var(--primary), var(--gold))",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0,
                }}>
                  <Icon path={icons.qr} size={22} color="white" />
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)" }}>QR Code Generator</p>
                  <p style={{ fontSize: 12, color: "var(--text-secondary)" }}>Generate & download QR codes for all tables</p>
                </div>
                <button className="btn-primary" style={{ padding: "9px 18px", fontSize: 12, whiteSpace: "nowrap" }}>
                  Generate
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Mood Banner ──────────────────────────────────────────────────────────────
function AIBanner() {
  const [activeMood, setActiveMood] = useState<string | null>(null);
  const [visible, setVisible] = useState(false);
  const sectionRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.2 });
    if (sectionRef.current) obs.observe(sectionRef.current);
    return () => obs.disconnect();
  }, []);

  const moods = [
    { key: "spicy",  label: "Spicy cravings",   emoji: "🌶️", color: "#E8572A", bg: "rgba(232,87,42,0.08)" },
    { key: "light",  label: "Light & healthy",   emoji: "🥗", color: "#2D9E6B", bg: "rgba(45,158,107,0.08)" },
    { key: "budget", label: "Under ₹200",         emoji: "💰", color: "#B07D2A", bg: "rgba(245,166,35,0.1)" },
    { key: "trend",  label: "Trending today",     emoji: "🔥", color: "#E8572A", bg: "rgba(232,87,42,0.08)" },
    { key: "combo",  label: "Suggest a combo",    emoji: "🍽️", color: "#7C5CBF", bg: "rgba(124,92,191,0.08)" },
  ];

  type DishMap = {
    [key: string]: { emoji: string; name: string; price: string; tag: string }[];
  };

  const dishMap: DishMap = {
    spicy: [
      { emoji: "🍗", name: "Tandoori Chicken", price: "₹320", tag: "🌶️🌶️🌶️ Very Spicy" },
      { emoji: "🍛", name: "Chicken Chettinad", price: "₹280", tag: "🌶️🌶️ Spicy" },
      { emoji: "🥘", name: "Szechuan Paneer", price: "₹240", tag: "🌶️🌶️🌶️ Very Spicy" },
    ],
    light: [
      { emoji: "🥗", name: "Garden Salad Bowl", price: "₹160", tag: "Low Cal · Veg" },
      { emoji: "🍲", name: "Moong Dal Soup", price: "₹120", tag: "Protein Rich" },
      { emoji: "🫔", name: "Veggie Wrap", price: "₹180", tag: "High Fibre" },
    ],
    budget: [
      { emoji: "🫓", name: "Garlic Naan", price: "₹60", tag: "Best Value" },
      { emoji: "🍮", name: "Gulab Jamun", price: "₹80", tag: "Dessert" },
      { emoji: "🥤", name: "Sweet Lassi", price: "₹90", tag: "Refreshing" },
    ],
    trend: [
      { emoji: "🍚", name: "Chicken Biryani", price: "₹280", tag: "🔥 #1 Today" },
      { emoji: "🍛", name: "Butter Paneer", price: "₹220", tag: "🔥 Trending" },
      { emoji: "🍗", name: "Tandoori Platter", price: "₹380", tag: "🔥 Popular" },
    ],
    combo: [
      { emoji: "🍱", name: "Dal + Roti + Sabzi", price: "₹199", tag: "Saves ₹60" },
      { emoji: "🍱", name: "Biryani + Raita + Gulab Jamun", price: "₹349", tag: "Saves ₹90" },
      { emoji: "🍱", name: "Starter + Main + Lassi", price: "₹420", tag: "Saves ₹110" },
    ],
  };

  const features = [
    { icon: icons.sparkles, title: "Mood-Based Search", desc: "Type or tap your craving and get instant matches" },
    { icon: icons.trendUp,  title: "Live Menu Intelligence", desc: "Show trending and best-selling dishes in real time" },
    { icon: icons.heart,    title: "Personalized Picks", desc: "Recommendations based on customer preferences" },
  ];

  const activeDishes = activeMood ? dishMap[activeMood] : null;

  return (
    <section id="offers" ref={sectionRef} style={{ padding: "96px 24px", background: "white", overflow: "hidden" }}>
      <style>{`
        @keyframes moodFadeUp {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes dishSlideIn {
          from { opacity: 0; transform: translateX(16px) scale(0.97); }
          to   { opacity: 1; transform: translateX(0) scale(1); }
        }
        @keyframes moodGlow {
          0%,100% { box-shadow: 0 0 0 0 rgba(232,87,42,0); }
          50%      { box-shadow: 0 0 0 6px rgba(232,87,42,0.12); }
        }
        .mood-chip { transition: all 0.22s cubic-bezier(0.34,1.56,0.64,1); }
        .mood-chip:hover { transform: translateY(-2px) scale(1.04); }
        .mood-chip:active { transform: scale(0.96); }
        .feature-card-ai { transition: all 0.25s ease; }
        .feature-card-ai:hover { transform: translateX(4px); border-color: rgba(232,87,42,0.25) !important; box-shadow: 0 6px 20px rgba(26,18,8,0.06) !important; }
        .dish-chip { transition: all 0.2s ease; }
        .dish-chip:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(26,18,8,0.08) !important; }
      `}</style>

      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        {/* Section wrapper with warm gradient background */}
        <div style={{
          borderRadius: 36,
          background: "linear-gradient(145deg, #FFFAF5 0%, #FFF5EC 50%, #FFFBF5 100%)",
          border: "1px solid rgba(232,87,42,0.1)",
          padding: "60px 64px",
          position: "relative", overflow: "hidden",
          boxShadow: "0 4px 40px rgba(232,87,42,0.04)",
        }}>

          {/* Soft background orbs */}
          <div style={{ position: "absolute", top: -80, right: -80, width: 320, height: 320, borderRadius: "50%", background: "radial-gradient(circle, rgba(245,166,35,0.12) 0%, transparent 70%)", pointerEvents: "none" }} />
          <div style={{ position: "absolute", bottom: -60, left: -60, width: 250, height: 250, borderRadius: "50%", background: "radial-gradient(circle, rgba(232,87,42,0.07) 0%, transparent 70%)", pointerEvents: "none" }} />
          {/* Subtle dot grid */}
          <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle, rgba(232,87,42,0.04) 1.5px, transparent 1.5px)", backgroundSize: "32px 32px", pointerEvents: "none", borderRadius: 36 }} />

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 72, alignItems: "flex-start", position: "relative", zIndex: 1 }}>

            {/* ── LEFT ── */}
            <div style={{ opacity: visible ? 1 : 0, transform: visible ? "none" : "translateX(-28px)", transition: "all 0.7s cubic-bezier(0.22,1,0.36,1)" }}>

              {/* Badge */}
              <div style={{
                display: "inline-flex", alignItems: "center", gap: 7,
                padding: "7px 16px", borderRadius: 100,
                background: "linear-gradient(135deg, var(--primary), var(--gold))",
                marginBottom: 22,
              }}>
                <Icon path={icons.sparkles} size={13} color="white" />
                <span style={{ fontSize: 11, fontWeight: 700, color: "white", letterSpacing: "0.07em", textTransform: "uppercase" }}>AI-Powered</span>
              </div>

              {/* Headline */}
              <h2 style={{
                fontFamily: "var(--font-display)", fontSize: 46, fontWeight: 700,
                color: "var(--text-primary)", lineHeight: 1.1, marginBottom: 16,
                letterSpacing: "-0.01em",
              }}>
                Order by Mood,{" "}
                <span className="gradient-text"><em>Not Just Menu</em></span>
              </h2>

              {/* Subtext */}
              <p style={{ fontSize: 15, color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: 32, maxWidth: 400 }}>
                Let your customers tell what they feel like — spicy, light, budget-friendly, or indulgent — and instantly show dishes from your menu that match their mood.
              </p>

              {/* Mood chips */}
              <p style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 12 }}>
                Pick a mood
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 32 }}>
                {moods.map((m, i) => {
                  const isActive = activeMood === m.key;
                  return (
                    <button
                      key={m.key}
                      className="mood-chip"
                      onClick={() => setActiveMood(isActive ? null : m.key)}
                      style={{
                        padding: "10px 18px", borderRadius: 100,
                        background: isActive ? m.color : m.bg,
                        border: `1.5px solid ${isActive ? m.color : "rgba(0,0,0,0.07)"}`,
                        color: isActive ? "white" : m.color,
                        fontSize: 13, fontWeight: 600, cursor: "pointer",
                        fontFamily: "var(--font-body)",
                        boxShadow: isActive ? `0 4px 16px ${m.color}35` : "none",
                        animation: isActive ? "moodGlow 1.4s ease infinite" : "none",
                        opacity: visible ? 1 : 0,
                        transform: visible ? "none" : "translateY(10px)",
                        transition: `all 0.22s cubic-bezier(0.34,1.56,0.64,1) ${i * 0.06}s`,
                      }}>
                      {m.emoji} {m.label}
                    </button>
                  );
                })}
              </div>

              {/* Animated dish results */}
              <div style={{ minHeight: 130 }}>
                {activeDishes ? (
                  <div>
                    <p style={{ fontSize: 12, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.09em", marginBottom: 12 }}>
                      Matching dishes →
                    </p>
                    <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
                      {activeDishes.map((d, i) => (
                        <div key={d.name} className="dish-chip" style={{
                          display: "flex", alignItems: "center", gap: 12,
                          padding: "11px 16px", borderRadius: 14,
                          background: "white",
                          border: "1px solid rgba(232,87,42,0.12)",
                          boxShadow: "0 2px 10px rgba(26,18,8,0.05)",
                          animation: `dishSlideIn 0.35s ease ${i * 0.08}s both`,
                          cursor: "default",
                        }}>
                          <span style={{ fontSize: 24, lineHeight: 1 }}>{d.emoji}</span>
                          <div style={{ flex: 1 }}>
                            <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", marginBottom: 1 }}>{d.name}</p>
                            <p style={{ fontSize: 11, color: "var(--text-muted)" }}>{d.tag}</p>
                          </div>
                          <span style={{ fontSize: 14, fontWeight: 700, color: "var(--primary)", fontFamily: "var(--font-display)" }}>{d.price}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div style={{
                    padding: "22px 20px", borderRadius: 16,
                    background: "rgba(232,87,42,0.03)",
                    border: "1.5px dashed rgba(232,87,42,0.18)",
                    display: "flex", alignItems: "center", gap: 12,
                  }}>
                    <span style={{ fontSize: 28 }}>👆</span>
                    <p style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.5 }}>
                      Tap any mood above to see<br />
                      <span style={{ color: "var(--text-secondary)", fontWeight: 500 }}>matching dishes from your menu</span>
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* ── RIGHT ── */}
            <div style={{
              display: "flex", flexDirection: "column", gap: 16,
              opacity: visible ? 1 : 0, transform: visible ? "none" : "translateX(28px)",
              transition: "all 0.7s cubic-bezier(0.22,1,0.36,1) 0.15s",
            }}>

              {/* Feature cards */}
              {features.map((f, i) => (
                <div key={f.title} className="feature-card-ai" style={{
                  display: "flex", alignItems: "flex-start", gap: 18,
                  padding: "22px 24px", borderRadius: 20,
                  background: "white",
                  border: "1px solid rgba(0,0,0,0.07)",
                  boxShadow: "0 2px 12px rgba(26,18,8,0.04)",
                  opacity: visible ? 1 : 0,
                  transition: `all 0.5s ease ${0.2 + i * 0.12}s`,
                  transform: visible ? "none" : "translateX(20px)",
                }}>
                  <div style={{
                    width: 46, height: 46, borderRadius: 14, flexShrink: 0,
                    background: "linear-gradient(135deg, rgba(232,87,42,0.1), rgba(245,166,35,0.08))",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <Icon path={f.icon} size={21} color="var(--primary)" />
                  </div>
                  <div>
                    <p style={{ fontSize: 15, fontWeight: 600, color: "var(--text-primary)", marginBottom: 5 }}>{f.title}</p>
                    <p style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.55 }}>{f.desc}</p>
                  </div>
                </div>
              ))}

              {/* Live preview mockup card */}
              <div style={{
                padding: "24px", borderRadius: 20,
                background: "linear-gradient(135deg, #1A1208, #2D1A08)",
                boxShadow: "0 12px 40px rgba(26,18,8,0.18)",
                opacity: visible ? 1 : 0,
                transition: "all 0.5s ease 0.56s",
                transform: visible ? "none" : "translateX(20px)",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#22C55E" }} />
                  <span style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: "0.08em" }}>Customer view · Live</span>
                </div>
                <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginBottom: 10 }}>Customer typed:</p>
                <div style={{
                  padding: "10px 14px", borderRadius: 10,
                  background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)",
                  display: "flex", alignItems: "center", gap: 8, marginBottom: 14,
                }}>
                  <span style={{ fontSize: 16 }}>🌶️</span>
                  <span style={{ fontSize: 14, color: "rgba(255,255,255,0.85)", fontStyle: "italic" }}>&quot;something spicy under ₹300&quot;</span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {[
                    { name: "Chicken Chettinad", price: "₹280", match: "98%" },
                    { name: "Szechuan Paneer", price: "₹240", match: "94%" },
                  ].map(d => (
                    <div key={d.name} style={{
                      display: "flex", alignItems: "center", justifyContent: "space-between",
                      padding: "9px 12px", borderRadius: 9,
                      background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.07)",
                    }}>
                      <span style={{ fontSize: 13, color: "rgba(255,255,255,0.8)", fontWeight: 500 }}>{d.name}</span>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <span style={{ fontSize: 11, color: "#FFD27A", fontWeight: 600 }}>{d.match} match</span>
                        <span style={{ fontSize: 13, color: "white", fontWeight: 700, fontFamily: "var(--font-display)" }}>{d.price}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Benefits ─────────────────────────────────────────────────────────────────
function BenefitsSection() {
  const benefits = [
    { emoji: "💡", title: "No Expensive Kiosk Needed", desc: "Works on any smartphone. Your customers already have everything they need in their pocket." },
    { emoji: "✏️", title: "Easy Menu Updates", desc: "Change prices, add specials, or mark items unavailable — all in real-time from your phone." },
    { emoji: "⚡", title: "Faster Table Service", desc: "Customers order themselves. Staff focuses on delivering food, not taking notes." },
    { emoji: "😌", title: "Less Staff Pressure", desc: "Reduce dependency on waiters. One staff member can handle more tables without stress." },
    { emoji: "⭐", title: "Better Customer Experience", desc: "Customers love the speed, clarity, and convenience of scanning and ordering on their own." },
    { emoji: "🏪", title: "Works for Any Restaurant", desc: "Small café, dhaba, cloud kitchen, or fine dining — the system adapts to your needs." },
  ];

  return (
    <section style={{ padding: "100px 24px", background: "var(--bg-warm)", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 50% 50%, rgba(245,166,35,0.07) 0%, transparent 70%)", pointerEvents: "none" }} />
      <div style={{ maxWidth: 1100, margin: "0 auto", position: "relative", zIndex: 1 }}>
        <div style={{ textAlign: "center", marginBottom: 60 }}>
          <div className="pill" style={{ background: "rgba(232,87,42,0.08)", color: "var(--primary)", marginBottom: 16, display: "inline-flex" }}>Why Choose Us</div>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: 48, fontWeight: 700, color: "var(--text-primary)", lineHeight: 1.15 }}>
            Built for{" "}
            <span className="gradient-text"><em>Small & Growing Restaurants</em></span>
          </h2>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
          {benefits.map((b) => (
            <div key={b.title} className="card" style={{ padding: 28, background: "white", cursor: "default" }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
                <span style={{ fontSize: 36 }}>{b.emoji}</span>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 8 }}>
                    <Icon path={icons.checkCircle} size={14} color="var(--green)" />
                    <h3 style={{ fontSize: 15, fontWeight: 600, color: "var(--text-primary)" }}>{b.title}</h3>
                  </div>
                  <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.65 }}>{b.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── CTA ──────────────────────────────────────────────────────────────────────
function CTASection() {
  return (
    <section style={{ padding: "80px 24px", background: "var(--bg-warm)" }}>
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        <div style={{
          borderRadius: 36, padding: "80px 60px", textAlign: "center",
          position: "relative", overflow: "hidden",
          background: "linear-gradient(135deg, #1A1208 0%, #2D1A08 100%)",
          boxShadow: "0 40px 100px rgba(26,18,8,0.2)",
        }}>
          {/* Decorative warm orbs */}
          <div style={{ position: "absolute", top: -100, right: -100, width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle, rgba(232,87,42,0.2) 0%, transparent 70%)", filter: "blur(60px)" }} />
          <div style={{ position: "absolute", bottom: -80, left: -80, width: 300, height: 300, borderRadius: "50%", background: "radial-gradient(circle, rgba(245,166,35,0.15) 0%, transparent 70%)", filter: "blur(50px)" }} />

          {/* Dotted grid */}
          <div style={{
            position: "absolute", inset: 0,
            backgroundImage: `radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px)`,
            backgroundSize: "28px 28px",
            pointerEvents: "none",
          }} />

          <div style={{ position: "relative", zIndex: 1 }}>
            <div className="pill" style={{ background: "rgba(232,87,42,0.2)", color: "#FFB891", marginBottom: 24, display: "inline-flex" }}>
              Ready to Get Started?
            </div>
            <h2 style={{
              fontFamily: "var(--font-display)", fontSize: 54, fontWeight: 700,
              color: "white", lineHeight: 1.1, marginBottom: 20,
              letterSpacing: "-0.02em",
            }}>
              Ready to Make Your Restaurant
              <br />
              <span style={{ background: "linear-gradient(135deg, #FF7A4D, #FFD27A)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                <em>Smarter?</em>
              </span>
            </h2>
            <p style={{ color: "rgba(255,255,255,0.65)", fontSize: 16, maxWidth: 420, margin: "0 auto 44px", lineHeight: 1.65 }}>
              Join hundreds of restaurants using TaybleTap to serve customers faster, reduce errors, and grow their business.
            </p>

            <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap", marginBottom: 28 }}>
              <button style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                padding: "16px 32px", borderRadius: 16,
                background: "linear-gradient(135deg, var(--primary), var(--gold))",
                color: "white", fontSize: 15, fontWeight: 600, border: "none", cursor: "pointer",
                fontFamily: "var(--font-body)",
                boxShadow: "0 8px 30px rgba(232,87,42,0.4)",
                transition: "all 0.25s",
              }}
                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 14px 40px rgba(232,87,42,0.5)"; }}
                onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "0 8px 30px rgba(232,87,42,0.4)"; }}>
                Register Restaurant <Icon path={icons.arrow} size={16} color="white" />
              </button>
              <button style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                padding: "16px 28px", borderRadius: 16,
                background: "rgba(255,255,255,0.08)", backdropFilter: "blur(10px)",
                color: "rgba(255,255,255,0.9)", fontSize: 15, fontWeight: 500, cursor: "pointer",
                border: "1px solid rgba(255,255,255,0.15)", fontFamily: "var(--font-body)",
                transition: "all 0.2s",
              }}
                onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.14)"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.08)"; }}>
                <Icon path={icons.logIn} size={16} color="rgba(255,255,255,0.8)" /> Login to Dashboard
              </button>
            </div>
            <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 13, fontWeight: 500 }}>
              ✓ No credit card required &nbsp;&nbsp; ✓ Setup in under 10 minutes &nbsp;&nbsp; ✓ Free to get started
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer style={{ padding: "60px 24px 32px", borderTop: "1px solid var(--border)", background: "white" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: 40, marginBottom: 48 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
              <div style={{ width: 36, height: 36, borderRadius: 11, background: "linear-gradient(135deg, var(--primary), var(--gold))", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Icon path={icons.utensils} size={17} color="white" />
              </div>
              <span style={{ fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 700, color: "var(--text-primary)" }}>
                Tayble<span style={{ color: "var(--primary)" }}>Tap</span>
              </span>
            </div>
            <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.7, maxWidth: 260 }}>
              Smart QR ordering system for modern Indian restaurants. Serving smarter since 2024.
            </p>
          </div>

          {[
            { title: "Product", links: ["Features", "How It Works", "Pricing", "Demo"] },
            { title: "Restaurant", links: ["Register", "Login to Dashboard", "Manage Menu", "QR Generator"] },
            { title: "Company", links: ["About", "Contact", "Privacy Policy", "Terms of Use"] },
          ].map(col => (
            <div key={col.title}>
              <p style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.07em", color: "var(--text-muted)", marginBottom: 16 }}>{col.title}</p>
              {col.links.map(link => (
                <a key={link} href="#" style={{ display: "block", fontSize: 13, color: "var(--text-secondary)", marginBottom: 10, textDecoration: "none", transition: "color 0.2s" }}
                  onMouseEnter={e => e.currentTarget.style.color = "var(--primary)"}
                  onMouseLeave={e => e.currentTarget.style.color = "var(--text-secondary)"}>
                  {link}
                </a>
              ))}
            </div>
          ))}
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 24, borderTop: "1px solid var(--border)", flexWrap: "wrap", gap: 12 }}>
          <p style={{ fontSize: 12, color: "var(--text-muted)" }}>© 2025 TaybleTap. All rights reserved.</p>
          <p style={{ fontSize: 12, color: "var(--text-muted)" }}>
            Built with <span style={{ color: "var(--primary)", fontWeight: 600 }}>Next.js · Django · MongoDB · Framer Motion</span>
          </p>
        </div>
      </div>
    </footer>
  );
}

// ─── App ──────────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <>
      <GlobalStyles />
      <Navbar />
      <main>
        <HeroSection />
        <MarqueeBanner />
        <ProblemSection />
        <SolutionSection />
        <HowItWorks />
        <DashboardPreview />
        <AIBanner />
        <BenefitsSection />
        <CTASection />
        <Footer />
      </main>
    </>
  );
}

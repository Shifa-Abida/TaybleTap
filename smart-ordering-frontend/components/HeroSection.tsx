"use client";
/*
  HEROSECTION.TSX — Hero for Restaurant Owner Landing Page
  ============================================================
  GOAL: Minimal warm SaaS style.
  
  ANIMATIONS:
  - Headline fades up line by line.
  - Subtext fades up after headline.
  - CTA buttons slide up.
  - Right-side visual slowly floats.
  - Avoid too much bouncing or spinning.
  ============================================================
*/

import { motion } from "framer-motion";
import { PlayCircle, ArrowRight, Star, TrendingUp, Clock } from "lucide-react";

// Line by line animation
const lineVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.15, duration: 0.6, ease: "easeOut" as const },
  }),
};

// Floating order notification cards shown on the right visual
const floatingCards = [
  { emoji: "🍛", name: "Chicken Biryani", table: "Table 4", price: "₹280", color: "var(--color-primary)", top: "12%", left: "-18%" },
  { emoji: "🧾", name: "New Order #47", table: "Table 7", price: "₹520", color: "var(--color-accent-green)", top: "55%", left: "82%" },
  { emoji: "💳", name: "Payment Done", table: "Table 2", price: "₹340", color: "#FBBF24", top: "80%", left: "-10%" },
];

export default function HeroSection() {
  return (
    <section id="home" className="relative min-h-screen flex items-center overflow-hidden" style={{ paddingTop: "88px" }}>

      {/* ── Soft Warm Background ─────────────────────── */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        {/* Soft subtle gradient orbs instead of neon */}
        <motion.div className="absolute top-0 right-0 w-[800px] h-[800px] rounded-full"
          style={{ background: "radial-gradient(circle, var(--color-soft-orange) 0%, transparent 60%)", filter: "blur(80px)", opacity: 0.5 }}
          animate={{ x: [0, 20, 0], y: [0, 20, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }} />
      </div>

      <div className="relative z-10 max-w-6xl w-full mx-auto px-6 py-20 grid md:grid-cols-2 gap-16 items-center" style={{ margin: "0 auto" }}>

        {/* ── LEFT: Text Content ───────────────────────────── */}
        <div>
          {/* Badge */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold mb-7"
            style={{ background: "var(--color-soft-orange)", color: "var(--color-primary)" }}>
            <Star size={12} fill="var(--color-primary)" />
            Trusted by 500+ Restaurants
          </motion.div>

          {/* Animated Headline — line by line */}
          <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-6"
            style={{ fontFamily: "'Playfair Display', serif", color: "var(--color-text-primary)" }}>
            <motion.div custom={0} variants={lineVariants} initial="hidden" animate="visible" className="block">
              Turn Your Restaurant Menu
            </motion.div>
            <motion.div custom={1} variants={lineVariants} initial="hidden" animate="visible" className="block">
              Into a <span className="gradient-text">Smart QR</span>
            </motion.div>
            <motion.div custom={2} variants={lineVariants} initial="hidden" animate="visible" className="block">
              Ordering System
            </motion.div>
          </h1>

          {/* Subtext */}
          <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.6 }}
            className="text-base leading-relaxed mb-8 max-w-lg" style={{ color: "var(--color-text-secondary)" }}>
            Let customers scan, browse, order, and pay directly from their table — while you manage
            menus and orders from one powerful dashboard.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6, duration: 0.6 }}
            className="flex flex-wrap gap-4 mb-10">
            <motion.a href="/register" 
              whileHover={{ scale: 1.03, boxShadow: "0 4px 14px rgba(232, 106, 51, 0.2)" }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center gap-2 px-7 py-3.5 rounded-2xl font-semibold text-white text-sm cursor-pointer transition-shadow"
              style={{ background: "var(--color-primary)" }}>
              Register Your Restaurant <ArrowRight size={16} />
            </motion.a>
            <motion.a href="#demo" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              className="flex items-center gap-2 px-7 py-3.5 rounded-2xl font-semibold text-sm cursor-pointer bg-white shadow-sm"
              style={{ border: "1px solid var(--color-border)", color: "var(--color-text-primary)" }}>
              <PlayCircle size={16} style={{ color: "var(--color-primary)" }} /> Watch Demo
            </motion.a>
          </motion.div>

          {/* Social proof stats */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8, duration: 0.6 }}
            className="flex items-center gap-6 flex-wrap">
            {[
              { icon: <Star size={14} fill="#FBBF24" color="#FBBF24" />, text: "4.9 Rating" },
              { icon: <TrendingUp size={14} color="var(--color-accent-green)" />, text: "3x Faster Orders" },
              { icon: <Clock size={14} color="var(--color-primary)" />, text: "Setup in 10 min" },
            ].map((s) => (
              <div key={s.text} className="flex items-center gap-2 text-sm font-medium" style={{ color: "var(--color-text-secondary)" }}>
                {s.icon} {s.text}
              </div>
            ))}
          </motion.div>
        </div>

        {/* ── RIGHT: Visual / Spline Placeholder ──────────── */}
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8, ease: "easeOut" }}
          className="relative flex justify-center items-center min-h-[420px]">

          {/* Main Card — Restaurant dashboard mockup */}
          <motion.div
            animate={{ y: [0, -8, 0] }} // Gentle float
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="relative w-72 h-80 rounded-3xl overflow-hidden flex flex-col shadow-xl"
            style={{
              background: "var(--color-bg-card)",
              border: "1px solid var(--color-border)",
            }}>
            {/* Mock browser bar */}
            <div className="px-4 py-3 flex items-center gap-2" style={{ borderBottom: "1px solid var(--color-border)", background: "#FAFAFA" }}>
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
              </div>
              <div className="flex-1 mx-3 h-5 rounded-md text-xs flex items-center justify-center font-medium"
                style={{ background: "#F1F5F9", color: "var(--color-text-muted)" }}>
                menuqr.app/dashboard
              </div>
            </div>

            {/* Mock dashboard content */}
            <div className="p-4 flex flex-col gap-3">
              <p className="text-xs font-semibold" style={{ color: "var(--color-text-secondary)" }}>Today&apos;s Overview</p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: "Orders", value: "47", color: "var(--color-primary)" },
                  { label: "Revenue", value: "₹8.2k", color: "var(--color-accent-green)" },
                  { label: "Pending", value: "5", color: "#F43F5E" },
                  { label: "Tables", value: "12", color: "var(--color-text-primary)" },
                ].map((stat) => (
                  <div key={stat.label} className="rounded-xl p-3 bg-white"
                    style={{ border: "1px solid var(--color-border)" }}>
                    <p className="text-sm font-bold" style={{ color: stat.color }}>{stat.value}</p>
                    <p className="text-xs font-medium" style={{ color: "var(--color-text-muted)" }}>{stat.label}</p>
                  </div>
                ))}
              </div>
              {/* Order list preview */}
              <div className="rounded-xl p-3 bg-white" style={{ border: "1px solid var(--color-border)" }}>
                {["Chicken Biryani", "Paneer Masala", "Garlic Naan"].map((item, i) => (
                  <div key={item} className="flex justify-between items-center py-1">
                    <span className="text-xs font-medium" style={{ color: "var(--color-text-primary)" }}>{item}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                      style={{ background: i === 0 ? "rgba(91, 140, 106, 0.1)" : "var(--color-soft-orange)", color: i === 0 ? "var(--color-accent-green)" : "var(--color-primary)" }}>
                      {i === 0 ? "Done" : "Pending"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Floating order notification cards */}
          {floatingCards.map((card, i) => (
            <motion.div key={card.name}
              className="absolute flex items-center gap-2 px-3 py-2 rounded-xl text-xs shadow-lg bg-white"
              style={{
                top: card.top, left: card.left,
                border: `1px solid var(--color-border)`,
              }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                opacity: { delay: 0.8 + i * 0.2, duration: 0.5 },
                y: { delay: 0.8 + i * 0.2, duration: 0.5 },
              }}>
              <span className="text-base">{card.emoji}</span>
              <div>
                <p className="font-semibold" style={{ color: "var(--color-text-primary)" }}>{card.name}</p>
                <p style={{ color: "var(--color-text-muted)", fontSize: "10px" }}>{card.table} · {card.price}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

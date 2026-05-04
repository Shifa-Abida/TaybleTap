"use client";
/*
  BENEFITSSECTION.TSX — "Built for Small and Growing Restaurants"
  ============================================================
  ANIMATION:
  - Cards scale slightly on hover
  - Background gradient moves slowly (CSS animation)
  ============================================================
*/

import { motion } from "framer-motion";
import { CheckCircle } from "lucide-react";

const benefits = [
  { emoji: "💡", title: "No Expensive Kiosk Needed", desc: "Works on any smartphone. Your customers already have everything they need in their pocket." },
  { emoji: "✏️", title: "Easy Menu Updates", desc: "Change prices, add specials, or mark items as unavailable — all in real-time from your phone." },
  { emoji: "⚡", title: "Faster Table Service", desc: "Customers order themselves. Your staff focuses on delivering food, not taking notes." },
  { emoji: "😌", title: "Less Staff Pressure", desc: "Reduce dependency on waiters. One staff member can handle more tables without stress." },
  { emoji: "⭐", title: "Better Customer Experience", desc: "Customers love the speed, clarity, and convenience of scanning and ordering on their own." },
  { emoji: "🏪", title: "Works for Any Restaurant", desc: "Small café, dhaba, cloud kitchen, or fine dining — the system adapts to your needs." },
];

export default function BenefitsSection() {
  return (
    <section className="relative overflow-hidden" style={{ padding: "8rem 1.5rem" }}>

      {/* Slowly moving gradient background */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse at 50% 50%, var(--color-soft-orange) 0%, transparent 70%)", opacity: 0.5 }}
        animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }} />

      <div className="max-w-6xl w-full mx-auto relative z-10" style={{ margin: "0 auto" }}>

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.55 }} className="text-center mb-14">
          <p className="text-sm font-semibold uppercase tracking-widest mb-3" style={{ color: "var(--color-primary)" }}>
            Why Choose Us
          </p>
          <h2 className="text-3xl md:text-4xl font-bold"
            style={{ fontFamily: "'Playfair Display', serif", color: "var(--color-text-primary)" }}>
            Built for <span className="gradient-text">Small and Growing Restaurants</span>
          </h2>
        </motion.div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
          {benefits.map((b, i) => (
            <motion.div key={b.title}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: i * 0.08 }}
              whileHover={{ scale: 1.04 }}
              className="p-6 rounded-2xl flex flex-col gap-3 cursor-default"
              style={{ background: "var(--color-bg-card)", border: "1px solid var(--color-border)" }}>
              <div className="flex items-start gap-3">
                <span className="text-3xl">{b.emoji}</span>
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <CheckCircle size={14} style={{ color: "var(--color-accent-green)" }} />
                    <h3 className="font-bold text-sm" style={{ color: "var(--color-text-primary)" }}>{b.title}</h3>
                  </div>
                  <p className="text-sm leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>{b.desc}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

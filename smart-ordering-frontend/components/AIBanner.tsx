/*
  ============================================================
  AIBANNER.TSX — AI Recommendation Feature Highlight
  ============================================================

  WHY THIS SECTION:
  This section introduces the AI module to the customer.
  It shows what kind of smart help is available — like asking
  "show me something spicy under ₹200" — and invites them to try it.

  This is a KEY differentiator from a regular digital menu.

  TECHNOLOGIES USED:
  - Framer Motion: Animated gradient border + floating chips
  ============================================================
*/

"use client";

import { motion } from "framer-motion";
import { Sparkles, Search, TrendingUp, Heart } from "lucide-react";

// Sample AI suggestion chips — will be clickable in future sprint
const suggestions = [
  { icon: "🌶️", text: "Something spicy" },
  { icon: "🥗", text: "Light & healthy" },
  { icon: "💰", text: "Under ₹200" },
  { icon: "🔥", text: "Best seller today" },
  { icon: "🍱", text: "Suggest a combo" },
];

const aiFeatures = [
  { icon: <Search size={18} />, title: "Smart Search", desc: 'Type "cheesy" or "veg" and get instant results' },
  { icon: <TrendingUp size={18} />, title: "Trending Picks", desc: "See what's popular among diners today" },
  { icon: <Heart size={18} />, title: "Personalized", desc: "Recommendations based on your past orders" },
];

export default function AIBanner() {
  return (
    <section id="offers" className="py-20 px-6">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="rounded-3xl p-8 md:p-12 relative overflow-hidden"
          style={{
            background: "linear-gradient(135deg, rgba(255,107,53,0.1), rgba(255,201,71,0.06))",
            border: "1px solid rgba(255,107,53,0.2)",
          }}
        >
          {/* Background decoration */}
          <div
            className="absolute top-0 right-0 w-72 h-72 rounded-full blur-3xl pointer-events-none"
            style={{ background: "rgba(255,107,53,0.08)", transform: "translate(30%, -30%)" }}
          />

          <div className="grid md:grid-cols-2 gap-10 items-center relative z-10">

            {/* ── Left: Text + Chips ──────────────────────── */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ background: "linear-gradient(135deg, #FF6B35, #FFC947)" }}
                >
                  <Sparkles size={16} color="white" />
                </div>
                <span className="text-sm font-semibold uppercase tracking-widest"
                  style={{ color: "var(--color-primary)" }}>
                  AI-Powered
                </span>
              </div>

              <h2 className="text-3xl md:text-4xl font-bold mb-3"
                style={{ fontFamily: "var(--font-display)", color: "var(--color-text-primary)" }}>
                Your Smart{" "}
                <span className="gradient-text">Food Assistant</span>
              </h2>

              <p className="mb-6 text-sm leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>
                Not sure what to order? Just tell our AI what you&apos;re in the mood for —
                spicy, budget-friendly, or something new. It&apos;ll find the perfect dish.
              </p>

              {/* AI Suggestion Chips */}
              <div className="flex flex-wrap gap-2">
                {suggestions.map((s, i) => (
                  <motion.button
                    key={s.text}
                    initial={{ opacity: 0, scale: 0.85 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.08 }}
                    whileHover={{ scale: 1.06 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-3.5 py-1.5 rounded-full text-sm font-medium cursor-pointer"
                    style={{
                      background: "rgba(255,255,255,0.06)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      color: "var(--color-text-primary)",
                    }}
                  >
                    {s.icon} {s.text}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* ── Right: Feature Cards ────────────────────── */}
            <div className="flex flex-col gap-4">
              {aiFeatures.map((feature, i) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-start gap-4 p-4 rounded-2xl"
                  style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}
                >
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: "rgba(255,107,53,0.15)", color: "#FF6B35" }}
                  >
                    {feature.icon}
                  </div>
                  <div>
                    <p className="font-semibold text-sm mb-0.5" style={{ color: "var(--color-text-primary)" }}>
                      {feature.title}
                    </p>
                    <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                      {feature.desc}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

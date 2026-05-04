/*
  ============================================================
  CATEGORIES.TSX — Food Category Cards Section
  ============================================================

  WHY THIS SECTION EXISTS:
  Customers can quickly jump to a food category (Starters,
  Biryani, Desserts, etc.) instead of scrolling the whole menu.
  This improves UX especially on mobile phones.

  TECHNOLOGIES USED:
  - Framer Motion: Cards animate in one-by-one using whileInView
    (animates only when user scrolls to this section)
  - Tailwind CSS: Responsive grid layout
  ============================================================
*/

"use client";

import { motion } from "framer-motion";

// Category data — in a real project this would come from the Django API
const categories = [
  { emoji: "🥗", name: "Starters",  count: 12, color: "#22C55E" },
  { emoji: "🍚", name: "Biryani",   count: 8,  color: "#FF6B35" },
  { emoji: "🍛", name: "Curries",   count: 15, color: "#FFC947" },
  { emoji: "🫓", name: "Breads",    count: 6,  color: "#A78BFA" },
  { emoji: "🥤", name: "Drinks",    count: 10, color: "#38BDF8" },
  { emoji: "🍮", name: "Desserts",  count: 7,  color: "#F472B6" },
];

export default function Categories() {
  return (
    <section id="menu" className="py-20 px-6">
      <div className="max-w-6xl mx-auto">

        {/* ── Section Header ───────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          /*
            WHY whileInView?
            Instead of animating on page load, this animates only
            when the user scrolls down to see this section.
            viewport={{ once: true }} means it only animates once,
            not every time the user scrolls up and back down.
          */
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-10"
        >
          <p className="text-sm font-semibold uppercase tracking-widest mb-2"
            style={{ color: "var(--color-primary)" }}>
            What are you craving?
          </p>
          <h2 className="text-3xl md:text-4xl font-bold"
            style={{ fontFamily: "var(--font-display)", color: "var(--color-text-primary)" }}>
            Browse by Category
          </h2>
        </motion.div>

        {/* ── Category Grid ─────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
          {categories.map((cat, index) => (
            <motion.div
              key={cat.name}
              /*
                WHY stagger with delay?
                Each card has a delay based on its index:
                index 0 → 0s, index 1 → 0.08s, index 2 → 0.16s ...
                This creates a cascade "waterfall" animation effect.
              */
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.08 }}
              whileHover={{ scale: 1.06, y: -4 }}
              whileTap={{ scale: 0.97 }}
              className="flex flex-col items-center gap-3 p-5 rounded-2xl cursor-pointer text-center"
              style={{
                background: "var(--color-bg-card)",
                border: "1px solid var(--color-border)",
                transition: "border-color 0.2s",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLDivElement).style.borderColor = cat.color + "60";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLDivElement).style.borderColor = "var(--color-border)";
              }}
            >
              {/* Emoji Icon with colored glow circle */}
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl"
                style={{ background: cat.color + "18" }}
              >
                {cat.emoji}
              </div>
              <div>
                <p className="font-semibold text-sm" style={{ color: "var(--color-text-primary)" }}>
                  {cat.name}
                </p>
                <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                  {cat.count} items
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

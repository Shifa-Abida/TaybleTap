/*
  ============================================================
  FEATUREDDISHES.TSX — Popular Dishes Showcase
  ============================================================

  WHY THIS SECTION:
  Shows the top dishes to entice customers immediately.
  In a real system, this data comes from the Django API
  (most ordered dishes = "featured").

  TECHNOLOGIES USED:
  - Framer Motion: Dish cards fade in on scroll + hover effect
  - Tailwind CSS: Card grid, responsive layout
  ============================================================
*/

"use client";

import { motion } from "framer-motion";
import { Plus, Star, Flame } from "lucide-react";
import { useState } from "react";

// Placeholder dish data — will come from Django API in the real system
const dishes = [
  {
    id: 1,
    name: "Chicken Biryani",
    description: "Aromatic basmati rice with tender chicken & spices",
    price: 280,
    rating: 4.9,
    tag: "Best Seller",
    emoji: "🍚",
    spicy: true,
    color: "#FF6B35",
  },
  {
    id: 2,
    name: "Paneer Butter Masala",
    description: "Rich tomato-based curry with soft paneer cubes",
    price: 220,
    rating: 4.7,
    tag: "Veg",
    emoji: "🍛",
    spicy: false,
    color: "#FFC947",
  },
  {
    id: 3,
    name: "Tandoori Platter",
    description: "Mixed grill platter with mint chutney",
    price: 380,
    rating: 4.8,
    tag: "Popular",
    emoji: "🍗",
    spicy: true,
    color: "#F472B6",
  },
  {
    id: 4,
    name: "Dal Makhani",
    description: "Slow-cooked black lentils in buttery tomato sauce",
    price: 180,
    rating: 4.6,
    tag: "Veg",
    emoji: "🫕",
    spicy: false,
    color: "#22C55E",
  },
  {
    id: 5,
    name: "Garlic Naan",
    description: "Soft naan brushed with garlic butter",
    price: 60,
    rating: 4.5,
    tag: "Bread",
    emoji: "🫓",
    spicy: false,
    color: "#A78BFA",
  },
  {
    id: 6,
    name: "Gulab Jamun",
    description: "Soft milk dumplings soaked in rose syrup",
    price: 80,
    rating: 4.9,
    tag: "Dessert",
    emoji: "🍮",
    spicy: false,
    color: "#38BDF8",
  },
];

export default function FeaturedDishes() {
  // Track which items are in cart — in real app this will be global state
  const [added, setAdded] = useState<number[]>([]);

  const handleAdd = (id: number) => {
    setAdded((prev) => [...prev, id]);
    // Visual feedback resets after 1.5 seconds
    setTimeout(() => setAdded((prev) => prev.filter((i) => i !== id)), 1500);
  };

  return (
    <section id="popular" className="py-20 px-6">
      <div className="max-w-6xl mx-auto">

        {/* ── Section Header ───────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex items-end justify-between mb-10 flex-wrap gap-4"
        >
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest mb-2"
              style={{ color: "var(--color-primary)" }}>
              🔥 Trending Now
            </p>
            <h2 className="text-3xl md:text-4xl font-bold"
              style={{ fontFamily: "var(--font-display)", color: "var(--color-text-primary)" }}>
              Featured Dishes
            </h2>
          </div>
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            className="text-sm font-medium px-5 py-2.5 rounded-xl cursor-pointer"
            style={{ background: "var(--color-bg-card)", color: "var(--color-primary)", border: "1px solid var(--color-border)" }}
          >
            View All →
          </motion.button>
        </motion.div>

        {/* ── Dishes Grid ───────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
          {dishes.map((dish, index) => (
            <motion.div
              key={dish.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: index * 0.07 }}
              whileHover={{ y: -6 }}
              className="rounded-2xl overflow-hidden flex flex-col"
              style={{
                background: "var(--color-bg-card)",
                border: "1px solid var(--color-border)",
              }}
            >
              {/* ── Dish Image Area (Emoji placeholder) ────── */}
              <div
                className="h-40 flex items-center justify-center text-6xl relative"
                style={{ background: dish.color + "14" }}
              >
                {dish.emoji}
                {/* Tag badge */}
                <div
                  className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs font-semibold"
                  style={{ background: dish.color + "25", color: dish.color, border: `1px solid ${dish.color}40` }}
                >
                  {dish.tag}
                </div>
                {/* Spicy indicator */}
                {dish.spicy && (
                  <div className="absolute top-3 right-3">
                    <Flame size={16} color="#FF6B35" />
                  </div>
                )}
              </div>

              {/* ── Dish Info ──────────────────────────────── */}
              <div className="p-4 flex flex-col gap-2 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold text-base leading-tight"
                    style={{ color: "var(--color-text-primary)" }}>
                    {dish.name}
                  </h3>
                  <div className="flex items-center gap-1 shrink-0">
                    <Star size={12} fill="#FFC947" color="#FFC947" />
                    <span className="text-xs font-medium" style={{ color: "#FFC947" }}>
                      {dish.rating}
                    </span>
                  </div>
                </div>

                <p className="text-xs leading-relaxed" style={{ color: "var(--color-text-muted)" }}>
                  {dish.description}
                </p>

                {/* Price + Add Button */}
                <div className="flex items-center justify-between mt-auto pt-3">
                  <p className="font-bold text-lg" style={{ color: "var(--color-text-primary)" }}>
                    ₹{dish.price}
                  </p>

                  {/*
                    WHY animate the Add button?
                    Micro-animations on interactive elements give immediate
                    feedback that the action was registered. This improves
                    perceived responsiveness of the app.
                  */}
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleAdd(dish.id)}
                    className="w-9 h-9 rounded-xl flex items-center justify-center cursor-pointer font-bold text-white transition-all"
                    style={{
                      background: added.includes(dish.id)
                        ? "#22C55E"
                        : "linear-gradient(135deg, #FF6B35, #FFC947)",
                    }}
                  >
                    {added.includes(dish.id) ? "✓" : <Plus size={18} />}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

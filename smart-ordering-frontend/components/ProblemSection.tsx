"use client";
/*
  PROBLEMSECTION.TSX — "Why Restaurants Need Smarter Ordering"
  ============================================================
  PURPOSE: Identify the restaurant owner's pain points so they
  feel understood and are motivated to look at our solution.

  ANIMATIONS:
  - Section title fades in on scroll
  - Cards appear one by one (staggered whileInView)
  - Icons bounce slightly on hover (whileHover)
  ============================================================
*/

import { motion } from "framer-motion";
import { Clock, AlertTriangle, FileX, BarChart2 } from "lucide-react";

const problems = [
  {
    icon: <Clock size={24} />,
    title: "Long Waiting Time",
    desc: "Customers wait ages for a waiter to take their order, leading to frustration and poor reviews.",
    color: "var(--color-primary)",
    bg: "var(--color-soft-orange)",
  },
  {
    icon: <AlertTriangle size={24} />,
    title: "Manual Order Mistakes",
    desc: "Handwritten orders get misread, wrong dishes reach the table, and it damages customer trust.",
    color: "var(--color-primary)",
    bg: "var(--color-soft-orange)",
  },
  {
    icon: <FileX size={24} />,
    title: "Outdated Printed Menus",
    desc: "Every price change or new dish means reprinting menus — expensive, slow, and wasteful.",
    color: "var(--color-primary)",
    bg: "var(--color-soft-orange)",
  },
  {
    icon: <BarChart2 size={24} />,
    title: "No Order Tracking",
    desc: "Kitchen staff have no clear visibility into which orders are pending, ready, or delivered.",
    color: "var(--color-primary)",
    bg: "var(--color-soft-orange)",
  },
];

export default function ProblemSection() {
  return (
    <section id="features" style={{ padding: "8rem 1.5rem" }}>
      <div className="max-w-5xl w-full mx-auto" style={{ margin: "0 auto" }}>

        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55 }}
          className="text-center mb-14">
          <p className="text-sm font-semibold uppercase tracking-widest mb-3" style={{ color: "var(--color-primary)" }}>
            The Real Problem
          </p>
          <h2 className="text-3xl md:text-4xl font-bold" style={{ fontFamily: "'Playfair Display', serif", color: "var(--color-text-primary)" }}>
            Why Restaurants Need <span className="gradient-text">Smarter Ordering</span>
          </h2>
          <p className="mt-4 max-w-xl mx-auto text-sm text-center" style={{ color: "var(--color-text-secondary)", margin: "1rem auto 0", textAlign: "center" }}>
            Traditional ordering systems are slowing restaurants down. Here&apos;s what&apos;s holding your business back.
          </p>
        </motion.div>

        {/* Problem Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
          {problems.map((p, i) => (
            <motion.div
              key={p.title}
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.15, ease: "easeOut" }}
              whileHover={{ y: -4, boxShadow: "0 10px 30px rgba(0,0,0,0.05)" }}
              className="p-5 rounded-2xl flex flex-col gap-3 bg-white"
              style={{
                border: "1px solid var(--color-border)",
              }}>
              {/* Icon - removed bounce */}
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: p.bg, color: p.color }}>
                {p.icon}
              </div>
              <h3 className="font-bold text-sm" style={{ color: "var(--color-text-primary)" }}>
                {p.title}
              </h3>
              <p className="text-xs leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>
                {p.desc}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Bottom connector arrow */}
        <motion.div
          initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
          transition={{ delay: 0.6 }}
          className="flex flex-col items-center mt-12 gap-2">
          <p className="text-sm font-medium" style={{ color: "var(--color-text-secondary)" }}>Here&apos;s how we solve all of this</p>
          <motion.div animate={{ y: [0, 5, 0] }} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}>
            <span style={{ color: "var(--color-primary)", fontSize: "1.2rem" }}>↓</span>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

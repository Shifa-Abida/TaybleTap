"use client";
/*
  SOLUTIONSECTION.TSX — "Everything Your Restaurant Needs in One System"
  ============================================================
  PURPOSE: Show all features of the system as solutions to
  the problems shown in the previous section.

  ANIMATIONS:
  - Cards fade in from left (even index) and right (odd index)
  - Large feature highlight slides in
  ============================================================
*/

import { motion } from "framer-motion";
import { QrCode, LayoutDashboard, CreditCard, BarChart, Users, Pencil } from "lucide-react";

const features = [
  { icon: <QrCode size={22} />, title: "Digital QR Menu", desc: "Customers scan and browse the full menu instantly — no app download needed." },
  { icon: <Pencil size={22} />, title: "Easy Menu Management", desc: "Add, edit, or remove dishes in seconds from your dashboard." },
  { icon: <LayoutDashboard size={22} />, title: "Live Order Dashboard", desc: "See every order in real-time. Update status and notify the kitchen instantly." },
  { icon: <CreditCard size={22} />, title: "UPI Payment Support", desc: "Customers pay via UPI QR code — cashless and effortless." },
  { icon: <BarChart size={22} />, title: "Sales Analytics", desc: "Understand what's selling, peak hours, and revenue trends at a glance." },
  { icon: <Users size={22} />, title: "Customer Insights", desc: "Track repeat customers, popular dishes, and order history." },
];

export default function SolutionSection() {
  return (
    <section id="how-it-works"
      style={{ padding: "8rem 1.5rem", background: "linear-gradient(180deg, var(--color-bg) 0%, var(--color-bg-card) 100%)" }}>
      <div className="max-w-6xl w-full mx-auto" style={{ margin: "0 auto" }}>

        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.55 }}
          className="text-center mb-14">
          <p className="text-sm font-semibold uppercase tracking-widest mb-3" style={{ color: "var(--color-primary)" }}>
            The Solution
          </p>
          <h2 className="text-3xl md:text-4xl font-bold"
            style={{ fontFamily: "'Playfair Display', serif", color: "var(--color-text-primary)" }}>
            Everything Your Restaurant Needs <br />
            <span className="gradient-text">in One System</span>
          </h2>
        </motion.div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.1, ease: "easeOut" }}
              whileHover="hover"
              className="p-6 rounded-2xl flex flex-col gap-4 cursor-pointer transition-colors bg-white group"
              style={{
                border: "1px solid var(--color-border)",
              }}
              variants={{
                hover: { borderColor: "var(--color-primary)", boxShadow: "0 10px 30px rgba(232, 106, 51, 0.05)" }
              }}>
              <motion.div className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ background: "var(--color-soft-orange)", color: "var(--color-primary)" }}
                variants={{ hover: { scale: 1.1 } }}
                transition={{ type: "spring", stiffness: 300 }}>
                {f.icon}
              </motion.div>
              <div>
                <h3 className="font-bold text-base mb-1.5" style={{ color: "var(--color-text-primary)" }}>
                  {f.title}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>
                  {f.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

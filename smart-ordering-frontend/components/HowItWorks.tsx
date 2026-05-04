"use client";
/*
  HOWITWORKS.TSX — 4-Step Process for Restaurant Owners
  ============================================================
  PURPOSE: Make the onboarding process feel simple and fast.
  Restaurant owners should feel: "I can set this up today."

  ANIMATIONS:
  - Timeline line draws from top to bottom as user scrolls
  - Each step card lights up (opacity + color) on scroll
  - Step numbers pulse gently
  ============================================================
*/

import { motion } from "framer-motion";
import { UserPlus, UtensilsCrossed, QrCode, ShoppingBag } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: <UserPlus size={24} />,
    title: "Register Your Restaurant",
    desc: "Create your free account in minutes. Add your restaurant name, logo, address, and contact details.",
    color: "var(--color-primary)",
  },
  {
    number: "02",
    icon: <UtensilsCrossed size={24} />,
    title: "Add Your Menu Items",
    desc: "Upload dish names, descriptions, images, prices, and categories. Update anytime — no reprinting needed.",
    color: "var(--color-primary)",
  },
  {
    number: "03",
    icon: <QrCode size={24} />,
    title: "Generate Table QR Codes",
    desc: "Get a unique QR code per table. Print and place them. Customers scan to open your interactive menu.",
    color: "var(--color-primary)",
  },
  {
    number: "04",
    icon: <ShoppingBag size={24} />,
    title: "Start Receiving Orders",
    desc: "Orders appear instantly in your dashboard. Track status, update the kitchen, and manage billing in real-time.",
    color: "var(--color-primary)",
  },
];

export default function HowItWorks() {
  return (
    <section id="pricing" style={{ padding: "8rem 1.5rem" }}>
      <div className="max-w-4xl w-full mx-auto" style={{ margin: "0 auto" }}>

        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.55 }}
          className="text-center mb-16">
          <p className="text-sm font-semibold uppercase tracking-widest mb-3" style={{ color: "var(--color-primary)" }}>
            Simple Setup
          </p>
          <h2 className="text-3xl md:text-4xl font-bold"
            style={{ fontFamily: "'Playfair Display', serif", color: "var(--color-text-primary)" }}>
            Get Started in <span className="gradient-text">4 Easy Steps</span>
          </h2>
        </motion.div>

        {/* Timeline Steps */}
        <div className="relative flex flex-col mt-16" style={{ display: "flex", flexDirection: "column", gap: "4rem" }}>

          {/* Vertical line behind steps */}
          <div className="absolute left-[27px] top-0 bottom-0 w-px"
            style={{ background: "var(--color-border)" }} />

          {steps.map((step) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="relative flex items-start gap-8"
              style={{ display: "flex", alignItems: "flex-start", gap: "2rem" }}
            >
              {/* Step Number Circle */}
              <motion.div
                whileInView={{ scale: [0.8, 1.1, 1], opacity: [0.5, 1] }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="relative z-10 w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 font-bold text-white shadow-sm"
                style={{ background: step.color }}>
                {step.icon}
              </motion.div>

              {/* Step Content */}
              <div className="flex-1 pt-1 text-left">
                <div className="flex items-center gap-3 mb-2 justify-start">
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                    style={{ background: "var(--color-soft-orange)", color: step.color }}>
                    Step {step.number}
                  </span>
                </div>
                <h3 className="font-bold text-xl mb-2" style={{ color: "var(--color-text-primary)" }}>
                  {step.title}
                </h3>
                <p className="text-base leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>
                  {step.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

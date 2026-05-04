"use client";
/*
  CTASECTION.TSX — Final Call To Action
  ============================================================
  ANIMATION:
  - Glowing pulsing background
  - Buttons have pulse ring effect
  - Text fades in from below
  ============================================================
*/

import { motion } from "framer-motion";
import { ArrowRight, LogIn } from "lucide-react";

export default function CTASection() {
  return (
    <section style={{ padding: "8rem 1.5rem" }}>
      <div className="max-w-5xl w-full mx-auto" style={{ margin: "0 auto" }}>
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.65 }}
          className="relative rounded-3xl p-16 md:p-24 text-center overflow-hidden"
          style={{
            background: "var(--color-bg-card)",
            border: "1px solid var(--color-border)",
            boxShadow: "0 20px 40px rgba(0,0,0,0.02)"
          }}>

          {/* Pulsing glow background */}
          <motion.div
            className="absolute inset-0 rounded-3xl pointer-events-none"
            style={{ background: "radial-gradient(circle at 50% 50%, var(--color-soft-orange) 0%, transparent 65%)", opacity: 0.5 }}
            animate={{ scale: [1, 1.08, 1], opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }} />

          {/* Decorative corner orb */}
          <div className="absolute top-[-30%] right-[-10%] w-72 h-72 rounded-full pointer-events-none"
            style={{ background: "radial-gradient(circle, var(--color-soft-orange) 0%, transparent 65%)", filter: "blur(40px)", opacity: 0.6 }} />

          <div className="relative z-10">
            <motion.p
              initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: 0.1 }}
              className="text-sm font-semibold uppercase tracking-widest mb-4" style={{ color: "var(--color-primary)" }}>
              Ready to Get Started?
            </motion.p>

            <motion.h2
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: 0.2, duration: 0.55 }}
              className="text-3xl md:text-5xl font-bold mb-5 leading-tight"
              style={{ fontFamily: "'Playfair Display', serif", color: "var(--color-text-primary)" }}>
              Ready to Make Your Restaurant <span className="gradient-text">Smarter?</span>
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: 0.3 }}
              className="mb-10 max-w-md mx-auto text-sm leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>
              Join hundreds of restaurants already using MenuQR to serve customers faster,
              reduce errors, and grow their business.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: 0.4 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4">

              {/* Register button with pulse ring */}
              <div className="relative">
                {/* Pulse ring effect */}
                <motion.div
                  className="absolute inset-0 rounded-2xl"
                  style={{ border: "2px solid var(--color-primary)" }}
                  animate={{ scale: [1, 1.18, 1], opacity: [0.4, 0, 0.4] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }} />
                <motion.a href="/register"
                  whileHover={{ scale: 1.03, boxShadow: "0 4px 14px rgba(232, 106, 51, 0.2)" }}
                  whileTap={{ scale: 0.97 }}
                  className="relative flex items-center gap-2 px-8 py-4 rounded-2xl font-semibold text-white text-sm cursor-pointer"
                  style={{ background: "var(--color-primary)" }}>
                  Register Restaurant <ArrowRight size={16} />
                </motion.a>
              </div>

              <motion.a href="/login"
                whileHover={{ scale: 1.02, borderColor: "var(--color-primary)" }}
                whileTap={{ scale: 0.97 }}
                className="flex items-center gap-2 px-8 py-4 rounded-2xl font-semibold text-sm cursor-pointer transition-all bg-white"
                style={{
                  border: "1px solid var(--color-border)",
                  color: "var(--color-text-primary)",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.02)"
                }}>
                <LogIn size={16} style={{ color: "var(--color-primary)" }} /> Login to Dashboard
              </motion.a>
            </motion.div>

            {/* Trust text */}
            <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
              transition={{ delay: 0.6 }} className="mt-6 text-xs font-medium" style={{ color: "var(--color-text-secondary)" }}>
              ✓ No credit card required &nbsp;&nbsp; ✓ Setup in under 10 minutes &nbsp;&nbsp; ✓ Free to get started
            </motion.p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

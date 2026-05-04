"use client";
/*
  FOOTER.TSX — Simple Restaurant Owner Footer
  Animation: Fades in when scrolled into view
*/

import { motion } from "framer-motion";
import { UtensilsCrossed } from "lucide-react";

export default function Footer() {
  return (
    <motion.footer
      initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}
      viewport={{ once: true }} transition={{ duration: 0.6 }}
      className="px-6 py-12"
      style={{ borderTop: "1px solid var(--color-border)" }}>
      <div className="max-w-6xl w-full mx-auto" style={{ margin: "0 auto" }}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-10">

          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                style={{ background: "var(--color-primary)" }}>
                <UtensilsCrossed size={16} color="white" />
              </div>
              <span className="font-bold" style={{ color: "var(--color-text-primary)" }}>MenuQR</span>
            </div>
            <p className="text-sm leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>
              Smart QR ordering system for modern restaurants.
            </p>
          </div>

          {/* Product */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: "var(--color-text-secondary)" }}>Product</p>
            {["Features", "How It Works", "Pricing", "Demo"].map((link) => (
              <motion.a key={link} href="#" whileHover={{ x: 4, color: "var(--color-primary)" }}
                className="block text-sm mb-2 cursor-pointer transition-colors" style={{ color: "var(--color-text-secondary)" }}>
                {link}
              </motion.a>
            ))}
          </div>

          {/* Restaurant */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: "var(--color-text-secondary)" }}>Restaurant</p>
            {["Register", "Login to Dashboard", "Manage Menu", "QR Generator"].map((link) => (
              <motion.a key={link} href="#" whileHover={{ x: 4, color: "var(--color-primary)" }}
                className="block text-sm mb-2 cursor-pointer transition-colors" style={{ color: "var(--color-text-secondary)" }}>
                {link}
              </motion.a>
            ))}
          </div>

          {/* Company */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: "var(--color-text-secondary)" }}>Company</p>
            {["About", "Contact", "Privacy Policy", "Terms of Use"].map((link) => (
              <motion.a key={link} href="#" whileHover={{ x: 4, color: "var(--color-primary)" }}
                className="block text-sm mb-2 cursor-pointer transition-colors" style={{ color: "var(--color-text-secondary)" }}>
                {link}
              </motion.a>
            ))}
          </div>
        </div>

        {/* Bottom */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-3 pt-6 text-xs"
          style={{ borderTop: "1px solid var(--color-border)", color: "var(--color-text-secondary)" }}>
          <p>© 2024 MenuQR. All rights reserved.</p>
          <p>
            Built with{" "}
            <span style={{ color: "var(--color-primary)" }}>Next.js · Tailwind CSS · Framer Motion · Django · MongoDB</span>
          </p>
        </div>
      </div>
    </motion.footer>
  );
}

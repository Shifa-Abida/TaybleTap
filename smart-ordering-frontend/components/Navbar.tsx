"use client";
/*
  NAVBAR.TSX — Restaurant Owner Navigation
  Target: Restaurant owners (not customers)
  Links: Features | How It Works | Pricing | Login | Register
  Animation: Slides down on load, Register button has hover glow
*/

import { motion } from "framer-motion";
import { UtensilsCrossed, Menu, X, LogOut } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";

const navLinks = ["Features", "How It Works", "Pricing", "Demo"];

/**
 * `Navbar` — top navigation bar for restaurant owners.
 *
 * Renders site navigation links and authentication controls. Uses
 * `useAuth()` to determine whether to show the authenticated
 * dashboard/logout UI or the public login/register CTAs.
 */
export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Add blur/border to navbar when user scrolls down
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleLogout = () => {
    logout();
  };

  return (
    <motion.nav
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="fixed top-0 left-0 right-0 z-50 px-6 py-4 transition-all duration-300"
      style={{
        background: scrolled ? "rgba(255, 253, 248, 0.85)" : "transparent",
        backdropFilter: scrolled ? "blur(20px)" : "none",
        borderBottom: scrolled ? "1px solid rgba(0, 0, 0, 0.05)" : "none",
      }}
    >
      <div className="max-w-6xl w-full mx-auto flex items-center justify-between" style={{ margin: "0 auto" }}>

        {/* Logo */}
        <motion.div className="flex items-center gap-2" whileHover={{ scale: 1.03 }}>
          <div className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: "var(--color-primary)" }}>
            <UtensilsCrossed size={18} color="white" />
          </div>
          <span className="font-bold text-base" style={{ color: "var(--color-text-primary)" }}>
            MenuQR
          </span>
        </motion.div>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <motion.a
              key={link}
              href={`#${link.toLowerCase().replace(" ", "-")}`}
              className="text-sm font-medium cursor-pointer transition-colors"
              style={{ color: "var(--color-text-secondary)" }}
              whileHover={{ color: "var(--color-primary)" }}
            >
              {link}
            </motion.a>
          ))}
        </div>

        {/* CTA Buttons */}
        {isAuthenticated ? (
          <div className="hidden md:flex items-center gap-3">
            <span className="text-sm font-medium" style={{ color: "var(--color-text-secondary)" }}>
              {user?.name || "Dashboard"}
            </span>
            <motion.button
              onClick={handleLogout}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.96 }}
              className="px-4 py-2 rounded-xl text-sm font-medium cursor-pointer flex items-center gap-2"
              style={{ background: "var(--color-bg-elevated)", border: "1px solid var(--color-border)", color: "var(--color-text-secondary)" }}
            >
              <LogOut size={15} /> Logout
            </motion.button>
          </div>
        ) : (
          <div className="hidden md:flex items-center gap-3">
            <motion.a
              href="/login"
              whileHover={{ color: "var(--color-primary)" }}
              className="text-sm font-medium cursor-pointer px-4 py-2 rounded-xl transition-colors"
              style={{ color: "var(--color-text-secondary)" }}
            >
              Login
            </motion.a>

            {/* Register button with glow on hover */}
            <motion.a
              href="/register"
              whileHover={{
                scale: 1.05,
                boxShadow: "0 0 28px rgba(232, 106, 51, 0.4)",
              }}
              whileTap={{ scale: 0.96 }}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white cursor-pointer"
              style={{ background: "var(--color-primary)" }}
            >
              Register Restaurant
            </motion.a>
          </div>
        )}

        {/* Mobile Hamburger */}
        <button
          className="md:hidden w-9 h-9 rounded-xl flex items-center justify-center"
          style={{ background: "var(--color-bg-elevated)", border: "1px solid var(--color-border)", color: "var(--color-text-primary)" }}
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:hidden mt-3 rounded-2xl p-5 flex flex-col gap-4 shadow-lg"
          style={{ background: "var(--color-bg-elevated)", border: "1px solid var(--color-border)" }}
        >
          {navLinks.map((link) => (
            <a key={link} href={`#${link.toLowerCase().replace(" ", "-")}`}
              className="text-sm font-medium" style={{ color: "var(--color-text-secondary)" }}
              onClick={() => setMobileOpen(false)}>
              {link}
            </a>
          ))}
          <hr style={{ borderColor: "var(--color-border)" }} />
          {isAuthenticated ? (
            <>
              <a href="/dashboard" className="text-sm font-medium" style={{ color: "var(--color-text-secondary)" }}>Dashboard</a>
              <button onClick={handleLogout} className="text-sm font-medium text-left" style={{ color: "var(--color-primary)" }}>
                Logout
              </button>
            </>
          ) : (
            <>
              <a href="/login" className="text-sm font-medium" style={{ color: "var(--color-text-secondary)" }}>Login</a>
              <a href="/register"
                className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white text-center"
                style={{ background: "var(--color-primary)" }}>
                Register Restaurant
              </a>
            </>
          )}
        </motion.div>
      )}
    </motion.nav>
  );
}

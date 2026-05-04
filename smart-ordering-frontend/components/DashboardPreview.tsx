"use client";
/*
  DASHBOARDPREVIEW.TSX — Admin Dashboard UI Preview Section
  ============================================================
  PURPOSE: Show restaurant owners a preview of what their
  dashboard looks like — builds confidence and trust.

  WHAT'S SHOWN:
  - Today's orders count
  - Revenue
  - Pending orders
  - Top selling item
  - Order notification cards popping in
  - Stats count up from 0 using animation

  ANIMATIONS:
  - Dashboard card floats gently (subtle y movement)
  - Stats count up from 0 to their final value
  - Order notifications slide in with stagger
  ============================================================
*/

import { motion, useInView } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import { TrendingUp, Clock, CheckCircle, AlertCircle, QrCode } from "lucide-react";

// Counter hook — counts from 0 to target when element is in view
function useCountUp(target: number, duration = 1.5) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const steps = 60;
    const increment = target / steps;
    const interval = (duration * 1000) / steps;
    const timer = setInterval(() => {
      start += increment;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, interval);
    return () => clearInterval(timer);
  }, [inView, target, duration]);

  return { count, ref };
}

const statCards = [
  { label: "Orders Today", target: 47, suffix: "", icon: <TrendingUp size={16} />, color: "var(--color-primary)" },
  { label: "Revenue", target: 8240, prefix: "₹", suffix: "", icon: <TrendingUp size={16} />, color: "var(--color-accent-green)" },
  { label: "Pending", target: 5, suffix: "", icon: <Clock size={16} />, color: "#F43F5E" },
  { label: "Tables Active", target: 12, suffix: "", icon: <CheckCircle size={16} />, color: "var(--color-text-primary)" },
];

const liveOrders = [
  { table: "Table 3", item: "Biryani × 2, Lassi × 2", status: "Preparing", color: "var(--color-primary)", icon: <Clock size={12} /> },
  { table: "Table 7", item: "Paneer Masala, Naan × 3", status: "Ready", color: "var(--color-accent-green)", icon: <CheckCircle size={12} /> },
  { table: "Table 1", item: "Tandoori Platter", status: "New", color: "var(--color-primary)", icon: <AlertCircle size={12} /> },
];

function StatCard({ stat }: { stat: typeof statCards[0] }) {
  const { count, ref } = useCountUp(stat.target);
  return (
    <div ref={ref} className="p-4 rounded-xl bg-white" style={{ border: "1px solid var(--color-border)" }}>
      <div className="flex items-center gap-1.5 mb-2" style={{ color: stat.color }}>
        {stat.icon}
        <span className="text-xs font-medium" style={{ color: "var(--color-text-muted)" }}>{stat.label}</span>
      </div>
      <p className="text-2xl font-bold" style={{ color: stat.color }}>
        {stat.prefix}{count.toLocaleString()}{stat.suffix}
      </p>
    </div>
  );
}

export default function DashboardPreview() {
  return (
    <section id="demo" className="bg-white"
      style={{ padding: "8rem 1.5rem", borderTop: "1px solid var(--color-border)" }}>
      <div className="max-w-6xl w-full mx-auto" style={{ margin: "0 auto" }}>

        {/* Section Header */}
        <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.55 }} className="text-center"
          style={{ marginBottom: "4rem" }}>
          <p className="text-sm font-semibold uppercase tracking-widest mb-3" style={{ color: "var(--color-primary)" }}>
            Live Dashboard
          </p>
          <h2 className="text-3xl md:text-4xl font-bold"
            style={{ fontFamily: "'Playfair Display', serif", color: "var(--color-text-primary)" }}>
            Your Restaurant, <span className="gradient-text">All in One View</span>
          </h2>
          <p className="text-sm max-w-md mx-auto" style={{ color: "var(--color-text-secondary)", marginTop: "1rem" }}>
            Monitor orders, track revenue, and manage your menu from a single powerful dashboard.
          </p>
        </motion.div>

        {/* Dashboard Mockup */}
        <motion.div
          initial={{ opacity: 0, x: 40 }} whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.65 }}
          className="relative rounded-3xl overflow-hidden shadow-xl"
          style={{ border: "1px solid var(--color-border)", background: "var(--color-bg-card)" }}>

          {/* Dashboard Top Bar */}
          <div className="px-6 py-4 flex items-center justify-between bg-white"
            style={{ borderBottom: "1px solid var(--color-border)" }}>
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                style={{ background: "var(--color-soft-orange)" }}>
                <span className="text-xs">🍽️</span>
              </div>
              <span className="font-semibold text-sm" style={{ color: "var(--color-text-primary)" }}>TaybleTap — Dashboard</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-xs" style={{ color: "#22C55E" }}>Live</span>
            </div>
          </div>

          <div className="p-6 grid md:grid-cols-3 gap-6">

            {/* LEFT: Stats */}
            <div className="md:col-span-1 flex flex-col gap-4">
              <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--color-text-muted)" }}>
                Today&apos;s Overview
              </p>
              <div className="grid grid-cols-2 md:grid-cols-1 gap-3">
                {statCards.map((stat) => <StatCard key={stat.label} stat={stat} />)}
              </div>
            </div>

            {/* RIGHT: Live Orders + QR */}
            <div className="md:col-span-2 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--color-text-muted)" }}>Live Orders</p>
                <span className="text-xs px-2 py-0.5 rounded-full font-bold" style={{ background: "var(--color-soft-orange)", color: "var(--color-primary)" }}>
                  3 active
                </span>
              </div>

              {/* Order Cards */}
              <div className="flex flex-col gap-3">
                {liveOrders.map((order, i) => (
                  <motion.div key={order.table}
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 + i * 0.15, duration: 0.45 }}
                    className="flex items-center justify-between p-4 rounded-xl bg-white"
                    style={{ border: "1px solid var(--color-border)", boxShadow: "0 4px 10px rgba(0,0,0,0.02)" }}>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs"
                        style={{ background: "var(--color-soft-orange)", color: order.color }}>
                        {order.table.split(" ")[1]}
                      </div>
                      <div>
                        <p className="text-sm font-semibold" style={{ color: "var(--color-text-primary)" }}>{order.table}</p>
                        <p className="text-xs" style={{ color: "var(--color-text-secondary)" }}>{order.item}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold"
                      style={{ background: order.i === 1 ? "rgba(91,140,106,0.1)" : "var(--color-soft-orange)", color: order.color }}>
                      {order.icon} {order.status}
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* QR Code Generator Preview */}
              <motion.div
                initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.7 }}
                className="flex items-center gap-4 p-4 rounded-xl mt-1 bg-white"
                style={{ border: "1px solid var(--color-border)" }}>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: "var(--color-soft-orange)", color: "var(--color-primary)" }}>
                  <QrCode size={22} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold" style={{ color: "var(--color-text-primary)" }}>QR Code Generator</p>
                  <p className="text-xs" style={{ color: "var(--color-text-secondary)" }}>Generate and download QR codes for all your tables</p>
                </div>
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.96 }}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-white shadow-sm"
                  style={{ background: "var(--color-primary)" }}>
                  Generate
                </motion.button>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

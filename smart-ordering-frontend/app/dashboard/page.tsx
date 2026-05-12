"use client";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter, usePathname } from "next/navigation";

const PRIMARY = "#FF6B35";
const GREEN = "#22C55E";
const AMBER = "#F59E0B";
const RED = "#F43F5E";
const MUTED = "#9CA3AF";

function KpiCard({ label, value, prefix = "", suffix = "", color, icon, sub }: {
  label: string; value: number; prefix?: string; suffix?: string; color: string; icon: string; sub?: string;
}) {
  return (
    <div style={{
      background: "white",
      border: "1px solid #F0EDE8",
      borderRadius: 16,
      padding: "20px 22px",
      display: "flex",
      flexDirection: "column",
      gap: 12,
      flex: 1,
      minWidth: 140,
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <span style={{ fontSize: 22 }}>{icon}</span>
        {sub && (
          <span style={{ fontSize: 11, fontWeight: 600, color: GREEN, background: "rgba(34,197,94,0.1)", padding: "2px 8px", borderRadius: 20 }}>
            {sub}
          </span>
        )}
      </div>
      <div>
        <p style={{ fontSize: 28, fontWeight: 700, color, margin: 0, lineHeight: 1.1, fontFamily: "'Playfair Display', serif" }}>
          {prefix}{value.toLocaleString()}{suffix}
        </p>
        <p style={{ fontSize: 12, color: MUTED, margin: "4px 0 0", fontWeight: 500 }}>{label}</p>
      </div>
    </div>
  );
}

const orders = [
  { id: "#0051", table: "Table 4", items: "Butter Chicken × 2, Naan × 4, Lassi × 2", amount: 890, status: "Preparing", time: "Just now" },
  { id: "#0050", table: "Table 8", items: "Veg Biryani, Raita, Papad", amount: 320, status: "Ready", time: "1m ago" },
  { id: "#0049", table: "Table 2", items: "Paneer Tikka, Garlic Naan × 2", amount: 480, status: "Ready", time: "3m ago" },
  { id: "#0048", table: "Table 6", items: "Mushroom Fried Rice, Clear Soup × 2", amount: 340, status: "Preparing", time: "5m ago" },
  { id: "#0047", table: "Table 3", items: "Chicken Biryani × 2, Lassi × 2", amount: 620, status: "Preparing", time: "8m ago" },
  { id: "#0046", table: "Table 7", items: "Paneer Butter Masala, Garlic Naan × 3", amount: 400, status: "Ready", time: "12m ago" },
  { id: "#0045", table: "Table 1", items: "Tandoori Platter, Cold Coffee", amount: 510, status: "Delivered", time: "18m ago" },
  { id: "#0044", table: "Table 5", items: "Dal Makhani, Jeera Rice, Naan", amount: 340, status: "Delivered", time: "25m ago" },
  { id: "#0043", table: "Table 9", items: "Gulab Jamun × 3, Masala Chai × 2", amount: 190, status: "Pending", time: "32m ago" },
  { id: "#0042", table: "Table 2", items: "Veg Thali", amount: 220, status: "Delivered", time: "40m ago" },
  { id: "#0041", table: "Table 10", items: "Chicken Fried Rice, Manchurian × 2", amount: 380, status: "Delivered", time: "48m ago" },
  { id: "#0040", table: "Table 11", items: "Samosa × 4, Coffee × 2", amount: 160, status: "Delivered", time: "55m ago" },
  { id: "#0039", table: "Table 4", items: "Malai Kofta, Kulcha × 2", amount: 420, status: "Delivered", time: "1h ago" },
  { id: "#0038", table: "Table 8", items: "Egg Curry, Rice, Salad", amount: 280, status: "Delivered", time: "1h ago" },
  { id: "#0037", table: "Table 12", items: "Dosa × 2, Sambar, Chutney", amount: 200, status: "Delivered", time: "1h ago" },
  { id: "#0036", table: "Table 1", items: "Chicken 65, Pepper Chicken", amount: 560, status: "Delivered", time: "2h ago" },
  { id: "#0035", table: "Table 6", items: "Idli × 6, Vada × 2", amount: 180, status: "Delivered", time: "2h ago" },
  { id: "#0034", table: "Table 3", items: "Biryani × 2, Mirchi Ka Salan", amount: 440, status: "Delivered", time: "2h ago" },
  { id: "#0033", table: "Table 7", items: "Fish Curry, Coconut Rice", amount: 520, status: "Delivered", time: "3h ago" },
  { id: "#0032", table: "Table 9", items: "Aloo Paratha × 2, Curd, Pickle", amount: 240, status: "Delivered", time: "3h ago" },
];

const statusConfig: Record<string, { bg: string; color: string; dot: string }> = {
  Pending:   { bg: "rgba(245,158,11,0.12)",  color: AMBER,   dot: AMBER },
  Preparing:  { bg: "rgba(255,107,53,0.12)",  color: PRIMARY, dot: PRIMARY },
  Ready:      { bg: "rgba(34,197,94,0.12)",  color: GREEN,   dot: GREEN },
  Delivered:  { bg: "rgba(156,163,175,0.12)", color: "#6B7280", dot: "#9CA3AF" },
};

const navItems = [
  { icon: "⊞", label: "Dashboard",   href: "/dashboard" },
  { icon: "🧾", label: "Live Orders", href: "/orders" },
  { icon: "🍽️", label: "Menu",        href: "/menu" },
  { icon: "📊", label: "Analytics",  href: "/analytics" },
  { icon: "⬛", label: "QR Codes",    href: "/qr" },
  { icon: "⚙️", label: "Settings",    href: "/settings" },
];

const notifications = [
  { text: "New order — Table 3", sub: "Chicken Biryani × 2", time: "Just now", dot: PRIMARY },
  { text: "Table 7 order ready", sub: "Paneer Butter Masala", time: "5m ago",  dot: GREEN },
  { text: "Table 9 pending >15m", sub: "Gulab Jamun × 3",   time: "22m ago", dot: AMBER },
];

export default function AdminDashboard() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [notifOpen, setNotifOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState("All");

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    }
  }, [isLoading, user, router]);

  const statuses = ["All", "Pending", "Preparing", "Ready", "Delivered"];
  const filtered = filterStatus === "All" ? orders : orders.filter(o => o.status === filterStatus);

  const topItem = "Chicken Biryani";
  const topCount = 24;
  const pendingCount = orders.filter(o => o.status === "Pending" || o.status === "Preparing").length;
  const completedCount = orders.filter(o => o.status === "Delivered").length;
  const todayRevenue = orders.reduce((sum, o) => sum + o.amount, 0);
  const readyCount = orders.filter(o => o.status === "Ready").length;

  if (isLoading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", background: "#FFFDF8" }}>
        <p style={{ color: MUTED, fontSize: 14 }}>Loading...</p>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div style={{
      display: "flex",
      minHeight: "100vh",
      background: "#FFFDF8",
      fontFamily: "'DM Sans', 'Inter', sans-serif",
    }}>

      {/* ── Sidebar ── */}
      <aside style={{
        width: 220,
        background: "white",
        borderRight: "1px solid #F0EDE8",
        display: "flex",
        flexDirection: "column",
        padding: "24px 0",
        flexShrink: 0,
      }}>
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "0 20px 28px" }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: PRIMARY, display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <span style={{ fontSize: 18 }}>🍽️</span>
          </div>
          <div>
            <p style={{ margin: 0, fontWeight: 700, fontSize: 15, color: "#1A1A1A", fontFamily: "'Playfair Display', serif" }}>MenuQR</p>
            <p style={{ margin: 0, fontSize: 10, color: MUTED, fontWeight: 500 }}>Admin Panel</p>
          </div>
        </div>

        {/* Nav Items */}
        <nav style={{ flex: 1 }}>
          {navItems.map(item => {
            const isActive = pathname === item.href;
            return (
              <button
                key={item.label}
                onClick={() => router.push(item.href)}
                style={{
                  width: "100%", display: "flex", alignItems: "center", gap: 10,
                  padding: "11px 20px", border: "none", cursor: "pointer",
                  background: isActive ? "rgba(255,107,53,0.08)" : "transparent",
                  borderLeft: isActive ? `3px solid ${PRIMARY}` : "3px solid transparent",
                  color: isActive ? PRIMARY : "#6B7280",
                  fontWeight: isActive ? 600 : 400,
                  fontSize: 13.5,
                  transition: "all 0.15s",
                  textAlign: "left",
                }}
              >
                <span style={{ fontSize: 16 }}>{item.icon}</span>
                {item.label}
                {item.label === "Live Orders" && (
                  <span style={{
                    marginLeft: "auto", fontSize: 10, fontWeight: 700,
                    background: PRIMARY, color: "white",
                    borderRadius: 10, padding: "1px 6px",
                  }}>{pendingCount}</span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Restaurant Info */}
        <div style={{
          margin: "0 14px",
          padding: "12px 14px",
          background: "rgba(255,107,53,0.06)",
          borderRadius: 12,
          border: "1px solid rgba(255,107,53,0.12)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 22 }}>🏪</span>
            <div>
              <p style={{ margin: 0, fontWeight: 600, fontSize: 12, color: "#1A1A1A" }}>
                {user.restaurant_name || "My Restaurant"}
              </p>
              <p style={{ margin: 0, fontSize: 11, color: MUTED }}>{user.city || "Bengaluru"}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* ── Main Content ── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>

        {/* ── Header ── */}
        <header style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "18px 28px",
          background: "white",
          borderBottom: "1px solid #F0EDE8",
          position: "sticky", top: 0, zIndex: 10,
        }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: "#1A1A1A", fontFamily: "'Playfair Display', serif" }}>
              Dashboard
            </h1>
            <p style={{ margin: "2px 0 0", fontSize: 12, color: MUTED }}>
              Tuesday, 13 May 2025 · Live
              <span style={{ display: "inline-block", width: 7, height: 7, borderRadius: "50%", background: GREEN, marginLeft: 6, verticalAlign: "middle" }} />
            </p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            {/* Notification Bell */}
            <div style={{ position: "relative" }}>
              <button
                onClick={() => setNotifOpen(!notifOpen)}
                style={{
                  width: 38, height: 38, borderRadius: 10,
                  border: "1px solid #F0EDE8",
                  background: notifOpen ? "rgba(255,107,53,0.08)" : "white",
                  cursor: "pointer", fontSize: 18,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  position: "relative",
                }}
              >
                🔔
                <span style={{
                  position: "absolute", top: -3, right: -3,
                  width: 16, height: 16, borderRadius: "50%",
                  background: PRIMARY, color: "white",
                  fontSize: 9, fontWeight: 700,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  border: "2px solid white",
                }}>{pendingCount}</span>
              </button>

              {notifOpen && (
                <div style={{
                  position: "absolute", top: 46, right: 0,
                  width: 290, background: "white",
                  border: "1px solid #F0EDE8", borderRadius: 14,
                  boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
                  zIndex: 100, overflow: "hidden",
                }}>
                  <div style={{ padding: "12px 16px 10px", borderBottom: "1px solid #F0EDE8", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <p style={{ margin: 0, fontWeight: 600, fontSize: 13, color: "#1A1A1A" }}>Notifications</p>
                    <button onClick={() => setNotifOpen(false)} style={{ background: "none", border: "none", cursor: "pointer", color: MUTED, fontSize: 16 }}>×</button>
                  </div>
                  {notifications.map((n, i) => (
                    <div key={i} style={{
                      padding: "10px 16px",
                      borderBottom: i < notifications.length - 1 ? "1px solid #F0EDE8" : "none",
                      display: "flex", gap: 10, alignItems: "flex-start",
                    }}>
                      <span style={{ width: 8, height: 8, borderRadius: "50%", background: n.dot, marginTop: 5, flexShrink: 0 }} />
                      <div style={{ flex: 1 }}>
                        <p style={{ margin: 0, fontSize: 12, fontWeight: 600, color: "#1A1A1A" }}>{n.text}</p>
                        <p style={{ margin: "1px 0 0", fontSize: 11, color: MUTED }}>{n.sub}</p>
                      </div>
                      <span style={{ fontSize: 10, color: MUTED, flexShrink: 0 }}>{n.time}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Avatar */}
            <div style={{
              width: 36, height: 36, borderRadius: "50%",
              background: "linear-gradient(135deg, #FF6B35, #FFC947)",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "white", fontWeight: 700, fontSize: 14,
            }}>{user.name?.charAt(0).toUpperCase()}</div>
          </div>
        </header>

        {/* ── Page Body ── */}
        <main style={{ flex: 1, padding: "28px", overflowY: "auto" }}>

          {/* KPI Cards */}
          <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 24 }}>
            <KpiCard label="Orders Today"      value={orders.length}      icon="🧾" color="#1A1A1A" sub={`${pendingCount} active`} />
            <KpiCard label="Revenue Today"    value={todayRevenue} prefix="₹" icon="💰" color={PRIMARY} sub={`${readyCount} ready`} />
            <KpiCard label="Pending / Active" value={pendingCount}        icon="⏳" color={AMBER} sub="Need attention" />
            <KpiCard label="Completed Orders" value={completedCount}      icon="✅" color={GREEN} sub="100% served" />
          </div>

          {/* Top Selling + Quick Actions Row */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 24 }}>

            {/* Top-Selling Item */}
            <div style={{
              background: "white", borderRadius: 16, border: "1px solid #F0EDE8",
              padding: "20px 22px",
            }}>
              <p style={{ margin: "0 0 14px", fontSize: 11, fontWeight: 600, color: MUTED, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                🔥 Top-Selling Item
              </p>
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <div style={{
                  width: 56, height: 56, borderRadius: 14,
                  background: "rgba(255,107,53,0.1)",
                  display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28,
                }}>🍚</div>
                <div>
                  <p style={{ margin: 0, fontWeight: 700, fontSize: 16, color: "#1A1A1A", fontFamily: "'Playfair Display', serif" }}>
                    {topItem}
                  </p>
                  <p style={{ margin: "3px 0 0", fontSize: 12, color: MUTED }}>
                    Ordered <strong style={{ color: PRIMARY }}>{topCount} times</strong> today
                  </p>
                </div>
              </div>
              <div style={{ marginTop: 16, height: 6, background: "#F0EDE8", borderRadius: 99 }}>
                <div style={{ height: "100%", width: "82%", background: `linear-gradient(90deg, ${PRIMARY}, #FFC947)`, borderRadius: 99 }} />
              </div>
              <p style={{ margin: "6px 0 0", fontSize: 11, color: MUTED }}>82% of today's orders include it</p>
            </div>

            {/* Quick Actions */}
            <div style={{
              background: "white", borderRadius: 16, border: "1px solid #F0EDE8",
              padding: "20px 22px",
            }}>
              <p style={{ margin: "0 0 14px", fontSize: 11, fontWeight: 600, color: MUTED, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                Quick Actions
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                {[
                  { icon: "➕", label: "Add Menu Item",    color: PRIMARY },
                  { icon: "📋", label: "View Live Orders", color: "#3B82F6" },
                  { icon: "⬛", label: "Generate QR",       color: "#8B5CF6" },
                  { icon: "📊", label: "View Analytics",    color: GREEN },
                ].map(({ icon, label, color }) => (
                  <button
                    key={label}
                    style={{
                      padding: "11px 10px",
                      borderRadius: 12,
                      border: `1px solid ${color}25`,
                      background: `${color}08`,
                      cursor: "pointer",
                      display: "flex", alignItems: "center", gap: 8,
                      fontSize: 12, fontWeight: 600, color,
                      transition: "all 0.15s",
                    }}
                    onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = `${color}15`; (e.currentTarget as HTMLButtonElement).style.transform = "scale(1.02)"; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = `${color}08`; (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)"; }}
                  >
                    <span style={{ fontSize: 16 }}>{icon}</span>
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Orders Table */}
          <div style={{
            background: "white", borderRadius: 16, border: "1px solid #F0EDE8",
            padding: "20px 22px",
          }}>
            {/* Table Header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, flexWrap: "wrap", gap: 12 }}>
              <p style={{ margin: 0, fontWeight: 700, fontSize: 15, color: "#1A1A1A", fontFamily: "'Playfair Display', serif" }}>
                Recent Orders
              </p>
              <div style={{ display: "flex", gap: 6 }}>
                {statuses.map(s => (
                  <button
                    key={s}
                    onClick={() => setFilterStatus(s)}
                    style={{
                      padding: "5px 12px", borderRadius: 20,
                      border: filterStatus === s ? `1px solid ${PRIMARY}` : "1px solid #F0EDE8",
                      background: filterStatus === s ? `${PRIMARY}12` : "white",
                      color: filterStatus === s ? PRIMARY : "#6B7280",
                      fontSize: 11, fontWeight: 600, cursor: "pointer",
                      transition: "all 0.15s",
                    }}
                  >{s}</button>
                ))}
              </div>
            </div>

            {/* Table */}
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #F0EDE8" }}>
                  {["Order ID", "Table", "Items", "Amount", "Status", "Time"].map(h => (
                    <th key={h} style={{
                      textAlign: "left", padding: "8px 10px",
                      fontSize: 11, fontWeight: 600, color: MUTED,
                      textTransform: "uppercase", letterSpacing: "0.07em",
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((order, i) => {
                  const sc = statusConfig[order.status];
                  return (
                    <tr
                      key={order.id}
                      style={{
                        borderBottom: i < filtered.length - 1 ? "1px solid #F0EDE8" : "none",
                        transition: "background 0.12s",
                      }}
                      onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "#FFFDF8"}
                      onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "transparent"}
                    >
                      <td style={{ padding: "12px 10px", fontWeight: 700, color: "#1A1A1A" }}>{order.id}</td>
                      <td style={{ padding: "12px 10px" }}>
                        <span style={{
                          background: "rgba(255,107,53,0.08)", color: PRIMARY,
                          padding: "3px 10px", borderRadius: 20, fontWeight: 600, fontSize: 12,
                        }}>{order.table}</span>
                      </td>
                      <td style={{ padding: "12px 10px", color: "#4B5563", maxWidth: 220, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {order.items}
                      </td>
                      <td style={{ padding: "12px 10px", fontWeight: 700, color: "#1A1A1A" }}>
                        ₹{order.amount}
                      </td>
                      <td style={{ padding: "12px 10px" }}>
                        <span style={{
                          display: "inline-flex", alignItems: "center", gap: 5,
                          background: sc.bg, color: sc.color,
                          padding: "4px 10px", borderRadius: 20, fontWeight: 600, fontSize: 12,
                        }}>
                          <span style={{ width: 6, height: 6, borderRadius: "50%", background: sc.dot, flexShrink: 0 }} />
                          {order.status}
                        </span>
                      </td>
                      <td style={{ padding: "12px 10px", color: MUTED, fontSize: 12 }}>{order.time}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {filtered.length === 0 && (
              <p style={{ textAlign: "center", color: MUTED, padding: "24px 0", fontSize: 13 }}>
                No orders with status &quot;{filterStatus}&quot;
              </p>
            )}

            {/* Footer */}
            <div style={{
              marginTop: 16, paddingTop: 14,
              borderTop: "1px solid #F0EDE8",
              display: "flex", justifyContent: "space-between", alignItems: "center",
            }}>
              <p style={{ margin: 0, fontSize: 12, color: MUTED }}>
                Showing {filtered.length} of {orders.length} orders
              </p>
              <button style={{
                padding: "7px 18px", borderRadius: 10,
                border: `1px solid ${PRIMARY}30`,
                background: `${PRIMARY}08`,
                color: PRIMARY, fontWeight: 600, fontSize: 12, cursor: "pointer",
              }}>
                View All Orders →
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
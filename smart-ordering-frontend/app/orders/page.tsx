"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import AdminLayout from "@/components/AdminLayout";

const PRIMARY = "#E8602E";
const GREEN = "#1A9E6B";
const SOFT_BG = "#FEF5EF";
const BORDER = "#F2E8E0";
const TEXT_PRIMARY = "#1A1A1A";
const TEXT_MUTED = "#9B8B80";
const RED = "#E53E3E";
const BLUE = "#2563EB";
const AMBER = "#D97706";
const PURPLE = "#7C3AED";

const STATUS_CONFIG: Record<string, { color: string; bg: string; dot: string; label: string }> = {
  Pending:    { color: AMBER,   bg: "rgba(217,119,6,0.1)",   dot: AMBER,   label: "Pending"    },
  Accepted:   { color: BLUE,    bg: "rgba(37,99,235,0.1)",   dot: BLUE,    label: "Accepted"   },
  Preparing:  { color: PRIMARY, bg: "rgba(232,96,46,0.1)",   dot: PRIMARY, label: "Preparing"  },
  Completed:  { color: GREEN,   bg: "rgba(26,158,107,0.1)",  dot: GREEN,   label: "Completed"  },
  Cancelled:  { color: RED,     bg: "rgba(229,62,62,0.1)",   dot: RED,     label: "Cancelled"  },
};

const STATUS_FLOW = ["Pending", "Accepted", "Preparing", "Completed"];

function total(order: { items: { price: number; qty: number }[] }) {
  return order.items.reduce((s, i) => s + i.price * i.qty, 0);
}

function StatusPill({ status }: { status: string }) {
  const c = STATUS_CONFIG[status] || { color: TEXT_MUTED, bg: "#f0f0f0", dot: TEXT_MUTED, label: status };
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      padding: "4px 12px", borderRadius: 20,
      background: c.bg, color: c.color,
      fontSize: 11, fontWeight: 700, letterSpacing: "0.04em",
    }}>
      <span style={{
        width: 6, height: 6, borderRadius: "50%", background: c.color, flexShrink: 0,
        animation: (status === "Preparing" || status === "Pending") ? "pulse 1.5s infinite" : "none",
      }} />
      {c.label}
    </span>
  );
}

function formatTime(isoDate: string): string {
  if (!isoDate) return "Just now";
  try {
    const created = new Date(isoDate);
    const now = new Date();
    const diffMs = Math.floor((now.getTime() - created.getTime()) / 1000);
    if (diffMs < 60) return "Just now";
    const mins = Math.floor(diffMs / 60);
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  } catch {
    return "Just now";
  }
}

interface OrderItem {
  name: string;
  qty: number;
  price: number;
}

interface Order {
  id: string;
  orderId: string;
  table: number;
  status: string;
  items: OrderItem[];
  total: number;
  createdAt: string;
  updatedAt: string;
}

const MOCK_ORDERS: Order[] = [
  {
    id: "mock001", orderId: "#0051", table: 4, status: "Pending",
    items: [
      { name: "Chicken Biryani", qty: 2, price: 280 },
      { name: "Lassi", qty: 2, price: 90 },
    ],
    total: 740, createdAt: new Date(Date.now() - 2 * 60000).toISOString(), updatedAt: new Date().toISOString(),
  },
  {
    id: "mock002", orderId: "#0050", table: 7, status: "Accepted",
    items: [
      { name: "Paneer Butter Masala", qty: 1, price: 220 },
      { name: "Garlic Naan", qty: 3, price: 60 },
    ],
    total: 400, createdAt: new Date(Date.now() - 5 * 60000).toISOString(), updatedAt: new Date().toISOString(),
  },
  {
    id: "mock003", orderId: "#0049", table: 2, status: "Preparing",
    items: [
      { name: "Tandoori Platter", qty: 1, price: 380 },
      { name: "Cold Coffee", qty: 2, price: 110 },
    ],
    total: 600, createdAt: new Date(Date.now() - 9 * 60000).toISOString(), updatedAt: new Date().toISOString(),
  },
  {
    id: "mock004", orderId: "#0048", table: 5, status: "Preparing",
    items: [
      { name: "Dal Makhani", qty: 1, price: 180 },
      { name: "Jeera Rice", qty: 2, price: 120 },
      { name: "Naan", qty: 2, price: 50 },
    ],
    total: 520, createdAt: new Date(Date.now() - 14 * 60000).toISOString(), updatedAt: new Date().toISOString(),
  },
  {
    id: "mock005", orderId: "#0047", table: 9, status: "Completed",
    items: [
      { name: "Gulab Jamun", qty: 3, price: 80 },
      { name: "Masala Chai", qty: 2, price: 40 },
    ],
    total: 320, createdAt: new Date(Date.now() - 20 * 60000).toISOString(), updatedAt: new Date().toISOString(),
  },
  {
    id: "mock006", orderId: "#0046", table: 1, status: "Completed",
    items: [
      { name: "Veg Thali", qty: 2, price: 220 },
    ],
    total: 440, createdAt: new Date(Date.now() - 28 * 60000).toISOString(), updatedAt: new Date().toISOString(),
  },
  {
    id: "mock007", orderId: "#0045", table: 3, status: "Cancelled",
    items: [
      { name: "Mutton Biryani", qty: 1, price: 340 },
      { name: "Raita", qty: 1, price: 60 },
    ],
    total: 400, createdAt: new Date(Date.now() - 35 * 60000).toISOString(), updatedAt: new Date().toISOString(),
  },
];

function ActionButtons({ order, onAction }: { order: Order; onAction: (id: string, status: string) => void }) {
  const s = order.status;
  if (s === "Completed" || s === "Cancelled") {
    return (
      <span style={{ fontSize: 11, color: TEXT_MUTED, fontStyle: "italic" }}>
        {s === "Completed" ? "✓ Order fulfilled" : "✕ Cancelled"}
      </span>
    );
  }

  const btn = (label: string, color: string, bg: string, border: string, action: string, icon: string) => (
    <button key={label} onClick={() => onAction(order.id, action)} style={{
      padding: "7px 14px", borderRadius: 10,
      border: `1px solid ${border}`, background: bg,
      fontSize: 12, fontWeight: 700, color, cursor: "pointer",
      display: "flex", alignItems: "center", gap: 5,
      transition: "all 0.13s", whiteSpace: "nowrap",
    }}
      onMouseEnter={e => (e.currentTarget.style.opacity = "0.8")}
      onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
    >{icon} {label}</button>
  );

  return (
    <div style={{ display: "flex", gap: 7, flexWrap: "wrap", alignItems: "center" }}>
      {s === "Pending" && <>
        {btn("Accept",  BLUE, "rgba(37,99,235,0.08)", "rgba(37,99,235,0.25)", "Accepted",  "✓")}
        {btn("Cancel",  RED,  "rgba(229,62,62,0.06)", "rgba(229,62,62,0.2)",  "Cancelled", "✕")}
      </>}
      {s === "Accepted" && <>
        {btn("Mark Preparing", PRIMARY, SOFT_BG, "rgba(232,96,46,0.3)", "Preparing", "🍳")}
        {btn("Cancel", RED, "rgba(229,62,62,0.06)", "rgba(229,62,62,0.2)", "Cancelled", "✕")}
      </>}
      {s === "Preparing" && <>
        {btn("Mark Completed", GREEN, "rgba(26,158,107,0.08)", "rgba(26,158,107,0.3)", "Completed", "✓")}
        {btn("Cancel", RED, "rgba(229,62,62,0.06)", "rgba(229,62,62,0.2)", "Cancelled", "✕")}
      </>}
    </div>
  );
}

function OrderCard({ order, onAction, expanded, onToggle }: {
  order: Order; onAction: (id: string, status: string) => void; expanded: boolean; onToggle: () => void;
}) {
  const c = STATUS_CONFIG[order.status] || { color: TEXT_MUTED, bg: "#f0f0f0", dot: TEXT_MUTED, label: order.status };
  const amt = total(order);
  const time = formatTime(order.createdAt);

  return (
    <div style={{
      background: "white", borderRadius: 16,
      border: `1px solid ${expanded ? c.color + "40" : BORDER}`,
      overflow: "hidden",
      boxShadow: expanded ? `0 4px 20px ${c.color}12` : "none",
      transition: "border-color 0.2s, box-shadow 0.2s",
    }}>
      <div
        onClick={onToggle}
        style={{
          display: "flex", alignItems: "center", gap: 14,
          padding: "16px 20px", cursor: "pointer",
          background: expanded ? c.bg.replace("0.1", "0.04") : "white",
        }}
      >
        <div style={{ display: "flex", gap: 16, alignItems: "center", minWidth: 0 }}>
          <div style={{ width: 56, display: "flex", flexDirection: "column", gap: 6 }}>
            <div style={{ fontWeight: 800, fontSize: 14 }}>{order.orderId}</div>
            <div style={{ fontSize: 12, color: TEXT_MUTED }}>{time}</div>
          </div>

          <div style={{ display: "flex", gap: 18, alignItems: "center", minWidth: 0 }}>
            {[
              { label: "Items", value: `${order.items.reduce((s, i) => s + i.qty, 0)} items` },
              { label: "Table", value: `Table ${order.table}` },
              { label: "Total", value: `₹${amt}` },
            ].map(({ label, value }) => (
              <div key={label} style={{ minWidth: 0 }}>
                <p style={{ margin: 0, fontSize: 10, fontWeight: 700, color: TEXT_MUTED, textTransform: "uppercase", letterSpacing: "0.08em" }}>{label}</p>
                <p style={{ margin: "2px 0 0", fontSize: 13, fontWeight: 600, color: TEXT_PRIMARY }}>{value}</p>
              </div>
            ))}
          </div>
        </div>

        <div style={{ marginLeft: "auto", display: "flex", gap: 8, alignItems: "center" }}>
          <StatusPill status={order.status} />
        </div>
      </div>

      {expanded && (
        <div style={{ padding: "14px 20px", borderTop: `1px solid ${BORDER}`, background: "#FFFDF8" }}>
          <div style={{ display: "flex", gap: 12, flexDirection: "column" }}>
            {order.items.map((it, idx) => (
              <div key={idx} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ fontSize: 13, color: TEXT_PRIMARY }}>{it.name} ×{it.qty}</div>
                <div style={{ fontSize: 13, fontWeight: 700 }}>₹{it.price * it.qty}</div>
              </div>
            ))}
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8, borderTop: `1px solid ${BORDER}`, paddingTop: 8 }}>
              <div style={{ fontSize: 13, color: TEXT_MUTED }}>Total</div>
              <div style={{ fontSize: 14, fontWeight: 800 }}>₹{amt}</div>
            </div>
            <div style={{ marginTop: 12 }}>
              <ActionButtons order={order} onAction={onAction} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const TABS = ["All", "Pending", "Accepted", "Preparing", "Completed", "Cancelled"];

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function LiveOrders() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeTab, setActiveTab] = useState("All");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"cards" | "table">("cards");
  const [notifOpen, setNotifOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    }
  }, [isLoading, user, router]);

  // Fetch orders from API
  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user]);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/api/orders/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders || []);
      } else {
        setOrders(MOCK_ORDERS);
      }
    } catch {
      setOrders(MOCK_ORDERS);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id: string, newStatus: string) => {
    // Optimistic update
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status: newStatus } : o));

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/api/orders/${id}/status/`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) {
        // Revert on failure
        fetchOrders();
      }
    } catch {
      fetchOrders();
    }
  };

  const filtered = activeTab === "All" ? orders : orders.filter(o => o.status === activeTab);

  const counts = TABS.reduce((acc, tab) => {
    acc[tab] = tab === "All" ? orders.length : orders.filter(o => o.status === tab).length;
    return acc;
  }, {} as Record<string, number>);

  const pending = orders.filter(o => o.status === "Pending").length;
  const preparing = orders.filter(o => o.status === "Preparing").length;
  const revenue = orders.filter(o => o.status === "Completed").reduce((s, o) => s + o.total, 0);

  if (isLoading || !user) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", background: "#FFFDF8" }}>
        <p style={{ color: TEXT_MUTED, fontSize: 14 }}>Loading...</p>
      </div>
    );
  }

  return (
    <AdminLayout activeCount={pending}>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.35; }
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* ── Header ── */}
      <header style={{
        background: "white", borderBottom: `1px solid ${BORDER}`,
        padding: "0 28px", height: 58,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        position: "sticky", top: 0, zIndex: 50,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 34, height: 34, borderRadius: 10, background: PRIMARY, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>🍽️</div>
          <div>
            <p style={{ margin: 0, fontWeight: 700, fontSize: 14, color: TEXT_PRIMARY }}>
              {user.restaurant_name || "TaybleTap"} — Live Orders
            </p>
            <p style={{ margin: 0, fontSize: 11, color: TEXT_MUTED }}>Real-time order management</p>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          {/* Live badge */}
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: GREEN, display: "inline-block", animation: "pulse 1.5s infinite" }} />
            <span style={{ fontSize: 13, fontWeight: 600, color: GREEN }}>Live</span>
          </div>

          {/* Bell */}
          <div style={{ position: "relative" }}>
            <button onClick={() => setNotifOpen(!notifOpen)} style={{
              width: 34, height: 34, borderRadius: 9, border: `1px solid ${BORDER}`,
              background: "white", cursor: "pointer", fontSize: 16,
              display: "flex", alignItems: "center", justifyContent: "center", position: "relative",
            }}>
              🔔
              {pending > 0 && (
                <span style={{
                  position: "absolute", top: -4, right: -4,
                  width: 16, height: 16, borderRadius: "50%",
                  background: PRIMARY, color: "white", fontSize: 9, fontWeight: 800,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  border: "2px solid white",
                }}>{pending}</span>
              )}
            </button>
            {notifOpen && (
              <div style={{
                position: "absolute", top: 42, right: 0, width: 280,
                background: "white", border: `1px solid ${BORDER}`,
                borderRadius: 14, boxShadow: "0 8px 24px rgba(0,0,0,0.09)",
                zIndex: 999, overflow: "hidden",
              }}>
                <div style={{ padding: "12px 16px 10px", borderBottom: `1px solid ${BORDER}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontWeight: 700, fontSize: 13, color: TEXT_PRIMARY }}>Pending Orders</span>
                  <button onClick={() => setNotifOpen(false)} style={{ background: "none", border: "none", cursor: "pointer", color: TEXT_MUTED, fontSize: 18 }}>×</button>
                </div>
                {orders.filter(o => o.status === "Pending").map((o, i, arr) => (
                  <div key={o.id} style={{
                    padding: "10px 16px",
                    borderBottom: i < arr.length - 1 ? `1px solid ${BORDER}` : "none",
                    display: "flex", gap: 10, alignItems: "center",
                  }}>
                    <span style={{ width: 7, height: 7, borderRadius: "50%", background: AMBER, flexShrink: 0, animation: "pulse 1.5s infinite" }} />
                    <div style={{ flex: 1 }}>
                      <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: TEXT_PRIMARY }}>{o.orderId} · Table {o.table}</p>
                      <p style={{ margin: 0, fontSize: 11, color: TEXT_MUTED }}>{o.items[0]?.name}{o.items.length > 1 ? ` +${o.items.length - 1} more` : ""}</p>
                    </div>
                    <span style={{ fontSize: 10, color: TEXT_MUTED }}>{formatTime(o.createdAt)}</span>
                  </div>
                ))}
                {orders.filter(o => o.status === "Pending").length === 0 && (
                  <p style={{ textAlign: "center", padding: "18px 0", fontSize: 13, color: TEXT_MUTED }}>No pending orders 🎉</p>
                )}
              </div>
            )}
          </div>

          {/* Avatar */}
          <div style={{
            width: 32, height: 32, borderRadius: "50%",
            background: `linear-gradient(135deg, ${PRIMARY}, #FFC947)`,
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "white", fontWeight: 700, fontSize: 12,
          }}>{user.name?.charAt(0).toUpperCase() || "U"}</div>
        </div>
      </header>

      <main style={{ flex: 1, padding: "24px 28px", overflowY: "auto" }}>
        {/* ── KPI Strip ── */}
        <div style={{ display: "flex", gap: 12, marginBottom: 24, flexWrap: "wrap" }}>
          {([
            { label: "Total Orders", value: orders.length, color: TEXT_PRIMARY, icon: "🧾" },
            { label: "Pending",       value: pending, color: AMBER, icon: "⏳" },
            { label: "Preparing",     value: preparing, color: PRIMARY, icon: "🍳" },
            { label: "Completed",    value: orders.filter(o => o.status === "Completed").length, color: GREEN, icon: "✅" },
            { label: "Revenue Today", value: `₹${revenue.toLocaleString()}`, color: GREEN, icon: "💰" },
          ] as { label: string; value: string | number; color: string; icon: string }[]).map(({ label, value, color, icon }) => (
            <div key={label} style={{
              background: "white", border: `1px solid ${BORDER}`, borderRadius: 14,
              padding: "14px 18px", flex: 1, minWidth: 120,
            }}>
              <span style={{ fontSize: 20 }}>{icon}</span>
              <p style={{ margin: "6px 0 2px", fontSize: 22, fontWeight: 800, color, fontFamily: "'Playfair Display', serif" }}>{value}</p>
              <p style={{ margin: 0, fontSize: 11, color: TEXT_MUTED, fontWeight: 500 }}>{label}</p>
            </div>
          ))}
        </div>

        {/* ── Tab Bar + View Toggle ── */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18, gap: 12, flexWrap: "wrap" }}>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {TABS.map(tab => {
              const active = activeTab === tab;
              const c = STATUS_CONFIG[tab] || {};
              return (
                <button key={tab} onClick={() => setActiveTab(tab)} style={{
                  padding: "7px 14px", borderRadius: 20, cursor: "pointer",
                  border: active ? `1px solid ${c.color || PRIMARY}` : `1px solid ${BORDER}`,
                  background: active ? (c.bg || SOFT_BG) : "white",
                  color: active ? (c.color || PRIMARY) : TEXT_MUTED,
                  fontSize: 12, fontWeight: active ? 700 : 500,
                  transition: "all 0.15s",
                  display: "flex", alignItems: "center", gap: 6,
                }}>
                  {tab}
                  {counts[tab] > 0 && (
                    <span style={{
                      width: 18, height: 18, borderRadius: "50%", fontSize: 10, fontWeight: 800,
                      background: active ? (c.color || PRIMARY) : "#E5E7EB",
                      color: active ? "white" : TEXT_MUTED,
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>{counts[tab]}</span>
                  )}
                </button>
              );
            })}
          </div>

          {/* View toggle */}
          <div style={{ display: "flex", background: "white", border: `1px solid ${BORDER}`, borderRadius: 10, overflow: "hidden" }}>
            {(["cards", "table"] as const).map(v => (
              <button key={v} onClick={() => setViewMode(v)} style={{
                width: 36, height: 36, border: "none", cursor: "pointer",
                background: viewMode === v ? SOFT_BG : "white",
                color: viewMode === v ? PRIMARY : TEXT_MUTED,
                fontSize: 17, display: "flex", alignItems: "center", justifyContent: "center",
                transition: "all 0.15s",
              }}>{v === "cards" ? "⊞" : "☰"}</button>
            ))}
          </div>
        </div>

        {/* Result count */}
        <p style={{ margin: "0 0 14px", fontSize: 12, color: TEXT_MUTED }}>
          Showing <strong style={{ color: TEXT_PRIMARY }}>{filtered.length}</strong> order{filtered.length !== 1 ? "s" : ""}
          {activeTab !== "All" && ` · ${activeTab}`}
        </p>

        {loading ? (
          <div style={{ textAlign: "center", padding: "60px 0" }}>
            <p style={{ color: TEXT_MUTED, fontSize: 15 }}>Loading orders...</p>
          </div>
        ) : (
          <>
            {/* ── CARDS VIEW ── */}
            {viewMode === "cards" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {filtered.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "60px 0" }}>
                    <span style={{ fontSize: 48 }}>📋</span>
                    <p style={{ marginTop: 12, fontSize: 15, fontWeight: 600, color: TEXT_MUTED }}>No orders here</p>
                  </div>
                ) : filtered.map(order => (
                  <div key={order.id} style={{ animation: "slideIn 0.25s ease" }}>
                    <OrderCard
                      order={order}
                      onAction={handleAction}
                      expanded={expandedId === order.id}
                      onToggle={() => setExpandedId(expandedId === order.id ? null : order.id)}
                    />
                  </div>
                ))}
              </div>
            )}

            {/* ── TABLE VIEW ── */}
            {viewMode === "table" && (
              <div style={{ background: "white", borderRadius: 16, border: `1px solid ${BORDER}`, overflow: "hidden" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                  <thead>
                    <tr style={{ background: SOFT_BG, borderBottom: `1px solid ${BORDER}` }}>
                      {["Order ID", "Table", "Items", "Qty", "Total", "Time", "Status", "Actions"].map(h => (
                        <th key={h} style={{
                          padding: "12px 16px", textAlign: "left",
                          fontSize: 11, fontWeight: 700, color: TEXT_MUTED,
                          textTransform: "uppercase", letterSpacing: "0.08em",
                          whiteSpace: "nowrap",
                        }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((order, i) => {
                      const amt = total(order);
                      const qty = order.items.reduce((s, it) => s + it.qty, 0);
                      return (
                        <tr key={order.id} style={{ borderBottom: i < filtered.length - 1 ? `1px solid ${BORDER}` : "none" }}
                          onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "#FFFDF8"}
                          onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "transparent"}
                        >
                          <td style={{ padding: "14px 16px", fontWeight: 800, color: TEXT_PRIMARY }}>{order.orderId}</td>
                          <td style={{ padding: "14px 16px" }}>
                            <span style={{
                              background: SOFT_BG, color: PRIMARY, padding: "3px 10px",
                              borderRadius: 20, fontWeight: 700, fontSize: 12,
                            }}>Table {order.table}</span>
                          </td>
                          <td style={{ padding: "14px 16px", color: TEXT_MUTED, fontSize: 12, maxWidth: 180 }}>
                            <div style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 180 }}>
                              {order.items.map(it => `${it.name} ×${it.qty}`).join(", ")}
                            </div>
                          </td>
                          <td style={{ padding: "14px 16px", fontWeight: 700, color: TEXT_PRIMARY, textAlign: "center" }}>{qty}</td>
                          <td style={{ padding: "14px 16px", fontWeight: 800, color: PRIMARY }}>₹{amt}</td>
                          <td style={{ padding: "14px 16px", color: TEXT_MUTED, fontSize: 12, whiteSpace: "nowrap" }}>{formatTime(order.createdAt)}</td>
                          <td style={{ padding: "14px 16px" }}><StatusPill status={order.status} /></td>
                          <td style={{ padding: "14px 16px" }}>
                            <ActionButtons order={order} onAction={handleAction} />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                {filtered.length === 0 && (
                  <div style={{ textAlign: "center", padding: "48px 0" }}>
                    <span style={{ fontSize: 40 }}>📋</span>
                    <p style={{ marginTop: 10, fontSize: 14, color: TEXT_MUTED }}>No orders found</p>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </main>
    </AdminLayout>
  );
}
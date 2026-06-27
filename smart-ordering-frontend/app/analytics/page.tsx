"use client";
import { useState, useEffect, useRef } from "react";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, LineChart, Line, Cell
} from "recharts";
import {
  TrendingUp, ShoppingBag, BarChart2, Users, Star, Flame, ArrowUp, ArrowDown
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import AdminLayout from "@/components/AdminLayout";

const PRIMARY = "#FF6B35";
const GREEN = "#22C55E";
const AMBER = "#FBBF24";
const ROSE = "#F43F5E";
const BLUE = "#38BDF8";

const dailyRevenue = [
  { time: "9am", revenue: 1200, orders: 8 },
  { time: "10am", revenue: 1800, orders: 14 },
  { time: "11am", revenue: 2400, orders: 19 },
  { time: "12pm", revenue: 4200, orders: 34 },
  { time: "1pm", revenue: 5100, orders: 41 },
  { time: "2pm", revenue: 3800, orders: 29 },
  { time: "3pm", revenue: 2200, orders: 17 },
  { time: "4pm", revenue: 1900, orders: 15 },
  { time: "5pm", revenue: 2800, orders: 22 },
  { time: "6pm", revenue: 4600, orders: 37 },
  { time: "7pm", revenue: 5800, orders: 46 },
  { time: "8pm", revenue: 6200, orders: 50 },
  { time: "9pm", revenue: 4400, orders: 35 },
];

const weeklyRevenue = [
  { day: "Mon", revenue: 18400, orders: 142 },
  { day: "Tue", revenue: 22100, orders: 176 },
  { day: "Wed", revenue: 19800, orders: 158 },
  { day: "Thu", revenue: 24600, orders: 196 },
  { day: "Fri", revenue: 31200, orders: 248 },
  { day: "Sat", revenue: 38900, orders: 310 },
  { day: "Sun", revenue: 29300, orders: 233 },
];

const topDishes = [
  { name: "Chicken Biryani", orders: 148, revenue: 41440, emoji: "🍚", color: PRIMARY },
  { name: "Paneer Butter Masala", orders: 112, revenue: 24640, emoji: "🍛", color: AMBER },
  { name: "Tandoori Platter", orders: 89, revenue: 33820, emoji: "🍗", color: ROSE },
  { name: "Dal Makhani", orders: 76, revenue: 13680, emoji: "🫕", color: GREEN },
  { name: "Garlic Naan", orders: 203, revenue: 12180, emoji: "🫓", color: BLUE },
];

const recentOrders = [
  { id: "#0847", table: "Table 4", items: "Chicken Biryani × 2, Lassi × 2", total: 720, status: "Delivered", time: "2 min ago", color: GREEN },
  { id: "#0846", table: "Table 7", items: "Paneer Masala, Naan × 3, Lassi", total: 400, status: "Preparing", time: "5 min ago", color: PRIMARY },
  { id: "#0845", table: "Table 2", items: "Tandoori Platter, Dal Makhani", total: 560, status: "Ready", time: "8 min ago", color: AMBER },
  { id: "#0844", table: "Table 9", items: "Gulab Jamun × 3, Biryani", total: 520, status: "Delivered", time: "14 min ago", color: GREEN },
  { id: "#0843", table: "Table 1", items: "Garlic Naan × 4, Butter Masala × 2", total: 680, status: "Delivered", time: "19 min ago", color: GREEN },
];

function useCountUp(target: number, duration = 1400, start = true) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start) return;
    let startTime: number | null = null;
    const animate = (ts: number) => {
      if (!startTime) startTime = ts;
      const progress = Math.min((ts - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [target, duration]);
  return count;
}

function StatCard({ label, value, prefix = "", suffix = "", icon, color, change, changeLabel }: {
  label: string; value: number; prefix?: string; suffix?: string;
  icon: React.ReactNode; color: string; change: number; changeLabel: string;
}) {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.3 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  const count = useCountUp(value, 1400, visible);
  const isPositive = change >= 0;

  return (
    <div ref={ref} style={{
      background: "white", border: "1px solid #F0EDE8", borderRadius: 20,
      padding: "20px 22px", display: "flex", flexDirection: "column", gap: 12,
      transition: "box-shadow 0.2s, transform 0.2s", cursor: "default",
    }}
      onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = "0 8px 24px rgba(255,107,53,0.08)"; (e.currentTarget as HTMLDivElement).style.transform = "translateY(-2px)"; }}
      onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = "none"; (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)"; }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</span>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: color + "18", display: "flex", alignItems: "center", justifyContent: "center", color }}>{icon}</div>
      </div>
      <div>
        <div style={{ fontSize: 28, fontWeight: 700, color: "#1A1A1A", lineHeight: 1 }}>{prefix}{count.toLocaleString()}{suffix}</div>
        <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 6 }}>
          <span style={{
            display: "flex", alignItems: "center", gap: 2, fontSize: 12, fontWeight: 600,
            color: isPositive ? GREEN : ROSE,
            background: isPositive ? "rgba(34,197,94,0.1)" : "rgba(244,63,94,0.1)",
            padding: "2px 7px", borderRadius: 20,
          }}>
            {isPositive ? <ArrowUp size={11} /> : <ArrowDown size={11} />}
            {Math.abs(change)}%
          </span>
          <span style={{ fontSize: 12, color: "#9CA3AF" }}>{changeLabel}</span>
        </div>
      </div>
    </div>
  );
}

function Skeleton({ w = "100%", h = 16, r = 8 }: { w?: string; h?: number; r?: number }) {
  return (
    <div style={{
      width: w, height: h, borderRadius: r,
      background: "linear-gradient(90deg, #F5F0EB 25%, #EDE8E1 50%, #F5F0EB 75%)",
      backgroundSize: "200% 100%", animation: "shimmer 1.5s infinite",
    }} />
  );
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div style={{ background: "white", border: "1px solid #F0EDE8", borderRadius: 12, padding: "10px 14px", fontSize: 13, boxShadow: "0 4px 16px rgba(0,0,0,0.08)" }}>
        <p style={{ fontWeight: 600, color: "#1A1A1A", marginBottom: 4 }}>{label}</p>
        {payload.map((p: any, i: number) => (
          <p key={i} style={{ color: p.color, margin: "2px 0" }}>
            {p.name === "revenue" ? `₹${p.value.toLocaleString()}` : `${p.value} orders`}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function AnalyticsDashboard() {
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<"Today" | "Week" | "Month">("Today");

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 1600);
    return () => clearTimeout(t);
  }, []);

  // navItems moved to shared components/adminNav.tsx

  const activeCount = 3;

  return (
    <AdminLayout activeCount={activeCount}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');
        @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
        .fade-up { animation: fadeUp 0.5s ease both; }
        .nav-btn:hover { background: rgba(255,107,53,0.06) !important; color: #FF6B35 !important; }
        .period-btn:hover { background: rgba(255,107,53,0.08) !important; }
        .order-row:hover { background: #FFFAF7 !important; }
        .dish-row:hover { background: #FFFAF7 !important; }
        .live-dot { animation: pulse 1.5s ease infinite; }
      `}</style>

      {/* Main */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, overflow: "auto" }}>
        {/* Top bar */}
        <header style={{
          background: "white", borderBottom: "1px solid #F0EDE8",
          padding: "16px 28px", display: "flex", alignItems: "center",
          justifyContent: "space-between", position: "sticky", top: 0, zIndex: 10,
        }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: "#1A1A1A", fontFamily: "'Playfair Display', serif" }}>Analytics</h1>
            <p style={{ margin: 0, fontSize: 12, color: "#9CA3AF", marginTop: 2 }}>Track performance and insights</p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {/* Period selector */}
            <div style={{ display: "flex", background: "#F5F0EB", borderRadius: 12, padding: 3, gap: 2 }}>
              {(["Today", "Week", "Month"] as const).map(p => (
                <button key={p} className="period-btn"
                  onClick={() => setPeriod(p)}
                  style={{
                    padding: "6px 14px", borderRadius: 9, border: "none", cursor: "pointer",
                    fontSize: 13, fontWeight: 600, transition: "all 0.15s",
                    background: period === p ? "white" : "transparent",
                    color: period === p ? PRIMARY : "#6B7280",
                    boxShadow: period === p ? "0 1px 4px rgba(0,0,0,0.08)" : "none",
                  }}>
                  {p}
                </button>
              ))}
            </div>
            <button style={{ width: 36, height: 36, borderRadius: 10, border: "1px solid #F0EDE8", background: "white", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#6B7280" }}>
              🔔
            </button>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg, #FF6B35, #FFC947)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700, color: "white" }}>{user?.name?.charAt(0).toUpperCase() || "S"}</div>
          </div>
        </header>

        <main style={{ padding: "28px", display: "flex", flexDirection: "column", gap: 24 }}>

          {/* KPI Cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}>
            {loading ? (
              Array(5).fill(0).map((_, i) => (
                <div key={i} style={{ background: "white", border: "1px solid #F0EDE8", borderRadius: 20, padding: "20px 22px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                    <Skeleton w="80" h={12} />
                    <Skeleton w="36" h={36} r={10} />
                  </div>
                  <Skeleton w="100" h={28} r={6} />
                  <div style={{ marginTop: 8 }}><Skeleton w="120" h={20} r={20} /></div>
                </div>
              ))
            ) : (
              <>
                <div className="fade-up" style={{ animationDelay: "0ms" }}>
                  <StatCard label="Total Revenue" value={8240} prefix="₹" icon={<TrendingUp size={17} />} color={PRIMARY} change={12.4} changeLabel="vs yesterday" />
                </div>
                <div className="fade-up" style={{ animationDelay: "80ms" }}>
                  <StatCard label="Total Orders" value={47} icon={<ShoppingBag size={17} />} color={GREEN} change={8.1} changeLabel="vs yesterday" />
                </div>
                <div className="fade-up" style={{ animationDelay: "160ms" }}>
                  <StatCard label="Avg Order Value" value={175} prefix="₹" icon={<BarChart2 size={17} />} color={AMBER} change={3.6} changeLabel="vs yesterday" />
                </div>
                <div className="fade-up" style={{ animationDelay: "240ms" }}>
                  <StatCard label="Active Tables" value={12} icon={<Users size={17} />} color={BLUE} change={-2.1} changeLabel="vs yesterday" />
                </div>
                <div className="fade-up" style={{ animationDelay: "320ms" }}>
                  <StatCard label="Avg Rating" value={49} suffix="/50" icon={<Star size={17} />} color={ROSE} change={0.8} changeLabel="this week" />
                </div>
              </>
            )}
          </div>

          {/* Peak Hours + Charts row */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>

            {/* Daily Revenue Chart */}
            <div style={{ background: "white", border: "1px solid #F0EDE8", borderRadius: 20, padding: "22px 22px 16px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
                <div>
                  <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "#1A1A1A" }}>Daily Revenue</p>
                  <p style={{ margin: 0, fontSize: 11, color: "#9CA3AF", marginTop: 2 }}>Revenue by hour today</p>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 4, padding: "4px 10px", background: "rgba(34,197,94,0.1)", borderRadius: 20 }}>
                  <div className="live-dot" style={{ width: 6, height: 6, borderRadius: "50%", background: GREEN }} />
                  <span style={{ fontSize: 11, fontWeight: 600, color: GREEN }}>Live</span>
                </div>
              </div>
              {loading ? <Skeleton w="100%" h={180} r={12} /> : (
                <ResponsiveContainer width="100%" height={180}>
                  <AreaChart data={dailyRevenue} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={PRIMARY} stopOpacity={0.15} />
                        <stop offset="95%" stopColor={PRIMARY} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F5F0EB" vertical={false} />
                    <XAxis dataKey="time" tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} interval={2} />
                    <YAxis tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} tickFormatter={v => `₹${(v / 1000).toFixed(0)}k`} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="revenue" stroke={PRIMARY} strokeWidth={2.5} fill="url(#revGrad)" dot={false} activeDot={{ r: 5, fill: PRIMARY, stroke: "white", strokeWidth: 2 }} />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Weekly Orders Bar Chart */}
            <div style={{ background: "white", border: "1px solid #F0EDE8", borderRadius: 20, padding: "22px 22px 16px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
                <div>
                  <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "#1A1A1A" }}>Weekly Orders</p>
                  <p style={{ margin: 0, fontSize: 11, color: "#9CA3AF", marginTop: 2 }}>Orders per day this week</p>
                </div>
                <span style={{ fontSize: 11, fontWeight: 600, color: "#9CA3AF" }}>Sat peak: 310</span>
              </div>
              {loading ? <Skeleton w="100%" h={180} r={12} /> : (
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={weeklyRevenue} margin={{ top: 5, right: 5, left: -25, bottom: 0 }} barSize={24}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F5F0EB" vertical={false} />
                    <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="orders" name="orders" radius={[6, 6, 0, 0]}>
                      {weeklyRevenue.map((_, i) => (
                        <Cell key={i} fill={i === 5 ? PRIMARY : "#FFE8DF"} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Peak hours mini-viz + Dish breakdown */}
          <div style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: 20 }}>

            {/* Peak Order Time */}
            <div style={{ background: "white", border: "1px solid #F0EDE8", borderRadius: 20, padding: "22px" }}>
              <div style={{ marginBottom: 18 }}>
                <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "#1A1A1A" }}>Peak Order Times</p>
                <p style={{ margin: 0, fontSize: 11, color: "#9CA3AF", marginTop: 2 }}>Busiest windows today</p>
              </div>
              {loading ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {Array(5).fill(0).map((_, i) => <Skeleton key={i} h={28} r={8} />)}
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {[
                    { label: "8pm–9pm", orders: 50, pct: 100 },
                    { label: "7pm–8pm", orders: 46, pct: 92 },
                    { label: "1pm–2pm", orders: 41, pct: 82 },
                    { label: "12pm–1pm", orders: 34, pct: 68 },
                    { label: "6pm–7pm", orders: 37, pct: 74 },
                  ].map((row, i) => (
                    <div key={row.label}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                        <span style={{ fontSize: 12, fontWeight: 500, color: "#374151" }}>{row.label}</span>
                        <span style={{ fontSize: 12, fontWeight: 600, color: i === 0 ? PRIMARY : "#6B7280" }}>{row.orders} orders</span>
                      </div>
                      <div style={{ height: 6, background: "#F5F0EB", borderRadius: 3, overflow: "hidden" }}>
                        <div style={{
                          height: "100%", borderRadius: 3,
                          width: `${row.pct}%`,
                          background: i === 0 ? `linear-gradient(90deg, ${PRIMARY}, #FFC947)` : "#FFD5C4",
                          transition: "width 1s ease",
                        }} />
                      </div>
                    </div>
                  ))}
                  <div style={{ marginTop: 12, padding: "10px 12px", background: "rgba(255,107,53,0.06)", borderRadius: 12, border: "1px solid rgba(255,107,53,0.12)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <Flame size={14} color={PRIMARY} />
                      <span style={{ fontSize: 12, fontWeight: 600, color: PRIMARY }}>Peak: 8–9 PM</span>
                    </div>
                    <p style={{ margin: "4px 0 0", fontSize: 11, color: "#6B7280" }}>Schedule extra staff for dinner rush</p>
                  </div>
                </div>
              )}
            </div>

            {/* Top Dishes */}
            <div style={{ background: "white", border: "1px solid #F0EDE8", borderRadius: 20, padding: "22px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
                <div>
                  <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "#1A1A1A" }}>Top Performing Dishes</p>
                  <p style={{ margin: 0, fontSize: 11, color: "#9CA3AF", marginTop: 2 }}>By orders this week</p>
                </div>
              </div>
              {loading ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {Array(5).fill(0).map((_, i) => <Skeleton key={i} h={44} r={12} />)}
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {topDishes.map((dish) => (
                    <div key={dish.name} className="dish-row" style={{
                      display: "flex", alignItems: "center", gap: 12,
                      padding: "10px 12px", borderRadius: 12,
                      border: "1px solid #F5F0EB", transition: "background 0.15s",
                    }}>
                      <span style={{ fontSize: 22, width: 32, textAlign: "center" }}>{dish.emoji}</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
                          <span style={{ fontSize: 13, fontWeight: 600, color: "#1A1A1A" }}>{dish.name}</span>
                          <span style={{ fontSize: 12, fontWeight: 700, color: dish.color }}>{dish.orders} orders</span>
                        </div>
                        <div style={{ height: 4, background: "#F5F0EB", borderRadius: 2 }}>
                          <div style={{
                            height: "100%", borderRadius: 2,
                            width: `${(dish.orders / 203) * 100}%`,
                            background: dish.color + "80",
                          }} />
                        </div>
                      </div>
                      <div style={{ textAlign: "right", minWidth: 64 }}>
                        <p style={{ margin: 0, fontSize: 12, fontWeight: 600, color: "#374151" }}>₹{dish.revenue.toLocaleString()}</p>
                        <p style={{ margin: 0, fontSize: 10, color: "#9CA3AF" }}>revenue</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Weekly Revenue Trend + Recent Orders */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: 20 }}>

            {/* Line chart: weekly revenue trend */}
            <div style={{ background: "white", border: "1px solid #F0EDE8", borderRadius: 20, padding: "22px 22px 16px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
                <div>
                  <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "#1A1A1A" }}>Weekly Revenue Trend</p>
                  <p style={{ margin: 0, fontSize: 11, color: "#9CA3AF", marginTop: 2 }}>Daily revenue comparison</p>
                </div>
                <div style={{ display: "flex", gap: 14, fontSize: 11 }}>
                  <span style={{ display: "flex", alignItems: "center", gap: 4, color: "#6B7280" }}>
                    <span style={{ width: 10, height: 3, background: PRIMARY, borderRadius: 2, display: "inline-block" }} />Revenue
                  </span>
                </div>
              </div>
              {loading ? <Skeleton w="100%" h={200} r={12} /> : (
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={weeklyRevenue} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor={PRIMARY} />
                        <stop offset="100%" stopColor="#FFC947" />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F5F0EB" vertical={false} />
                    <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} tickFormatter={v => `₹${(v / 1000).toFixed(0)}k`} />
                    <Tooltip content={<CustomTooltip />} />
                    <Line type="monotone" dataKey="revenue" stroke="url(#lineGrad)" strokeWidth={3} dot={{ r: 4, fill: PRIMARY, stroke: "white", strokeWidth: 2 }} activeDot={{ r: 6, fill: PRIMARY }} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Recent Orders */}
            <div style={{ background: "white", border: "1px solid #F0EDE8", borderRadius: 20, padding: "22px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "#1A1A1A" }}>Recent Orders</p>
                <span style={{ fontSize: 11, fontWeight: 600, color: PRIMARY, cursor: "pointer" }}>View all →</span>
              </div>
              {loading ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {Array(5).fill(0).map((_, i) => <Skeleton key={i} h={56} r={12} />)}
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {recentOrders.map((order) => (
                    <div key={order.id} className="order-row" style={{
                      padding: "10px 12px", borderRadius: 12,
                      border: "1px solid #F5F0EB", transition: "background 0.15s",
                    }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 3 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <span style={{ fontSize: 12, fontWeight: 700, color: "#374151" }}>{order.id}</span>
                          <span style={{ fontSize: 11, color: "#9CA3AF" }}>·</span>
                          <span style={{ fontSize: 12, fontWeight: 500, color: "#374151" }}>{order.table}</span>
                        </div>
                        <span style={{
                          fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 20,
                          background: order.status === "Delivered" ? "rgba(34,197,94,0.1)" : order.status === "Ready" ? "rgba(251,191,36,0.12)" : "rgba(255,107,53,0.1)",
                          color: order.color,
                        }}>{order.status}</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <p style={{ margin: 0, fontSize: 11, color: "#6B7280", maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{order.items}</p>
                        <span style={{ fontSize: 12, fontWeight: 600, color: "#1A1A1A" }}>₹{order.total}</span>
                      </div>
                      <p style={{ margin: "3px 0 0", fontSize: 10, color: "#9CA3AF" }}>{order.time}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

        </main>
      </div>
    </AdminLayout>
  );
}

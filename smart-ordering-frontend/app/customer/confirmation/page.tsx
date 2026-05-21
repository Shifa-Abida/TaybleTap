"use client";
import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";

const PRIMARY = "#E8602E";
const GREEN = "#1A9E6B";
const SOFT_BG = "#FEF5EF";
const BORDER = "#F2E8E0";
const TEXT_PRIMARY = "#1A1A1A";
const TEXT_MUTED = "#9B8B80";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const STATUS_STEPS = ["Pending", "Accepted", "Preparing", "Completed"];
const STATUS_INFO: Record<string, { emoji: string; label: string; description: string }> = {
  Pending:   { emoji: "⏳", label: "Order Received",   description: "Your order has been sent to the kitchen" },
  Accepted:  { emoji: "✅", label: "Order Accepted",   description: "The kitchen has accepted your order" },
  Preparing: { emoji: "👨‍🍳", label: "Being Prepared",   description: "Your food is being prepared with care" },
  Completed: { emoji: "🎉", label: "Ready!",           description: "Your order is ready — enjoy your meal!" },
  Cancelled: { emoji: "❌", label: "Cancelled",         description: "This order has been cancelled" },
};

interface OrderData {
  id: string;
  order_id: string;
  table: number;
  status: string;
  items: Array<{ name: string; price: number; qty: number }>;
  total: number;
  created_at: string;
}

/* ─── Status Step Indicator ────────────────────────────────────── */
function StatusStepper({ currentStatus }: { currentStatus: string }) {
  const currentIndex = STATUS_STEPS.indexOf(currentStatus);
  const isCancelled = currentStatus === "Cancelled";

  if (isCancelled) {
    return (
      <div style={{
        background: "rgba(229,62,62,0.06)", borderRadius: 16,
        padding: "24px 20px", textAlign: "center",
      }}>
        <span style={{ fontSize: 48 }}>❌</span>
        <h3 style={{ margin: "12px 0 4px", fontSize: 18, fontWeight: 700, color: "#E53E3E" }}>
          Order Cancelled
        </h3>
        <p style={{ margin: 0, fontSize: 13, color: TEXT_MUTED }}>
          This order has been cancelled by the restaurant
        </p>
      </div>
    );
  }

  return (
    <div style={{ padding: "8px 0" }}>
      {STATUS_STEPS.map((step, index) => {
        const isCompleted = index <= currentIndex;
        const isActive = index === currentIndex;
        const isLast = index === STATUS_STEPS.length - 1;
        const info = STATUS_INFO[step];

        return (
          <div key={step} style={{ display: "flex", gap: 16, position: "relative" }}>
            {/* Vertical line + circle */}
            <div style={{
              display: "flex", flexDirection: "column", alignItems: "center",
              width: 36, flexShrink: 0,
            }}>
              <div style={{
                width: 36, height: 36, borderRadius: "50%",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: isActive ? 18 : 14,
                background: isCompleted
                  ? (isActive ? PRIMARY : GREEN)
                  : "#F3F0EC",
                color: isCompleted ? "white" : TEXT_MUTED,
                fontWeight: 700,
                transition: "all 0.3s ease",
                boxShadow: isActive ? `0 0 0 4px rgba(232,96,46,0.2)` : "none",
                animation: isActive ? "pulse 2s ease-in-out infinite" : "none",
              }}>
                {isCompleted ? (isActive ? info.emoji : "✓") : (index + 1)}
              </div>
              {!isLast && (
                <div style={{
                  width: 2, flex: 1, minHeight: 24,
                  background: isCompleted && index < currentIndex
                    ? GREEN
                    : `linear-gradient(to bottom, ${BORDER}, ${BORDER})`,
                  transition: "background 0.3s",
                }} />
              )}
            </div>

            {/* Step content */}
            <div style={{
              paddingBottom: isLast ? 0 : 20, flex: 1,
              opacity: isCompleted ? 1 : 0.5,
            }}>
              <p style={{
                margin: 0, fontSize: 14, fontWeight: isActive ? 700 : 600,
                color: isActive ? PRIMARY : (isCompleted ? TEXT_PRIMARY : TEXT_MUTED),
              }}>
                {info.label}
              </p>
              <p style={{
                margin: "2px 0 0", fontSize: 12,
                color: isActive ? TEXT_PRIMARY : TEXT_MUTED,
              }}>
                {info.description}
              </p>
            </div>
          </div>
        );
      })}

      <style>{`
        @keyframes pulse {
          0%, 100% { box-shadow: 0 0 0 4px rgba(232,96,46,0.15); }
          50% { box-shadow: 0 0 0 8px rgba(232,96,46,0.05); }
        }
      `}</style>
    </div>
  );
}

/* ─── Confirmation Page Inner ──────────────────────────────────── */
function ConfirmationInner() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const orderId = searchParams.get("order") || "";       // MongoDB _id
  const restaurantId = searchParams.get("resto") || "";
  const tableId = searchParams.get("table") || "1";
  const displayOrderId = searchParams.get("orderId") || "";  // #0001 style

  const [order, setOrder] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showConfetti, setShowConfetti] = useState(true);

  // Fetch order status
  const fetchStatus = useCallback(async () => {
    if (!orderId || !restaurantId) return;
    try {
      const res = await fetch(`${API_URL}/api/customer/order/${orderId}/?resto=${restaurantId}`);
      if (res.ok) {
        const data = await res.json();
        setOrder(data);
        setError("");
      } else {
        setError("Could not find your order");
      }
    } catch {
      setError("Failed to load order status");
    } finally {
      setLoading(false);
    }
  }, [orderId, restaurantId]);

  // Initial fetch
  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  // Auto-poll every 10 seconds for live updates
  useEffect(() => {
    if (!orderId || !restaurantId) return;
    const interval = setInterval(fetchStatus, 10000);
    return () => clearInterval(interval);
  }, [orderId, restaurantId, fetchStatus]);

  // Hide confetti after 4 seconds
  useEffect(() => {
    const timer = setTimeout(() => setShowConfetti(false), 4000);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div style={{
        minHeight: "100vh", background: "#FFFDF8",
        display: "flex", alignItems: "center", justifyContent: "center",
        flexDirection: "column", gap: 12,
      }}>
        <div style={{
          width: 40, height: 40, border: `3px solid ${BORDER}`,
          borderTopColor: PRIMARY, borderRadius: "50%",
          animation: "spin 0.8s linear infinite",
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <p style={{ color: TEXT_MUTED, fontSize: 14 }}>Loading order status...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div style={{
        minHeight: "100vh", background: "#FFFDF8",
        display: "flex", alignItems: "center", justifyContent: "center",
        flexDirection: "column", gap: 16, padding: 40,
        fontFamily: "'Inter', sans-serif",
      }}>
        <span style={{ fontSize: 64 }}>😔</span>
        <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: TEXT_PRIMARY }}>
          {error || "Order not found"}
        </h2>
        <button
          onClick={() => router.push(`/customer/menu?resto=${restaurantId}&table=${tableId}`)}
          style={{
            padding: "12px 28px", borderRadius: 12,
            border: "none", background: PRIMARY, color: "white",
            fontSize: 14, fontWeight: 700, cursor: "pointer",
          }}
        >
          ← Back to Menu
        </button>
      </div>
    );
  }

  const isCompleted = order.status === "Completed";

  return (
    <div style={{
      minHeight: "100vh", background: "#FFFDF8",
      fontFamily: "'Inter', 'DM Sans', sans-serif",
      paddingBottom: 40,
    }}>
      {/* Confetti animation */}
      {showConfetti && (
        <div style={{
          position: "fixed", inset: 0, pointerEvents: "none", zIndex: 999,
          overflow: "hidden",
        }}>
          {Array.from({ length: 30 }).map((_, i) => (
            <div key={i} style={{
              position: "absolute",
              top: -20,
              left: `${Math.random() * 100}%`,
              width: 8 + Math.random() * 8,
              height: 8 + Math.random() * 8,
              borderRadius: Math.random() > 0.5 ? "50%" : 2,
              background: [PRIMARY, GREEN, "#F59E0B", "#3B82F6", "#EC4899", "#8B5CF6"][Math.floor(Math.random() * 6)],
              animation: `confettiFall ${2 + Math.random() * 3}s ease-in forwards`,
              animationDelay: `${Math.random() * 1.5}s`,
              opacity: 0.8,
            }} />
          ))}
          <style>{`
            @keyframes confettiFall {
              0% { transform: translateY(0) rotate(0deg); opacity: 1; }
              100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
            }
          `}</style>
        </div>
      )}

      {/* Header */}
      <header style={{
        background: "white", borderBottom: `1px solid ${BORDER}`,
        padding: "14px 20px", position: "sticky", top: 0, zIndex: 100,
        backdropFilter: "blur(12px)", backgroundColor: "rgba(255,255,255,0.92)",
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <p style={{ margin: 0, fontSize: 17, fontWeight: 700, color: TEXT_PRIMARY }}>
              Order {order.order_id || displayOrderId}
            </p>
            <p style={{ margin: "1px 0 0", fontSize: 12, color: TEXT_MUTED }}>
              Table {order.table}
            </p>
          </div>
          <div style={{
            padding: "6px 14px", borderRadius: 20,
            background: isCompleted
              ? "rgba(26,158,107,0.1)"
              : order.status === "Cancelled"
                ? "rgba(229,62,62,0.1)"
                : SOFT_BG,
            color: isCompleted
              ? GREEN
              : order.status === "Cancelled"
                ? "#E53E3E"
                : PRIMARY,
            fontSize: 12, fontWeight: 700,
          }}>
            {STATUS_INFO[order.status]?.emoji} {order.status}
          </div>
        </div>
      </header>

      <div style={{ padding: "20px", maxWidth: 480, margin: "0 auto" }}>
        {/* Success Banner */}
        <div style={{
          background: isCompleted
            ? `linear-gradient(135deg, rgba(26,158,107,0.08), rgba(26,158,107,0.02))`
            : `linear-gradient(135deg, rgba(232,96,46,0.08), rgba(232,96,46,0.02))`,
          borderRadius: 20, padding: "28px 24px", textAlign: "center",
          border: `1px solid ${isCompleted ? "rgba(26,158,107,0.15)" : "rgba(232,96,46,0.15)"}`,
          marginBottom: 20,
        }}>
          <span style={{ fontSize: 56 }}>
            {isCompleted ? "🎉" : STATUS_INFO[order.status]?.emoji || "⏳"}
          </span>
          <h2 style={{
            margin: "12px 0 4px", fontSize: 22, fontWeight: 800,
            color: TEXT_PRIMARY,
          }}>
            {isCompleted ? "Order Complete!" : "Order Placed Successfully!"}
          </h2>
          <p style={{ margin: 0, fontSize: 14, color: TEXT_MUTED }}>
            {isCompleted
              ? "Your food is ready — enjoy your meal! 🍽️"
              : "Sit back and relax while we prepare your food"
            }
          </p>
        </div>

        {/* Order Status Tracker */}
        <div style={{
          background: "white", borderRadius: 20, border: `1px solid ${BORDER}`,
          padding: 20, marginBottom: 16,
        }}>
          <h3 style={{
            margin: "0 0 16px", fontSize: 15, fontWeight: 700, color: TEXT_PRIMARY,
            display: "flex", alignItems: "center", gap: 8,
          }}>
            📍 Order Status
            <span style={{
              fontSize: 10, fontWeight: 600, padding: "3px 8px", borderRadius: 8,
              background: "rgba(26,158,107,0.1)", color: GREEN,
            }}>
              LIVE
            </span>
          </h3>

          <StatusStepper currentStatus={order.status} />
        </div>

        {/* Order Details */}
        <div style={{
          background: "white", borderRadius: 20, border: `1px solid ${BORDER}`,
          padding: 20, marginBottom: 16,
        }}>
          <h3 style={{ margin: "0 0 14px", fontSize: 15, fontWeight: 700, color: TEXT_PRIMARY }}>
            📋 Order Details
          </h3>

          {order.items.map((item, index) => (
            <div key={index} style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "8px 0",
              borderBottom: index < order.items.length - 1 ? `1px solid ${BORDER}` : "none",
            }}>
              <div>
                <span style={{ fontSize: 13, fontWeight: 600, color: TEXT_PRIMARY }}>
                  {item.name}
                </span>
                <span style={{ fontSize: 12, color: TEXT_MUTED, marginLeft: 6 }}>
                  × {item.qty}
                </span>
              </div>
              <span style={{ fontSize: 13, fontWeight: 600, color: TEXT_PRIMARY }}>
                ₹{item.price * item.qty}
              </span>
            </div>
          ))}

          <div style={{
            display: "flex", justifyContent: "space-between",
            paddingTop: 12, marginTop: 8, borderTop: `1px solid ${BORDER}`,
          }}>
            <span style={{ fontSize: 15, fontWeight: 700, color: TEXT_PRIMARY }}>Total</span>
            <span style={{ fontSize: 20, fontWeight: 800, color: PRIMARY }}>₹{order.total}</span>
          </div>
        </div>

        {/* Order Again */}
        <button
          onClick={() => router.push(`/customer/menu?resto=${restaurantId}&table=${tableId}`)}
          style={{
            width: "100%", padding: "14px", borderRadius: 14,
            border: `1px solid ${BORDER}`, background: "white",
            fontSize: 14, fontWeight: 600, color: TEXT_PRIMARY, cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            transition: "all 0.15s",
          }}
          onMouseEnter={(e: any) => { e.currentTarget.style.borderColor = PRIMARY; e.currentTarget.style.color = PRIMARY; }}
          onMouseLeave={(e: any) => { e.currentTarget.style.borderColor = BORDER; e.currentTarget.style.color = TEXT_PRIMARY; }}
        >
          🍽️ Order More Items
        </button>

        {/* Auto-refresh notice */}
        <p style={{
          margin: "16px 0 0", fontSize: 11, color: TEXT_MUTED, textAlign: "center",
        }}>
          Status updates automatically every 10 seconds
        </p>
      </div>
    </div>
  );
}

export default function ConfirmationPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: "100vh", background: "#FFFDF8", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ color: "#9B8B80", fontSize: 14 }}>Loading confirmation...</p>
      </div>
    }>
      <ConfirmationInner />
    </Suspense>
  );
}

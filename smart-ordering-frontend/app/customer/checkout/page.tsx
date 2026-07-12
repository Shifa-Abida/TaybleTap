"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

const PRIMARY = "#FF6B35";
const ACCENT = "#FFC947";
const SOFT_BG = "#FEF5EF";
const BORDER = "#F2E8E0";
const TEXT_PRIMARY = "#1A1A1A";
const TEXT_MUTED = "#9B8B80";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface CartItem {
  id: string;
  name: string;
  price: number;
  emoji: string;
  quantity: number;
  available?: boolean;
  stock_quantity?: number;
}

interface MenuStockItem {
  id: string;
  available: boolean;
  stock_quantity?: number;
}

interface CustomerProfile {
  id: string;
  name: string;
  phone: string;
}

function CheckoutInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const tableId = searchParams.get("table") || "1";
  const restaurantId = searchParams.get("resto") || "";
  const cartKey = `cart_${restaurantId}_${tableId}`;
  const customerKey = `customer_profile_${restaurantId}_${tableId}`;

  const [cart, setCart] = useState<CartItem[]>(() => {
    if (typeof window === "undefined") return [];
    const saved = window.sessionStorage.getItem(cartKey);
    if (!saved) return [];
    try {
      return JSON.parse(saved);
    } catch {
      return [];
    }
  });
  const [restaurantName, setRestaurantName] = useState("Restaurant");
  const [paymentQrCode, setPaymentQrCode] = useState("");
  const [paymentCode, setPaymentCode] = useState("");
  const [customerProfile, setCustomerProfile] = useState<CustomerProfile | null>(null);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    sessionStorage.setItem(cartKey, JSON.stringify(cart));
  }, [cart, cartKey]);

  useEffect(() => {
    const fetchInfo = async () => {
      const savedCustomer = window.sessionStorage.getItem(customerKey);
      if (savedCustomer) {
        try {
          setCustomerProfile(JSON.parse(savedCustomer));
        } catch {
          setCustomerProfile(null);
        }
      }

      if (!restaurantId) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`${API_URL}/api/customer/restaurant/?resto=${restaurantId}`);
        if (res.ok) {
          const data = await res.json();
          setRestaurantName(data.restaurant_name || "Restaurant");
          setPaymentQrCode(data.payment_qr_code || "");
        }

        const menuRes = await fetch(`${API_URL}/api/customer/menu/?resto=${restaurantId}`);
        if (menuRes.ok) {
          const menuData = await menuRes.json();
          const menuItems: MenuStockItem[] = Array.isArray(menuData.items) ? menuData.items : [];
          setCart((prev) => prev.map((item) => {
            const liveItem = menuItems.find((menuItem) => menuItem.id === item.id);
            return {
              ...item,
              available: liveItem?.available ?? false,
              stock_quantity: liveItem?.stock_quantity,
            };
          }));
        }
      } catch {
        // Keep default checkout values for prototype fallback.
      } finally {
        setLoading(false);
      }
    };

    fetchInfo();
  }, [customerKey, restaurantId]);

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const stockIssue = cart.find((item) =>
    item.available === false || (item.stock_quantity !== undefined && item.quantity > item.stock_quantity)
  );
  const canPlaceOrder = cart.length > 0 && paymentCode.trim().length > 0 && !placingOrder && !stockIssue;

  const updateCartQuantity = (id: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.id !== id) return item;
          if (delta > 0 && (item.available === false || (item.stock_quantity !== undefined && item.quantity >= item.stock_quantity))) return item;
          return { ...item, quantity: item.quantity + delta };
        })
        .filter((item) => item.quantity > 0)
    );
  };

  const handlePlaceOrder = async () => {
    if (!canPlaceOrder) return;
    setPlacingOrder(true);

    try {
      const res = await fetch(`${API_URL}/api/customer/order/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          restaurant_id: restaurantId,
          table: parseInt(tableId, 10) || 1,
          customer_name: customerProfile?.name || "",
          payment_code: paymentCode.trim(),
          items: cart.map((item) => ({
            id: item.id,
            name: item.name,
            price: item.price,
            qty: item.quantity,
          })),
        }),
      });

      if (res.ok) {
        const data = await res.json();
        sessionStorage.removeItem(cartKey);
        router.push(
          `/customer/confirmation?order=${data.id}&resto=${restaurantId}&table=${tableId}&orderId=${encodeURIComponent(data.order_id)}`
        );
        return;
      }

      const err = await res.json().catch(() => ({}));
      alert(err.error || "Payment code could not be verified.");
    } catch {
      alert("Unable to place order. Please try again.");
    } finally {
      setPlacingOrder(false);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: "#FFFDF8", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ color: TEXT_MUTED, fontSize: 14 }}>Loading checkout...</p>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div style={{
        minHeight: "100vh", background: "#FFFDF8", display: "flex", alignItems: "center",
        justifyContent: "center", flexDirection: "column", gap: 16, padding: 40,
        fontFamily: "'Inter', sans-serif",
      }}>
        <span style={{ fontSize: 64 }}>🛒</span>
        <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: TEXT_PRIMARY }}>Your cart is empty</h2>
        <p style={{ margin: 0, fontSize: 14, color: TEXT_MUTED, textAlign: "center" }}>
          Go back to the menu and add some dishes.
        </p>
        <button
          onClick={() => router.push(`/customer/menu?resto=${restaurantId}&table=${tableId}`)}
          style={{
            padding: "12px 28px", borderRadius: 12, border: "none", background: PRIMARY,
            color: "white", fontSize: 14, fontWeight: 700, cursor: "pointer",
          }}
        >
          Back to Menu
        </button>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: "#FFFDF8",
      fontFamily: "'Inter', 'DM Sans', sans-serif",
      paddingBottom: 104,
    }}>
      <header style={{
        background: "rgba(255,255,255,0.92)",
        borderBottom: `1px solid ${BORDER}`,
        padding: "14px 20px",
        position: "sticky",
        top: 0,
        zIndex: 100,
        backdropFilter: "blur(12px)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button
            onClick={() => router.push(`/customer/menu?resto=${restaurantId}&table=${tableId}`)}
            style={{
              width: 36, height: 36, borderRadius: 10, border: `1px solid ${BORDER}`,
              background: "white", cursor: "pointer", fontSize: 16,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            ←
          </button>
          <div>
            <p style={{ margin: 0, fontSize: 17, fontWeight: 700, color: TEXT_PRIMARY }}>Checkout</p>
            <p style={{ margin: "1px 0 0", fontSize: 12, color: TEXT_MUTED }}>
              {restaurantName} · Table {tableId}
            </p>
          </div>
        </div>
      </header>

      <main style={{ padding: 20, maxWidth: 480, margin: "0 auto" }}>
        <section style={{ background: "white", borderRadius: 20, border: `1px solid ${BORDER}`, padding: 20, marginBottom: 16 }}>
          <h3 style={{ margin: "0 0 16px", fontSize: 15, fontWeight: 700, color: TEXT_PRIMARY }}>
            Order Summary
            <span style={{ marginLeft: 8, fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 10, background: SOFT_BG, color: TEXT_MUTED }}>
              {cartCount} item{cartCount !== 1 ? "s" : ""}
            </span>
          </h3>

          {cart.map((item) => (
            <div key={item.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: `1px solid ${BORDER}` }}>
              <span style={{ fontSize: 22 }}>{item.emoji}</span>
              <div style={{ flex: 1 }}>
                <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: TEXT_PRIMARY }}>{item.name}</p>
                <p style={{ margin: 0, fontSize: 11, color: TEXT_MUTED }}>₹{item.price} × {item.quantity}</p>
                {item.available === false && <p style={{ margin: "3px 0 0", fontSize: 11, color: "#E53E3E", fontWeight: 700 }}>Out Of Stock</p>}
                {item.available !== false && item.stock_quantity !== undefined && item.stock_quantity <= 5 && (
                  <p style={{ margin: "3px 0 0", fontSize: 11, color: "#D97706", fontWeight: 700 }}>Only {item.stock_quantity} left</p>
                )}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <button onClick={() => updateCartQuantity(item.id, -1)} style={{
                  width: 26, height: 26, borderRadius: 7, border: `1px solid ${BORDER}`,
                  background: "white", fontSize: 14, color: TEXT_PRIMARY, cursor: "pointer",
                }}>−</button>
                <span style={{ fontSize: 13, fontWeight: 700, minWidth: 18, textAlign: "center" }}>{item.quantity}</span>
                <button
                  onClick={() => updateCartQuantity(item.id, 1)}
                  disabled={item.available === false || (item.stock_quantity !== undefined && item.quantity >= item.stock_quantity)}
                  style={{
                  width: 26, height: 26, borderRadius: 7, border: "none",
                  background: item.available === false || (item.stock_quantity !== undefined && item.quantity >= item.stock_quantity) ? TEXT_MUTED : PRIMARY,
                  color: "white", fontSize: 14, cursor: "pointer",
                }}>+</button>
              </div>
              <span style={{ fontSize: 14, fontWeight: 700, color: TEXT_PRIMARY, minWidth: 48, textAlign: "right" }}>
                ₹{item.price * item.quantity}
              </span>
            </div>
          ))}

          <div style={{ display: "flex", justifyContent: "space-between", paddingTop: 14, marginTop: 8, borderTop: `1px solid ${BORDER}` }}>
            <span style={{ fontSize: 16, fontWeight: 700, color: TEXT_PRIMARY }}>Total</span>
            <span style={{ fontSize: 22, fontWeight: 800, color: PRIMARY }}>₹{cartTotal}</span>
          </div>
          {stockIssue && (
            <p style={{ margin: "12px 0 0", color: "#E53E3E", fontSize: 12, fontWeight: 700 }}>
              {stockIssue.available === false ? `${stockIssue.name} is unavailable.` : `Only ${stockIssue.stock_quantity} left for ${stockIssue.name}.`}
            </p>
          )}
        </section>

        <section style={{ background: "white", borderRadius: 20, border: `1px solid ${BORDER}`, padding: 24, textAlign: "center", marginBottom: 16 }}>
          <div style={{
            width: 56, height: 56, borderRadius: 16, background: "rgba(34,197,94,0.1)",
            display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", fontSize: 28,
          }}>
            💳
          </div>
          <h3 style={{ margin: "0 0 4px", fontSize: 17, fontWeight: 700, color: TEXT_PRIMARY }}>Scan QR to Pay</h3>
          <p style={{ margin: "0 0 20px", fontSize: 13, color: TEXT_MUTED }}>
            Prototype payment: scan the restaurant QR, then enter the payment code.
          </p>

          <div style={{
            background: SOFT_BG, borderRadius: 16, padding: 20,
            display: "inline-flex", flexDirection: "column", alignItems: "center", gap: 12,
            marginBottom: 16,
          }}>
            {paymentQrCode ? (
              <img
                src={paymentQrCode}
                alt="Restaurant payment QR code"
                style={{ width: 180, height: 180, borderRadius: 12, objectFit: "contain", background: "white" }}
              />
            ) : (
              <div style={{
                width: 180, height: 180, borderRadius: 12, background: "white",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: TEXT_MUTED, fontSize: 13, textAlign: "center", padding: 18,
              }}>
                Payment QR not configured
              </div>
            )}
            <p style={{ margin: 0, fontSize: 12, color: TEXT_MUTED }}>
              Ask the restaurant for the prototype payment code after scanning.
            </p>
          </div>

          <input
            value={paymentCode}
            onChange={(e) => setPaymentCode(e.target.value.toUpperCase())}
            placeholder="Enter payment code"
            style={{
              width: "100%", padding: "13px 14px", borderRadius: 14,
              border: `1px solid ${BORDER}`, background: "white", color: TEXT_PRIMARY,
              fontSize: 14, fontWeight: 700, textAlign: "center", letterSpacing: "0.08em", outline: "none",
            }}
          />
        </section>

        <button
          onClick={() => router.push(`/customer/menu?resto=${restaurantId}&table=${tableId}`)}
          style={{
            width: "100%", padding: 12, borderRadius: 12, border: `1px dashed ${BORDER}`,
            background: "transparent", fontSize: 13, fontWeight: 600, color: TEXT_MUTED, cursor: "pointer",
          }}
        >
          + Add more items
        </button>
      </main>

      <div style={{
        position: "fixed", bottom: 0, left: 0, right: 0, padding: "12px 20px", zIndex: 90,
        background: "rgba(255,255,255,0.95)", backdropFilter: "blur(12px)", borderTop: `1px solid ${BORDER}`,
      }}>
        <div style={{ maxWidth: 480, margin: "0 auto" }}>
          <button
            onClick={handlePlaceOrder}
            disabled={!canPlaceOrder}
            style={{
              width: "100%", padding: 16, borderRadius: 14, border: "none",
              background: canPlaceOrder ? `linear-gradient(135deg, ${PRIMARY}, ${ACCENT})` : TEXT_MUTED,
              color: "white", fontSize: 16, fontWeight: 700,
              cursor: canPlaceOrder ? "pointer" : "not-allowed",
            }}
          >
            {placingOrder ? "Verifying Payment..." : `Place Order · ₹${cartTotal}`}
          </button>
          {!paymentCode.trim() && (
            <p style={{ margin: "8px 0 0", textAlign: "center", fontSize: 11, color: TEXT_MUTED }}>
              Enter the payment code to place the order.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: "100vh", background: "#FFFDF8", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ color: "#9B8B80", fontSize: 14 }}>Loading checkout...</p>
      </div>
    }>
      <CheckoutInner />
    </Suspense>
  );
}

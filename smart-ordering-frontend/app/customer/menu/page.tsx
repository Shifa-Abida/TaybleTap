"use client";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";

const PRIMARY = "#E8602E";
const GREEN = "#1A9E6B";
const SOFT_BG = "#FEF5EF";
const BORDER = "#F2E8E0";
const TEXT_PRIMARY = "#1A1A1A";
const TEXT_MUTED = "#9B8B80";

const CATEGORIES = ["All", "Starters", "Biryani", "Curries", "Breads", "Drinks", "Desserts"];

const CATEGORY_COLORS: Record<string, { bg: string; color: string }> = {
  Starters: { bg: "rgba(34,197,94,0.1)",   color: "#16A34A" },
  Biryani:  { bg: "rgba(232,96,46,0.1)",   color: PRIMARY   },
  Curries:  { bg: "rgba(245,158,11,0.1)",  color: "#D97706" },
  Breads:   { bg: "rgba(139,92,246,0.1)",  color: "#7C3AED" },
  Drinks:   { bg: "rgba(59,130,246,0.1)",  color: "#2563EB" },
  Desserts: { bg: "rgba(236,72,153,0.1)",  color: "#DB2777" },
};

const DEFAULT_ITEMS = [
  { name: "Chicken Biryani",      emoji: "🍚", price: 280, category: "Biryani",  desc: "Aromatic basmati rice with tender chicken & spices",    available: true  },
  { name: "Paneer Butter Masala", emoji: "🍛", price: 220, category: "Curries",  desc: "Rich tomato-based curry with soft paneer cubes",          available: true  },
  { name: "Tandoori Platter",     emoji: "🍗", price: 380, category: "Starters", desc: "Mixed grill platter with mint chutney",                  available: true  },
  { name: "Dal Makhani",          emoji: "🫕", price: 180, category: "Curries",  desc: "Slow-cooked black lentils in buttery tomato sauce",        available: true  },
  { name: "Garlic Naan",          emoji: "🫓", price: 60,  category: "Breads",   desc: "Soft naan brushed with garlic butter",                   available: true  },
  { name: "Gulab Jamun",          emoji: "🍮", price: 80,  category: "Desserts", desc: "Soft milk dumplings soaked in rose syrup",                available: true  },
  { name: "Mango Lassi",          emoji: "🥤", price: 90,  category: "Drinks",   desc: "Chilled mango yogurt drink",                            available: true  },
  { name: "Veg Spring Rolls",     emoji: "🥗", price: 120, category: "Starters", desc: "Crispy rolls stuffed with spiced vegetables",              available: true  },
  { name: "Mutton Biryani",       emoji: "🍲", price: 340, category: "Biryani",   desc: "Slow-cooked mutton with fragrant basmati rice",            available: true  },
  { name: "Masala Chai",          emoji: "☕", price: 40,  category: "Drinks",   desc: "Spiced Indian tea with ginger and cardamom",             available: true  },
  { name: "Butter Naan",          emoji: "🫓", price: 50,  category: "Breads",   desc: "Soft leavened bread baked in tandoor",                    available: true  },
  { name: "Rasmalai",             emoji: "🍮", price: 100, category: "Desserts", desc: "Soft cheese dumplings in sweetened milk",                available: true  },
  { name: "Chicken 65",           emoji: "🍗", price: 200, category: "Starters", desc: "Spicy deep-fried chicken with curry leaves",             available: true  },
  { name: "Kadai Paneer",         emoji: "🍛", price: 240, category: "Curries",  desc: "Paneer cooked in a spiced tomato gravy with peppers",     available: true  },
  { name: "Jeera Rice",           emoji: "🍚", price: 90,  category: "Biryani",  desc: "Fragrant basmati rice with cumin seeds",                  available: true  },
  { name: "Plain Dosa",           emoji: "🥞", price: 70,  category: "Starters", desc: "Crispy rice and lentil crepe with sambar & chutney",    available: true  },
  { name: "Chicken Fried Rice",   emoji: "🍳", price: 180, category: "Biryani",  desc: "Wok-tossed rice with chicken, egg & vegetables",          available: true  },
  { name: "Coca-Cola",            emoji: "🥤", price: 50,  category: "Drinks",   desc: "Chilled soft drink",                                   available: true  },
  { name: "Mango Cheesecake",     emoji: "🍰", price: 150, category: "Desserts", desc: "Creamy cheesecake with fresh mango topping",            available: true  },
  { name: "Roti",                 emoji: "🫓", price: 30,  category: "Breads",   desc: "Whole wheat flatbread baked on tandoor",                available: true  },
];

interface CartItem {
  id: string;
  name: string;
  price: number;
  emoji: string;
  quantity: number;
}

function Badge({ category }: { category: string }) {
  const c = CATEGORY_COLORS[category] || { bg: SOFT_BG, color: TEXT_MUTED };
  return (
    <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 12, background: c.bg, color: c.color }}>
      {category}
    </span>
  );
}

function MenuItemCard({ item, onAdd }: { item: any; onAdd: (item: any) => void }) {
  const [hovered, setHovered] = useState(false);
  const catC = CATEGORY_COLORS[item.category] || {};

  if (!item.available) return null;

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: "white", borderRadius: 16,
        border: `1px solid ${hovered ? "rgba(232,96,46,0.3)" : BORDER}`,
        overflow: "hidden", display: "flex", flexDirection: "column",
        transition: "all 0.2s ease",
        boxShadow: hovered ? "0 4px 16px rgba(232,96,46,0.1)" : "none",
      }}
    >
      <div style={{
        height: 100, background: catC.bg || SOFT_BG,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 44, position: "relative",
      }}>
        <span>{item.emoji}</span>
        <div style={{ position: "absolute", top: 8, left: 8 }}>
          <Badge category={item.category} />
        </div>
      </div>

      <div style={{ padding: "12px 14px", flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
          <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: TEXT_PRIMARY, lineHeight: 1.3 }}>
            {item.name}
          </h3>
          <span style={{ fontSize: 15, fontWeight: 800, color: PRIMARY, flexShrink: 0 }}>₹{item.price}</span>
        </div>

        <p style={{ margin: 0, fontSize: 11, color: TEXT_MUTED, lineHeight: 1.4, flex: 1 }}>
          {item.desc}
        </p>

        <button
          onClick={() => onAdd(item)}
          style={{
            width: "100%", padding: "10px 0", marginTop: 4,
            borderRadius: 10, border: "none",
            background: PRIMARY, color: "white",
            fontSize: 13, fontWeight: 700, cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
            transition: "all 0.15s",
          }}
          onMouseEnter={(e: any) => e.currentTarget.style.opacity = "0.85"}
          onMouseLeave={(e: any) => e.currentTarget.style.opacity = "1"}
        >
          <span style={{ fontSize: 14 }}>+</span> Add to Order
        </button>
      </div>
    </div>
  );
}

function CartItemRow({ item, onUpdate }: { item: CartItem; onUpdate: (id: string, delta: number) => void }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 12,
      padding: "12px 0", borderBottom: `1px solid ${BORDER}`,
    }}>
      <span style={{ fontSize: 24 }}>{item.emoji}</span>
      <div style={{ flex: 1 }}>
        <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: TEXT_PRIMARY }}>{item.name}</p>
        <p style={{ margin: 0, fontSize: 12, color: TEXT_MUTED }}>₹{item.price} each</p>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <button
          onClick={() => onUpdate(item.id, -1)}
          style={{
            width: 28, height: 28, borderRadius: 8, border: `1px solid ${BORDER}`,
            background: "white", fontSize: 16, color: TEXT_PRIMARY, cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >−</button>
        <span style={{ fontSize: 14, fontWeight: 700, minWidth: 20, textAlign: "center" }}>
          {item.quantity}
        </span>
        <button
          onClick={() => onUpdate(item.id, 1)}
          style={{
            width: 28, height: 28, borderRadius: 8, border: "none",
            background: PRIMARY, color: "white", fontSize: 16, cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >+</button>
      </div>
      <div style={{ minWidth: 50, textAlign: "right" }}>
        <span style={{ fontSize: 14, fontWeight: 700, color: TEXT_PRIMARY }}>
          ₹{item.price * item.quantity}
        </span>
      </div>
    </div>
  );
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

function CustomerMenuInner() {
  const searchParams = useSearchParams();
  const tableId = searchParams.get("table") || "1";
  const restaurantId = searchParams.get("resto") || "";
  const restaurantName = "TaybleTap Restaurant";

  const [items, setItems] = useState<any[]>(DEFAULT_ITEMS);
  const [activeCategory, setActiveCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [loading, setLoading] = useState(true);
  const [placingOrder, setPlacingOrder] = useState(false);

  useEffect(() => {
    // Try to fetch from API, fallback to defaults
    const fetchMenu = async () => {
      try {
        const token = localStorage.getItem("token");
        const headers: Record<string, string> = {};
        if (token) {
          headers["Authorization"] = `Bearer ${token}`;
        }
        // If we have a restaurant ID from URL, pass it as a query param
        const url = restaurantId
          ? `${API_URL}/api/menu/?restaurant_id=${restaurantId}`
          : `${API_URL}/api/menu/`;
        const res = await fetch(url, { headers });
        if (res.ok) {
          const data = await res.json();
          if (data.items && data.items.length > 0) {
            setItems(data.items);
          }
        }
      } catch {
        // Use defaults
      } finally {
        setLoading(false);
      }
    };
    fetchMenu();
  }, [restaurantId]);

  const filtered = items.filter((item) => {
    if (!item.available) return false;
    const matchCat = activeCategory === "All" || item.category === activeCategory;
    const matchSearch = item.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const addToCart = (item: any) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.name === item.name);
      if (existing) {
        return prev.map((i) =>
          i.name === item.name ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [
        ...prev,
        {
          id: item.id || Math.random().toString(36).substr(2, 9),
          name: item.name,
          price: item.price,
          emoji: item.emoji,
          quantity: 1,
        },
      ];
    });
  };

  const updateCartQuantity = (id: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item.id === id ? { ...item, quantity: item.quantity + delta } : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handlePlaceOrder = async () => {
    if (cart.length === 0) return;

    setPlacingOrder(true);
    try {
      // Prepare order items
      const orderItems = cart.map(item => ({
        name: item.name,
        price: item.price,
        qty: item.quantity,
      }));

      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/api/orders/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          table: parseInt(tableId) || 1,
          items: orderItems,
        }),
      });

      if (res.ok) {
        setOrderPlaced(true);
        setCart([]);
        setTimeout(() => {
          setOrderPlaced(false);
          setShowCart(false);
        }, 3000);
      } else {
        alert("Failed to place order. Please try again.");
      }
    } catch {
      alert("Failed to place order. Please try again.");
    } finally {
      setPlacingOrder(false);
    }
  };

  if (loading) {
    return (
      <div style={{
        minHeight: "100vh", background: "#FFFDF8",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <p style={{ color: TEXT_MUTED, fontSize: 14 }}>Loading menu...</p>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#FFFDF8", fontFamily: "'DM Sans', sans-serif", paddingBottom: 80 }}>
      {/* Header */}
      <header style={{
        background: "white", borderBottom: `1px solid ${BORDER}`,
        padding: "16px 20px", position: "sticky", top: 0, zIndex: 100,
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <p style={{ margin: 0, fontSize: 18, fontWeight: 700, color: TEXT_PRIMARY, fontFamily: "'Playfair Display', serif" }}>
              {restaurantName}
            </p>
            <p style={{ margin: "2px 0 0", fontSize: 12, color: TEXT_MUTED }}>
              Table {tableId} · Scan to order
            </p>
          </div>
          <button
            onClick={() => setShowCart(true)}
            style={{
              position: "relative",
              width: 48, height: 48, borderRadius: 14, border: "none",
              background: PRIMARY, color: "white", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 20,
            }}
          >
            🛒
            {cartCount > 0 && (
              <span style={{
                position: "absolute", top: -4, right: -4,
                width: 20, height: 20, borderRadius: "50%",
                background: GREEN, color: "white",
                fontSize: 11, fontWeight: 700,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* Search */}
      <div style={{ padding: "16px 20px" }}>
        <div style={{ position: "relative" }}>
          <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", fontSize: 16 }}>🔍</span>
          <input
            type="text"
            placeholder="Search dishes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: "100%", padding: "12px 14px 12px 40px",
              borderRadius: 14, border: `1px solid ${BORDER}`,
              fontSize: 14, color: TEXT_PRIMARY, background: "white",
              outline: "none", fontFamily: "inherit", boxSizing: "border-box",
            }}
          />
        </div>
      </div>

      {/* Categories */}
      <div style={{ padding: "0 20px 16px", display: "flex", gap: 8, overflowX: "auto", scrollbarWidth: "none" }}>
        {CATEGORIES.map((cat) => {
          const active = activeCategory === cat;
          const c = CATEGORY_COLORS[cat];
          return (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              style={{
                padding: "8px 16px", borderRadius: 20, cursor: "pointer",
                border: active ? `1px solid ${c?.color || PRIMARY}` : `1px solid ${BORDER}`,
                background: active ? (c?.bg || SOFT_BG) : "white",
                color: active ? (c?.color || PRIMARY) : TEXT_MUTED,
                fontSize: 13, fontWeight: active ? 700 : 500,
                whiteSpace: "nowrap", transition: "all 0.15s",
                flexShrink: 0,
              }}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Menu Grid */}
      <div style={{ padding: "0 20px" }}>
        <p style={{ margin: "0 0 16px", fontSize: 12, color: TEXT_MUTED, fontWeight: 500 }}>
          {filtered.length} dishes available
        </p>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
          gap: 12,
        }}>
          {filtered.map((item) => (
            <MenuItemCard key={item.id || item.name} item={item} onAdd={addToCart} />
          ))}
        </div>
        {filtered.length === 0 && (
          <div style={{ textAlign: "center", padding: "40px 0" }}>
            <span style={{ fontSize: 40 }}>🔍</span>
            <p style={{ marginTop: 12, fontSize: 14, color: TEXT_MUTED }}>No dishes found</p>
          </div>
        )}
      </div>

      {/* Cart Drawer */}
      {showCart && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)",
          zIndex: 1000, display: "flex", alignItems: "flex-end",
        }} onClick={() => setShowCart(false)}>
          <div style={{
            background: "white", borderRadius: "24px 24px 0 0",
            width: "100%", maxHeight: "80vh", padding: "24px 20px",
            animation: "slideUp 0.3s ease",
          }} onClick={(e: any) => e.stopPropagation()}>
            <style>{`
              @keyframes slideUp {
                from { transform: translateY(100%); }
                to { transform: translateY(0); }
              }
            `}</style>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
              <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: TEXT_PRIMARY }}>
                Your Order
              </h2>
              <button
                onClick={() => setShowCart(false)}
                style={{
                  width: 32, height: 32, borderRadius: 10, border: `1px solid ${BORDER}`,
                  background: SOFT_BG, cursor: "pointer", fontSize: 18, color: TEXT_MUTED,
                }}
              >
                ×
              </button>
            </div>

            {orderPlaced ? (
              <div style={{ textAlign: "center", padding: "40px 20px" }}>
                <span style={{ fontSize: 56 }}>✅</span>
                <h3 style={{ margin: "16px 0 8px", fontSize: 20, fontWeight: 700, color: TEXT_PRIMARY }}>
                  Order Placed!
                </h3>
                <p style={{ margin: 0, fontSize: 14, color: TEXT_MUTED }}>
                  Your order has been sent to the kitchen
                </p>
              </div>
            ) : cart.length === 0 ? (
              <div style={{ textAlign: "center", padding: "40px 20px" }}>
                <span style={{ fontSize: 48 }}>🛒</span>
                <p style={{ marginTop: 12, fontSize: 14, color: TEXT_MUTED }}>
                  Your cart is empty
                </p>
                <p style={{ margin: "4px 0 0", fontSize: 12, color: TEXT_MUTED }}>
                  Add some dishes to get started
                </p>
              </div>
            ) : (
              <>
                <div style={{ maxHeight: "40vh", overflowY: "auto" }}>
                  {cart.map((item) => (
                    <CartItemRow key={item.id} item={item} onUpdate={updateCartQuantity} />
                  ))}
                </div>

                <div style={{
                  marginTop: 20, padding: "20px 0",
                  borderTop: `1px solid ${BORDER}`,
                }}>
                  <div style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    marginBottom: 16,
                  }}>
                    <span style={{ fontSize: 16, fontWeight: 600, color: TEXT_PRIMARY }}>Total</span>
                    <span style={{ fontSize: 24, fontWeight: 800, color: PRIMARY }}>
                      ₹{cartTotal}
                    </span>
                  </div>
                  <button
                    onClick={handlePlaceOrder}
                    style={{
                      width: "100%", padding: "16px", borderRadius: 14,
                      border: "none", background: PRIMARY, color: "white",
                      fontSize: 16, fontWeight: 700, cursor: "pointer",
                      display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                    }}
                  >
                    ✓ Place Order
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function CustomerMenu() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: "100vh", background: "#FFFDF8", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ color: "#9B8B80", fontSize: 14 }}>Loading menu...</p>
      </div>
    }>
      <CustomerMenuInner />
    </Suspense>
  );
}
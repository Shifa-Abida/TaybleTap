"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

const PRIMARY = "#FF6B35";
const ACCENT = "#FFC947";
const GREEN = "#22C55E";
const BG = "#FFFDF8";
const CARD_BG = "#FFFFFF";
const BORDER = "#F0EDE8";
const TEXT_PRIMARY = "#1A1A1A";
const TEXT_SECONDARY = "#6B7280";
const TEXT_MUTED = "#9CA3AF";
const SOFT_ORANGE = "rgba(255,107,53,0.08)";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const categories = [
  { id: "all", label: "All Items", icon: "🍽️" },
  { id: "starters", label: "Starters", icon: "🥗" },
  { id: "main", label: "Main Course", icon: "🍛" },
  { id: "drinks", label: "Drinks", icon: "🥤" },
  { id: "desserts", label: "Desserts", icon: "🍮" },
  { id: "combos", label: "Combos", icon: "🎁" },
];

const suggestionChips = [
  { label: "Spicy", query: "I want spicy food" },
  { label: "Under ₹200", query: "Show food under ₹200" },
  { label: "Popular Today", query: "Show popular dishes" },
  { label: "Best Combos", query: "Suggest best combos" },
  { label: "Veg", query: "I want something veg" },
];

const catColors: Record<string, string> = {
  all: PRIMARY,
  starters: GREEN,
  main: PRIMARY,
  drinks: "#38BDF8",
  desserts: "#F472B6",
  combos: "#A78BFA",
};

const categoryAliases: Record<string, string> = {
  Starters: "starters",
  Biryani: "main",
  Curries: "main",
  Breads: "main",
  Drinks: "drinks",
  Desserts: "desserts",
  Combos: "combos",
};

const fallbackItems: MenuItem[] = [
  { id: "1", name: "Veg Spring Rolls", desc: "Crispy rolls stuffed with veggies and noodles", price: 120, category: "Starters", emoji: "🥢", available: true },
  { id: "2", name: "Chicken Tikka", desc: "Tender chicken marinated in spiced yogurt, grilled", price: 220, category: "Starters", emoji: "🍗", available: true },
  { id: "3", name: "Paneer Tikka", desc: "Smoky chargrilled cottage cheese with mint chutney", price: 180, category: "Starters", emoji: "🧀", available: true },
  { id: "4", name: "Chicken Biryani", desc: "Aromatic basmati rice with tender chicken and whole spices", price: 280, category: "Biryani", emoji: "🍚", available: true },
  { id: "5", name: "Paneer Butter Masala", desc: "Rich tomato-based curry with soft paneer cubes", price: 220, category: "Curries", emoji: "🍛", available: true },
  { id: "6", name: "Dal Makhani", desc: "Slow-cooked black lentils in buttery tomato sauce", price: 180, category: "Curries", emoji: "🫕", available: true },
  { id: "7", name: "Garlic Naan", desc: "Soft naan brushed with garlic butter and coriander", price: 60, category: "Breads", emoji: "🫓", available: true },
  { id: "8", name: "Mango Lassi", desc: "Thick creamy yogurt blended with Alphonso mango", price: 90, category: "Drinks", emoji: "🥭", available: true },
  { id: "9", name: "Cold Coffee", desc: "Strong espresso shaken with milk and ice", price: 100, category: "Drinks", emoji: "☕", available: true },
  { id: "10", name: "Gulab Jamun", desc: "Soft milk dumplings soaked in rose and cardamom syrup", price: 80, category: "Desserts", emoji: "🍮", available: true },
  { id: "11", name: "Thali Combo", desc: "2 curries, rotis, rice, dal and dessert in one complete meal", price: 320, category: "Combos", emoji: "🎁", available: true },
];

interface MenuItem {
  id: string;
  name: string;
  desc: string;
  price: number;
  category: string;
  emoji: string;
  available: boolean;
  image?: string;
  tags?: string[];
  popularity_score?: number;
}

interface CartItem {
  id: string;
  name: string;
  price: number;
  emoji: string;
  quantity: number;
}

interface RestaurantInfo {
  name: string;
  city: string;
}

interface CustomerProfile {
  id: string;
  name: string;
  phone: string;
}

interface ChatMessage {
  id: string;
  role: "assistant" | "user";
  text: string;
  items?: MenuItem[];
}

type PersonalizationChoice = "pending" | "personalize" | "guest";

type SpeechRecognitionResultEvent = {
  results: ArrayLike<ArrayLike<{ transcript: string }>>;
};

type SpeechRecognitionInstance = {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  onstart: (() => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
  onresult: ((event: SpeechRecognitionResultEvent) => void) | null;
  start: () => void;
};

type SpeechRecognitionConstructor = new () => SpeechRecognitionInstance;

function categoryId(item: MenuItem) {
  return categoryAliases[item.category] || item.category.toLowerCase();
}

function categoryColor(item: MenuItem) {
  return catColors[categoryId(item)] || PRIMARY;
}

function isVeg(item: MenuItem) {
  const text = `${item.name} ${item.desc}`.toLowerCase();
  return !/(chicken|mutton|fish|egg|prawn|meat)/.test(text);
}

function isBestSeller(item: MenuItem) {
  const text = item.name.toLowerCase();
  return /(biryani|tikka|lassi|gulab|combo|butter chicken)/.test(text);
}

function ratingFor(item: MenuItem) {
  const base = 4.3 + ((item.name.length + item.category.length) % 7) / 10;
  return Math.min(base, 4.9).toFixed(1);
}

function tagsFor(item: MenuItem) {
  if (item.tags?.length) return item.tags;
  const text = `${item.name} ${item.category} ${item.desc}`.toLowerCase();
  const tags = new Set<string>();
  if (/(chicken|mutton|fish|egg|prawn|meat)/.test(text)) tags.add("non-veg");
  else tags.add("veg");
  if (/(spicy|tikka|biryani|masala|chilli|65)/.test(text)) tags.add("spicy");
  if (/(sweet|dessert|gulab|rasmalai|kheer|lassi|mango)/.test(text)) tags.add("sweet");
  if (/(salad|soup|fresh|lime)/.test(text)) tags.add("healthy");
  if (/(paneer|cheese|cheesy)/.test(text)) tags.add("cheesy");
  if (/combo/.test(text) || item.category.toLowerCase() === "combos") tags.add("combo");
  if ((item.popularity_score ?? (isBestSeller(item) ? 88 : 65)) >= 80) tags.add("popular");
  return Array.from(tags);
}

function localRecommendations(items: MenuItem[], rawQuery: string) {
  const query = rawQuery.toLowerCase();
  return items
    .filter((item) => {
      const tags = tagsFor(item);
      const popularity = item.popularity_score ?? (isBestSeller(item) ? 88 : 65);
      if (/under\s*200|below\s*200|₹200|rs\.?\s*200/.test(query)) return item.price <= 200;
      if (/popular|best|famous/.test(query)) return popularity >= 80;
      if (/combo/.test(query)) return tags.includes("combo");
      if (/non[-\s]?veg|chicken/.test(query)) return tags.includes("non-veg");
      if (/veg|vegetarian/.test(query)) return tags.includes("veg");
      if (/spicy|hot/.test(query)) return tags.includes("spicy");
      if (/sweet|dessert/.test(query)) return tags.includes("sweet");
      if (/healthy|light/.test(query)) return tags.includes("healthy");
      if (/cheesy|cheese/.test(query)) return tags.includes("cheesy");
      return item.name.toLowerCase().includes(query) || item.desc.toLowerCase().includes(query);
    })
    .sort((a, b) => (b.popularity_score ?? 0) - (a.popularity_score ?? 0));
}

function VegIcon({ veg }: { veg: boolean }) {
  const color = veg ? GREEN : "#E53E3E";
  return (
    <div style={{
      width: 16, height: 16, borderRadius: 3, border: `2px solid ${color}`,
      display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
      background: "white",
    }}>
      <div style={{ width: 7, height: 7, borderRadius: "50%", background: color }} />
    </div>
  );
}

function StarRating({ rating }: { rating: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 3, flexShrink: 0 }}>
      <span style={{ fontSize: 11, color: ACCENT }}>★</span>
      <span style={{ fontSize: 11, fontWeight: 600, color: TEXT_SECONDARY }}>{rating}</span>
    </div>
  );
}

function FoodCard({
  item,
  onAdd,
  added,
  justAdded,
}: {
  item: MenuItem;
  onAdd: (item: MenuItem) => void;
  added: boolean;
  justAdded: boolean;
}) {
  const col = categoryColor(item);

  return (
    <div
      style={{
        background: CARD_BG,
        border: `1px solid ${BORDER}`,
        borderRadius: 20,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        animation: "cardIn 0.4s ease forwards",
        transition: "transform 0.18s, box-shadow 0.18s",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-4px)";
        e.currentTarget.style.boxShadow = "0 12px 32px rgba(0,0,0,0.07)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      <div style={{
        height: 120,
        background: `${col}15`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 52,
        position: "relative",
      }}>
        <span style={{ filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.1))", animation: "floatEmoji 3s ease-in-out infinite" }}>
          {item.emoji || "🍽️"}
        </span>
        {isBestSeller(item) && (
          <div style={{
            position: "absolute",
            top: 10,
            left: 10,
            background: `linear-gradient(135deg, ${PRIMARY}, ${ACCENT})`,
            color: "white",
            fontSize: 9,
            fontWeight: 700,
            padding: "3px 8px",
            borderRadius: 20,
            letterSpacing: "0.5px",
            textTransform: "uppercase",
          }}>
            🔥 Bestseller
          </div>
        )}
        <div style={{ position: "absolute", top: 10, right: 10 }}>
          <VegIcon veg={isVeg(item)} />
        </div>
      </div>

      <div style={{ padding: "12px 14px 14px", flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 6 }}>
          <p style={{ margin: 0, fontWeight: 700, fontSize: 13.5, color: TEXT_PRIMARY, lineHeight: 1.3 }}>{item.name}</p>
          <StarRating rating={ratingFor(item)} />
        </div>
        <p style={{ margin: 0, fontSize: 11.5, color: TEXT_MUTED, lineHeight: 1.5, flex: 1 }}>{item.desc}</p>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 6 }}>
          <span style={{ fontWeight: 800, fontSize: 16, color: TEXT_PRIMARY }}>₹{item.price}</span>
          <button
            onClick={() => onAdd(item)}
            style={{
              width: 34,
              height: 34,
              borderRadius: 11,
              background: justAdded ? GREEN : `linear-gradient(135deg, ${PRIMARY}, ${ACCENT})`,
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontSize: 18,
              fontWeight: 700,
              transition: "all 0.2s",
              transform: added ? "scale(0.92)" : "scale(1)",
            }}
          >
            {justAdded ? "✓" : "+"}
          </button>
        </div>
      </div>
    </div>
  );
}

function RecommendationCard({ item, onAdd }: { item: MenuItem; onAdd: (item: MenuItem) => void }) {
  const mainTag = tagsFor(item)[0] || "suggested";
  const col = categoryColor(item);

  return (
    <div style={{
      display: "flex", gap: 12, alignItems: "center",
      padding: 12, borderRadius: 16, background: "white",
      border: `1px solid ${BORDER}`, boxShadow: "0 4px 16px rgba(0,0,0,0.04)",
    }}>
      <div style={{
        width: 64, height: 64, borderRadius: 14, background: `${col}18`,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: item.image ? 0 : 30, overflow: "hidden", flexShrink: 0,
      }}>
        {item.image ? (
          <img src={item.image} alt={item.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : item.emoji || "🍽️"}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 4 }}>
          <p style={{ margin: 0, fontSize: 13.5, fontWeight: 800, color: TEXT_PRIMARY, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {item.name}
          </p>
          <span style={{
            fontSize: 10, fontWeight: 800, color: col, background: `${col}16`,
            borderRadius: 999, padding: "2px 7px", textTransform: "uppercase", flexShrink: 0,
          }}>{mainTag}</span>
        </div>
        <p style={{ margin: 0, fontSize: 11.5, lineHeight: 1.45, color: TEXT_MUTED }}>
          {item.desc}
        </p>
        <p style={{ margin: "5px 0 0", fontSize: 14, fontWeight: 900, color: PRIMARY }}>₹{item.price}</p>
      </div>
      <button
        onClick={() => onAdd(item)}
        style={{
          width: 34, height: 34, borderRadius: 11, border: "none", cursor: "pointer",
          background: `linear-gradient(135deg, ${PRIMARY}, ${ACCENT})`,
          color: "white", fontSize: 18, fontWeight: 900, flexShrink: 0,
        }}
      >
        +
      </button>
    </div>
  );
}

function PersonalizationChoiceScreen({
  restaurantName,
  tableId,
  onPersonalize,
  onGuest,
}: {
  restaurantName: string;
  tableId: string;
  onPersonalize: () => void;
  onGuest: () => void;
}) {
  return (
    <div style={{
      minHeight: "100vh",
      background: BG,
      fontFamily: "'DM Sans', 'Inter', sans-serif",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: 20,
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=DM+Sans:wght@400;500;600;700;800;900&display=swap');
        * { box-sizing:border-box; }
        button:active { transform: scale(0.97); }
      `}</style>

      <div style={{
        width: "100%",
        maxWidth: 440,
        display: "flex",
        flexDirection: "column",
        gap: 18,
      }}>
        <div style={{ textAlign: "center" }}>
          <div style={{
            width: 74,
            height: 74,
            margin: "0 auto 16px",
            borderRadius: 24,
            background: `linear-gradient(135deg, ${PRIMARY}, ${ACCENT})`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
            fontSize: 34,
            boxShadow: `0 16px 36px ${PRIMARY}33`,
          }}>
            ✨
          </div>
          <p style={{
            margin: 0,
            color: TEXT_PRIMARY,
            fontFamily: "'Playfair Display', serif",
            fontSize: 28,
            lineHeight: 1.15,
          }}>
            Want personalized suggestions?
          </p>
          <p style={{ margin: "10px 0 0", color: TEXT_SECONDARY, fontSize: 14, lineHeight: 1.55 }}>
            {restaurantName} can remember your taste and make the menu feel more familiar next time.
          </p>
        </div>

        <div style={{
          background: CARD_BG,
          border: `1px solid ${BORDER}`,
          borderRadius: 22,
          padding: 16,
          boxShadow: "0 14px 36px rgba(0,0,0,0.06)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
            <span style={{
              background: SOFT_ORANGE,
              color: PRIMARY,
              borderRadius: 999,
              padding: "6px 10px",
              fontSize: 12,
              fontWeight: 900,
            }}>
              Table {tableId}
            </span>
            <span style={{ color: TEXT_MUTED, fontSize: 12, fontWeight: 700 }}>Optional</span>
          </div>

          <div style={{ display: "grid", gap: 10, marginBottom: 16 }}>
            {[
              "Remember your name and mobile number after OTP verification",
              "Suggest dishes based on your previous orders and taste",
              "Still let you browse and order without creating a profile",
            ].map((text) => (
              <div key={text} style={{ display: "flex", gap: 9, alignItems: "flex-start" }}>
                <span style={{ color: GREEN, fontSize: 14, fontWeight: 900, marginTop: 1 }}>✓</span>
                <span style={{ color: TEXT_SECONDARY, fontSize: 13, lineHeight: 1.45 }}>{text}</span>
              </div>
            ))}
          </div>

          <button
            onClick={onPersonalize}
            style={{
              width: "100%",
              border: "none",
              borderRadius: 15,
              background: `linear-gradient(135deg, ${PRIMARY}, ${ACCENT})`,
              color: "white",
              cursor: "pointer",
              padding: "14px 16px",
              fontSize: 14,
              fontWeight: 900,
              fontFamily: "inherit",
              boxShadow: `0 8px 22px ${PRIMARY}33`,
            }}
          >
            Enter details for personalized suggestions
          </button>

          <button
            onClick={onGuest}
            style={{
              width: "100%",
              border: `1px solid ${BORDER}`,
              borderRadius: 15,
              background: "#F8F5F2",
              color: TEXT_SECONDARY,
              cursor: "pointer",
              padding: "13px 16px",
              fontSize: 13,
              fontWeight: 800,
              fontFamily: "inherit",
              marginTop: 10,
            }}
          >
            Continue without login
          </button>
        </div>
      </div>
    </div>
  );
}

function PersonalizationOtpScreen({
  restaurantName,
  tableId,
  onVerified,
  onBack,
  onGuest,
}: {
  restaurantName: string;
  tableId: string;
  onVerified: (customer: CustomerProfile) => void;
  onBack: () => void;
  onGuest: () => void;
}) {
  const searchParams = useSearchParams();
  const restaurantId = searchParams.get("resto") || "";
  const [step, setStep] = useState<"details" | "otp">("details");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [devOtp, setDevOtp] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const requestOtp = async () => {
    setError("");
    setInfo("");
    setDevOtp("");
    const cleanName = name.trim();
    const cleanPhone = phone.replace(/\D/g, "");

    if (cleanName.length < 2) {
      setError("Please enter your full name.");
      return;
    }
    if (cleanPhone.length < 10 || cleanPhone.length > 15) {
      setError("Please enter a valid phone number.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/api/customer/otp/request/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          restaurant_id: restaurantId,
          table: parseInt(tableId, 10) || tableId,
          name: cleanName,
          phone: cleanPhone,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Could not send OTP. Please try again.");
        return;
      }
      setPhone(cleanPhone);
      setStep("otp");
      setInfo(`OTP sent to the phone ending ${data.phone_last4 || cleanPhone.slice(-4)}.`);
      if (data.dev_otp) {
        setDevOtp(data.dev_otp);
      }
    } catch {
      setError("Could not connect to OTP service. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const verifyOtp = async () => {
    setError("");
    setInfo("");
    const cleanOtp = otp.trim();
    if (!/^\d{6}$/.test(cleanOtp)) {
      setError("Enter the 6-digit OTP.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/api/customer/otp/verify/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          restaurant_id: restaurantId,
          table: parseInt(tableId, 10) || tableId,
          phone,
          otp: cleanOtp,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "OTP verification failed.");
        return;
      }
      onVerified(data.customer);
    } catch {
      setError("Could not verify OTP. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: BG,
      fontFamily: "'DM Sans', 'Inter', sans-serif",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: 20,
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=DM+Sans:wght@400;500;600;700;800;900&display=swap');
        * { box-sizing:border-box; }
        input:focus { border-color: ${PRIMARY} !important; box-shadow: 0 0 0 3px ${SOFT_ORANGE}; }
      `}</style>

      <div style={{
        width: "100%",
        maxWidth: 440,
        background: CARD_BG,
        border: `1px solid ${BORDER}`,
        borderRadius: 24,
        padding: 20,
        boxShadow: "0 18px 48px rgba(0,0,0,0.08)",
      }}>
        <button
          onClick={onBack}
          type="button"
          style={{
            border: "none",
            background: "transparent",
            color: TEXT_MUTED,
            fontSize: 13,
            fontWeight: 800,
            cursor: "pointer",
            padding: 0,
            marginBottom: 18,
          }}
        >
          Back
        </button>

        <div style={{ marginBottom: 18 }}>
          <span style={{
            display: "inline-flex",
            background: SOFT_ORANGE,
            color: PRIMARY,
            borderRadius: 999,
            padding: "6px 10px",
            fontSize: 12,
            fontWeight: 900,
            marginBottom: 12,
          }}>
            Table {tableId}
          </span>
          <h1 style={{
            margin: 0,
            color: TEXT_PRIMARY,
            fontFamily: "'Playfair Display', serif",
            fontSize: 28,
            lineHeight: 1.15,
          }}>
            {step === "details" ? "Personalized ordering" : "Verify your phone"}
          </h1>
          <p style={{ margin: "10px 0 0", color: TEXT_SECONDARY, fontSize: 14, lineHeight: 1.55 }}>
            {step === "details"
              ? `${restaurantName} can remember your taste after a quick OTP verification.`
              : "Enter the OTP sent to your phone to continue to the menu."}
          </p>
        </div>

        <div style={{ display: "grid", gap: 12 }}>
          {step === "details" ? (
            <>
              <label style={{ display: "grid", gap: 7 }}>
                <span style={{ fontSize: 13, fontWeight: 800, color: TEXT_SECONDARY }}>Name</span>
                <input
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Enter your name"
                  autoComplete="name"
                  style={{
                    width: "100%",
                    border: `1px solid ${BORDER}`,
                    borderRadius: 14,
                    padding: "13px 14px",
                    fontSize: 15,
                    color: TEXT_PRIMARY,
                    fontFamily: "inherit",
                  }}
                />
              </label>
              <label style={{ display: "grid", gap: 7 }}>
                <span style={{ fontSize: 13, fontWeight: 800, color: TEXT_SECONDARY }}>Phone number</span>
                <input
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  placeholder="Enter mobile number"
                  inputMode="tel"
                  autoComplete="tel"
                  style={{
                    width: "100%",
                    border: `1px solid ${BORDER}`,
                    borderRadius: 14,
                    padding: "13px 14px",
                    fontSize: 15,
                    color: TEXT_PRIMARY,
                    fontFamily: "inherit",
                  }}
                />
              </label>
            </>
          ) : (
            <label style={{ display: "grid", gap: 7 }}>
              <span style={{ fontSize: 13, fontWeight: 800, color: TEXT_SECONDARY }}>OTP</span>
              <input
                value={otp}
                onChange={(event) => setOtp(event.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="6-digit OTP"
                inputMode="numeric"
                autoComplete="one-time-code"
                style={{
                  width: "100%",
                  border: `1px solid ${BORDER}`,
                  borderRadius: 14,
                  padding: "13px 14px",
                  fontSize: 18,
                  fontWeight: 900,
                  letterSpacing: "0.14em",
                  textAlign: "center",
                  color: TEXT_PRIMARY,
                  fontFamily: "inherit",
                }}
              />
            </label>
          )}

          {error && (
            <p style={{ margin: 0, color: "#E53E3E", background: "rgba(229,62,62,0.08)", borderRadius: 12, padding: "10px 12px", fontSize: 13, fontWeight: 700 }}>
              {error}
            </p>
          )}
          {info && (
            <p style={{ margin: 0, color: GREEN, background: "rgba(34,197,94,0.08)", borderRadius: 12, padding: "10px 12px", fontSize: 13, fontWeight: 700 }}>
              {info}
            </p>
          )}
          {devOtp && (
            <p style={{ margin: 0, color: TEXT_MUTED, background: "#F8F5F2", borderRadius: 12, padding: "10px 12px", fontSize: 12, lineHeight: 1.45 }}>
              Development OTP: <strong style={{ color: TEXT_PRIMARY }}>{devOtp}</strong>
            </p>
          )}

          <button
            onClick={step === "details" ? requestOtp : verifyOtp}
            disabled={submitting}
            type="button"
            style={{
              width: "100%",
              border: "none",
              borderRadius: 16,
              background: `linear-gradient(135deg, ${PRIMARY}, ${ACCENT})`,
              color: "white",
              cursor: submitting ? "wait" : "pointer",
              padding: "15px 16px",
              fontSize: 15,
              fontWeight: 900,
              fontFamily: "inherit",
              boxShadow: `0 8px 22px ${PRIMARY}33`,
              opacity: submitting ? 0.75 : 1,
            }}
          >
            {submitting ? "Please wait..." : step === "details" ? "Send OTP" : "Verify and open menu"}
          </button>

          {step === "otp" && (
            <button
              onClick={requestOtp}
              disabled={submitting}
              type="button"
              style={{
                width: "100%",
                border: `1px solid ${BORDER}`,
                borderRadius: 14,
                background: "#F8F5F2",
                color: TEXT_SECONDARY,
                cursor: submitting ? "wait" : "pointer",
                padding: "12px 16px",
                fontSize: 13,
                fontWeight: 800,
                fontFamily: "inherit",
              }}
            >
              Resend OTP
            </button>
          )}

          <button
            onClick={onGuest}
            type="button"
            style={{
              width: "100%",
              border: "none",
              background: "transparent",
              color: TEXT_MUTED,
              cursor: "pointer",
              padding: "8px 16px",
              fontSize: 13,
              fontWeight: 800,
              fontFamily: "inherit",
            }}
          >
            Continue without login
          </button>
        </div>
      </div>
    </div>
  );
}

function CustomerMenuInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const tableId = searchParams.get("table") || "1";
  const restaurantId = searchParams.get("resto") || "";
  const cartStorageKey = `cart_${restaurantId}_${tableId}`;
  const personalizationStorageKey = `personalization_choice_${restaurantId}_${tableId}`;
  const customerStorageKey = `customer_profile_${restaurantId}_${tableId}`;
  const tabsRef = useRef<HTMLDivElement | null>(null);

  const [restaurant, setRestaurant] = useState<RestaurantInfo>({ name: "Restaurant", city: "" });
  const [items, setItems] = useState<MenuItem[]>([]);
  const [activeCategory, setActiveCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState<CartItem[]>(() => {
    if (typeof window === "undefined") return [];
    const saved = window.sessionStorage.getItem(cartStorageKey);
    if (!saved) return [];
    try {
      return JSON.parse(saved);
    } catch {
      return [];
    }
  });
  const [justAdded, setJustAdded] = useState<Record<string, boolean>>({});
  const [cartOpen, setCartOpen] = useState(false);
  const [assistantOpen, setAssistantOpen] = useState(false);
  const [cartBounce, setCartBounce] = useState(false);
  const [loading, setLoading] = useState(true);
  const [personalizationChoice, setPersonalizationChoice] = useState<PersonalizationChoice>(() => {
    if (typeof window === "undefined") return "pending";
    const saved = window.sessionStorage.getItem(personalizationStorageKey);
    return saved === "personalize" || saved === "guest" ? saved : "pending";
  });
  const [customerProfile, setCustomerProfile] = useState<CustomerProfile | null>(() => {
    if (typeof window === "undefined") return null;
    const saved = window.sessionStorage.getItem(customerStorageKey);
    if (!saved) return null;
    try {
      return JSON.parse(saved);
    } catch {
      return null;
    }
  });
  const [suggestionQuery, setSuggestionQuery] = useState("");
  const [recommendations, setRecommendations] = useState<MenuItem[]>([]);
  const [recommendationMessage, setRecommendationMessage] = useState("");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      text: "Hi, tell me what you feel like eating. I can suggest spicy, veg, popular, combo, or budget-friendly dishes.",
    },
  ]);
  const [suggesting, setSuggesting] = useState(false);
  const [listening, setListening] = useState(false);

  useEffect(() => {
    if (!restaurantId) return;
    sessionStorage.setItem(cartStorageKey, JSON.stringify(cart));
  }, [cart, cartStorageKey, restaurantId]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const menuRes = await fetch(`${API_URL}/api/customer/menu/?resto=${restaurantId}`);
        if (menuRes.ok) {
          const data = await menuRes.json();
          const liveItems = Array.isArray(data.items) ? data.items : [];
          setItems(liveItems.length > 0 ? liveItems : fallbackItems);
          if (data.restaurant_name) {
            setRestaurant((prev) => ({ ...prev, name: data.restaurant_name }));
          }
        } else {
          setItems(fallbackItems);
        }

        if (restaurantId) {
          const infoRes = await fetch(`${API_URL}/api/customer/restaurant/?resto=${restaurantId}`);
          if (infoRes.ok) {
            const info = await infoRes.json();
            setRestaurant((prev) => ({
              name: info.restaurant_name || prev.name,
              city: info.city || "",
            }));
          }
        }
      } catch {
        setItems(fallbackItems);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [restaurantId]);

  const filtered = useMemo(() => items.filter((item) => {
    if (!item.available) return false;
    const matchCat = activeCategory === "all" || categoryId(item) === activeCategory;
    const needle = search.toLowerCase();
    const matchSearch = item.name.toLowerCase().includes(needle) || item.desc.toLowerCase().includes(needle);
    return matchCat && matchSearch;
  }), [activeCategory, items, search]);

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const choosePersonalization = (choice: Exclude<PersonalizationChoice, "pending">) => {
    window.sessionStorage.setItem(personalizationStorageKey, choice);
    setPersonalizationChoice(choice);

    if (choice === "guest") {
      window.sessionStorage.removeItem(customerStorageKey);
      setCustomerProfile(null);
    }
  };

  const handlePersonalizationVerified = (customer: CustomerProfile) => {
    window.sessionStorage.setItem(personalizationStorageKey, "personalize");
    window.sessionStorage.setItem(customerStorageKey, JSON.stringify(customer));
    setPersonalizationChoice("personalize");
    setCustomerProfile(customer);
    setChatMessages((prev) => [
      ...prev,
      {
        id: `personalize-${Date.now()}`,
        role: "assistant",
        text: `Welcome ${customer.name}. I can now suggest dishes based on your preferences and future visits.`,
      },
    ]);
    setAssistantOpen(true);
  };

  const addToCart = (item: MenuItem) => {
    setCart((prev) => {
      const existing = prev.find((cartItem) => cartItem.id === item.id);
      if (existing) {
        return prev.map((cartItem) =>
          cartItem.id === item.id ? { ...cartItem, quantity: cartItem.quantity + 1 } : cartItem
        );
      }

      return [...prev, {
        id: item.id,
        name: item.name,
        price: item.price,
        emoji: item.emoji || "🍽️",
        quantity: 1,
      }];
    });
    setJustAdded((prev) => ({ ...prev, [item.id]: true }));
    setCartBounce(true);
    window.setTimeout(() => setJustAdded((prev) => ({ ...prev, [item.id]: false })), 900);
    window.setTimeout(() => setCartBounce(false), 400);
  };

  const speakAssistantReply = (message: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(message);
    utterance.lang = "en-IN";
    utterance.rate = 0.95;
    utterance.pitch = 1.05;
    window.speechSynthesis.speak(utterance);
  };

  const buildAssistantReply = (matches: MenuItem[]) => {
    if (matches.length === 0) {
      return "Sorry, I could not find matching options right now. You can try spicy, veg, popular, combo, or under 200.";
    }

    const names = matches.slice(0, 3).map((item) => item.name);
    const dishList = names.length === 1
      ? names[0]
      : `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}`;
    return `Okay, these are the options we have: ${dishList}.`;
  };

  const runSuggestion = async (queryOverride?: string, speakReply = false) => {
    const query = (queryOverride ?? suggestionQuery).trim();
    if (!query) return;
    const requestId = Date.now().toString();

    setSuggestionQuery(query);
    setSuggesting(true);
    setRecommendationMessage("");
    setChatMessages((prev) => [
      ...prev,
      { id: `user-${requestId}`, role: "user", text: query },
    ]);

    try {
      const res = await fetch(`${API_URL}/api/customer/recommendations/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ restaurant_id: restaurantId, query }),
      });

      if (res.ok) {
        const data = await res.json();
        const resultItems = Array.isArray(data.items) ? data.items : [];
        const finalItems = resultItems.length > 0 ? resultItems : localRecommendations(items, query);
        const reply = buildAssistantReply(finalItems);
        setRecommendations(finalItems);
        setRecommendationMessage(data.message || "");
        setChatMessages((prev) => [
          ...prev,
          { id: `assistant-${requestId}`, role: "assistant", text: reply, items: finalItems },
        ]);
        setSuggestionQuery("");
        if (speakReply) {
          speakAssistantReply(reply);
        }
        return;
      }
    } catch {
      // Fall back to local rule matching below.
    } finally {
      setSuggesting(false);
    }

    const localMatches = localRecommendations(items, query);
    const reply = buildAssistantReply(localMatches);
    setRecommendations(localMatches);
    setChatMessages((prev) => [
      ...prev,
      { id: `assistant-${requestId}`, role: "assistant", text: reply, items: localMatches },
    ]);
    setSuggestionQuery("");
    setRecommendationMessage(localMatches.length ? "" : "No matching dishes found. Try spicy, veg, popular, combo, or under ₹200.");
    if (speakReply) {
      speakAssistantReply(reply);
    }
  };

  const startVoiceInput = () => {
    if (typeof window === "undefined") return;
    const speechWindow = window as Window & {
      SpeechRecognition?: SpeechRecognitionConstructor;
      webkitSpeechRecognition?: SpeechRecognitionConstructor;
    };
    const Recognition = speechWindow.SpeechRecognition || speechWindow.webkitSpeechRecognition;
    if (!Recognition) {
      setRecommendationMessage("Voice input is not supported in this browser. Please type your craving.");
      return;
    }

    const recognition = new Recognition();
    recognition.lang = "en-IN";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.onstart = () => setListening(true);
    recognition.onend = () => setListening(false);
    recognition.onerror = () => {
      setListening(false);
      setRecommendationMessage("Could not hear that clearly. Please try again or type your request.");
    };
    recognition.onresult = (event) => {
      const transcript = event.results[0]?.[0]?.transcript || "";
      setSuggestionQuery(transcript);
      runSuggestion(transcript, true);
    };
    recognition.start();
  };

  const updateQty = (id: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => item.id === id ? { ...item, quantity: item.quantity + delta } : item)
        .filter((item) => item.quantity > 0)
    );
  };

  const goToCheckout = () => {
    setCartOpen(false);
    router.push(`/customer/checkout?resto=${restaurantId}&table=${tableId}`);
  };

  if (loading) {
    return (
      <div style={{
        minHeight: "100vh",
        background: BG,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        gap: 12,
      }}>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <div style={{
          width: 40,
          height: 40,
          border: `3px solid ${BORDER}`,
          borderTopColor: PRIMARY,
          borderRadius: "50%",
          animation: "spin 0.8s linear infinite",
        }} />
        <p style={{ color: TEXT_MUTED, fontSize: 14 }}>Loading menu...</p>
      </div>
    );
  }

  if (personalizationChoice === "pending") {
    return (
      <PersonalizationChoiceScreen
        restaurantName={restaurant.name}
        tableId={tableId}
        onPersonalize={() => choosePersonalization("personalize")}
        onGuest={() => choosePersonalization("guest")}
      />
    );
  }

  if (personalizationChoice === "personalize" && !customerProfile) {
    return (
      <PersonalizationOtpScreen
        restaurantName={restaurant.name}
        tableId={tableId}
        onVerified={handlePersonalizationVerified}
        onBack={() => {
          window.sessionStorage.removeItem(personalizationStorageKey);
          setPersonalizationChoice("pending");
        }}
        onGuest={() => choosePersonalization("guest")}
      />
    );
  }

  return (
    <div style={{ background: BG, minHeight: "100vh", fontFamily: "'DM Sans', 'Inter', sans-serif", position: "relative" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=DM+Sans:wght@400;500;600;700&display=swap');
        @keyframes cardIn { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
        @keyframes floatEmoji { 0%,100%{ transform:translateY(0); } 50%{ transform:translateY(-5px); } }
        @keyframes slideUp { from { transform:translateY(100%); opacity:0; } to { transform:translateY(0); opacity:1; } }
        @keyframes cartBounce { 0%,100%{transform:scale(1)} 40%{transform:scale(1.18)} 70%{transform:scale(0.94)} }
        @keyframes fadeIn { from{opacity:0} to{opacity:1} }
        ::-webkit-scrollbar { display: none; }
        * { -ms-overflow-style:none; scrollbar-width:none; box-sizing:border-box; }
        input:focus { outline: none; }
        button:active { transform: scale(0.94); }
      `}</style>

      <div style={{
        position: "sticky",
        top: 0,
        zIndex: 100,
        background: "rgba(255,253,248,0.92)",
        backdropFilter: "blur(20px)",
        borderBottom: `1px solid ${BORDER}`,
      }}>
        <div style={{ padding: "14px 18px 12px", display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            width: 44,
            height: 44,
            borderRadius: 14,
            background: `linear-gradient(135deg, ${PRIMARY}, ${ACCENT})`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 22,
            flexShrink: 0,
          }}>🍽️</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ margin: 0, fontWeight: 700, fontSize: 16, color: TEXT_PRIMARY, fontFamily: "'Playfair Display', serif" }}>
              {restaurant.name}
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 2, flexWrap: "wrap" }}>
              <span style={{ fontSize: 11, color: TEXT_MUTED }}>🏪 Table</span>
              <span style={{
                fontSize: 11,
                fontWeight: 700,
                color: PRIMARY,
                background: SOFT_ORANGE,
                padding: "1px 8px",
                borderRadius: 20,
              }}>Table {tableId}</span>
              <span style={{ width: 4, height: 4, borderRadius: "50%", background: GREEN, display: "inline-block" }} />
              <span style={{ fontSize: 11, color: GREEN, fontWeight: 600 }}>Open</span>
            </div>
          </div>
          <div style={{ textAlign: "right", flexShrink: 0 }}>
            <p style={{ margin: 0, fontSize: 10, color: TEXT_MUTED }}>{restaurant.city || "Dining"}</p>
            <div style={{ display: "flex", alignItems: "center", gap: 3, justifyContent: "flex-end" }}>
              <span style={{ color: ACCENT, fontSize: 12 }}>★</span>
              <span style={{ fontSize: 12, fontWeight: 600, color: TEXT_SECONDARY }}>4.8</span>
            </div>
          </div>
        </div>

        <div style={{ padding: "0 18px 12px" }}>
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            background: "#F8F5F2",
            borderRadius: 14,
            padding: "10px 14px",
            border: `1px solid ${BORDER}`,
          }}>
            <span style={{ fontSize: 16, color: TEXT_MUTED }}>🔍</span>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search dishes, cuisines..."
              style={{
                flex: 1,
                border: "none",
                background: "transparent",
                fontSize: 13.5,
                color: TEXT_PRIMARY,
                fontFamily: "inherit",
                minWidth: 0,
              }}
            />
            {search && (
              <button onClick={() => setSearch("")} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 16, color: TEXT_MUTED }}>✕</button>
            )}
          </div>
        </div>

        <div style={{ position: "relative", padding: "0 0 12px" }}>
          <div ref={tabsRef} style={{
            display: "flex",
            gap: 8,
            overflowX: "auto",
            padding: "0 18px",
            scrollBehavior: "smooth",
          }}>
            {categories.map((cat) => {
              const isActive = activeCategory === cat.id;
              const col = catColors[cat.id] || PRIMARY;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "7px 14px",
                    borderRadius: 24,
                    border: "none",
                    cursor: "pointer",
                    background: isActive ? col : "#F8F5F2",
                    color: isActive ? "white" : TEXT_SECONDARY,
                    fontWeight: isActive ? 700 : 500,
                    fontSize: 12.5,
                    whiteSpace: "nowrap",
                    flexShrink: 0,
                    transition: "all 0.2s",
                    boxShadow: isActive ? `0 4px 14px ${col}44` : "none",
                    fontFamily: "inherit",
                  }}
                >
                  <span style={{ fontSize: 14 }}>{cat.icon}</span>
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <section style={{ display: "none", padding: "18px 18px 0" }}>
        <div style={{
          background: "linear-gradient(135deg, rgba(255,107,53,0.1), rgba(255,201,71,0.13))",
          border: `1px solid ${BORDER}`,
          borderRadius: 22,
          padding: 16,
          boxShadow: "0 10px 34px rgba(255,107,53,0.08)",
        }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 12 }}>
            <div>
              <p style={{ margin: 0, fontSize: 16, fontWeight: 900, color: TEXT_PRIMARY }}>Smart Suggestions</p>
              <p style={{ margin: "2px 0 0", fontSize: 12, color: TEXT_MUTED }}>Tell the assistant what you feel like eating.</p>
            </div>
            <div style={{
              width: 42, height: 42, borderRadius: 14,
              display: "flex", alignItems: "center", justifyContent: "center",
              background: `linear-gradient(135deg, ${PRIMARY}, ${ACCENT})`,
              color: "white", fontSize: 20, flexShrink: 0,
            }}>✨</div>
          </div>

          <div style={{
            display: "flex", alignItems: "center", gap: 8,
            background: "white", border: `1px solid ${BORDER}`,
            borderRadius: 16, padding: "8px 10px", marginBottom: 10,
          }}>
            <input
              value={suggestionQuery}
              onChange={(event) => setSuggestionQuery(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") runSuggestion();
              }}
              placeholder="Tell us what you feel like eating..."
              style={{
                flex: 1, border: "none", outline: "none", background: "transparent",
                color: TEXT_PRIMARY, fontSize: 13.5, fontFamily: "inherit", minWidth: 0,
              }}
            />
            <button
              onClick={startVoiceInput}
              title="Use voice input"
              style={{
                width: 34, height: 34, borderRadius: 11, border: "none", cursor: "pointer",
                background: listening ? GREEN : SOFT_ORANGE, color: listening ? "white" : PRIMARY,
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16,
              }}
            >
              🎙️
            </button>
            <button
              onClick={() => runSuggestion()}
              disabled={suggesting}
              style={{
                height: 34, borderRadius: 11, border: "none", cursor: suggesting ? "wait" : "pointer",
                background: `linear-gradient(135deg, ${PRIMARY}, ${ACCENT})`,
                color: "white", fontSize: 12.5, fontWeight: 800,
                padding: "0 14px", fontFamily: "inherit",
              }}
            >
              {suggesting ? "..." : "Suggest"}
            </button>
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>
            {suggestionChips.map((chip) => (
              <button
                key={chip.label}
                onClick={() => runSuggestion(chip.query)}
                style={{
                  border: "none", borderRadius: 999, background: "white", color: TEXT_SECONDARY,
                  padding: "7px 11px", fontSize: 12, fontWeight: 800, cursor: "pointer",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                }}
              >
                {chip.label}
              </button>
            ))}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 12 }}>
            {chatMessages.map((message) => {
              const isUser = message.role === "user";
              return (
                <div
                  key={message.id}
                  style={{
                    display: "flex",
                    justifyContent: isUser ? "flex-end" : "flex-start",
                  }}
                >
                  <div style={{
                    maxWidth: isUser ? "82%" : "100%",
                    width: isUser ? "auto" : "100%",
                    display: "flex",
                    flexDirection: "column",
                    gap: 10,
                    alignItems: isUser ? "flex-end" : "stretch",
                  }}>
                    <div style={{
                      alignSelf: isUser ? "flex-end" : "flex-start",
                      background: isUser ? `linear-gradient(135deg, ${PRIMARY}, ${ACCENT})` : "white",
                      color: isUser ? "white" : TEXT_PRIMARY,
                      border: isUser ? "none" : `1px solid ${BORDER}`,
                      borderRadius: isUser ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                      padding: "9px 12px",
                      fontSize: 12.5,
                      fontWeight: isUser ? 800 : 700,
                      lineHeight: 1.45,
                      boxShadow: isUser ? `0 4px 14px ${PRIMARY}33` : "0 3px 12px rgba(0,0,0,0.04)",
                    }}>
                      {message.text}
                    </div>

                    {!!message.items?.length && (
                      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                        {message.items.map((item) => (
                          <RecommendationCard key={`${message.id}-${item.id || item.name}`} item={item} onAdd={addToCart} />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {recommendationMessage && recommendations.length === 0 && (
              <p style={{ margin: 0, color: TEXT_MUTED, fontSize: 12.5, lineHeight: 1.5 }}>
                {recommendationMessage}
              </p>
            )}
          </div>

          {suggesting && (
            <div style={{ display: "flex", justifyContent: "flex-start", marginTop: 10 }}>
              <div style={{
                background: "white",
                color: TEXT_MUTED,
                border: `1px solid ${BORDER}`,
                borderRadius: "16px 16px 16px 4px",
                padding: "9px 12px",
                fontSize: 12.5,
                fontWeight: 700,
              }}>
                Finding dishes...
              </div>
            </div>
          )}
        </div>
      </section>

      <div style={{ padding: "18px 18px 120px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, gap: 12 }}>
          <p style={{ margin: 0, fontSize: 13, color: TEXT_MUTED }}>
            <span style={{ fontWeight: 700, color: TEXT_PRIMARY }}>{filtered.length}</span> items
            {search && <span> for &quot;<strong style={{ color: PRIMARY }}>{search}</strong>&quot;</span>}
          </p>
          <span style={{ fontSize: 11, color: TEXT_MUTED, whiteSpace: "nowrap" }}>
            {categories.find((cat) => cat.id === activeCategory)?.label || "All Categories"}
          </span>
        </div>

        {filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 20px" }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🍽️</div>
            <p style={{ fontWeight: 700, color: TEXT_PRIMARY, margin: "0 0 6px" }}>No dishes found</p>
            <p style={{ color: TEXT_MUTED, fontSize: 13 }}>Try a different search or category</p>
          </div>
        ) : (
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
            gap: 14,
          }}>
            {filtered.map((item, index) => (
              <div key={item.id || item.name} style={{ animationDelay: `${index * 0.05}s` }}>
                <FoodCard
                  item={item}
                  onAdd={addToCart}
                  added={cart.some((cartItem) => cartItem.id === item.id)}
                  justAdded={!!justAdded[item.id]}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {assistantOpen && (
        <button
          onClick={() => setAssistantOpen(false)}
          aria-label="Close personalized assistant"
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 240,
            border: "none",
            background: "rgba(0,0,0,0.28)",
            cursor: "pointer",
            animation: "fadeIn 0.18s ease",
          }}
        />
      )}

      <aside
        aria-label="Personalized assistant"
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          zIndex: 260,
          width: "min(430px, calc(100vw - 22px))",
          height: "100vh",
          background: CARD_BG,
          borderLeft: `1px solid ${BORDER}`,
          boxShadow: "-18px 0 50px rgba(0,0,0,0.16)",
          transform: assistantOpen ? "translateX(0)" : "translateX(calc(100% + 28px))",
          transition: "transform 0.28s cubic-bezier(0.22,1,0.36,1)",
          display: "flex",
          flexDirection: "column",
          fontFamily: "'DM Sans', 'Inter', sans-serif",
        }}
      >
        <div style={{
          padding: "18px 18px 14px",
          borderBottom: `1px solid ${BORDER}`,
          background: "linear-gradient(135deg, rgba(255,107,53,0.08), rgba(255,201,71,0.12))",
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 14, alignItems: "flex-start" }}>
            <div>
              <p style={{ margin: 0, fontSize: 18, fontWeight: 900, color: TEXT_PRIMARY }}>
                Personalized Assistant
              </p>
              <p style={{ margin: "5px 0 0", fontSize: 12.5, color: TEXT_SECONDARY, lineHeight: 1.45 }}>
                {customerProfile
                  ? `Hi ${customerProfile.name}, ask for food by mood, budget, or taste.`
                  : "Ask for food by mood, budget, or taste."}
              </p>
            </div>
            <button
              onClick={() => setAssistantOpen(false)}
              aria-label="Close"
              style={{
                width: 34,
                height: 34,
                borderRadius: 12,
                border: `1px solid ${BORDER}`,
                background: "white",
                cursor: "pointer",
                color: TEXT_SECONDARY,
                fontSize: 18,
                flexShrink: 0,
              }}
            >
              x
            </button>
          </div>
        </div>

        <div style={{ padding: 16, borderBottom: `1px solid ${BORDER}` }}>
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            background: "#F8F5F2",
            border: `1px solid ${BORDER}`,
            borderRadius: 16,
            padding: "8px 10px",
          }}>
            <input
              value={suggestionQuery}
              onChange={(event) => setSuggestionQuery(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") runSuggestion();
              }}
              placeholder="What do you feel like eating?"
              style={{
                flex: 1,
                border: "none",
                outline: "none",
                background: "transparent",
                color: TEXT_PRIMARY,
                fontSize: 13.5,
                fontFamily: "inherit",
                minWidth: 0,
              }}
            />
            <button
              onClick={startVoiceInput}
              title="Use voice input"
              style={{
                width: 34,
                height: 34,
                borderRadius: 11,
                border: "none",
                cursor: "pointer",
                background: listening ? GREEN : SOFT_ORANGE,
                color: listening ? "white" : PRIMARY,
                fontSize: 15,
              }}
            >
              mic
            </button>
            <button
              onClick={() => runSuggestion()}
              disabled={suggesting}
              style={{
                height: 34,
                borderRadius: 11,
                border: "none",
                cursor: suggesting ? "wait" : "pointer",
                background: `linear-gradient(135deg, ${PRIMARY}, ${ACCENT})`,
                color: "white",
                fontSize: 12.5,
                fontWeight: 800,
                padding: "0 14px",
                fontFamily: "inherit",
              }}
            >
              {suggesting ? "..." : "Ask"}
            </button>
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 12 }}>
            {suggestionChips.map((chip) => (
              <button
                key={chip.label}
                onClick={() => runSuggestion(chip.query)}
                style={{
                  border: `1px solid ${BORDER}`,
                  borderRadius: 999,
                  background: "white",
                  color: TEXT_SECONDARY,
                  padding: "7px 11px",
                  fontSize: 12,
                  fontWeight: 800,
                  cursor: "pointer",
                }}
              >
                {chip.label}
              </button>
            ))}
          </div>
        </div>

        <div style={{
          flex: 1,
          overflowY: "auto",
          padding: 16,
          display: "flex",
          flexDirection: "column",
          gap: 12,
          background: BG,
        }}>
          {chatMessages.map((message) => {
            const isUser = message.role === "user";
            return (
              <div
                key={message.id}
                style={{
                  alignSelf: isUser ? "flex-end" : "flex-start",
                  maxWidth: "100%",
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                  alignItems: isUser ? "flex-end" : "stretch",
                }}
              >
                <div style={{
                  background: isUser ? `linear-gradient(135deg, ${PRIMARY}, ${ACCENT})` : "white",
                  color: isUser ? "white" : TEXT_PRIMARY,
                  border: isUser ? "none" : `1px solid ${BORDER}`,
                  borderRadius: isUser ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                  padding: "10px 12px",
                  fontSize: 12.5,
                  fontWeight: 700,
                  lineHeight: 1.45,
                  boxShadow: "0 3px 12px rgba(0,0,0,0.04)",
                }}>
                  {message.text}
                </div>

                {!!message.items?.length && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 10, width: "100%" }}>
                    {message.items.map((item) => (
                      <RecommendationCard key={`${message.id}-${item.id || item.name}`} item={item} onAdd={addToCart} />
                    ))}
                  </div>
                )}
              </div>
            );
          })}

          {recommendationMessage && recommendations.length === 0 && (
            <p style={{
              margin: 0,
              color: TEXT_MUTED,
              fontSize: 12.5,
              lineHeight: 1.5,
              background: "white",
              border: `1px solid ${BORDER}`,
              borderRadius: 14,
              padding: "10px 12px",
            }}>
              {recommendationMessage}
            </p>
          )}

          {suggesting && (
            <div style={{
              alignSelf: "flex-start",
              background: "white",
              color: TEXT_MUTED,
              border: `1px solid ${BORDER}`,
              borderRadius: "16px 16px 16px 4px",
              padding: "10px 12px",
              fontSize: 12.5,
              fontWeight: 700,
            }}>
              Finding dishes...
            </div>
          )}
        </div>
      </aside>

      {cartOpen && (
        <div
          onClick={() => setCartOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.4)",
            zIndex: 200,
            animation: "fadeIn 0.2s ease",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              background: CARD_BG,
              borderRadius: "24px 24px 0 0",
              padding: "20px 18px 36px",
              maxHeight: "75vh",
              overflowY: "auto",
              animation: "slideUp 0.3s ease",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
              <p style={{ margin: 0, fontWeight: 800, fontSize: 17, color: TEXT_PRIMARY, fontFamily: "'Playfair Display', serif" }}>
                🛒 Your Cart
              </p>
              <button onClick={() => setCartOpen(false)} style={{
                width: 32,
                height: 32,
                borderRadius: 10,
                background: "#F0EDE8",
                border: "none",
                cursor: "pointer",
                fontSize: 15,
                color: TEXT_SECONDARY,
              }}>✕</button>
            </div>

            {cartCount === 0 ? (
              <div style={{ textAlign: "center", padding: "30px 0" }}>
                <div style={{ fontSize: 42, marginBottom: 10 }}>🛒</div>
                <p style={{ color: TEXT_MUTED, margin: 0 }}>Your cart is empty</p>
              </div>
            ) : (
              <>
                {cart.map((item) => (
                  <div key={item.id} style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "12px 0",
                    borderBottom: `1px solid ${BORDER}`,
                  }}>
                    <div style={{
                      width: 42,
                      height: 42,
                      borderRadius: 12,
                      background: `${PRIMARY}15`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 22,
                      flexShrink: 0,
                    }}>{item.emoji}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ margin: 0, fontWeight: 600, fontSize: 13, color: TEXT_PRIMARY }}>{item.name}</p>
                      <p style={{ margin: "2px 0 0", fontSize: 12, color: TEXT_MUTED }}>₹{item.price} each</p>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <button onClick={() => updateQty(item.id, -1)} style={{
                        width: 26,
                        height: 26,
                        borderRadius: 8,
                        background: "#F0EDE8",
                        border: "none",
                        cursor: "pointer",
                        fontSize: 14,
                        fontWeight: 700,
                        color: TEXT_SECONDARY,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}>−</button>
                      <span style={{ fontWeight: 700, fontSize: 14, color: TEXT_PRIMARY, minWidth: 16, textAlign: "center" }}>{item.quantity}</span>
                      <button onClick={() => updateQty(item.id, 1)} style={{
                        width: 26,
                        height: 26,
                        borderRadius: 8,
                        background: `linear-gradient(135deg, ${PRIMARY}, ${ACCENT})`,
                        border: "none",
                        cursor: "pointer",
                        fontSize: 14,
                        fontWeight: 700,
                        color: "white",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}>+</button>
                    </div>
                    <span style={{ fontWeight: 700, fontSize: 13, color: TEXT_PRIMARY, minWidth: 48, textAlign: "right" }}>
                      ₹{item.price * item.quantity}
                    </span>
                  </div>
                ))}

                <div style={{ marginTop: 16, padding: "14px 0 0" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                    <span style={{ fontSize: 13, color: TEXT_MUTED }}>Subtotal</span>
                    <span style={{ fontSize: 13, color: TEXT_SECONDARY }}>₹{cartTotal}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", padding: "12px 0", borderTop: `1px solid ${BORDER}` }}>
                    <span style={{ fontWeight: 800, fontSize: 15, color: TEXT_PRIMARY }}>Total</span>
                    <span style={{ fontWeight: 800, fontSize: 15, color: PRIMARY }}>₹{cartTotal}</span>
                  </div>
                </div>

                <button
                  onClick={goToCheckout}
                  style={{
                    width: "100%",
                    padding: "15px",
                    background: `linear-gradient(135deg, ${PRIMARY}, ${ACCENT})`,
                    border: "none",
                    borderRadius: 16,
                    cursor: "pointer",
                    fontWeight: 700,
                    fontSize: 14,
                    color: "white",
                    letterSpacing: "0.3px",
                    fontFamily: "inherit",
                    marginTop: 4,
                    boxShadow: `0 8px 24px ${PRIMARY}44`,
                  }}
                >
                  Proceed to Checkout · ₹{cartTotal}
                </button>
              </>
            )}
          </div>
        </div>
      )}

      <div style={{
        position: "fixed",
        bottom: 24,
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 150,
      }}>
        <button
          onClick={() => setCartOpen(true)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            background: `linear-gradient(135deg, ${PRIMARY}, ${ACCENT})`,
            border: "none",
            borderRadius: 50,
            cursor: "pointer",
            padding: "13px 22px",
            boxShadow: `0 8px 28px ${PRIMARY}55`,
            animation: cartBounce ? "cartBounce 0.4s ease" : "none",
            fontFamily: "inherit",
            minWidth: cartCount > 0 ? 220 : 180,
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 18 }}>🛒</span>
            <span style={{ color: "white", fontWeight: 700, fontSize: 13 }}>
              {cartCount > 0 ? `${cartCount} item${cartCount > 1 ? "s" : ""}` : "View Cart"}
            </span>
          </div>
          {cartCount > 0 && (
            <>
              <div style={{ width: 1, height: 20, background: "rgba(255,255,255,0.3)" }} />
              <span style={{ color: "white", fontWeight: 800, fontSize: 14 }}>₹{cartTotal}</span>
            </>
          )}
        </button>
      </div>

      <button
        onClick={() => setAssistantOpen(true)}
        aria-label="Open personalized assistant"
        style={{
          position: "fixed",
          right: 18,
          bottom: 24,
          zIndex: 180,
          width: 58,
          height: 58,
          borderRadius: 22,
          border: "none",
          cursor: "pointer",
          background: `linear-gradient(135deg, ${PRIMARY}, ${ACCENT})`,
          color: "white",
          boxShadow: `0 12px 30px ${PRIMARY}55`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          gap: 1,
          fontFamily: "inherit",
        }}
      >
        <span style={{ fontSize: 20, lineHeight: 1 }}>AI</span>
        <span style={{ fontSize: 9, fontWeight: 900, lineHeight: 1 }}>Taste</span>
      </button>
    </div>
  );
}

export default function CustomerMenu() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: "100vh", background: BG, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ color: TEXT_MUTED, fontSize: 14 }}>Loading menu...</p>
      </div>
    }>
      <CustomerMenuInner />
    </Suspense>
  );
}

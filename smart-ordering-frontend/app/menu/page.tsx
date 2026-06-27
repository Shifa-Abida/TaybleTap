"use client";
import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import AdminLayout from "@/components/AdminLayout";

const PRIMARY = "#E8602E";
const GREEN = "#1A9E6B";
const SOFT_BG = "#FEF5EF";
const BORDER = "#F2E8E0";
const TEXT_PRIMARY = "#1A1A1A";
const TEXT_MUTED = "#9B8B80";
const RED = "#E53E3E";

const CATEGORIES = ["All", "Starters", "Biryani", "Curries", "Breads", "Drinks", "Desserts"];

const CATEGORY_COLORS = {
  Starters: { bg: "rgba(34,197,94,0.1)",   color: "#16A34A" },
  Biryani:  { bg: "rgba(232,96,46,0.1)",   color: PRIMARY   },
  Curries:  { bg: "rgba(245,158,11,0.1)",  color: "#D97706" },
  Breads:   { bg: "rgba(139,92,246,0.1)",  color: "#7C3AED" },
  Drinks:   { bg: "rgba(59,130,246,0.1)",  color: "#2563EB" },
  Desserts: { bg: "rgba(236,72,153,0.1)",  color: "#DB2777" },
};

const EMPTY_FORM = { name: "", price: "", category: "Starters", desc: "", image: null as File | null, imagePreview: null as string | null, available: true };

const DEFAULT_ITEMS = [
  { name: "Chicken Biryani",      emoji: "🍚", price: 280, category: "Biryani",  desc: "Aromatic basmati rice with tender chicken & spices",    available: true  },
  { name: "Paneer Butter Masala", emoji: "🍛", price: 220, category: "Curries",  desc: "Rich tomato-based curry with soft paneer cubes",          available: true  },
  { name: "Tandoori Platter",     emoji: "🍗", price: 380, category: "Starters", desc: "Mixed grill platter with mint chutney",                  available: true  },
  { name: "Dal Makhani",          emoji: "🫕", price: 180, category: "Curries",  desc: "Slow-cooked black lentils in buttery tomato sauce",        available: false },
  { name: "Garlic Naan",          emoji: "🫓", price: 60,  category: "Breads",   desc: "Soft naan brushed with garlic butter",                   available: true  },
  { name: "Gulab Jamun",          emoji: "🍮", price: 80,  category: "Desserts", desc: "Soft milk dumplings soaked in rose syrup",                available: true  },
  { name: "Mango Lassi",          emoji: "🥤", price: 90,  category: "Drinks",   desc: "Chilled mango yogurt drink",                            available: true  },
  { name: "Veg Spring Rolls",     emoji: "🥗", price: 120, category: "Starters", desc: "Crispy rolls stuffed with spiced vegetables",              available: true  },
  { name: "Mutton Biryani",       emoji: "🍲", price: 340, category: "Biryani",   desc: "Slow-cooked mutton with fragrant basmati rice",            available: false },
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

function Badge({ category }: { category: string }) {
  const c = CATEGORY_COLORS[category as keyof typeof CATEGORY_COLORS] || { bg: SOFT_BG, color: TEXT_MUTED };
  return (
    <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20, background: c.bg, color: c.color }}>
      {category}
    </span>
  );
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button onClick={onChange} style={{
      width: 40, height: 22, borderRadius: 11, border: "none", cursor: "pointer",
      background: checked ? GREEN : "#D1D5DB",
      position: "relative", transition: "background 0.2s", flexShrink: 0,
    }}>
      <span style={{
        position: "absolute", top: 3, left: checked ? 21 : 3,
        width: 16, height: 16, borderRadius: "50%", background: "white",
        transition: "left 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.15)",
      }} />
    </button>
  );
}

function Modal({ mode, form, setForm, onSave, onClose }: { mode: string; form: any; setForm: any; onSave: () => void; onClose: () => void }) {
  const fileRef = useRef<HTMLInputElement>(null);

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setForm((f: any) => ({ ...f, image: file, imagePreview: ev.target?.result }));
    reader.readAsDataURL(file);
  };

  const field = (label: string, key: string, type = "text") => (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <label style={{ fontSize: 12, fontWeight: 600, color: TEXT_MUTED, textTransform: "uppercase", letterSpacing: "0.07em" }}>{label}</label>
      <input
        type={type}
        value={form[key]}
        onChange={(e: any) => setForm((f: any) => ({ ...f, [key]: e.target.value }))}
        placeholder={key === "name" ? "e.g. Chicken Biryani" : key === "price" ? "e.g. 280" : ""}
        style={{
          padding: "10px 14px", borderRadius: 10, border: `1px solid ${BORDER}`,
          fontSize: 13, color: TEXT_PRIMARY, background: "white", outline: "none",
          fontFamily: "inherit",
        }}
        onFocus={(e: any) => e.target.style.borderColor = PRIMARY}
        onBlur={(e: any) => e.target.style.borderColor = BORDER}
      />
    </div>
  );

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.35)",
      display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 1000, padding: 20,
    }} onClick={onClose}>
      <div style={{
        background: "white", borderRadius: 20, width: "100%", maxWidth: 520,
        maxHeight: "90vh", overflowY: "auto",
        boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
      }} onClick={(e: any) => e.stopPropagation()}>

        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "22px 24px 18px", borderBottom: `1px solid ${BORDER}`,
        }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: TEXT_PRIMARY, fontFamily: "'Playfair Display', serif" }}>
              {mode === "add" ? "Add Menu Item" : "Edit Menu Item"}
            </h2>
            <p style={{ margin: "3px 0 0", fontSize: 12, color: TEXT_MUTED }}>
              {mode === "add" ? "Fill in the details to add a new dish" : "Update the dish details below"}
            </p>
          </div>
          <button onClick={onClose} style={{
            width: 32, height: 32, borderRadius: 8, border: `1px solid ${BORDER}`,
            background: SOFT_BG, cursor: "pointer", fontSize: 18, color: TEXT_MUTED,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>×</button>
        </div>

        <div style={{ padding: "22px 24px", display: "flex", flexDirection: "column", gap: 16 }}>

          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: TEXT_MUTED, textTransform: "uppercase", letterSpacing: "0.07em" }}>Dish Image</label>
            <div
              onClick={() => fileRef.current?.click()}
              style={{
                height: 130, borderRadius: 12, border: `2px dashed ${BORDER}`,
                background: SOFT_BG, display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "center", cursor: "pointer",
                gap: 8, overflow: "hidden", position: "relative",
                transition: "border-color 0.15s",
              }}
              onMouseEnter={(e: any) => e.currentTarget.style.borderColor = PRIMARY}
              onMouseLeave={(e: any) => e.currentTarget.style.borderColor = BORDER}
            >
              {form.imagePreview ? (
                <img src={form.imagePreview} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                <>
                  <span style={{ fontSize: 32 }}>📷</span>
                  <p style={{ margin: 0, fontSize: 12, color: TEXT_MUTED, fontWeight: 500 }}>Click to upload image</p>
                  <p style={{ margin: 0, fontSize: 11, color: TEXT_MUTED }}>PNG, JPG up to 5MB</p>
                </>
              )}
              <input ref={fileRef as any} type="file" accept="image/*" style={{ display: "none" }} onChange={handleImage} />
            </div>
          </div>

          {field("Item Name", "name", "text")}

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {field("Price (₹)", "price", "number")}
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: TEXT_MUTED, textTransform: "uppercase", letterSpacing: "0.07em" }}>Category</label>
              <select
                value={form.category}
                onChange={(e: any) => setForm((f: any) => ({ ...f, category: e.target.value }))}
                style={{
                  padding: "10px 14px", borderRadius: 10, border: `1px solid ${BORDER}`,
                  fontSize: 13, color: TEXT_PRIMARY, background: "white",
                  outline: "none", fontFamily: "inherit", cursor: "pointer",
                }}
                onFocus={(e: any) => e.target.style.borderColor = PRIMARY}
                onBlur={(e: any) => e.target.style.borderColor = BORDER}
              >
                {CATEGORIES.filter(c => c !== "All").map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: TEXT_MUTED, textTransform: "uppercase", letterSpacing: "0.07em" }}>Description</label>
            <textarea
              value={form.desc}
              onChange={(e: any) => setForm((f: any) => ({ ...f, desc: e.target.value }))}
              placeholder="Short description of the dish..."
              rows={3}
              style={{
                padding: "10px 14px", borderRadius: 10, border: `1px solid ${BORDER}`,
                fontSize: 13, color: TEXT_PRIMARY, background: "white", outline: "none",
                fontFamily: "inherit", resize: "vertical", lineHeight: 1.6,
              }}
              onFocus={(e: any) => e.target.style.borderColor = PRIMARY}
              onBlur={(e: any) => e.target.style.borderColor = BORDER}
            />
          </div>

          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "14px 16px", borderRadius: 12, background: SOFT_BG, border: `1px solid ${BORDER}`,
          }}>
            <div>
              <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: TEXT_PRIMARY }}>Available for Ordering</p>
              <p style={{ margin: "2px 0 0", fontSize: 11, color: TEXT_MUTED }}>Customers can see and order this item</p>
            </div>
            <Toggle checked={form.available} onChange={() => setForm((f: any) => ({ ...f, available: !f.available }))} />
          </div>

          <div style={{ display: "flex", gap: 10, paddingTop: 4 }}>
            <button onClick={onClose} style={{
              flex: 1, padding: "12px", borderRadius: 12,
              border: `1px solid ${BORDER}`, background: "white",
              fontSize: 13, fontWeight: 600, color: TEXT_MUTED, cursor: "pointer",
            }}>Cancel</button>
            <button onClick={onSave} style={{
              flex: 2, padding: "12px", borderRadius: 12,
              border: "none", background: PRIMARY,
              fontSize: 13, fontWeight: 700, color: "white", cursor: "pointer",
            }}
              onMouseEnter={(e: any) => e.currentTarget.style.opacity = "0.88"}
              onMouseLeave={(e: any) => e.currentTarget.style.opacity = "1"}
            >
              {mode === "add" ? "Add to Menu" : "Save Changes"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function DeleteConfirm({ item, onConfirm, onClose }: { item: any; onConfirm: () => void; onClose: () => void }) {
  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.35)",
      display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 1000, padding: 20,
    }} onClick={onClose}>
      <div style={{
        background: "white", borderRadius: 20, width: "100%", maxWidth: 380,
        padding: "28px 28px 24px",
        boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
      }} onClick={(e: any) => e.stopPropagation()}>
        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <div style={{
            width: 56, height: 56, borderRadius: 16, background: "rgba(229,62,62,0.1)",
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 14px", fontSize: 26,
          }}>🗑️</div>
          <h3 style={{ margin: "0 0 6px", fontSize: 17, fontWeight: 700, color: TEXT_PRIMARY, fontFamily: "'Playfair Display', serif" }}>
            Delete "{item.name}"?
          </h3>
          <p style={{ margin: 0, fontSize: 13, color: TEXT_MUTED, lineHeight: 1.5 }}>
            This item will be permanently removed from your menu. This action cannot be undone.
          </p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={onClose} style={{
            flex: 1, padding: "11px", borderRadius: 12,
            border: `1px solid ${BORDER}`, background: "white",
            fontSize: 13, fontWeight: 600, color: TEXT_MUTED, cursor: "pointer",
          }}>Cancel</button>
          <button onClick={onConfirm} style={{
            flex: 1, padding: "11px", borderRadius: 12,
            border: "none", background: RED,
            fontSize: 13, fontWeight: 700, color: "white", cursor: "pointer",
          }}>Delete Item</button>
        </div>
      </div>
    </div>
  );
}

function MenuCard({ item, onEdit, onDelete, onToggle }: { item: any; onEdit: (item: any) => void; onDelete: (item: any) => void; onToggle: (id: string) => void }) {
  const [hovered, setHovered] = useState(false);
  const catC = CATEGORY_COLORS[item.category as keyof typeof CATEGORY_COLORS] || {};

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: "white", borderRadius: 16,
        border: `1px solid ${hovered ? "rgba(232,96,46,0.25)" : BORDER}`,
        overflow: "hidden", display: "flex", flexDirection: "column",
        transition: "border-color 0.18s, box-shadow 0.18s",
        boxShadow: hovered ? "0 6px 24px rgba(232,96,46,0.08)" : "none",
        opacity: item.available ? 1 : 0.75,
      }}
    >
      <div style={{
        height: 140, background: catC.bg || SOFT_BG,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 56, position: "relative",
      }}>
        {item.imagePreview ? (
          <img src={item.imagePreview} alt={item.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          <span>{item.emoji}</span>
        )}

        {!item.available && (
          <div style={{
            position: "absolute", inset: 0,
            background: "rgba(255,255,255,0.55)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <span style={{ fontSize: 11, fontWeight: 800, color: RED, background: "white", padding: "4px 12px", borderRadius: 20, border: `1px solid ${RED}30` }}>
              UNAVAILABLE
            </span>
          </div>
        )}

        <div style={{ position: "absolute", top: 10, left: 10 }}>
          <Badge category={item.category} />
        </div>
      </div>

      <div style={{ padding: "14px 16px 16px", flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
          <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: TEXT_PRIMARY, lineHeight: 1.3 }}>
            {item.name}
          </h3>
          <span style={{ fontSize: 16, fontWeight: 800, color: PRIMARY, flexShrink: 0 }}>₹{item.price}</span>
        </div>

        <p style={{ margin: 0, fontSize: 11, color: TEXT_MUTED, lineHeight: 1.5, flex: 1 }}>
          {item.desc}
        </p>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 6 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
            <Toggle checked={item.available} onChange={() => onToggle(item.id)} />
            <span style={{ fontSize: 11, fontWeight: 600, color: item.available ? GREEN : TEXT_MUTED }}>
              {item.available ? "Available" : "Unavailable"}
            </span>
          </div>
        </div>

        <div style={{ display: "flex", gap: 8, paddingTop: 2 }}>
          <button onClick={() => onEdit(item)} style={{
            flex: 1, padding: "8px 0", borderRadius: 10,
            border: `1px solid ${BORDER}`, background: SOFT_BG,
            fontSize: 12, fontWeight: 600, color: TEXT_PRIMARY, cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 5,
            transition: "all 0.12s",
          }}
            onMouseEnter={(e: any) => { (e.currentTarget as HTMLButtonElement).style.borderColor = PRIMARY; (e.currentTarget as HTMLButtonElement).style.color = PRIMARY; }}
            onMouseLeave={(e: any) => { (e.currentTarget as HTMLButtonElement).style.borderColor = BORDER; (e.currentTarget as HTMLButtonElement).style.color = TEXT_PRIMARY; }}
          >
            ✏️ Edit
          </button>
          <button onClick={() => onDelete(item)} style={{
            flex: 1, padding: "8px 0", borderRadius: 10,
            border: "1px solid rgba(229,62,62,0.2)", background: "rgba(229,62,62,0.06)",
            fontSize: 12, fontWeight: 600, color: RED, cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 5,
            transition: "all 0.12s",
          }}
            onMouseEnter={(e: any) => (e.currentTarget as HTMLButtonElement).style.background = "rgba(229,62,62,0.12)"}
            onMouseLeave={(e: any) => (e.currentTarget as HTMLButtonElement).style.background = "rgba(229,62,62,0.06)"}
          >
            🗑️ Delete
          </button>
        </div>
      </div>
    </div>
  );
}

export default function MenuManagement() {
  const { user, isLoading, logout } = useAuth();
  const router = useRouter();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [modal, setModal] = useState<string | null>(null);
  const [editItem, setEditItem] = useState<any>(null);
  const [deleteItem, setDeleteItem] = useState<any>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [viewMode, setViewMode] = useState("grid");

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    }
  }, [isLoading, user]);

  useEffect(() => {
    if (user) {
      fetchMenuItems();
    }
  }, [user]);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  const fetchMenuItems = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/api/menu/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 401) {
        await logout();
        return;
      }
      if (res.ok) {
        const data = await res.json();
        if (data.items && data.items.length === 0) {
          for (const item of DEFAULT_ITEMS) {
            await fetch(`${API_URL}/api/menu/`, {
              method: "POST",
              headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
              body: JSON.stringify(item),
            });
          }
          const retryRes = await fetch(`${API_URL}/api/menu/`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const retryData = await retryRes.json();
          setItems(retryData.items || []);
        } else {
          setItems(data.items || []);
        }
      } else {
        setItems([]);
      }
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  const filtered = items.filter((item: any) => {
    const matchCat = activeCategory === "All" || item.category === activeCategory;
    const matchSearch = item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.category.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const openAdd = () => { setForm(EMPTY_FORM); setModal("add"); };
  const openEdit = (item: any) => {
    setEditItem(item);
    setForm({
      name: item.name, price: item.price, category: item.category,
      desc: item.desc, image: null, imagePreview: item.imagePreview || null,
      available: item.available,
    });
    setModal("edit");
  };

  const handleSave = async () => {
    if (!form.name || !form.price) return;

    const token = localStorage.getItem("token");
    const url = modal === "add" ? `${API_URL}/api/menu/` : `${API_URL}/api/menu/${editItem.id}/`;
    const method = modal === "add" ? "POST" : "PUT";

    try {
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: form.name,
          price: Number(form.price),
          category: form.category,
          desc: form.desc,
          emoji: typeof form.imagePreview === "string" && form.imagePreview.startsWith("data:image") ? "" : "🍽️",
          imagePreview: form.imagePreview,
          available: form.available,
        }),
      });

      if (res.ok) {
        await fetchMenuItems();
        setModal(null);
        setEditItem(null);
      }
    } catch {
      // handle error
    }
  };

  const handleDelete = async () => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${API_URL}/api/menu/${deleteItem.id}/`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setItems(prev => prev.filter((i: any) => i.id !== deleteItem.id));
        setDeleteItem(null);
      }
    } catch {
      // handle error
    }
  };

  const handleToggle = async (id: string) => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${API_URL}/api/menu/${id}/toggle/`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setItems(prev => prev.map((i: any) => i.id === id ? { ...i, available: data.available } : i));
      }
    } catch {
      // handle error
    }
  };

  const availableCount = items.filter((i: any) => i.available).length;

  if (isLoading || loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", background: "#FFFDF8" }}>
        <p style={{ color: TEXT_MUTED, fontSize: 14 }}>Loading...</p>
      </div>
    );
  }

  if (!user) return null;

  return (
    <AdminLayout>
    <div style={{ minHeight: "100vh", background: "#FFFDF8", fontFamily: "'DM Sans', sans-serif" }}>

      <header style={{
        background: "white", borderBottom: `1px solid ${BORDER}`,
        padding: "0 28px", height: 58,
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div>
            <p style={{ margin: 0, fontWeight: 700, fontSize: 18, color: TEXT_PRIMARY, fontFamily: "'Playfair Display', serif" }}>Menu Management</p>
            <p style={{ margin: 0, fontSize: 12, color: TEXT_MUTED }}>Manage your restaurant menu</p>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ fontSize: 12, color: TEXT_MUTED, fontWeight: 500 }}>
            <span style={{ color: GREEN, fontWeight: 700 }}>{availableCount}</span> / {items.length} items available
          </div>
          <button onClick={openAdd} style={{
            display: "flex", alignItems: "center", gap: 8,
            padding: "9px 18px", borderRadius: 12,
            background: PRIMARY, border: "none",
            color: "white", fontSize: 13, fontWeight: 700, cursor: "pointer",
            transition: "opacity 0.15s",
          }}
            onMouseEnter={(e: any) => e.currentTarget.style.opacity = "0.88"}
            onMouseLeave={(e: any) => e.currentTarget.style.opacity = "1"}
          >
            <span style={{ fontSize: 16, lineHeight: 1 }}>+</span> Add Menu Item
          </button>
        </div>
      </header>

      <main style={{ padding: "28px 28px" }}>

        <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 20, flexWrap: "wrap" }}>

          <div style={{ position: "relative", flex: 1, minWidth: 200 }}>
            <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", fontSize: 16, pointerEvents: "none" }}>🔍</span>
            <input
              type="text"
              placeholder="Search dishes, categories..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                width: "100%", padding: "10px 14px 10px 38px",
                borderRadius: 12, border: `1px solid ${BORDER}`,
                fontSize: 13, color: TEXT_PRIMARY, background: "white",
                outline: "none", fontFamily: "inherit", boxSizing: "border-box",
              }}
              onFocus={(e: any) => e.target.style.borderColor = PRIMARY}
              onBlur={(e: any) => e.target.style.borderColor = BORDER}
            />
          </div>

          <div style={{ display: "flex", background: "white", border: `1px solid ${BORDER}`, borderRadius: 10, overflow: "hidden" }}>
            {[{ v: "grid", icon: "⊞" }, { v: "table", icon: "☰" }].map(({ v, icon }) => (
              <button key={v} onClick={() => setViewMode(v)} style={{
                width: 38, height: 38, border: "none", cursor: "pointer",
                background: viewMode === v ? SOFT_BG : "white",
                color: viewMode === v ? PRIMARY : TEXT_MUTED,
                fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center",
                transition: "all 0.15s",
              }}>{icon}</button>
            ))}
          </div>
        </div>

        <div style={{ display: "flex", gap: 8, marginBottom: 24, flexWrap: "wrap" }}>
          {CATEGORIES.map(cat => {
            const active = activeCategory === cat;
            const c = CATEGORY_COLORS[cat as keyof typeof CATEGORY_COLORS];
            return (
              <button key={cat} onClick={() => setActiveCategory(cat)} style={{
                padding: "7px 16px", borderRadius: 20, cursor: "pointer",
                border: active ? `1px solid ${c ? c.color : PRIMARY}` : `1px solid ${BORDER}`,
                background: active ? (c ? c.bg : SOFT_BG) : "white",
                color: active ? (c ? c.color : PRIMARY) : TEXT_MUTED,
                fontSize: 13, fontWeight: active ? 700 : 500,
                transition: "all 0.15s",
              }}>
                {cat}
                {cat !== "All" && (
                  <span style={{ marginLeft: 6, fontSize: 11, opacity: 0.8 }}>
                    ({items.filter((i: any) => i.category === cat).length})
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div style={{ marginBottom: 16, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <p style={{ margin: 0, fontSize: 12, color: TEXT_MUTED, fontWeight: 500 }}>
            Showing <strong style={{ color: TEXT_PRIMARY }}>{filtered.length}</strong> items
            {activeCategory !== "All" && ` in ${activeCategory}`}
            {search && ` for "${search}"`}
          </p>
        </div>

        {viewMode === "grid" && (
          filtered.length > 0 ? (
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
              gap: 16,
            }}>
              {filtered.map((item: any) => (
                <MenuCard key={item.id} item={item} onEdit={openEdit} onDelete={setDeleteItem} onToggle={handleToggle} />
              ))}
            </div>
          ) : (
            <div style={{ textAlign: "center", padding: "60px 0" }}>
              <span style={{ fontSize: 48 }}>🍽️</span>
              <p style={{ marginTop: 12, fontSize: 15, fontWeight: 600, color: TEXT_MUTED }}>No items found</p>
              <p style={{ fontSize: 13, color: TEXT_MUTED }}>Try a different search or category</p>
            </div>
          )
        )}

        {viewMode === "table" && (
          <div style={{ background: "white", borderRadius: 16, border: `1px solid ${BORDER}`, overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ background: SOFT_BG, borderBottom: `1px solid ${BORDER}` }}>
                  {["Dish", "Category", "Price", "Status", "Availability", "Actions"].map(h => (
                    <th key={h} style={{
                      padding: "12px 16px", textAlign: "left",
                      fontSize: 11, fontWeight: 700, color: TEXT_MUTED,
                      textTransform: "uppercase", letterSpacing: "0.08em",
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((item: any, i: number) => (
                  <tr key={item.id} style={{
                    borderBottom: i < filtered.length - 1 ? `1px solid ${BORDER}` : "none",
                    opacity: item.available ? 1 : 0.65,
                  }}
                    onMouseEnter={(e: any) => e.currentTarget.style.background = "#FFFDF8"}
                    onMouseLeave={(e: any) => e.currentTarget.style.background = "transparent"}
                  >
                    <td style={{ padding: "14px 16px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <div style={{
                          width: 40, height: 40, borderRadius: 10,
                          background: (CATEGORY_COLORS[item.category as keyof typeof CATEGORY_COLORS]?.bg) || SOFT_BG,
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: 22, flexShrink: 0, overflow: "hidden",
                        }}>
                          {item.imagePreview ? <img src={item.imagePreview} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : item.emoji}
                        </div>
                        <div>
                          <p style={{ margin: 0, fontWeight: 700, color: TEXT_PRIMARY }}>{item.name}</p>
                          <p style={{ margin: 0, fontSize: 11, color: TEXT_MUTED, maxWidth: 200, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{item.desc}</p>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: "14px 16px" }}><Badge category={item.category} /></td>
                    <td style={{ padding: "14px 16px", fontWeight: 800, color: PRIMARY, fontSize: 14 }}>₹{item.price}</td>
                    <td style={{ padding: "14px 16px" }}>
                      <span style={{
                        fontSize: 11, fontWeight: 700,
                        color: item.available ? GREEN : RED,
                        background: item.available ? "rgba(26,158,107,0.1)" : "rgba(229,62,62,0.1)",
                        padding: "3px 10px", borderRadius: 20,
                      }}>
                        {item.available ? "Available" : "Unavailable"}
                      </span>
                    </td>
                    <td style={{ padding: "14px 16px" }}>
                      <Toggle checked={item.available} onChange={() => handleToggle(item.id)} />
                    </td>
                    <td style={{ padding: "14px 16px" }}>
                      <div style={{ display: "flex", gap: 8 }}>
                        <button onClick={() => openEdit(item)} style={{
                          padding: "6px 14px", borderRadius: 8,
                          border: `1px solid ${BORDER}`, background: SOFT_BG,
                          fontSize: 12, fontWeight: 600, color: TEXT_PRIMARY, cursor: "pointer",
                        }}
                          onMouseEnter={(e: any) => { (e.currentTarget as HTMLButtonElement).style.borderColor = PRIMARY; (e.currentTarget as HTMLButtonElement).style.color = PRIMARY; }}
                          onMouseLeave={(e: any) => { (e.currentTarget as HTMLButtonElement).style.borderColor = BORDER; (e.currentTarget as HTMLButtonElement).style.color = TEXT_PRIMARY; }}
                        >✏️ Edit</button>
                        <button onClick={() => setDeleteItem(item)} style={{
                          padding: "6px 14px", borderRadius: 8,
                          border: "1px solid rgba(229,62,62,0.2)", background: "rgba(229,62,62,0.06)",
                          fontSize: 12, fontWeight: 600, color: RED, cursor: "pointer",
                        }}
                          onMouseEnter={(e: any) => (e.currentTarget as HTMLButtonElement).style.background = "rgba(229,62,62,0.12)"}
                          onMouseLeave={(e: any) => (e.currentTarget as HTMLButtonElement).style.background = "rgba(229,62,62,0.06)"}
                        >🗑️ Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div style={{ textAlign: "center", padding: "48px 0" }}>
                <span style={{ fontSize: 40 }}>🍽️</span>
                <p style={{ marginTop: 10, fontSize: 14, color: TEXT_MUTED }}>No items found</p>
              </div>
            )}
          </div>
        )}
      </main>

      {modal && (
        <Modal
          mode={modal}
          form={form}
          setForm={setForm}
          onSave={handleSave}
          onClose={() => { setModal(null); setEditItem(null); }}
        />
      )}

      {deleteItem && (
        <DeleteConfirm
          item={deleteItem}
          onConfirm={handleDelete}
          onClose={() => setDeleteItem(null)}
        />
      )}
    </div>
    </AdminLayout>
  );
}

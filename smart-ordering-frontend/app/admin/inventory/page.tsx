"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import AdminLayout from "@/components/AdminLayout";
import { useAuth } from "@/context/AuthContext";
import { API_ENDPOINTS, getAuthHeaders } from "@/lib/api";

const PRIMARY = "#E8602E";
const GREEN = "#1A9E6B";
const AMBER = "#D97706";
const RED = "#E53E3E";
const BORDER = "#F2E8E0";
const MUTED = "#9B8B80";

interface InventoryItem {
  id: string;
  name: string;
  category: string;
  stock_quantity: number;
  low_stock_threshold: number;
  track_stock: boolean;
  is_available: boolean;
  available: boolean;
  stock_status: "Not Tracked" | "Out Of Stock" | "Low Stock" | "In Stock";
}

interface InventoryForm {
  stock_quantity: number;
  low_stock_threshold: number;
  track_stock: boolean;
  is_available: boolean;
}

const statusColors: Record<InventoryItem["stock_status"], { color: string; background: string }> = {
  "Not Tracked": { color: MUTED, background: "#F3F4F6" },
  "Out Of Stock": { color: RED, background: "rgba(229,62,62,0.1)" },
  "Low Stock": { color: AMBER, background: "rgba(245,158,11,0.12)" },
  "In Stock": { color: GREEN, background: "rgba(26,158,107,0.1)" },
};

function Toggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button
      type="button"
      onClick={onChange}
      style={{
        width: 42, height: 23, border: "none", borderRadius: 20,
        background: checked ? GREEN : "#D1D5DB", cursor: "pointer", position: "relative",
      }}
    >
      <span style={{
        position: "absolute", top: 3, left: checked ? 22 : 3,
        width: 17, height: 17, borderRadius: "50%", background: "white",
        transition: "left 0.15s",
      }} />
    </button>
  );
}

export default function InventoryManagement() {
  const { user, isLoading, logout } = useAuth();
  const router = useRouter();
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [lowStockCount, setLowStockCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState<InventoryItem | null>(null);
  const [form, setForm] = useState<InventoryForm | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isLoading && !user) router.push("/login");
  }, [isLoading, router, user]);

  const fetchInventory = useCallback(async () => {
    try {
      setError("");
      const headers = getAuthHeaders();
      const [menuRes, lowStockRes] = await Promise.all([
        fetch(API_ENDPOINTS.MENU, { headers }),
        fetch(API_ENDPOINTS.MENU_LOW_STOCK, { headers }),
      ]);
      if (menuRes.status === 401 || lowStockRes.status === 401) {
        await logout();
        throw new Error("Your session expired. Please log in again.");
      }
      if (!menuRes.ok) throw new Error("Could not load inventory.");

      const menuData = await menuRes.json();
      const lowStockData = lowStockRes.ok ? await lowStockRes.json() : { items: [] };
      setItems(Array.isArray(menuData.items) ? menuData.items : []);
      setLowStockCount(Array.isArray(lowStockData.items) ? lowStockData.items.length : 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load inventory.");
    } finally {
      setLoading(false);
    }
  }, [logout]);

  useEffect(() => {
    if (!user) return;
    const timer = window.setTimeout(() => {
      void fetchInventory();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [fetchInventory, user]);

  const openEdit = (item: InventoryItem) => {
    setEditing(item);
    setForm({
      stock_quantity: item.stock_quantity,
      low_stock_threshold: item.low_stock_threshold,
      track_stock: item.track_stock,
      is_available: item.is_available,
    });
  };

  const saveInventory = async () => {
    if (!editing || !form) return;
    setSaving(true);
    setError("");
    try {
      const res = await fetch(API_ENDPOINTS.MENU_ITEM(editing.id), {
        method: "PATCH",
        headers: getAuthHeaders(),
        body: JSON.stringify(form),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Could not update inventory.");

      setEditing(null);
      setForm(null);
      await fetchInventory();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update inventory.");
    } finally {
      setSaving(false);
    }
  };

  if (isLoading || loading) {
    return <div style={{ minHeight: "100vh", display: "grid", placeItems: "center" }}>Loading inventory...</div>;
  }
  if (!user) return null;

  return (
    <AdminLayout>
      <div style={{ minHeight: "100vh", background: "#FFFDF8", fontFamily: "'DM Sans', 'Inter', sans-serif" }}>
        <header style={{ padding: "18px 28px", background: "white", borderBottom: `1px solid ${BORDER}` }}>
          <h1 style={{ margin: 0, fontSize: 21, color: "#1A1A1A" }}>Inventory Management</h1>
          <p style={{ margin: "4px 0 0", color: MUTED, fontSize: 13 }}>
            Track portions, low-stock thresholds, and ordering availability.
          </p>
        </header>

        <main style={{ padding: 28 }}>
          <div style={{
            marginBottom: 18, padding: "14px 18px", borderRadius: 14,
            border: `1px solid ${lowStockCount ? "rgba(245,158,11,0.35)" : BORDER}`,
            background: lowStockCount ? "rgba(245,158,11,0.08)" : "white",
            color: lowStockCount ? AMBER : GREEN, fontWeight: 700, fontSize: 13,
          }}>
            {lowStockCount ? `${lowStockCount} tracked item${lowStockCount === 1 ? "" : "s"} need attention.` : "No tracked items are low on stock."}
          </div>

          {error && <p style={{ color: RED, fontSize: 13 }}>{error}</p>}

          <div style={{ overflowX: "auto", background: "white", border: `1px solid ${BORDER}`, borderRadius: 16 }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 820 }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${BORDER}` }}>
                  {["Menu Item Name", "Category", "Current Stock", "Low Stock Threshold", "Stock Status", "Availability", "Action"].map((heading) => (
                    <th key={heading} style={{ padding: "13px 14px", textAlign: "left", color: MUTED, fontSize: 11, textTransform: "uppercase" }}>
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {items.map((item) => {
                  const status = statusColors[item.stock_status];
                  return (
                    <tr key={item.id} style={{ borderBottom: `1px solid ${BORDER}` }}>
                      <td style={{ padding: 14, fontWeight: 700, color: "#1A1A1A" }}>{item.name}</td>
                      <td style={{ padding: 14, color: "#6B7280", fontSize: 13 }}>{item.category}</td>
                      <td style={{ padding: 14, fontWeight: 700 }}>{item.stock_quantity}</td>
                      <td style={{ padding: 14 }}>{item.low_stock_threshold}</td>
                      <td style={{ padding: 14 }}>
                        <span style={{ padding: "4px 9px", borderRadius: 20, fontSize: 12, fontWeight: 700, ...status }}>
                          {item.stock_status}
                        </span>
                      </td>
                      <td style={{ padding: 14, color: item.is_available ? GREEN : RED, fontWeight: 700, fontSize: 12 }}>
                        {item.is_available ? "Available" : "Unavailable"}
                      </td>
                      <td style={{ padding: 14 }}>
                        <button
                          onClick={() => openEdit(item)}
                          style={{ padding: "7px 14px", borderRadius: 9, border: `1px solid ${PRIMARY}35`, background: `${PRIMARY}10`, color: PRIMARY, cursor: "pointer", fontWeight: 700 }}
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {items.length === 0 && <p style={{ padding: 24, textAlign: "center", color: MUTED }}>No menu items found.</p>}
          </div>
        </main>

        {editing && form && (
          <div style={{ position: "fixed", inset: 0, zIndex: 1000, background: "rgba(0,0,0,0.35)", display: "grid", placeItems: "center", padding: 20 }}>
            <div style={{ width: "100%", maxWidth: 460, background: "white", borderRadius: 18, padding: 22 }}>
              <h2 style={{ margin: 0, fontSize: 18 }}>Edit {editing.name}</h2>
              <p style={{ margin: "5px 0 18px", color: MUTED, fontSize: 12 }}>Update menu-item stock controls.</p>

              {[
                ["Current Stock", "stock_quantity"],
                ["Low Stock Threshold", "low_stock_threshold"],
              ].map(([label, key]) => (
                <label key={key} style={{ display: "grid", gap: 6, marginBottom: 14, color: MUTED, fontSize: 12, fontWeight: 700 }}>
                  {label}
                  <input
                    type="number"
                    min={0}
                    value={form[key as keyof InventoryForm] as number}
                    onChange={(event) => setForm({ ...form, [key]: Math.max(0, Number(event.target.value)) })}
                    style={{ padding: "10px 12px", borderRadius: 10, border: `1px solid ${BORDER}`, fontSize: 14 }}
                  />
                </label>
              ))}

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0" }}>
                <span style={{ fontSize: 13, fontWeight: 700 }}>Track stock automatically</span>
                <Toggle checked={form.track_stock} onChange={() => setForm({ ...form, track_stock: !form.track_stock })} />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0 18px" }}>
                <span style={{ fontSize: 13, fontWeight: 700 }}>Available for ordering</span>
                <Toggle checked={form.is_available} onChange={() => setForm({ ...form, is_available: !form.is_available })} />
              </div>

              <div style={{ display: "flex", gap: 10 }}>
                <button onClick={() => { setEditing(null); setForm(null); }} style={{ flex: 1, padding: 11, borderRadius: 10, border: `1px solid ${BORDER}`, background: "white", cursor: "pointer" }}>
                  Cancel
                </button>
                <button onClick={saveInventory} disabled={saving} style={{ flex: 1, padding: 11, borderRadius: 10, border: "none", background: PRIMARY, color: "white", cursor: "pointer", fontWeight: 700 }}>
                  {saving ? "Saving..." : "Save"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

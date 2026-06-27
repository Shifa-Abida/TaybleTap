"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
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
  imagePreview?: string;
  emoji?: string;
  desc?: string;
  updated_at?: string;
  created_at?: string;
  stock_status: "Not Tracked" | "Out Of Stock" | "Low Stock" | "In Stock";
}

interface InventoryForm {
  stock_quantity: number;
  low_stock_threshold: number;
  track_stock: boolean;
  is_available: boolean;
}

type DisplayStockStatus = Exclude<InventoryItem["stock_status"], "Not Tracked">;

const DEMO_INVENTORY: InventoryItem[] = [
  {
    id: "1",
    name: "Chicken Biryani",
    category: "Biryani",
    stock_quantity: 18,
    low_stock_threshold: 5,
    track_stock: true,
    is_available: true,
    available: true,
    imagePreview: "https://images.unsplash.com/photo-1604908177523-4b38db8292af?auto=format&fit=crop&w=200&q=80",
    updated_at: new Date(Date.now() - 15 * 60000).toISOString(),
    stock_status: "In Stock",
  },
  {
    id: "2",
    name: "Palak Paneer",
    category: "Curries",
    stock_quantity: 3,
    low_stock_threshold: 5,
    track_stock: true,
    is_available: true,
    available: true,
    imagePreview: "https://images.unsplash.com/photo-1589308078058-8d3c1a9f5924?auto=format&fit=crop&w=200&q=80",
    updated_at: new Date(Date.now() - 2 * 3600000).toISOString(),
    stock_status: "Low Stock",
  },
  {
    id: "3",
    name: "Butter Chicken",
    category: "Curries",
    stock_quantity: 0,
    low_stock_threshold: 5,
    track_stock: true,
    is_available: false,
    available: false,
    imagePreview: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=200&q=80",
    updated_at: new Date(Date.now() - 26 * 3600000).toISOString(),
    stock_status: "Out Of Stock",
  },
  {
    id: "4",
    name: "Garlic Naan",
    category: "Breads",
    stock_quantity: 2,
    low_stock_threshold: 5,
    track_stock: true,
    is_available: true,
    available: true,
    imagePreview: "https://images.unsplash.com/photo-1589927986089-35812389fc1b?auto=format&fit=crop&w=200&q=80",
    updated_at: new Date(Date.now() - 40 * 60000).toISOString(),
    stock_status: "Low Stock",
  },
  {
    id: "5",
    name: "Mango Lassi",
    category: "Drinks",
    stock_quantity: 12,
    low_stock_threshold: 5,
    track_stock: true,
    is_available: true,
    available: true,
    imagePreview: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=200&q=80",
    updated_at: new Date(Date.now() - 80 * 60000).toISOString(),
    stock_status: "In Stock",
  },
  {
    id: "6",
    name: "Gulab Jamun",
    category: "Desserts",
    stock_quantity: 8,
    low_stock_threshold: 5,
    track_stock: true,
    is_available: true,
    available: true,
    imagePreview: "https://images.unsplash.com/photo-1576792379663-5c228cf82552?auto=format&fit=crop&w=200&q=80",
    updated_at: new Date(Date.now() - 30 * 60000).toISOString(),
    stock_status: "In Stock",
  },
];

const statusColors: Record<DisplayStockStatus, { color: string; background: string }> = {
  "Out Of Stock": { color: RED, background: "rgba(229,62,62,0.12)" },
  "Low Stock": { color: AMBER, background: "rgba(245,158,11,0.12)" },
  "In Stock": { color: GREEN, background: "rgba(26,158,107,0.12)" },
};

function getStockStatus(item: InventoryItem): DisplayStockStatus {
  if (item.stock_quantity === 0) return "Out Of Stock";
  if (item.stock_quantity <= item.low_stock_threshold) return "Low Stock";
  return "In Stock";
}

function getAvailability(item: InventoryItem) {
  return item.stock_quantity > 0;
}

function getRelativeTimeLabel(timestamp?: string) {
  if (!timestamp) return "Just now";
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return "Just now";
  const diffMinutes = Math.round((Date.now() - date.getTime()) / 60000);
  if (diffMinutes < 1) return "Just now";
  if (diffMinutes < 60) return `${diffMinutes} min${diffMinutes === 1 ? "" : "s"} ago`;
  const diffHours = Math.round(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? "" : "s"} ago`;
  if (diffHours < 48) return "Yesterday";
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

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

const STOCK_PAGE_SIZE = 10;
const STATUS_OPTIONS = ["All", "In Stock", "Low Stock", "Out Of Stock"];
const AVAILABILITY_OPTIONS = ["All", "Available", "Unavailable"];

export default function InventoryManagement() {
  const { user, isLoading, logout } = useAuth();
  const router = useRouter();
  const [items, setItems] = useState<InventoryItem[]>(DEMO_INVENTORY);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState<InventoryItem | null>(null);
  const [form, setForm] = useState<InventoryForm | null>(null);
  const [stockModalItem, setStockModalItem] = useState<InventoryItem | null>(null);
  const [stockModalQuantity, setStockModalQuantity] = useState(0);
  const [actionMenuId, setActionMenuId] = useState<string | null>(null);
  const [historyItem, setHistoryItem] = useState<InventoryItem | null>(null);
  const [filters, setFilters] = useState({
    search: "",
    category: "All",
    status: "All",
    availability: "All",
  });
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (!isLoading && !user) router.push("/login");
  }, [isLoading, router, user]);

  const fetchInventory = useCallback(async () => {
    try {
      const headers = getAuthHeaders();
      const menuRes = await fetch(API_ENDPOINTS.MENU, { headers });
      if (menuRes.status === 401) {
        await logout();
        throw new Error("Your session expired. Please log in again.");
      }
      if (!menuRes.ok) throw new Error("Could not load inventory.");

      const menuData = await menuRes.json();
      const fetchedItems = Array.isArray(menuData.items) ? menuData.items : [];
      if (fetchedItems.length > 0) setItems(fetchedItems);
    } catch {
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

  const categories = useMemo(
    () => ["All", ...Array.from(new Set(items.map((item) => item.category)))].sort(),
    [items]
  );

  const filteredItems = useMemo(
    () => items.filter((item) => {
      const search = filters.search.trim().toLowerCase();
      const matchSearch =
        !search ||
        item.name.toLowerCase().includes(search) ||
        item.category.toLowerCase().includes(search);
      const matchCategory = filters.category === "All" || item.category === filters.category;
      const stockStatus = getStockStatus(item);
      const matchStatus = filters.status === "All" || stockStatus === filters.status;
      const availability = getAvailability(item);
      const matchAvailability =
        filters.availability === "All" ||
        (filters.availability === "Available" && availability) ||
        (filters.availability === "Unavailable" && !availability);
      return matchSearch && matchCategory && matchStatus && matchAvailability;
    }),
    [filters, items]
  );

  useEffect(() => {
    setPage(1);
  }, [filters]);

  const pageCount = Math.max(1, Math.ceil(filteredItems.length / STOCK_PAGE_SIZE));
  const pagedItems = filteredItems.slice((page - 1) * STOCK_PAGE_SIZE, page * STOCK_PAGE_SIZE);

  const totalItems = items.length;
  const inStockCount = items.filter((item) => getStockStatus(item) === "In Stock").length;
  const lowStockCount = items.filter((item) => getStockStatus(item) === "Low Stock").length;
  const outOfStockCount = items.filter((item) => getStockStatus(item) === "Out Of Stock").length;
  const inventoryAlerts = items.filter((item) => getStockStatus(item) !== "In Stock");

  const formatCsvValue = (value: any) => {
    const text = value === null || value === undefined ? "" : String(value);
    return `"${text.replace(/"/g, '""')}"`;
  };

  const exportCsv = () => {
    const headers = ["Name", "Category", "Current Stock", "Threshold", "Status", "Availability"];
    const rows = filteredItems.map((item) => [
      item.name,
      item.category,
      item.stock_quantity,
      item.low_stock_threshold,
      getStockStatus(item),
      getAvailability(item) ? "Available" : "Unavailable",
    ]);
    const csvContent = [headers, ...rows].map((row) => row.map(formatCsvValue).join(",")).join("\r\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "inventory-export.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const openEdit = (item: InventoryItem) => {
    setHistoryItem(null);
    setActionMenuId(null);
    setEditing(item);
    setForm({
      stock_quantity: item.stock_quantity,
      low_stock_threshold: item.low_stock_threshold,
      track_stock: item.track_stock,
      is_available: item.is_available,
    });
  };

  const openStockModal = (item: InventoryItem) => {
    setActionMenuId(null);
    setHistoryItem(null);
    setStockModalItem(item);
    setStockModalQuantity(item.stock_quantity);
  };

  const saveStockUpdate = async () => {
    if (!stockModalItem) return;
    setSaving(true);
    try {
      const res = await fetch(API_ENDPOINTS.MENU_ITEM(stockModalItem.id), {
        method: "PATCH",
        headers: getAuthHeaders(),
        body: JSON.stringify({ stock_quantity: Math.max(0, stockModalQuantity) }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Could not update stock.");
      await fetchInventory();
      setStockModalItem(null);
    } catch {
    } finally {
      setSaving(false);
    }
  };

  const saveInventory = async () => {
    if (!editing || !form) return;
    setSaving(true);
    try {
      const res = await fetch(API_ENDPOINTS.MENU_ITEM(editing.id), {
        method: "PATCH",
        headers: getAuthHeaders(),
        body: JSON.stringify(form),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Could not save inventory.");
      await fetchInventory();
      setEditing(null);
      setForm(null);
    } catch {
    } finally {
      setSaving(false);
    }
  };

  const openHistory = (item: InventoryItem) => {
    setActionMenuId(null);
    setHistoryItem(item);
  };

  const formatUpdatedAt = (item: InventoryItem) => {
    const timestamp = (item as any).updated_at || (item as any).created_at;
    return getRelativeTimeLabel(timestamp);
  };

  if (isLoading || loading) {
    return <div style={{ minHeight: "100vh", display: "grid", placeItems: "center" }}>Loading inventory...</div>;
  }
  if (!user) return null;

  return (
    <AdminLayout>
      <div style={{ minHeight: "100vh", background: "#FFFDF8", fontFamily: "'DM Sans', 'Inter', sans-serif" }}>
        <header style={{ padding: "18px 28px", background: "white", borderBottom: `1px solid ${BORDER}`, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 20 }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 22, color: "#1A1A1A" }}>Inventory Management</h1>
            <p style={{ margin: "6px 0 0", color: MUTED, fontSize: 13, maxWidth: 680 }}>
              Keep all menu inventory in sync with your existing menu items, track low stock alerts, and update availability without changing your current menu workflow.
            </p>
          </div>
          <button
            type="button"
            onClick={exportCsv}
            style={{ padding: "12px 18px", borderRadius: 14, border: `1px solid ${BORDER}`, background: "white", color: PRIMARY, fontWeight: 700, cursor: "pointer" }}>
            Export CSV
          </button>
        </header>

        <main style={{ padding: 28 }}>
          <section style={{ display: "grid", gap: 18, marginBottom: 22 }}>
            <div style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))" }}>
              {[
                { label: "Total Items", value: totalItems, color: "#1A1A1A", icon: "📦" },
                { label: "In Stock", value: inStockCount, color: GREEN, icon: "✅" },
                { label: "Low Stock", value: lowStockCount, color: AMBER, icon: "⚠️" },
                { label: "Out of Stock", value: outOfStockCount, color: RED, icon: "⛔" },
              ].map((card) => (
                <div key={card.label} style={{ padding: 20, borderRadius: 18, background: "white", border: `1px solid ${BORDER}`, boxShadow: "0 10px 25px rgba(15,23,42,0.04)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <span style={{ fontSize: 20 }}>{card.icon}</span>
                    <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: MUTED, letterSpacing: "0.08em", textTransform: "uppercase" }}>{card.label}</p>
                  </div>
                  <p style={{ margin: "14px 0 0", fontSize: 28, fontWeight: 700, color: card.color }}>{card.value}</p>
                </div>
              ))}
            </div>

            <div style={{ display: "flex", flexWrap: "wrap", gap: 16, alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ minWidth: 280, flex: 1, minHeight: 104, padding: 20, borderRadius: 18, background: "white", border: `1px solid ${BORDER}` }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: "#1A1A1A" }}>⚠ Inventory Alerts</span>
                    <span style={{ padding: "4px 10px", borderRadius: 999, fontSize: 12, fontWeight: 700, color: inventoryAlerts.length ? RED : GREEN, background: inventoryAlerts.length ? "rgba(229,62,62,0.12)" : "rgba(16,185,129,0.12)" }}>
                      {inventoryAlerts.length}
                    </span>
                  </div>
                </div>
                <div style={{ marginTop: 12 }}>
                  {inventoryAlerts.length > 0 ? (
                    <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "grid", gap: 6 }}>
                      {inventoryAlerts.slice(0, 5).map((item) => (
                        <li key={item.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, padding: "8px 0", borderBottom: `1px solid ${BORDER}` }}>
                          <span style={{ display: "inline-flex", alignItems: "center", gap: 8, color: "#1A1A1A", fontSize: 13 }}>
                            <span>•</span>
                            {item.name}
                          </span>
                          <span style={{ color: "#92400E", fontSize: 13, fontWeight: 700 }}>
                            {getStockStatus(item) === "Out Of Stock"
                              ? "Out Of Stock"
                              : `Low Stock (${item.stock_quantity} remaining)`}
                          </span>
                        </li>
                      ))}
                      {inventoryAlerts.length > 5 && (
                        <li style={{ padding: "8px 0", color: MUTED, fontSize: 13 }}>
                          + {inventoryAlerts.length - 5} more items
                        </li>
                      )}
                    </ul>
                  ) : (
                    <p style={{ margin: 0, color: MUTED, fontSize: 13 }}>No current inventory alerts.</p>
                  )}
                </div>
              </div>
            </div>
          </section>

          <section style={{ marginBottom: 24, display: "grid", gap: 14, background: "white", padding: 20, borderRadius: 18, border: `1px solid ${BORDER}` }}>
            <div style={{ display: "grid", gap: 12, gridTemplateColumns: "1fr auto", alignItems: "center" }}>
              <div>
                <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "#1A1A1A" }}>Filter & search inventory</p>
                <p style={{ margin: "6px 0 0", fontSize: 12, color: MUTED }}>Find the right item quickly by name, category, status, or availability.</p>
              </div>
              <button
                type="button"
                onClick={() => setFilters({ search: "", category: "All", status: "All", availability: "All" })}
                style={{ padding: "12px 16px", borderRadius: 12, border: `1px solid ${BORDER}`, background: "white", color: "#4B5563", fontWeight: 700, cursor: "pointer" }}>
                Reset Filters
              </button>
            </div>

            <div style={{ display: "grid", gap: 12, gridTemplateColumns: "1.7fr 1fr 1fr 1fr" }}>
              <input
                type="text"
                placeholder="Search menu item"
                value={filters.search}
                onChange={(event) => setFilters((prev) => ({ ...prev, search: event.target.value }))}
                style={{ width: "100%", padding: "14px 16px", borderRadius: 14, border: `1px solid ${BORDER}`, fontSize: 14 }}
              />
              <select
                value={filters.category}
                onChange={(event) => setFilters((prev) => ({ ...prev, category: event.target.value }))}
                style={{ width: "100%", padding: "14px 16px", borderRadius: 14, border: `1px solid ${BORDER}`, fontSize: 14, background: "white" }}>
                {categories.map((category) => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
              <select
                value={filters.status}
                onChange={(event) => setFilters((prev) => ({ ...prev, status: event.target.value }))}
                style={{ width: "100%", padding: "14px 16px", borderRadius: 14, border: `1px solid ${BORDER}`, fontSize: 14, background: "white" }}>
                {STATUS_OPTIONS.map((status) => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
              <select
                value={filters.availability}
                onChange={(event) => setFilters((prev) => ({ ...prev, availability: event.target.value }))}
                style={{ width: "100%", padding: "14px 16px", borderRadius: 14, border: `1px solid ${BORDER}`, fontSize: 14, background: "white" }}>
                {AVAILABILITY_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>
          </section>

          <section style={{ overflowX: "auto", background: "white", border: `1px solid ${BORDER}`, borderRadius: 18, boxShadow: "0 15px 36px rgba(15,23,42,0.05)" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 1100 }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${BORDER}`, background: "#F8FAFC" }}>
                  {["Item", "Category", "Stock", "Status", "Availability", "Last Updated", "Actions"].map((heading) => (
                    <th key={heading} style={{ padding: "16px 14px", textAlign: "left", color: MUTED, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pagedItems.map((item) => {
                  const status = statusColors[getStockStatus(item)];
                  return (
<tr key={item.id} style={{ borderBottom: `1px solid ${BORDER}`, borderLeft: `4px solid ${status.color}`, background: "#FFFFFF" }}>
                      <td style={{ padding: 10, color: "#1F2937", fontSize: 13, fontWeight: 700 }}>{item.name}</td>

                      <td style={{ padding: 10, color: "#4B5563", fontSize: 13 }}>{item.category}</td>

                      <td style={{ padding: 10, fontWeight: 700, color: "#111827" }}>{item.stock_quantity} / {item.low_stock_threshold}</td>

                      <td style={{ padding: 10 }}>
                        <span style={{ padding: "5px 10px", borderRadius: 999, fontSize: 12, fontWeight: 700, display: "inline-flex", alignItems: "center", gap: 6, color: status.color, background: status.background }}>
                          {status.color === GREEN ? "🟢" : status.color === AMBER ? "🟡" : "🔴"} {getStockStatus(item)}
                        </span>
                      </td>

                      <td style={{ padding: 10 }}>
                        <span style={{ padding: "5px 10px", borderRadius: 999, fontSize: 12, fontWeight: 700, color: getAvailability(item) ? GREEN : RED, background: getAvailability(item) ? "rgba(26,158,107,0.12)" : "rgba(229,62,62,0.12)" }}>
                          {getAvailability(item) ? "Available" : "Unavailable"}
                        </span>
                      </td>

                      <td style={{ padding: 10, color: "#6B7280", fontSize: 13 }}>{formatUpdatedAt(item)}</td>

                      <td style={{ padding: 10, verticalAlign: "top", position: "relative" }}>
                        <button
                          type="button"
                          onClick={() => setActionMenuId(actionMenuId === item.id ? null : item.id)}
                          style={{ width: 44, height: 44, borderRadius: 12, border: `1px solid ${BORDER}`, background: "white", cursor: "pointer", color: "#374151" }}>
                          ⋮
                        </button>
                        {actionMenuId === item.id && (
                          <div style={{ position: "absolute", top: 54, right: 0, width: 220, borderRadius: 16, border: `1px solid ${BORDER}`, background: "white", boxShadow: "0 20px 45px rgba(15,23,42,0.12)", zIndex: 30 }}>
                            <button type="button" onClick={() => openStockModal(item)} style={{ width: "100%", textAlign: "left", padding: "14px 16px", border: "none", background: "transparent", cursor: "pointer", color: "#111827", fontWeight: 700 }}>
                              Update Stock
                            </button>
                            <button type="button" onClick={() => openEdit(item)} style={{ width: "100%", textAlign: "left", padding: "14px 16px", border: "none", background: "transparent", cursor: "pointer", color: "#111827", fontWeight: 700 }}>
                              Edit Threshold
                            </button>
                            <button type="button" onClick={() => openHistory(item)} style={{ width: "100%", textAlign: "left", padding: "14px 16px", border: "none", background: "transparent", cursor: "pointer", color: "#111827", fontWeight: 700 }}>
                              View History
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {filteredItems.length === 0 && <p style={{ padding: 24, textAlign: "center", color: MUTED }}>No inventory items match the selected filters.</p>}
          </section>

          <section style={{ marginTop: 20, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
            <p style={{ margin: 0, color: MUTED, fontSize: 13 }}>
              Showing {filteredItems.length === 0 ? 0 : (page - 1) * STOCK_PAGE_SIZE + 1}–{Math.min(page * STOCK_PAGE_SIZE, filteredItems.length)} of {filteredItems.length} items
            </p>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <button
                type="button"
                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                disabled={page === 1}
                style={{ padding: "10px 14px", borderRadius: 12, border: `1px solid ${BORDER}`, background: page === 1 ? "#F3F4F6" : "white", color: page === 1 ? "#9CA3AF" : "#111827", cursor: page === 1 ? "not-allowed" : "pointer" }}>
                Previous
              </button>
              {Array.from({ length: pageCount }, (_, index) => index + 1).map((pageNumber) => (
                <button
                  key={pageNumber}
                  type="button"
                  onClick={() => setPage(pageNumber)}
                  style={{ padding: "10px 14px", borderRadius: 12, border: `1px solid ${pageNumber === page ? PRIMARY : BORDER}`, background: pageNumber === page ? PRIMARY : "white", color: pageNumber === page ? "white" : "#111827", cursor: "pointer" }}>
                  {pageNumber}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setPage((prev) => Math.min(pageCount, prev + 1))}
                disabled={page === pageCount}
                style={{ padding: "10px 14px", borderRadius: 12, border: `1px solid ${BORDER}`, background: page === pageCount ? "#F3F4F6" : "white", color: page === pageCount ? "#9CA3AF" : "#111827", cursor: page === pageCount ? "not-allowed" : "pointer" }}>
                Next
              </button>
            </div>
          </section>
        </main>

        {editing && form && (
          <div style={{ position: "fixed", inset: 0, zIndex: 1000, background: "rgba(0,0,0,0.35)", display: "grid", placeItems: "center", padding: 20 }}>
            <div style={{ width: "100%", maxWidth: 500, background: "white", borderRadius: 18, padding: 26 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, marginBottom: 18 }}>
                <div>
                  <h2 style={{ margin: 0, fontSize: 20 }}>Edit {editing.name}</h2>
                  <p style={{ margin: "8px 0 0", color: MUTED, fontSize: 13 }}>Adjust stock, threshold, and availability for this menu item.</p>
                </div>
                <button onClick={() => { setEditing(null); setForm(null); }} style={{ border: "none", background: "transparent", color: MUTED, fontSize: 22, lineHeight: 1, cursor: "pointer" }}>
                  ×
                </button>
              </div>

              {[
                ["Current Stock", "stock_quantity"],
                ["Low Stock Threshold", "low_stock_threshold"],
              ].map(([label, key]) => (
                <label key={key} style={{ display: "grid", gap: 8, marginBottom: 16, color: MUTED, fontSize: 12, fontWeight: 700 }}>
                  {label}
                  <input
                    type="number"
                    min={0}
                    value={form[key as keyof InventoryForm] as number}
                    onChange={(event) => setForm({ ...form, [key]: Math.max(0, Number(event.target.value)) })}
                    style={{ width: "100%", padding: "12px 14px", borderRadius: 14, border: `1px solid ${BORDER}`, fontSize: 14 }}
                  />
                </label>
              ))}

              <div style={{ display: "grid", gap: 12, gridTemplateColumns: "1fr 1fr", marginBottom: 18 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0" }}>
                  <span style={{ fontSize: 13, fontWeight: 700 }}>Track stock automatically</span>
                  <Toggle checked={form.track_stock} onChange={() => setForm({ ...form, track_stock: !form.track_stock })} />
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0" }}>
                  <span style={{ fontSize: 13, fontWeight: 700 }}>Available for ordering</span>
                  <Toggle checked={form.is_available} onChange={() => setForm({ ...form, is_available: !form.is_available })} />
                </div>
              </div>

              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                <button onClick={() => { setEditing(null); setForm(null); }} style={{ flex: 1, minWidth: 120, padding: 14, borderRadius: 14, border: `1px solid ${BORDER}`, background: "white", color: "#374151", cursor: "pointer", fontWeight: 700 }}>
                  Cancel
                </button>
                <button onClick={saveInventory} disabled={saving} style={{ flex: 1, minWidth: 120, padding: 14, borderRadius: 14, border: "none", background: PRIMARY, color: "white", cursor: "pointer", fontWeight: 700 }}>
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>
          </div>
        )}

        {stockModalItem && (
          <div style={{ position: "fixed", inset: 0, zIndex: 1000, background: "rgba(0,0,0,0.35)", display: "grid", placeItems: "center", padding: 20 }}>
            <div style={{ width: "100%", maxWidth: 460, background: "white", borderRadius: 18, padding: 26 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, marginBottom: 18 }}>
                <div>
                  <h2 style={{ margin: 0, fontSize: 20 }}>Update Stock</h2>
                  <p style={{ margin: "8px 0 0", color: MUTED, fontSize: 13 }}>Adjust the current stock quantity for this item.</p>
                </div>
                <button onClick={() => setStockModalItem(null)} style={{ border: "none", background: "transparent", color: MUTED, fontSize: 22, lineHeight: 1, cursor: "pointer" }}>
                  ×
                </button>
              </div>

              <label style={{ display: "grid", gap: 8, marginBottom: 16, color: MUTED, fontSize: 12, fontWeight: 700 }}>
                Item Name
                <input type="text" value={stockModalItem.name} readOnly style={{ width: "100%", padding: "12px 14px", borderRadius: 14, border: `1px solid ${BORDER}`, fontSize: 14, background: "#F8FAFC", color: "#111827" }} />
              </label>

              <label style={{ display: "grid", gap: 8, marginBottom: 16, color: MUTED, fontSize: 12, fontWeight: 700 }}>
                Current Stock
                <input type="number" value={stockModalItem.stock_quantity} readOnly style={{ width: "100%", padding: "12px 14px", borderRadius: 14, border: `1px solid ${BORDER}`, fontSize: 14, background: "#F8FAFC", color: "#111827" }} />
              </label>

              <label style={{ display: "grid", gap: 8, marginBottom: 24, color: MUTED, fontSize: 12, fontWeight: 700 }}>
                New Stock Quantity
                <input
                  type="number"
                  min={0}
                  value={stockModalQuantity}
                  onChange={(event) => setStockModalQuantity(Math.max(0, Number(event.target.value)))}
                  style={{ width: "100%", padding: "12px 14px", borderRadius: 14, border: `1px solid ${BORDER}`, fontSize: 14 }}
                />
              </label>

              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                <button onClick={() => setStockModalItem(null)} style={{ flex: 1, minWidth: 120, padding: 14, borderRadius: 14, border: `1px solid ${BORDER}`, background: "white", color: "#374151", cursor: "pointer", fontWeight: 700 }}>
                  Cancel
                </button>
                <button onClick={saveStockUpdate} disabled={saving} style={{ flex: 1, minWidth: 120, padding: 14, borderRadius: 14, border: "none", background: PRIMARY, color: "white", cursor: "pointer", fontWeight: 700 }}>
                  {saving ? "Saving..." : "Save"}
                </button>
              </div>
            </div>
          </div>
        )}

        {stockModalItem && (
          <div style={{ position: "fixed", inset: 0, zIndex: 1000, background: "rgba(0,0,0,0.35)", display: "grid", placeItems: "center", padding: 20 }}>
            <div style={{ width: "100%", maxWidth: 460, background: "white", borderRadius: 18, padding: 26 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, marginBottom: 18 }}>
                <div>
                  <h2 style={{ margin: 0, fontSize: 20 }}>Update Stock</h2>
                  <p style={{ margin: "8px 0 0", color: MUTED, fontSize: 13 }}>Adjust the current stock quantity for this menu item.</p>
                </div>
                <button onClick={() => setStockModalItem(null)} style={{ border: "none", background: "transparent", color: MUTED, fontSize: 22, lineHeight: 1, cursor: "pointer" }}>
                  ×
                </button>
              </div>

              <label style={{ display: "grid", gap: 8, marginBottom: 16, color: MUTED, fontSize: 12, fontWeight: 700 }}>
                Item Name
                <input type="text" value={stockModalItem.name} readOnly style={{ width: "100%", padding: "12px 14px", borderRadius: 14, border: `1px solid ${BORDER}`, fontSize: 14, background: "#F8FAFC", color: "#111827" }} />
              </label>

              <label style={{ display: "grid", gap: 8, marginBottom: 16, color: MUTED, fontSize: 12, fontWeight: 700 }}>
                Current Stock
                <input type="number" value={stockModalItem.stock_quantity} readOnly style={{ width: "100%", padding: "12px 14px", borderRadius: 14, border: `1px solid ${BORDER}`, fontSize: 14, background: "#F8FAFC", color: "#111827" }} />
              </label>

              <label style={{ display: "grid", gap: 8, marginBottom: 24, color: MUTED, fontSize: 12, fontWeight: 700 }}>
                New Stock Quantity
                <input
                  type="number"
                  min={0}
                  value={stockModalQuantity}
                  onChange={(event) => setStockModalQuantity(Math.max(0, Number(event.target.value)))}
                  style={{ width: "100%", padding: "12px 14px", borderRadius: 14, border: `1px solid ${BORDER}`, fontSize: 14 }}
                />
              </label>

              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                <button onClick={() => setStockModalItem(null)} style={{ flex: 1, minWidth: 120, padding: 14, borderRadius: 14, border: `1px solid ${BORDER}`, background: "white", color: "#374151", cursor: "pointer", fontWeight: 700 }}>
                  Cancel
                </button>
                <button onClick={saveStockUpdate} disabled={saving} style={{ flex: 1, minWidth: 120, padding: 14, borderRadius: 14, border: "none", background: PRIMARY, color: "white", cursor: "pointer", fontWeight: 700 }}>
                  {saving ? "Saving..." : "Save"}
                </button>
              </div>
            </div>
          </div>
        )}

        {historyItem && (
          <div style={{ position: "fixed", inset: 0, zIndex: 1000, background: "rgba(0,0,0,0.35)", display: "grid", placeItems: "center", padding: 20 }}>
            <div style={{ width: "100%", maxWidth: 460, background: "white", borderRadius: 18, padding: 24 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, marginBottom: 18 }}>
                <div>
                  <h2 style={{ margin: 0, fontSize: 20 }}>History for {historyItem.name}</h2>
                  <p style={{ margin: "8px 0 0", color: MUTED, fontSize: 13 }}>A history viewer will show item stock and availability changes.</p>
                </div>
                <button onClick={() => setHistoryItem(null)} style={{ border: "none", background: "transparent", color: MUTED, fontSize: 22, lineHeight: 1, cursor: "pointer" }}>
                  ×
                </button>
              </div>
              <div style={{ padding: 18, borderRadius: 16, background: "#F8FAFC" }}>
                <p style={{ margin: 0, color: MUTED, fontSize: 13 }}>Detailed history is not available in the current inventory interface, but the action menu is styled and ready for future audit trail support.</p>
              </div>
              <div style={{ marginTop: 20, textAlign: "right" }}>
                <button onClick={() => setHistoryItem(null)} style={{ padding: "12px 18px", borderRadius: 14, border: "none", background: PRIMARY, color: "white", cursor: "pointer", fontWeight: 700 }}>
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

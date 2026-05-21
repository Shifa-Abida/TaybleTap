"use client";
import { useState, useEffect } from "react";
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

interface TableData {
  id: string;
  table_number: number;
  table_name: string;
  is_active: boolean;
  qr_url: string;
  qr_code: string;
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

function TableCard({ table, onEdit, onDelete, onToggle, onDownload }: {
  table: TableData;
  onEdit: (t: TableData) => void;
  onDelete: (t: TableData) => void;
  onToggle: (id: string) => void;
  onDownload: (t: TableData) => void;
}) {
  const [hovered, setHovered] = useState(false);

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
        opacity: table.is_active ? 1 : 0.65,
      }}
    >
      {/* QR Code Section */}
      <div style={{
        height: 180, background: SOFT_BG,
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 16,
      }}>
        {table.qr_code ? (
          <a
            href={table.qr_url}
            target="_blank"
            rel="noopener noreferrer"
            title={`Open customer menu for Table ${table.table_number}`}
            style={{
              width: "100%",
              height: "100%",
              display: "block",
              borderRadius: 8,
              cursor: "pointer",
              outline: "none",
              textDecoration: "none",
            }}
          >
            <img
              src={table.qr_code}
              alt={`Table ${table.table_number} QR`}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "contain",
                borderRadius: 8,
                display: "block",
              }}
            />
          </a>
        ) : (
          <span style={{ fontSize: 48 }}>⬛</span>
        )}
      </div>

      {/* Table Info */}
      <div style={{ padding: "16px", flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
          <div>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: TEXT_PRIMARY }}>
              Table {table.table_number}
            </h3>
            {table.table_name && (
              <p style={{ margin: "2px 0 0", fontSize: 12, color: TEXT_MUTED }}>
                {table.table_name}
              </p>
            )}
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 4 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
            <Toggle checked={table.is_active} onChange={() => onToggle(table.id)} />
            <span style={{ fontSize: 11, fontWeight: 600, color: table.is_active ? GREEN : TEXT_MUTED }}>
              {table.is_active ? "Active" : "Inactive"}
            </span>
          </div>
        </div>

        <div style={{ display: "flex", gap: 8, paddingTop: 4 }}>
          <button onClick={() => onDownload(table)} style={{
            flex: 1, padding: "8px 0", borderRadius: 10,
            border: `1px solid ${BORDER}`, background: SOFT_BG,
            fontSize: 12, fontWeight: 600, color: TEXT_PRIMARY, cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 5,
            transition: "all 0.12s",
          }}
            onMouseEnter={(e: any) => (e.currentTarget as HTMLButtonElement).style.borderColor = PRIMARY}
            onMouseLeave={(e: any) => (e.currentTarget as HTMLButtonElement).style.borderColor = BORDER}
          >
            ⬇️ Download
          </button>
          <button onClick={() => onEdit(table)} style={{
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
          <button onClick={() => onDelete(table)} style={{
            flex: 1, padding: "8px 0", borderRadius: 10,
            border: "1px solid rgba(229,62,62,0.2)", background: "rgba(229,62,62,0.06)",
            fontSize: 12, fontWeight: 600, color: RED, cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 5,
            transition: "all 0.12s",
          }}
            onMouseEnter={(e: any) => (e.currentTarget as HTMLButtonElement).style.background = "rgba(229,62,62,0.12)"}
            onMouseLeave={(e: any) => (e.currentTarget as HTMLButtonElement).style.background = "rgba(229,62,62,0.06)"}
          >
            🗑️
          </button>
        </div>
      </div>
    </div>
  );
}

function TableModal({ mode, form, setForm, onSave, onClose }: {
  mode: string;
  form: { table_number: string; table_name: string };
  setForm: (f: any) => void;
  onSave: () => void;
  onClose: () => void;
}) {
  const field = (label: string, key: string, placeholder: string) => (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <label style={{ fontSize: 12, fontWeight: 600, color: TEXT_MUTED, textTransform: "uppercase", letterSpacing: "0.07em" }}>{label}</label>
      <input
        type={key === "table_number" ? "number" : "text"}
        value={form[key as keyof typeof form]}
        onChange={(e: any) => setForm((f: any) => ({ ...f, [key]: e.target.value }))}
        placeholder={placeholder}
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
        background: "white", borderRadius: 20, width: "100%", maxWidth: 420,
        boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
      }} onClick={(e: any) => e.stopPropagation()}>

        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "22px 24px 18px", borderBottom: `1px solid ${BORDER}`,
        }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: TEXT_PRIMARY, fontFamily: "'Playfair Display', serif" }}>
              {mode === "add" ? "Add New Table" : "Edit Table"}
            </h2>
            <p style={{ margin: "3px 0 0", fontSize: 12, color: TEXT_MUTED }}>
              {mode === "add" ? "Add a new table to your restaurant" : "Update table details"}
            </p>
          </div>
          <button onClick={onClose} style={{
            width: 32, height: 32, borderRadius: 8, border: `1px solid ${BORDER}`,
            background: SOFT_BG, cursor: "pointer", fontSize: 18, color: TEXT_MUTED,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>×</button>
        </div>

        <div style={{ padding: "22px 24px", display: "flex", flexDirection: "column", gap: 16 }}>
          {field("Table Number", "table_number", "e.g. 1")}

          {field("Table Name (Optional)", "table_name", "e.g. Window Table, Patio")}

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
              {mode === "add" ? "Add Table" : "Save Changes"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function DeleteConfirm({ table, onConfirm, onClose }: { table: TableData; onConfirm: () => void; onClose: () => void }) {
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
            Delete Table {table.table_number}?
          </h3>
          <p style={{ margin: 0, fontSize: 13, color: TEXT_MUTED, lineHeight: 1.5 }}>
            This will remove the table and its QR code. This action cannot be undone.
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
          }}>Delete Table</button>
        </div>
      </div>
    </div>
  );
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function QRGenerator() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [tables, setTables] = useState<TableData[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<string | null>(null);
  const [editTable, setEditTable] = useState<TableData | null>(null);
  const [deleteTable, setDeleteTable] = useState<TableData | null>(null);
  const [form, setForm] = useState({ table_number: "", table_name: "" });

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    }
  }, [isLoading, user]);

  useEffect(() => {
    if (user) {
      fetchTables();
    }
  }, [user]);

  const fetchTables = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/api/tables/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setTables(data.tables || []);
      }
    } catch {
      setTables([]);
    } finally {
      setLoading(false);
    }
  };

  const openAdd = () => {
    setForm({ table_number: "", table_name: "" });
    setModal("add");
  };

  const openEdit = (table: TableData) => {
    setEditTable(table);
    setForm({
      table_number: String(table.table_number),
      table_name: table.table_name || "",
    });
    setModal("edit");
  };

  const handleSave = async () => {
    const tableNum = parseInt(form.table_number);
    if (!tableNum || tableNum < 1) return;

    const token = localStorage.getItem("token");
    const url = modal === "add"
      ? `${API_URL}/api/tables/`
      : `${API_URL}/api/tables/${editTable?.id}/`;
    const method = modal === "add" ? "POST" : "PUT";

    try {
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          table_number: tableNum,
          table_name: form.table_name,
        }),
      });

      if (res.ok) {
        await fetchTables();
        setModal(null);
        setEditTable(null);
      } else {
        const data = await res.json();
        alert(data.error || "Failed to save table");
      }
    } catch {
      alert("Failed to save table");
    }
  };

  const handleDelete = async () => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${API_URL}/api/tables/${deleteTable?.id}/`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setTables(prev => prev.filter((t: TableData) => t.id !== deleteTable?.id));
        setDeleteTable(null);
      }
    } catch {
      alert("Failed to delete table");
    }
  };

  const handleToggle = async (id: string) => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${API_URL}/api/tables/${id}/toggle/`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setTables(prev => prev.map((t: TableData) => t.id === id ? { ...t, is_active: data.is_active } : t));
      }
    } catch {
      // handle error
    }
  };

  const handleDownload = (table: TableData) => {
    if (!table.qr_code) return;

    // Convert base64 to blob and download
    const link = document.createElement("a");
    link.href = table.qr_code;
    link.download = `table-${table.table_number}-qr.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const activeCount = tables.filter((t: TableData) => t.is_active).length;

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
              <p style={{ margin: 0, fontWeight: 700, fontSize: 18, color: TEXT_PRIMARY, fontFamily: "'Playfair Display', serif" }}>QR Code Generator</p>
              <p style={{ margin: 0, fontSize: 12, color: TEXT_MUTED }}>Generate QR codes for your tables</p>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ fontSize: 12, color: TEXT_MUTED, fontWeight: 500 }}>
              <span style={{ color: GREEN, fontWeight: 700 }}>{activeCount}</span> / {tables.length} tables active
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
              <span style={{ fontSize: 16, lineHeight: 1 }}>+</span> Add Table
            </button>
          </div>
        </header>

        <main style={{ padding: "28px 28px" }}>

          {tables.length === 0 ? (
            <div style={{
              textAlign: "center", padding: "80px 20px",
              background: "white", borderRadius: 20, border: `1px solid ${BORDER}`,
            }}>
              <span style={{ fontSize: 64 }}>⬛</span>
              <h3 style={{ margin: "20px 0 10px", fontSize: 18, fontWeight: 700, color: TEXT_PRIMARY }}>
                No Tables Yet
              </h3>
              <p style={{ margin: "0 0 24px", fontSize: 14, color: TEXT_MUTED }}>
                Add your first table to generate a QR code
              </p>
              <button onClick={openAdd} style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                padding: "12px 24px", borderRadius: 12,
                background: PRIMARY, border: "none",
                color: "white", fontSize: 14, fontWeight: 600, cursor: "pointer",
              }}>
                + Add Your First Table
              </button>
            </div>
          ) : (
            <>
              <div style={{ marginBottom: 16, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <p style={{ margin: 0, fontSize: 12, color: TEXT_MUTED, fontWeight: 500 }}>
                  Showing <strong style={{ color: TEXT_PRIMARY }}>{tables.length}</strong> tables
                </p>
              </div>

              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
                gap: 20,
              }}>
                {tables.map((table: TableData) => (
                  <TableCard
                    key={table.id}
                    table={table}
                    onEdit={openEdit}
                    onDelete={setDeleteTable}
                    onToggle={handleToggle}
                    onDownload={handleDownload}
                  />
                ))}
              </div>
            </>
          )}
        </main>

        {modal && (
          <TableModal
            mode={modal}
            form={form}
            setForm={setForm}
            onSave={handleSave}
            onClose={() => { setModal(null); setEditTable(null); }}
          />
        )}

        {deleteTable && (
          <DeleteConfirm
            table={deleteTable}
            onConfirm={handleDelete}
            onClose={() => setDeleteTable(null)}
          />
        )}
      </div>
    </AdminLayout>
  );
}

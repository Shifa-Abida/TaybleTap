"use client";
import { ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import navItems from "@/components/adminNav";

const PRIMARY = "#FF6B35";
const MUTED = "#9CA3AF";

interface AdminLayoutProps {
  children: ReactNode;
  activeCount?: number;
}

export default function AdminLayout({ children, activeCount = 0 }: AdminLayoutProps) {
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  // navItems imported from shared config (components/adminNav.tsx)

  return (
    <div style={{
      display: "flex",
      minHeight: "100vh",
      background: "#FFFDF8",
      fontFamily: "'DM Sans', 'Inter', sans-serif",
    }}>
      {/* ── Sidebar ── */}
      <aside style={{
        width: 220,
        background: "white",
        borderRight: "1px solid #F0EDE8",
        display: "flex",
        flexDirection: "column",
        padding: "24px 0",
        flexShrink: 0,
        position: "sticky",
        top: 0,
        height: "100vh",
      }}>
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "0 20px 28px" }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: PRIMARY, display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <span style={{ fontSize: 18 }}>🍽️</span>
          </div>
          <div>
            <p style={{ margin: 0, fontWeight: 700, fontSize: 15, color: "#1A1A1A", fontFamily: "'Playfair Display', serif" }}>MenuQR</p>
            <p style={{ margin: 0, fontSize: 10, color: MUTED, fontWeight: 500 }}>Admin Panel</p>
          </div>
        </div>

        {/* Nav Items */}
        <nav style={{ flex: 1 }}>
          {navItems.map(item => {
            const isActive = pathname === item.href;
            return (
              <button
                key={item.label}
                onClick={() => router.push(item.href)}
                style={{
                  width: "100%", display: "flex", alignItems: "center", gap: 10,
                  padding: "11px 20px", border: "none", cursor: "pointer",
                  background: isActive ? "rgba(255,107,53,0.08)" : "transparent",
                  borderLeft: isActive ? `3px solid ${PRIMARY}` : "3px solid transparent",
                  color: isActive ? PRIMARY : "#6B7280",
                  fontWeight: isActive ? 600 : 400,
                  fontSize: 13.5,
                  transition: "all 0.15s",
                  textAlign: "left",
                }}
              >
                <span style={{ fontSize: 16 }}>{item.icon}</span>
                {item.label}
                {item.label === "Live Orders" && activeCount > 0 && (
                  <span style={{
                    marginLeft: "auto", fontSize: 10, fontWeight: 700,
                    background: PRIMARY, color: "white",
                    borderRadius: 10, padding: "1px 6px",
                  }}>{activeCount}</span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Restaurant Info */}
        <div style={{
          margin: "0 14px",
          padding: "12px 14px",
          background: "rgba(255,107,53,0.06)",
          borderRadius: 12,
          border: "1px solid rgba(255,107,53,0.12)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 22 }}>🏪</span>
            <div>
              <p style={{ margin: 0, fontWeight: 600, fontSize: 12, color: "#1A1A1A" }}>
                {user?.restaurant_name || "My Restaurant"}
              </p>
              <p style={{ margin: 0, fontSize: 11, color: MUTED }}>{user?.city || "Bengaluru"}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* ── Main Content ── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        {children}
      </div>
    </div>
  );
}

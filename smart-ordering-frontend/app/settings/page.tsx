"use client";
import { useState, useRef, useEffect } from "react";
import {
  Camera, Save, Eye, EyeOff, CheckCircle, AlertCircle, Clock,
  MapPin, Phone, Mail, User, Store, Shield, Bell, Trash2,
  ChevronRight, Loader2, Check, Utensils, BarChart2, QrCode,
  LayoutDashboard, X, Upload, Globe, Wifi, WifiOff, Zap
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useRouter, usePathname } from "next/navigation";

const PRIMARY = "#FF6B35";
const PRIMARY_SOFT = "rgba(255,107,53,0.08)";
const PRIMARY_BORDER = "rgba(255,107,53,0.2)";
const ACCENT_GREEN = "#22C55E";
const MUTED = "#9CA3AF";
const TEXT_PRIMARY = "#1A1A1A";
const TEXT_SECONDARY = "#6B7280";
const BORDER = "#F0EDE8";
const BG = "#FFFDF8";
const CARD = "#FFFFFF";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
  { icon: Utensils, label: "Live Orders", href: "/orders" },
  { icon: Store, label: "Menu", href: "/menu" },
  { icon: BarChart2, label: "Analytics", href: "/analytics" },
  { icon: QrCode, label: "QR Codes", href: "/qr" },
  { icon: Shield, label: "Settings", href: "/settings" },
];

function Field({ label, icon: Icon, type = "text", value, onChange, placeholder, hint, error, rightElement }: {
  label: string; icon?: React.ComponentType<{ size: number; color?: string; style?: React.CSSProperties }>; type?: string;
  value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; placeholder?: string;
  hint?: string; error?: string; rightElement?: React.ReactNode;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <label style={{ fontSize: 12.5, fontWeight: 600, color: TEXT_SECONDARY, letterSpacing: "0.02em" }}>{label}</label>
      <div style={{
        display: "flex", alignItems: "center", gap: 10,
        border: `1.5px solid ${error ? "#F43F5E" : focused ? PRIMARY : BORDER}`,
        borderRadius: 12, padding: "0 14px",
        background: focused ? "rgba(255,107,53,0.02)" : CARD,
        transition: "all 0.2s",
      }}>
        {Icon && <Icon size={15} color={focused ? PRIMARY : MUTED} style={{ flexShrink: 0, transition: "color 0.2s" }} />}
        <input
          type={type} value={value} onChange={onChange} placeholder={placeholder}
          onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
          style={{
            flex: 1, border: "none", outline: "none", background: "transparent",
            fontSize: 13.5, color: TEXT_PRIMARY, padding: "11px 0",
            fontFamily: "'DM Sans', 'Inter', sans-serif",
          }}
        />
        {rightElement}
      </div>
      {hint && !error && <p style={{ fontSize: 11.5, color: MUTED, margin: 0 }}>{hint}</p>}
      {error && <p style={{ fontSize: 11.5, color: "#F43F5E", margin: 0, display: "flex", alignItems: "center", gap: 4 }}><AlertCircle size={11} />{error}</p>}
    </div>
  );
}

function SectionCard({ title, subtitle, icon: Icon, children, accent }: {
  title: string; subtitle?: string; icon: React.ComponentType<{ size: number; color?: string }>;
  children: React.ReactNode; accent?: boolean;
}) {
  return (
    <div style={{ background: CARD, borderRadius: 20, border: `1px solid ${BORDER}`, overflow: "hidden" }}>
      <div style={{
        padding: "20px 28px", borderBottom: `1px solid ${BORDER}`,
        background: accent ? PRIMARY_SOFT : "transparent",
        display: "flex", alignItems: "flex-start", gap: 14,
      }}>
        <div style={{
          width: 38, height: 38, borderRadius: 10,
          background: accent ? PRIMARY : "#F4F0EA",
          display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
        }}>
          <Icon size={17} color={accent ? "white" : TEXT_SECONDARY} />
        </div>
        <div>
          <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: TEXT_PRIMARY }}>{title}</h3>
          {subtitle && <p style={{ margin: "2px 0 0", fontSize: 12.5, color: TEXT_SECONDARY }}>{subtitle}</p>}
        </div>
      </div>
      <div style={{ padding: "24px 28px" }}>{children}</div>
    </div>
  );
}

function PasswordStrength({ password }: { password: string }) {
  const checks = [
    password.length >= 8,
    /[A-Z]/.test(password),
    /[0-9]/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ];
  const score = checks.filter(Boolean).length;
  const labels = ["", "Weak", "Fair", "Good", "Strong"];
  const colors = ["", "#F43F5E", "#F59E0B", "#3B82F6", ACCENT_GREEN];
  if (!password) return null;
  return (
    <div style={{ marginTop: 8 }}>
      <div style={{ display: "flex", gap: 4, marginBottom: 6 }}>
        {[0, 1, 2, 3].map(i => (
          <div key={i} style={{
            flex: 1, height: 3, borderRadius: 99,
            background: i < score ? colors[score] : BORDER, transition: "background 0.3s",
          }} />
        ))}
      </div>
      <p style={{ fontSize: 11.5, color: colors[score], margin: 0, fontWeight: 600 }}>{labels[score]}</p>
    </div>
  );
}

function Toast({ visible, message, type = "success" }: { visible: boolean; message: string; type?: string }) {
  return (
    <div style={{
      position: "fixed", bottom: 32, right: 32, zIndex: 1000,
      display: "flex", alignItems: "center", gap: 10,
      background: type === "success" ? TEXT_PRIMARY : "#F43F5E",
      color: "white", borderRadius: 14, padding: "12px 20px",
      fontSize: 13.5, fontWeight: 500, boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
      transform: visible ? "translateY(0)" : "translateY(80px)",
      opacity: visible ? 1 : 0, transition: "all 0.35s cubic-bezier(0.34,1.56,0.64,1)",
      pointerEvents: visible ? "auto" : "none",
    }}>
      {type === "success" ? <Check size={16} /> : <X size={16} />}
      {message}
    </div>
  );
}

function CompletionBar({ percent }: { percent: number }) {
  return (
    <div style={{
      background: CARD, borderRadius: 16, padding: "16px 20px", border: `1px solid ${BORDER}`, marginBottom: 24,
      display: "flex", alignItems: "center", gap: 16,
    }}>
      <div style={{
        width: 44, height: 44, borderRadius: 12, flexShrink: 0,
        background: percent === 100 ? "rgba(34,197,94,0.1)" : PRIMARY_SOFT,
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        {percent === 100 ? <CheckCircle size={20} color={ACCENT_GREEN} /> : <Zap size={20} color={PRIMARY} />}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
          <span style={{ fontSize: 12.5, fontWeight: 600, color: TEXT_PRIMARY }}>
            {percent === 100 ? "Profile Complete! 🎉" : "Complete your profile"}
          </span>
          <span style={{ fontSize: 12, fontWeight: 700, color: percent === 100 ? ACCENT_GREEN : PRIMARY }}>{percent}%</span>
        </div>
        <div style={{ height: 6, background: "#F4F0EA", borderRadius: 99, overflow: "hidden" }}>
          <div style={{
            height: "100%", width: `${percent}%`, borderRadius: 99,
            background: percent === 100 ? ACCENT_GREEN : `linear-gradient(90deg, ${PRIMARY}, #FFC947)`,
            transition: "width 0.6s ease",
          }} />
        </div>
        {percent < 100 && <p style={{ margin: "5px 0 0", fontSize: 11.5, color: MUTED }}>Add logo & description to reach 100%</p>}
      </div>
    </div>
  );
}

function StatusToggle({ isOpen, onToggle }: { isOpen: boolean; onToggle: () => void }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 12,
      background: isOpen ? "rgba(34,197,94,0.08)" : "rgba(244,63,94,0.08)",
      border: `1.5px solid ${isOpen ? "rgba(34,197,94,0.25)" : "rgba(244,63,94,0.25)"}`,
      borderRadius: 12, padding: "10px 16px", cursor: "pointer", transition: "all 0.25s",
    }} onClick={onToggle}>
      {isOpen ? <Wifi size={15} color={ACCENT_GREEN} /> : <WifiOff size={15} color="#F43F5E" />}
      <span style={{ fontSize: 13, fontWeight: 600, color: isOpen ? ACCENT_GREEN : "#F43F5E" }}>{isOpen ? "Open Now" : "Closed"}</span>
      <div style={{
        marginLeft: "auto", width: 36, height: 20, borderRadius: 99,
        background: isOpen ? ACCENT_GREEN : "#E5E7EB", transition: "background 0.25s", position: "relative",
      }}>
        <div style={{
          position: "absolute", top: 2, left: isOpen ? 18 : 2,
          width: 16, height: 16, borderRadius: 99, background: "white",
          transition: "left 0.25s", boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
        }} />
      </div>
    </div>
  );
}

function LogoUpload({ logo, onUpload }: { logo: string | null; onUpload: (v: string | null) => void }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const handleFile = (file: File | undefined) => {
    if (!file || !file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = e => onUpload(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
      <div
        onDragOver={e => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={e => { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files[0]); }}
        onClick={() => !logo && fileRef.current?.click()}
        style={{
          width: 90, height: 90, borderRadius: 20, overflow: "hidden", flexShrink: 0,
          border: `2px dashed ${dragging ? PRIMARY : BORDER}`,
          background: logo ? "transparent" : PRIMARY_SOFT,
          display: "flex", alignItems: "center", justifyContent: "center",
          cursor: logo ? "default" : "pointer", transition: "all 0.2s",
        }}
      >
        {logo ? (
          <img src={logo} alt="logo" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          <Store size={28} color={PRIMARY} />
        )}
      </div>
      <div>
        <p style={{ margin: "0 0 6px", fontSize: 13, fontWeight: 600, color: TEXT_PRIMARY }}>Restaurant Logo</p>
        <p style={{ margin: "0 0 12px", fontSize: 12, color: MUTED }}>PNG, JPG or SVG. Max 2MB.</p>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => fileRef.current?.click()} style={{
            display: "flex", alignItems: "center", gap: 6,
            padding: "7px 14px", borderRadius: 10, fontSize: 12.5, fontWeight: 600,
            background: PRIMARY, color: "white", border: "none", cursor: "pointer",
          }}>
            <Upload size={13} /> Upload
          </button>
          {logo && (
            <button onClick={() => onUpload(null)} style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "7px 14px", borderRadius: 10, fontSize: 12.5, fontWeight: 500,
              background: "transparent", color: TEXT_SECONDARY, border: `1px solid ${BORDER}`, cursor: "pointer",
            }}>
              <Trash2 size={12} /> Remove
            </button>
          )}
        </div>
        <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }}
          onChange={e => handleFile(e.target.files?.[0])} />
      </div>
    </div>
  );
}

function TimePicker({ label, value, onChange }: { label: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void }) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <label style={{ fontSize: 12.5, fontWeight: 600, color: TEXT_SECONDARY }}>{label}</label>
      <div style={{
        display: "flex", alignItems: "center", gap: 10,
        border: `1.5px solid ${focused ? PRIMARY : BORDER}`,
        borderRadius: 12, padding: "0 14px", background: CARD, transition: "all 0.2s",
      }}>
        <Clock size={15} color={focused ? PRIMARY : MUTED} style={{ transition: "color 0.2s" }} />
        <input type="time" value={value} onChange={onChange}
          onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
          style={{
            flex: 1, border: "none", outline: "none", background: "transparent",
            fontSize: 13.5, color: TEXT_PRIMARY, padding: "11px 0",
            fontFamily: "'DM Sans', 'Inter', sans-serif",
          }} />
      </div>
    </div>
  );
}

function NotifRow({ label, desc, checked, onChange }: { label: string; desc: string; checked: boolean; onChange: () => void }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "12px 0", borderBottom: `1px solid ${BORDER}`, gap: 16,
    }}>
      <div>
        <p style={{ margin: 0, fontSize: 13.5, fontWeight: 500, color: TEXT_PRIMARY }}>{label}</p>
        <p style={{ margin: 0, fontSize: 12, color: MUTED }}>{desc}</p>
      </div>
      <div onClick={onChange} style={{
        width: 40, height: 22, borderRadius: 99, cursor: "pointer", flexShrink: 0,
        background: checked ? PRIMARY : "#E5E7EB", transition: "background 0.25s", position: "relative",
      }}>
        <div style={{
          position: "absolute", top: 3, left: checked ? 20 : 3,
          width: 16, height: 16, borderRadius: 99, background: "white",
          transition: "left 0.25s", boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
        }} />
      </div>
    </div>
  );
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function RestaurantSettings() {
  const { user, isLoading, updateUser } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const [logo, setLogo] = useState<string | null>(null);
  const [restaurantName, setRestaurantName] = useState(user?.restaurant_name || "Spice Garden");
  const [cuisineType, setCuisineType] = useState("North Indian · Multi-Cuisine");
  const [description, setDescription] = useState("Authentic flavors from across India, served fresh every day.");
  const [website, setWebsite] = useState("spicegarden.in");
  const [ownerName, setOwnerName] = useState(user?.name || "Arjun Mehta");
  const [email, setEmail] = useState(user?.email || "arjun@spicegarden.in");
  const [phone, setPhone] = useState(user?.phone || "+91 98765 43210");
  const [address, setAddress] = useState("12, MG Road, Near Forum Mall");
  const [city, setCity] = useState(user?.city || "Bengaluru");
  const [state, setState] = useState("Karnataka");
  const [zip, setZip] = useState("560001");
  const [openTime, setOpenTime] = useState("10:00");
  const [closeTime, setCloseTime] = useState("23:00");
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isOpen, setIsOpen] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState({ visible: false, message: "", type: "success" as "success" | "error" });
  const [notifs, setNotifs] = useState({ newOrder: true, statusUpdate: false, dailyReport: true, lowStock: false });
  const [activeSection, setActiveSection] = useState("profile");

  useEffect(() => {
    if (!isLoading && !user) router.push("/login");
  }, [isLoading, user, router]);

  const pwError = confirmPw && newPw !== confirmPw ? "Passwords don't match" : "";

  const completionPercent = (() => {
    let score = 0;
    if (logo) score += 20;
    if (restaurantName) score += 20;
    if (description) score += 20;
    if (ownerName && email && phone) score += 20;
    if (address && city) score += 20;
    return score;
  })();

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ visible: true, message, type });
    setTimeout(() => setToast(t => ({ ...t, visible: false })), 3000);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/api/auth/profile/`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: ownerName,
          phone,
          restaurant_name: restaurantName,
          city,
          restaurant_type: cuisineType,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        updateUser(data.user);
        showToast("Changes saved successfully");
      } else {
        showToast(data.error || "Failed to save changes", "error");
      }
    } catch {
      showToast("Cannot connect to server", "error");
    } finally {
      setSaving(false);
    }
  };

  const sectionLinks = [
    { id: "profile", label: "Restaurant Profile" },
    { id: "owner", label: "Owner Information" },
    { id: "details", label: "Business Details" },
    { id: "security", label: "Security" },
    { id: "notifications", label: "Notifications" },
    { id: "danger", label: "Danger Zone" },
  ];

  if (isLoading || !user) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", background: BG }}>
        <p style={{ color: MUTED, fontSize: 14 }}>Loading...</p>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: BG, fontFamily: "'DM Sans', 'Inter', sans-serif" }}>

      {/* Sidebar */}
      <aside style={{ width: 220, background: CARD, borderRight: `1px solid ${BORDER}`, display: "flex", flexDirection: "column", padding: "24px 0", position: "sticky", top: 0, height: "100vh", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "0 20px 28px" }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: PRIMARY, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Utensils size={18} color="white" />
          </div>
          <div>
            <p style={{ margin: 0, fontWeight: 700, fontSize: 15, color: TEXT_PRIMARY }}>MenuQR</p>
            <p style={{ margin: 0, fontSize: 10, color: MUTED, fontWeight: 500 }}>Admin Panel</p>
          </div>
        </div>
        <nav style={{ flex: 1 }}>
          {navItems.map(item => {
            const isActive = pathname === item.href;
            return (
              <button key={item.label} onClick={() => router.push(item.href)} style={{
                width: "100%", display: "flex", alignItems: "center", gap: 10,
                padding: "11px 20px", border: "none", cursor: "pointer",
                background: isActive ? PRIMARY_SOFT : "transparent",
                borderLeft: isActive ? `3px solid ${PRIMARY}` : "3px solid transparent",
                color: isActive ? PRIMARY : TEXT_SECONDARY,
                fontWeight: isActive ? 600 : 400, fontSize: 13.5,
                transition: "all 0.15s", textAlign: "left",
              }}>
                <item.icon size={16} />
                {item.label}
              </button>
            );
          })}
        </nav>
        <div style={{ margin: "0 14px", padding: "12px 14px", background: PRIMARY_SOFT, borderRadius: 12, border: `1px solid ${PRIMARY_BORDER}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 22 }}>🏪</span>
            <div>
              <p style={{ margin: 0, fontWeight: 600, fontSize: 12, color: TEXT_PRIMARY }}>{user.restaurant_name || "My Restaurant"}</p>
              <p style={{ margin: 0, fontSize: 11, color: MUTED }}>{user.city || "Bengaluru"}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        {/* Top Bar */}
        <div style={{ background: CARD, borderBottom: `1px solid ${BORDER}`, padding: "0 32px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 64, flexShrink: 0, position: "sticky", top: 0, zIndex: 10 }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: TEXT_PRIMARY }}>Settings</h1>
            <p style={{ margin: 0, fontSize: 12, color: MUTED }}>Manage your restaurant profile and preferences</p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <StatusToggle isOpen={isOpen} onToggle={() => setIsOpen(v => !v)} />
            <button onClick={handleSave} disabled={saving} style={{
              display: "flex", alignItems: "center", gap: 8,
              padding: "9px 20px", borderRadius: 12, fontSize: 13.5, fontWeight: 600,
              background: saving ? "#F4F0EA" : PRIMARY, color: saving ? MUTED : "white",
              border: "none", cursor: saving ? "not-allowed" : "pointer", transition: "all 0.2s",
            }}>
              {saving ? <Loader2 size={15} style={{ animation: "spin 1s linear infinite" }} /> : <Save size={15} />}
              {saving ? "Saving…" : "Save Changes"}
            </button>
          </div>
        </div>

        <div style={{ display: "flex", flex: 1, minWidth: 0 }}>
          {/* Section Nav */}
          <div style={{ width: 200, padding: "24px 16px", flexShrink: 0, borderRight: `1px solid ${BORDER}`, position: "sticky", top: 64, alignSelf: "flex-start", height: "calc(100vh - 64px)", overflowY: "auto" }}>
            {sectionLinks.map(({ id, label }) => (
              <button key={id} onClick={() => {
                setActiveSection(id);
                document.getElementById(`section-${id}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
              }} style={{
                width: "100%", textAlign: "left", padding: "8px 12px",
                borderRadius: 10, border: "none", cursor: "pointer", fontSize: 13,
                fontWeight: activeSection === id ? 600 : 400,
                color: activeSection === id ? PRIMARY : TEXT_SECONDARY,
                background: activeSection === id ? PRIMARY_SOFT : "transparent",
                marginBottom: 2, transition: "all 0.15s",
                display: "flex", alignItems: "center", justifyContent: "space-between",
              }}>
                {label}
                {activeSection === id && <ChevronRight size={13} />}
              </button>
            ))}
          </div>

          {/* Content */}
          <div style={{ flex: 1, padding: "28px 32px", minWidth: 0, maxWidth: 820 }}>
            <CompletionBar percent={completionPercent} />

            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

              {/* Restaurant Profile */}
              <div id="section-profile">
                <SectionCard title="Restaurant Profile" subtitle="Public-facing info customers will see" icon={Store} accent>
                  <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                    <LogoUpload logo={logo} onUpload={setLogo} />
                    <div style={{ height: 1, background: BORDER }} />
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                      <Field label="Restaurant Name" icon={Store} value={restaurantName} onChange={e => setRestaurantName(e.target.value)} placeholder="Your restaurant name" />
                      <Field label="Cuisine Type" icon={Utensils} value={cuisineType} onChange={e => setCuisineType(e.target.value)} placeholder="e.g. North Indian, Italian" />
                    </div>
                    <Field label="Short Description / Tagline" value={description} onChange={e => setDescription(e.target.value)} placeholder="A short line that describes your restaurant" hint="Shown on your digital menu page" />
                    <Field label="Website (optional)" icon={Globe} value={website} onChange={e => setWebsite(e.target.value)} placeholder="yourrestaurant.com" />
                  </div>
                </SectionCard>
              </div>

              {/* Owner Information */}
              <div id="section-owner">
                <SectionCard title="Owner Information" subtitle="Your personal account details" icon={User}>
                  <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    <Field label="Full Name" icon={User} value={ownerName} onChange={e => setOwnerName(e.target.value)} placeholder="Your full name" />
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                      <Field label="Email Address" icon={Mail} type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" hint="Used for login and notifications" />
                      <Field label="Phone Number" icon={Phone} type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+91 00000 00000" />
                    </div>
                  </div>
                </SectionCard>
              </div>

              {/* Business Details */}
              <div id="section-details">
                <SectionCard title="Business Details" subtitle="Location and operating hours" icon={MapPin}>
                  <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    <Field label="Street Address" icon={MapPin} value={address} onChange={e => setAddress(e.target.value)} placeholder="Street address" />
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
                      <Field label="City" value={city} onChange={e => setCity(e.target.value)} placeholder="City" />
                      <Field label="State" value={state} onChange={e => setState(e.target.value)} placeholder="State" />
                      <Field label="PIN Code" value={zip} onChange={e => setZip(e.target.value)} placeholder="560001" />
                    </div>
                    <div style={{ height: 1, background: BORDER }} />
                    <div style={{ display: "flex", gap: 16 }}>
                      <div style={{ flex: 1 }}><TimePicker label="Opening Time" value={openTime} onChange={e => setOpenTime(e.target.value)} /></div>
                      <div style={{ flex: 1 }}><TimePicker label="Closing Time" value={closeTime} onChange={e => setCloseTime(e.target.value)} /></div>
                      <div style={{ flex: 1, background: PRIMARY_SOFT, border: `1px solid ${PRIMARY_BORDER}`, borderRadius: 12, padding: "12px 16px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
                        <p style={{ margin: 0, fontSize: 11.5, color: MUTED, marginBottom: 4 }}>Operating hours</p>
                        <p style={{ margin: 0, fontSize: 13.5, fontWeight: 700, color: PRIMARY }}>{openTime} – {closeTime}</p>
                        <p style={{ margin: 0, fontSize: 11, color: MUTED }}>
                          {(() => {
                            const [oh, om] = openTime.split(":").map(Number);
                            const [ch, cm] = closeTime.split(":").map(Number);
                            const diff = ((ch * 60 + cm) - (oh * 60 + om) + 1440) % 1440;
                            return `${Math.floor(diff / 60)}h ${diff % 60}m per day`;
                          })()}
                        </p>
                      </div>
                    </div>
                  </div>
                </SectionCard>
              </div>

              {/* Security */}
              <div id="section-security">
                <SectionCard title="Security" subtitle="Keep your account safe" icon={Shield}>
                  <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    <div style={{ background: "rgba(59,130,246,0.06)", border: "1px solid rgba(59,130,246,0.15)", borderRadius: 12, padding: "12px 16px", display: "flex", alignItems: "flex-start", gap: 10 }}>
                      <Shield size={15} color="#3B82F6" style={{ flexShrink: 0, marginTop: 1 }} />
                      <p style={{ margin: 0, fontSize: 12.5, color: "#1D4ED8", lineHeight: 1.5 }}>Use a strong password of at least 8 characters including numbers and symbols.</p>
                    </div>
                    <Field label="Current Password" icon={Shield} type={showCurrent ? "text" : "password"} value={currentPw} onChange={e => setCurrentPw(e.target.value)} placeholder="Enter current password"
                      rightElement={<button onClick={() => setShowCurrent(v => !v)} style={{ border: "none", background: "transparent", cursor: "pointer", padding: 4 }}>{showCurrent ? <EyeOff size={15} color={MUTED} /> : <Eye size={15} color={MUTED} />}</button>} />
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                      <div>
                        <Field label="New Password" icon={Shield} type={showNew ? "text" : "password"} value={newPw} onChange={e => setNewPw(e.target.value)} placeholder="New password"
                          rightElement={<button onClick={() => setShowNew(v => !v)} style={{ border: "none", background: "transparent", cursor: "pointer", padding: 4 }}>{showNew ? <EyeOff size={15} color={MUTED} /> : <Eye size={15} color={MUTED} />}</button>} />
                        <PasswordStrength password={newPw} />
                      </div>
                      <Field label="Confirm Password" icon={Shield} type={showConfirm ? "text" : "password"} value={confirmPw} onChange={e => setConfirmPw(e.target.value)} placeholder="Confirm new password" error={pwError}
                        rightElement={<button onClick={() => setShowConfirm(v => !v)} style={{ border: "none", background: "transparent", cursor: "pointer", padding: 4 }}>{showConfirm ? <EyeOff size={15} color={MUTED} /> : <Eye size={15} color={MUTED} />}</button>} />
                    </div>
                    <button style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 18px", borderRadius: 12, fontSize: 13, fontWeight: 600, background: TEXT_PRIMARY, color: "white", border: "none", cursor: "pointer", alignSelf: "flex-start" }}>
                      <Shield size={14} /> Update Password
                    </button>
                  </div>
                </SectionCard>
              </div>

              {/* Notifications */}
              <div id="section-notifications">
                <SectionCard title="Notifications" subtitle="Choose what you want to hear about" icon={Bell}>
                  <div>
                    <NotifRow label="New Order Alerts" desc="Get notified when a new order arrives" checked={notifs.newOrder} onChange={() => setNotifs(n => ({ ...n, newOrder: !n.newOrder }))} />
                    <NotifRow label="Status Updates" desc="Notify when order status changes" checked={notifs.statusUpdate} onChange={() => setNotifs(n => ({ ...n, statusUpdate: !n.statusUpdate }))} />
                    <NotifRow label="Daily Summary Report" desc="Receive end-of-day revenue & order report" checked={notifs.dailyReport} onChange={() => setNotifs(n => ({ ...n, dailyReport: !n.dailyReport }))} />
                    <NotifRow label="Low Inventory Alerts" desc="Warn when menu items run out" checked={notifs.lowStock} onChange={() => setNotifs(n => ({ ...n, lowStock: !n.lowStock }))} />
                    <div style={{ paddingTop: 12 }}>
                      <NotifRow label="Weekly Analytics" desc="Monday morning performance digest" checked={false} onChange={() => {}} />
                    </div>
                  </div>
                </SectionCard>
              </div>

              {/* Danger Zone */}
              <div id="section-danger">
                <div style={{ background: CARD, borderRadius: 20, border: "1.5px solid rgba(244,63,94,0.2)", overflow: "hidden" }}>
                  <div style={{ padding: "20px 28px", borderBottom: "1px solid rgba(244,63,94,0.12)", background: "rgba(244,63,94,0.04)", display: "flex", alignItems: "center", gap: 14 }}>
                    <div style={{ width: 38, height: 38, borderRadius: 10, background: "rgba(244,63,94,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <AlertCircle size={17} color="#F43F5E" />
                    </div>
                    <div>
                      <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "#F43F5E" }}>Danger Zone</h3>
                      <p style={{ margin: "2px 0 0", fontSize: 12.5, color: TEXT_SECONDARY }}>Irreversible actions — proceed with caution</p>
                    </div>
                  </div>
                  <div style={{ padding: "24px 28px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 24, flexWrap: "wrap" }}>
                    <div>
                      <p style={{ margin: "0 0 4px", fontSize: 14, fontWeight: 600, color: TEXT_PRIMARY }}>Delete Restaurant Account</p>
                      <p style={{ margin: 0, fontSize: 12.5, color: MUTED }}>Permanently delete your account, menus, and all order history.</p>
                    </div>
                    <button style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 18px", borderRadius: 12, fontSize: 13, fontWeight: 600, background: "transparent", color: "#F43F5E", border: "1.5px solid rgba(244,63,94,0.3)", cursor: "pointer" }}>
                      <Trash2 size={14} /> Delete Account
                    </button>
                  </div>
                </div>
              </div>

              {/* Bottom Save Bar */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 24px", background: CARD, borderRadius: 16, border: `1px solid ${BORDER}` }}>
                <p style={{ margin: 0, fontSize: 13, color: MUTED }}>Last saved: <span style={{ color: TEXT_PRIMARY, fontWeight: 600 }}>Today at 2:41 PM</span></p>
                <div style={{ display: "flex", gap: 10 }}>
                  <button style={{ padding: "10px 20px", borderRadius: 12, fontSize: 13.5, fontWeight: 500, background: "transparent", color: TEXT_SECONDARY, border: `1px solid ${BORDER}`, cursor: "pointer" }}>Cancel</button>
                  <button onClick={handleSave} disabled={saving} style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 24px", borderRadius: 12, fontSize: 13.5, fontWeight: 600, background: saving ? "#F4F0EA" : PRIMARY, color: saving ? MUTED : "white", border: "none", cursor: saving ? "not-allowed" : "pointer", transition: "all 0.2s" }}>
                    {saving ? <Loader2 size={15} style={{ animation: "spin 1s linear infinite" }} /> : <Save size={15} />}
                    {saving ? "Saving…" : "Save All Changes"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Toast visible={toast.visible} message={toast.message} type={toast.type} />
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');
        @keyframes spin { to { transform: rotate(360deg); } }
        * { box-sizing: border-box; }
        input[type="time"]::-webkit-calendar-picker-indicator { opacity: 0.4; cursor: pointer; }
        ::-webkit-scrollbar { width: 5px; } ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #E5E0D8; border-radius: 99px; }
      `}</style>
    </div>
  );
}
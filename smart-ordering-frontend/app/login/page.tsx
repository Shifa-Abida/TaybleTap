"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AuthGlobalStyles } from "@/components/auth/AuthStyles";
import { Icon, IC, Logo, AnimatedOrbs, TestimonialTicker, Field, SocialButtons, useRipple } from "@/components/auth/AuthShared";
import { DashboardVisual } from "@/components/auth/DashboardVisual";
import { useAuth } from "@/context/AuthContext";

export default function LoginPage() {
  const router = useRouter();
  const { login, isAuthenticated } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const { ref: btnRef, triggerRipple } = useRipple();

  useEffect(() => {
    if (isAuthenticated) {
      router.push("/dashboard");
    }
  }, [isAuthenticated, router]);

  useEffect(() => { const t = setTimeout(() => setMounted(true), 60); return () => clearTimeout(t); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    triggerRipple(e as unknown as React.MouseEvent);
    setError("");
    setLoading(true);

    try {
      const res = await fetch("http://localhost:8000/api/auth/login/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (res.ok) {
        login(data.token, data.user);
        setSuccess(true);
        setTimeout(() => router.push("/dashboard"), 1500);
      } else {
        setError(data.error || "Invalid credentials. Please try again.");
      }
    } catch {
      setError("Cannot connect to server. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <AuthGlobalStyles />
      <div className="page-wrap" style={{ minHeight: "100vh", display: "flex", background: "var(--bg-warm)" }}>

        {/* ── LEFT: Form panel ── */}
        <div style={{
          width: "46%", flexShrink: 0, display: "flex", flexDirection: "column",
          padding: "40px 60px",
          opacity: mounted ? 1 : 0, transform: mounted ? "none" : "translateX(-24px)",
          transition: "all 0.7s cubic-bezier(0.22,1,0.36,1)",
          position: "relative", zIndex: 2, background: "var(--bg-warm)",
        }}>
          <Logo onClick={() => router.push("/")} />

          <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", maxWidth: 400, margin: "0 auto", width: "100%" }}>
            <div style={{ marginBottom: 32, opacity: mounted ? 1 : 0, transform: mounted ? "none" : "translateY(12px)", transition: "all 0.6s 0.15s ease" }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: "var(--primary)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>Welcome back</p>
              <h1 style={{ fontFamily: "var(--font-display)", fontSize: 38, fontWeight: 700, color: "var(--text-primary)", lineHeight: 1.1, marginBottom: 10 }}>
                Login to your<br />
                <span style={{ background: "linear-gradient(135deg, #E8572A, #F5A623)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", fontStyle: "italic" }}>Dashboard</span>
              </h1>
              <p style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.6 }}>Manage orders, menus & revenue from one place.</p>
            </div>

            {success ? (
              <div style={{ textAlign: "center", padding: "40px 20px", animation: "dashCard 0.5s ease" }}>
                <div style={{ width: 72, height: 72, borderRadius: "50%", background: "rgba(45,158,107,0.1)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 18px" }}>
                  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#2D9E6B" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d={IC.check} strokeDasharray="24" strokeDashoffset="0" style={{ animation: "checkmark 0.5s ease forwards" }} />
                  </svg>
                </div>
                <h3 style={{ fontFamily: "var(--font-display)", fontSize: 24, fontWeight: 700, color: "var(--text-primary)", marginBottom: 8 }}>You&apos;re in! \uD83C\uDF89</h3>
                <p style={{ fontSize: 14, color: "var(--text-secondary)" }}>Redirecting to your dashboard...</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ opacity: mounted ? 1 : 0, transition: "opacity 0.5s 0.3s" }}>
                <SocialButtons />
                <Field label="Email address" type="email" icon={IC.mail} placeholder="you@restaurant.com" value={email} onChange={setEmail} />
                <Field label="Password" type="password" icon={IC.lock} placeholder="Enter your password" value={password} onChange={setPassword} />

                {error && (
                  <div style={{ padding: "10px 14px", borderRadius: 11, background: "rgba(232,87,42,0.06)", border: "1px solid rgba(232,87,42,0.15)", marginBottom: 16 }}>
                    <p style={{ fontSize: 13, color: "var(--primary)", fontWeight: 500 }}>{error}</p>
                  </div>
                )}

                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24, marginTop: -6 }}>
                  <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
                    <input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)}
                      style={{ width: 15, height: 15, accentColor: "var(--primary)", cursor: "pointer" }} />
                    <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>Remember me</span>
                  </label>
                  <a className="tt-link" style={{ fontSize: 13 }}>Forgot password?</a>
                </div>

                <button ref={btnRef} type="submit" className="tt-btn-primary" disabled={loading}>
                  {loading ? (
                    <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
                        <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"
                          style={{ animation: "spin-slow 0.8s linear infinite", transformOrigin: "12px 12px", display: "block" }} />
                      </svg>
                      Logging in...
                    </span>
                  ) : (
                    <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                      Login to Dashboard <Icon d={IC.arrow} size={16} color="white" />
                    </span>
                  )}
                </button>

                <p style={{ textAlign: "center", marginTop: 20, fontSize: 13, color: "var(--text-secondary)" }}>
                  New to TaybleTap?{" "}
                  <span className="tt-link" onClick={() => router.push("/register")}>Create free account \u2192</span>
                </p>
              </form>
            )}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 24, opacity: 0.7 }}>
            {[{ d: IC.shield, t: "Secure login" }, { d: IC.star, t: "500+ restaurants" }, { d: IC.clock, t: "Setup in 10 min" }].map(i => (
              <div key={i.t} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <Icon d={i.d} size={13} color="var(--text-muted)" />
                <span style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 500 }}>{i.t}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── RIGHT: Animated visual panel ── */}
        <div style={{
          flex: 1, position: "relative", overflow: "hidden",
          background: "linear-gradient(150deg, #1A1208 0%, #2D1A08 55%, #1A0E04 100%)",
          opacity: mounted ? 1 : 0, transform: mounted ? "none" : "translateX(24px)",
          transition: "all 0.75s cubic-bezier(0.22,1,0.36,1) 0.1s",
        }}>
          <AnimatedOrbs variant="dark" />
          <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px)", backgroundSize: "32px 32px" }} />

          <div style={{ position: "absolute", top: 44, left: 44, right: 44, zIndex: 4 }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 7, background: "rgba(232,87,42,0.2)", borderRadius: 100, padding: "5px 13px", marginBottom: 14 }}>
              <Icon d={IC.spark} size={12} color="#FFB891" />
              <span style={{ fontSize: 11, fontWeight: 700, color: "#FFB891", letterSpacing: "0.07em", textTransform: "uppercase" }}>Live Dashboard</span>
            </div>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: 32, fontWeight: 700, color: "white", lineHeight: 1.2, maxWidth: 300 }}>
              Your restaurant,{" "}
              <em style={{ background: "linear-gradient(135deg, #FF7A4D, #FFD27A)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>always live</em>
            </h2>
          </div>

          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", padding: "100px 32px 80px" }}>
            <DashboardVisual animate={mounted} />
          </div>

          <TestimonialTicker />
        </div>
      </div>
    </>
  );
}

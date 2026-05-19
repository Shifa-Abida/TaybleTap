"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AuthGlobalStyles } from "@/components/auth/AuthStyles";
import { Icon, IC, Logo, AnimatedOrbs, TestimonialTicker, Field, SocialButtons, PasswordStrength, useRipple } from "@/components/auth/AuthShared";
import { RegisterVisual } from "@/components/auth/RegisterVisual";
import { useAuth } from "@/context/AuthContext";

export default function RegisterPage() {
  const router = useRouter();
  const { login, isAuthenticated } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "", restaurant: "", city: "", type: "" });
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const { ref: btnRef, triggerRipple } = useRipple();

  useEffect(() => {
    if (isAuthenticated) {
      router.push("/dashboard");
    }
  }, [isAuthenticated, router]);

  useEffect(() => { const t = setTimeout(() => setMounted(true), 60); return () => clearTimeout(t); }, []);

  const set = (k: string) => (v: string) => setForm(f => ({ ...f, [k]: v }));
  const progress = step === 1 ? 50 : 100;
  const restaurantTypes = ["Quick Service", "Fine Dining", "Caf\u00E9 / Bakery", "Dhaba", "Cloud Kitchen", "Bar & Grill"];

  const handleNext = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (step === 1) { setStep(2); return; }

    triggerRipple(e as unknown as React.MouseEvent);
    setLoading(true);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/auth/register/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          phone: form.phone,
          password: form.password,
          restaurant_name: form.restaurant,
          city: form.city,
          restaurant_type: form.type,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        login(data.token, data.user);
        setDone(true);
        setTimeout(() => router.push("/dashboard"), 3000);
      } else {
        setError(data.error || "Registration failed. Please try again.");
        setStep(1);
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

        {/* ── LEFT: Animated visual panel ── */}
        <div style={{
          width: "42%", flexShrink: 0, position: "relative", overflow: "hidden",
          background: "linear-gradient(150deg, #1A1208 0%, #2D1A08 60%, #1A0E04 100%)",
          opacity: mounted ? 1 : 0, transform: mounted ? "none" : "translateX(-24px)",
          transition: "all 0.75s cubic-bezier(0.22,1,0.36,1) 0.05s",
        }}>
          <AnimatedOrbs variant="dark" />
          <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px)", backgroundSize: "32px 32px" }} />

          <div style={{ position: "absolute", top: 44, left: 44, right: 44, zIndex: 4 }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 7, background: "rgba(232,87,42,0.2)", borderRadius: 100, padding: "5px 13px", marginBottom: 14 }}>
              <Icon d={IC.spark} size={12} color="#FFB891" />
              <span style={{ fontSize: 11, fontWeight: 700, color: "#FFB891", letterSpacing: "0.07em", textTransform: "uppercase" }}>Join 500+ Restaurants</span>
            </div>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: 32, fontWeight: 700, color: "white", lineHeight: 1.2, maxWidth: 280 }}>
              Go live in{" "}
              <em style={{ background: "linear-gradient(135deg, #FF7A4D, #FFD27A)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>under 10 minutes</em>
            </h2>
          </div>

          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", padding: "100px 32px 80px" }}>
            <RegisterVisual animate={mounted} />
          </div>
          <TestimonialTicker />
        </div>

        {/* ── RIGHT: Form panel ── */}
        <div style={{
          flex: 1, display: "flex", flexDirection: "column", padding: "40px 60px",
          opacity: mounted ? 1 : 0, transform: mounted ? "none" : "translateX(24px)",
          transition: "all 0.7s cubic-bezier(0.22,1,0.36,1) 0.1s", overflowY: "auto",
        }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <Logo onClick={() => router.push("/")} />
            <button onClick={() => router.push("/login")} style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", cursor: "pointer", fontSize: 13, color: "var(--text-secondary)", fontFamily: "var(--font-body)" }}>
              <Icon d={IC.arrowLeft} size={15} color="var(--text-muted)" /> Back to login
            </button>
          </div>

          <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", maxWidth: 440, margin: "0 auto", width: "100%", paddingTop: 24 }}>

            {/* Step indicator */}
            <div style={{ marginBottom: 28 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                {[1, 2].map(s => (
                  <div key={s} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{
                      width: 28, height: 28, borderRadius: "50%",
                      background: step >= s ? "linear-gradient(135deg, var(--primary), var(--gold))" : "rgba(0,0,0,0.07)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 12, fontWeight: 700, color: step >= s ? "white" : "var(--text-muted)",
                      transition: "all 0.4s ease", boxShadow: step === s ? "0 4px 12px rgba(232,87,42,0.3)" : "none",
                    }}>
                      {step > s ? <Icon d={IC.check} size={13} color="white" sw={2.5} /> : s}
                    </div>
                    <span style={{ fontSize: 12, fontWeight: step === s ? 600 : 400, color: step === s ? "var(--text-primary)" : "var(--text-muted)", transition: "all 0.3s" }}>
                      {s === 1 ? "Account" : "Restaurant"}
                    </span>
                    {s < 2 && <div style={{ width: 40, height: 1.5, background: step > s ? "var(--primary)" : "var(--border)", borderRadius: 1, marginLeft: 4, transition: "background 0.4s" }} />}
                  </div>
                ))}
                <span style={{ marginLeft: "auto", fontSize: 11, fontWeight: 600, color: "var(--primary)", background: "rgba(232,87,42,0.08)", padding: "3px 10px", borderRadius: 20 }}>{progress}%</span>
              </div>
              <div style={{ height: 3, background: "rgba(0,0,0,0.07)", borderRadius: 2, overflow: "hidden" }}>
                <div style={{ height: "100%", borderRadius: 2, background: "linear-gradient(90deg, var(--primary), var(--gold))", width: `${progress}%`, transition: "width 0.5s cubic-bezier(0.34,1.56,0.64,1)" }} />
              </div>
            </div>

            {/* Heading */}
            <div style={{ marginBottom: 28 }}>
              <h1 style={{ fontFamily: "var(--font-display)", fontSize: 36, fontWeight: 700, color: "var(--text-primary)", lineHeight: 1.1, marginBottom: 8 }}>
                {step === 1
                  ? <>Create your <span style={{ background: "linear-gradient(135deg, #E8572A, #F5A623)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", fontStyle: "italic" }}>free account</span></>
                  : <>Tell us about your <span style={{ background: "linear-gradient(135deg, #E8572A, #F5A623)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", fontStyle: "italic" }}>Restaurant</span></>
                }
              </h1>
              <p style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.55 }}>
                {step === 1 ? "No credit card required. Start for free." : "Just a few details and you\u2019re live in minutes."}
              </p>
            </div>

            {error && (
              <div style={{ padding: "10px 14px", borderRadius: 11, background: "rgba(232,87,42,0.06)", border: "1px solid rgba(232,87,42,0.15)", marginBottom: 16 }}>
                <p style={{ fontSize: 13, color: "var(--primary)", fontWeight: 500 }}>{error}</p>
              </div>
            )}

            {done ? (
              <div style={{ textAlign: "center", padding: "36px 20px", animation: "dashCard 0.5s ease" }}>
                <div style={{ fontSize: 56, marginBottom: 16 }}>\uD83C\uDF89</div>
                <h3 style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 700, color: "var(--text-primary)", marginBottom: 10 }}>You&apos;re all set!</h3>
                <p style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.6, marginBottom: 24, maxWidth: 320, margin: "0 auto 24px" }}>
                  Welcome to TaybleTap. Your dashboard is being set up.
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: 10, maxWidth: 280, margin: "0 auto" }}>
                  {["Dashboard created", "QR codes generated", "AI menu assistant ready"].map((t, i) => (
                    <div key={t} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", borderRadius: 11, background: "rgba(45,158,107,0.07)", border: "1px solid rgba(45,158,107,0.15)", animation: `stepIn 0.4s ${i * 0.15}s both` }}>
                      <Icon d={IC.check} size={15} color="#2D9E6B" sw={2.5} />
                      <span style={{ fontSize: 13, fontWeight: 500, color: "var(--text-primary)" }}>{t}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <form onSubmit={handleNext} style={{ animation: `panelSlide${step === 2 ? "Right" : "Left"} 0.4s ease` }}>
                {step === 1 && (
                  <>
                    <SocialButtons label="Sign up with" />
                    <Field label="Full name" icon={IC.user} placeholder="Your name" value={form.name} onChange={set("name")} />
                    <Field label="Email address" type="email" icon={IC.mail} placeholder="you@restaurant.com" value={form.email} onChange={set("email")} />
                    <Field label="Phone number" type="tel" icon={IC.phone} placeholder="+91 98765 43210" value={form.phone} onChange={set("phone")} />
                    <Field label="Password" type="password" icon={IC.lock} placeholder="Create a strong password" value={form.password} onChange={set("password")} extra={<PasswordStrength pw={form.password} />} />
                  </>
                )}

                {step === 2 && (
                  <>
                    <Field label="Restaurant name" icon={IC.building} placeholder="e.g. Spice Garden" value={form.restaurant} onChange={set("restaurant")} />
                    <Field label="City" icon={IC.map} placeholder="e.g. Bengaluru" value={form.city} onChange={set("city")} />
                    <div style={{ marginBottom: 18 }}>
                      <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 7 }}>Restaurant type</label>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                        {restaurantTypes.map(t => (
                          <button key={t} type="button" onClick={() => set("type")(t)}
                            style={{
                              padding: "8px 14px", borderRadius: 100,
                              background: form.type === t ? "var(--primary)" : "white",
                              border: `1.5px solid ${form.type === t ? "var(--primary)" : "var(--border)"}`,
                              color: form.type === t ? "white" : "var(--text-secondary)",
                              fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "var(--font-body)",
                              transition: "all 0.2s", boxShadow: form.type === t ? "0 4px 12px rgba(232,87,42,0.25)" : "none",
                            }}>{t}</button>
                        ))}
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 22, padding: "12px 14px", borderRadius: 11, background: "rgba(232,87,42,0.04)", border: "1px solid rgba(232,87,42,0.12)" }}>
                      <input type="checkbox" defaultChecked style={{ marginTop: 2, accentColor: "var(--primary)", cursor: "pointer" }} />
                      <span style={{ fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.55 }}>
                        I agree to TaybleTap&apos;s{" "}<a className="tt-link" style={{ fontSize: 12 }}>Terms of Service</a> and{" "}<a className="tt-link" style={{ fontSize: 12 }}>Privacy Policy</a>
                      </span>
                    </div>
                  </>
                )}

                <button ref={btnRef} type="submit" className="tt-btn-primary" disabled={loading}>
                  {loading ? (
                    <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
                        <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"
                          style={{ animation: "spin-slow 0.8s linear infinite", transformOrigin: "12px 12px" }} />
                      </svg>
                      Setting up your restaurant...
                    </span>
                  ) : (
                    <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                      {step === 1 ? "Continue" : "Create Restaurant Account"} <Icon d={IC.arrow} size={16} color="white" />
                    </span>
                  )}
                </button>

                {step === 2 && (
                  <button type="button" onClick={() => setStep(1)} style={{ width: "100%", marginTop: 10, padding: "12px", borderRadius: 14, border: "1.5px solid var(--border)", background: "white", fontFamily: "var(--font-body)", fontSize: 14, fontWeight: 500, color: "var(--text-secondary)", cursor: "pointer" }}>
                    \u2190 Back
                  </button>
                )}

                <p style={{ textAlign: "center", marginTop: 20, fontSize: 13, color: "var(--text-secondary)" }}>
                  Already have an account?{" "}
                  <span className="tt-link" onClick={() => router.push("/login")}>Login \u2192</span>
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

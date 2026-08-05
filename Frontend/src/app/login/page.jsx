"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import api from "@/lib/api";

function EyeIcon({ open }) {
  return open ? (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ) : (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M3 3l18 18" />
      <path d="M10.6 5.2A10.6 10.6 0 0 1 12 5c6.5 0 10 7 10 7a15.9 15.9 0 0 1-3.3 4.2M6.5 6.6C4 8.3 2 12 2 12s3.5 7 10 7c1.4 0 2.7-.3 3.8-.8" />
      <path d="M9.5 9.7A3 3 0 0 0 12 15a3 3 0 0 0 2.3-1.1" />
    </svg>
  );
}

function InvoiceMockup() {
  const [stamped, setStamped] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setStamped(true), 700);
    return () => clearTimeout(t);
  }, []);

  const lineItems = [
    { label: "Pro plan — monthly", amount: "49.00" },
    { label: "Add-on seats × 3", amount: "27.00" },
    { label: "Usage overage", amount: "6.40" },
  ];

  return (
    <div
      className="relative w-full max-w-xs rounded-2xl p-6"
      style={{ background: "#16224D", border: "1px solid rgba(255,255,255,0.08)" }}
    >
      <div className="flex items-center justify-between">
        <span className="text-[11px] uppercase tracking-wider" style={{ color: "#7C89B8" }}>
          Invoice #INV-0847
        </span>
        <span
          className="rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide transition-all duration-500"
          style={{
            background: stamped ? "rgba(18,183,106,0.15)" : "transparent",
            color: "#12B76A",
            opacity: stamped ? 1 : 0,
            transform: stamped ? "scale(1) rotate(-4deg)" : "scale(0.7) rotate(-4deg)",
          }}
        >
          Paid
        </span>
      </div>

      <div className="mt-5 space-y-3">
        {lineItems.map((item) => (
          <div key={item.label} className="flex items-center justify-between text-sm">
            <span style={{ color: "#B7C0E0" }}>{item.label}</span>
            <span className="font-display tabular-nums" style={{ color: "#EDF0F9" }}>
              ${item.amount}
            </span>
          </div>
        ))}
      </div>

      <div
        className="mt-4 flex items-center justify-between border-t pt-4"
        style={{ borderColor: "rgba(255,255,255,0.08)" }}
      >
        <span className="text-xs font-medium" style={{ color: "#7C89B8" }}>
          Total due
        </span>
        <span className="font-display text-xl font-semibold tabular-nums" style={{ color: "#F5A524" }}>
          $82.40
        </span>
      </div>
    </div>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await api.post("/auth/login", { email, password });
      const redirectTo = searchParams.get("redirect") || "/billing";
      router.push(redirectTo);
      router.refresh(); // middleware ko naya cookie state dekhne ke liye
    } catch (err) {
      setError(err.response?.data?.message || "Login fail ho gaya");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full flex-col lg:flex-row-reverse" style={{ background: "#FFFFFF" }}>
      <style jsx global>{`
        @import url("https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600&display=swap");
        .font-display {
          font-family: "Space Grotesk", sans-serif;
        }
        .font-body {
          font-family: "Inter", sans-serif;
        }
      `}</style>

      {/* Brand panel */}
      <div
        className="relative flex w-full flex-col justify-between overflow-hidden px-8 py-8 lg:w-[46%] lg:px-14 lg:py-14"
        style={{ background: "#101B3D", color: "#FFFFFF" }}
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />

        <div className="relative z-10 flex items-center gap-2">
          <span
            className="flex h-8 w-8 items-center justify-center rounded-full font-display text-sm font-semibold"
            style={{ background: "#F5A524", color: "#101B3D" }}
          >
            B
          </span>
          <span className="font-display text-lg font-semibold tracking-tight">Billing</span>
        </div>

        <div className="relative z-10 hidden lg:block">
          <h1 className="font-display text-3xl font-medium leading-tight" style={{ color: "#FFFFFF" }}>
            Billing that closes
            <br />
            itself out.
          </h1>
          <p className="font-body mt-3 max-w-xs text-sm leading-relaxed" style={{ color: "#B7C0E0" }}>
            Log in to see what's outstanding, what's cleared, and what needs a nudge —
            all in one place.
          </p>
        </div>

        <div className="relative z-10 mt-8 flex justify-center lg:mt-0 lg:justify-start">
          <InvoiceMockup />
        </div>
      </div>

      {/* Form panel */}
      <div className="flex flex-1 items-center justify-center px-6 py-12 sm:px-10">
        <form
          onSubmit={handleSubmit}
          className="font-body w-full max-w-sm rounded-2xl border p-8 shadow-sm"
          style={{ borderColor: "#E4E7EC", background: "#FFFFFF" }}
        >
          <h2 className="font-display text-2xl font-semibold" style={{ color: "#101828" }}>
            Log in
          </h2>
          <p className="mt-1 text-sm" style={{ color: "#667085" }}>
            Access your billing dashboard.
          </p>

          {error && (
            <p className="mt-4 rounded-lg px-3 py-2 text-sm" style={{ background: "#FEF3F2", color: "#B42318" }}>
              {error}
            </p>
          )}

          <label className="mt-6 block text-xs font-medium" style={{ color: "#101828" }}>
            Email
          </label>
          <input
            type="email"
            placeholder="you@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            suppressHydrationWarning
            className="mt-1.5 w-full rounded-lg border px-3 py-2.5 text-sm outline-none transition focus:ring-[3px]"
            style={{ borderColor: "#E4E7EC", color: "#101828", "--tw-ring-color": "rgba(16,27,61,0.12)" }}
          />

          <label className="mt-4 block text-xs font-medium" style={{ color: "#101828" }}>
            Password
          </label>
          <div className="relative mt-1.5">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              suppressHydrationWarning
              className="w-full rounded-lg border px-3 py-2.5 pr-10 text-sm outline-none transition focus:ring-[3px]"
              style={{ borderColor: "#E4E7EC", color: "#101828", "--tw-ring-color": "rgba(16,27,61,0.12)" }}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2"
              style={{ color: "#667085" }}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              <EyeIcon open={showPassword} />
            </button>
          </div>

          <div className="mt-3 flex justify-end">
            <Link href="/forgot-password" className="text-xs font-medium hover:underline" style={{ color: "#101B3D" }}>
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-6 w-full rounded-lg py-2.5 text-sm font-semibold transition disabled:opacity-50"
            style={{ background: "#101B3D", color: "#FFFFFF" }}
          >
            {loading ? "Logging in..." : "Log in"}
          </button>

          <p className="mt-6 text-center text-sm" style={{ color: "#667085" }}>
            New here?{" "}
            <Link href="/register" className="font-medium hover:underline" style={{ color: "#101B3D" }}>
              Create an account
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
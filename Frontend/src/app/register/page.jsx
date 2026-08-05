"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/lib/api";

function CheckItem({ label, done }) {
  return (
    <div className="flex items-center gap-3">
      <span
        className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full transition-all duration-300"
        style={{
          background: done ? "#12B76A" : "transparent",
          border: done ? "1px solid #12B76A" : "1px solid rgba(255,255,255,0.25)",
        }}
      >
        <svg
          width="11"
          height="11"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#101B3D"
          strokeWidth="3"
          style={{
            opacity: done ? 1 : 0,
            transform: done ? "scale(1)" : "scale(0.5)",
            transition: "all 0.25s ease",
          }}
        >
          <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
      <span
        className="font-body text-sm transition-colors duration-300"
        style={{ color: done ? "#EDF0F9" : "#7C89B8" }}
      >
        {label}
      </span>
    </div>
  );
}

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

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "cashier" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const setRole = (role) => setForm({ ...form, role });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await api.post("/auth/register", form);
      router.push("/billing");
      router.refresh();
    } catch (err) {
      setError(err.response?.data?.message || "Register fail ho gaya");
    } finally {
      setLoading(false);
    }
  };

  const checklist = [
    { key: "name", label: "Full name added", done: form.name.trim().length > 0 },
    { key: "email", label: "Work email added", done: /\S+@\S+\.\S+/.test(form.email) },
    { key: "password", label: "Password set", done: form.password.length >= 6 },
    { key: "role", label: `Role: ${form.role === "admin" ? "Admin" : "Cashier"}`, done: true },
  ];
  const doneCount = checklist.filter((c) => c.done).length;

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
          <h1 className="font-display text-3xl font-medium leading-tight">
            Set up your
            <br />
            Billing in minutes.
          </h1>
          <p className="font-body mt-3 max-w-xs text-sm leading-relaxed" style={{ color: "#B7C0E0" }}>
            One account, every invoice — cashiers and admins see exactly what they need.
          </p>
        </div>

        {/* Signature element: live setup checklist */}
        <div
          className="relative z-10 mt-8 w-full max-w-xs rounded-2xl p-6 lg:mt-0"
          style={{ background: "#16224D", border: "1px solid rgba(255,255,255,0.08)" }}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase tracking-wider" style={{ color: "#7C89B8" }}>
              Account setup
            </span>
            <span className="font-display text-xs font-semibold tabular-nums" style={{ color: "#F5A524" }}>
              {doneCount}/4
            </span>
          </div>
          <div className="mt-4 space-y-3.5">
            {checklist.map((item) => (
              <CheckItem key={item.key} label={item.label} done={item.done} />
            ))}
          </div>
          <div
            className="mt-5 h-1.5 w-full overflow-hidden rounded-full"
            style={{ background: "rgba(255,255,255,0.08)" }}
          >
            <div
              className="h-full rounded-full transition-all duration-500 ease-out"
              style={{ width: `${(doneCount / 4) * 100}%`, background: "#12B76A" }}
            />
          </div>
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
            Create account
          </h2>
          <p className="mt-1 text-sm" style={{ color: "#667085" }}>
            Set up access to your billing dashboard.
          </p>

          {error && (
            <p className="mt-4 rounded-lg px-3 py-2 text-sm" style={{ background: "#FEF3F2", color: "#B42318" }}>
              {error}
            </p>
          )}

          <label className="mt-6 block text-xs font-medium" style={{ color: "#101828" }}>
            Full name
          </label>
          <input
            name="name"
            placeholder="Jordan Blake"
            value={form.name}
            onChange={handleChange}
            required
            className="mt-1.5 w-full rounded-lg border px-3 py-2.5 text-sm outline-none transition"
            style={{ borderColor: "#E4E7EC", color: "#101828" }}
            onFocus={(e) => (e.target.style.boxShadow = "0 0 0 3px rgba(16,27,61,0.12)")}
            onBlur={(e) => (e.target.style.boxShadow = "none")}
          />

          <label className="mt-4 block text-xs font-medium" style={{ color: "#101828" }}>
            Email
          </label>
          <input
            name="email"
            type="email"
            placeholder="you@company.com"
            value={form.email}
            onChange={handleChange}
            required
            className="mt-1.5 w-full rounded-lg border px-3 py-2.5 text-sm outline-none transition"
            style={{ borderColor: "#E4E7EC", color: "#101828" }}
            onFocus={(e) => (e.target.style.boxShadow = "0 0 0 3px rgba(16,27,61,0.12)")}
            onBlur={(e) => (e.target.style.boxShadow = "none")}
          />

          <label className="mt-4 block text-xs font-medium" style={{ color: "#101828" }}>
            Password
          </label>
          <div className="relative mt-1.5">
            <input
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              value={form.password}
              onChange={handleChange}
              required
              className="w-full rounded-lg border px-3 py-2.5 pr-10 text-sm outline-none transition"
              style={{ borderColor: "#E4E7EC", color: "#101828" }}
              onFocus={(e) => (e.target.style.boxShadow = "0 0 0 3px rgba(16,27,61,0.12)")}
              onBlur={(e) => (e.target.style.boxShadow = "none")}
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

          <label className="mt-4 block text-xs font-medium" style={{ color: "#101828" }}>
            Role
          </label>
          <div className="mt-1.5 grid grid-cols-2 gap-2">
            {[
              { value: "cashier", label: "Cashier" },
              { value: "admin", label: "Admin" },
            ].map((opt) => {
              const active = form.role === opt.value;
              return (
                <button
                  type="button"
                  key={opt.value}
                  onClick={() => setRole(opt.value)}
                  className="rounded-lg border py-2.5 text-sm font-medium transition-all"
                  style={{
                    borderColor: active ? "#101B3D" : "#E4E7EC",
                    background: active ? "#101B3D" : "#FFFFFF",
                    color: active ? "#FFFFFF" : "#667085",
                  }}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-6 w-full rounded-lg py-2.5 text-sm font-semibold transition disabled:opacity-50"
            style={{ background: "#101B3D", color: "#FFFFFF" }}
          >
            {loading ? "Creating..." : "Create account"}
          </button>

          <p className="mt-6 text-center text-sm" style={{ color: "#667085" }}>
            Already have an account?{" "}
            <Link href="/login" className="font-medium hover:underline" style={{ color: "#101B3D" }}>
              Log in
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
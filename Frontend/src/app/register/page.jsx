"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/lib/api";
import { toast } from "react-toastify";

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

function CheckIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

function SuccessScreen() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center px-6" style={{ background: "#FFFFFF" }}>
      <div className="flex w-full max-w-sm flex-col items-center rounded-2xl border p-10 text-center shadow-sm" style={{ borderColor: "#E4E7EC" }}>
        <div
          className="flex h-16 w-16 items-center justify-center rounded-full"
          style={{
            background: "rgba(18,183,106,0.12)",
            color: "#12B76A",
            animation: "regSuccessPop 0.4s ease-out",
          }}
        >
          <CheckIcon />
        </div>

        <h2 className="font-display mt-5 text-xl font-semibold" style={{ color: "#101828" }}>
          Account created!
        </h2>

        <p className="mt-2 text-sm" style={{ color: "#667085" }}>
          Taking you to the login page...
        </p>

        <div className="mt-6 h-1 w-full overflow-hidden rounded-full" style={{ background: "#E4E7EC" }}>
          <div
            className="h-full rounded-full"
            style={{
              background: "#101B3D",
              animation: "regSuccessBar 1.6s linear forwards",
            }}
          />
        </div>

        <style jsx>{`
          @keyframes regSuccessPop {
            0% {
              transform: scale(0.6);
              opacity: 0;
            }
            100% {
              transform: scale(1);
              opacity: 1;
            }
          }
          @keyframes regSuccessBar {
            0% {
              width: 0%;
            }
            100% {
              width: 100%;
            }
          }
        `}</style>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Please enter your name.");
      return;
    }

    if (!email.trim()) {
      setError("Please enter your email.");
      return;
    }

    if (!password) {
      setError("Please enter a password.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      await api.post("/auth/register", {
        name: name.trim(),
        email: email.trim(),
        password,
      });

      toast.success("Account created successfully!");
      setSuccess(true);

      // thoda delay taaki success screen dikh jaye, phir login pe bhejo
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        "Registration failed. Please try again.";

      setError(message);
      toast.error(message);
      setLoading(false);
    }
  };

  if (success) {
    return <SuccessScreen />;
  }

  return (
    <div className="flex min-h-screen w-full flex-col lg:flex-row-reverse" style={{ background: "#FFFFFF" }}>
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
            Set up billing
            <br />
            in minutes.
          </h1>
          <p className="font-body mt-3 max-w-xs text-sm leading-relaxed" style={{ color: "#B7C0E0" }}>
            Create an account to start tracking invoices, customers, and
            payments — all in one place.
          </p>
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
            Create an account
          </h2>
          <p className="mt-1 text-sm" style={{ color: "#667085" }}>
            Get started with your billing dashboard.
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
            type="text"
            placeholder="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            suppressHydrationWarning
            className="mt-1.5 w-full rounded-lg border px-3 py-2.5 text-sm outline-none transition focus:ring-[3px]"
            style={{ borderColor: "#E4E7EC", color: "#101828", "--tw-ring-color": "rgba(16,27,61,0.12)" }}
          />

          <label className="mt-4 block text-xs font-medium" style={{ color: "#101828" }}>
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
              placeholder="At least 6 characters"
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

          <label className="mt-4 block text-xs font-medium" style={{ color: "#101828" }}>
            Confirm password
          </label>
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Re-enter password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            suppressHydrationWarning
            className="mt-1.5 w-full rounded-lg border px-3 py-2.5 text-sm outline-none transition focus:ring-[3px]"
            style={{ borderColor: "#E4E7EC", color: "#101828", "--tw-ring-color": "rgba(16,27,61,0.12)" }}
          />

          <button
            type="submit"
            disabled={loading}
            className="mt-6 w-full rounded-lg py-2.5 text-sm font-semibold transition disabled:opacity-50"
            style={{ background: "#101B3D", color: "#FFFFFF" }}
          >
            {loading ? "Creating account..." : "Create account"}
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
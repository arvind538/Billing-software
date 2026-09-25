"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import api from "@/lib/api";
import { toast } from "react-toastify";

function EyeIcon({ open }) {
  return open ? (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ) : (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path d="M3 3l18 18" />
      <path d="M10.6 5.2A10.6 10.6 0 0 1 12 5c6.5 0 10 7 10 7a15.9 15.9 0 0 1-3.3 4.2M6.5 6.6C4 8.3 2 12 2 12s3.5 7 10 7c1.4 0 2.7-.3 3.8-.8" />
      <path d="M9.5 9.7A3 3 0 0 0 12 15a3 3 0 0 0 2.3-1.1" />
    </svg>
  );
}

function LoginForm() {
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
      const response = await api.post("/auth/login", {
        email: email.trim().toLowerCase(),
        password: password,
      });

      const token =
        response.data?.token ||
        response.data?.accessToken ||
        response.data?.jwt;

      if (token) {
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(response.data));

        document.cookie = `token=${token}; path=/; max-age=604800; SameSite=Lax`;

        const redirectParam = searchParams.get("redirect");
        const safeDestination =
          redirectParam &&
            !redirectParam.includes(".well-known") &&
            !redirectParam.includes("com.chrome.devtools")
            ? redirectParam
            : "/billing";

        window.location.replace(safeDestination);
      } else {
        setError("Login successful but no authentication token received from server.");
      }
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Invalid email or password.";
      setError(message);
      toast?.error?.(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="flex min-h-screen w-full items-center justify-center px-4 py-12"
      style={{ background: "#F8FAFC" }}
    >
      <div className="w-full max-w-md">
        {/* Simple Brand Header */}
        <div className="mb-8 flex items-center justify-center gap-2">
          <span
            className="flex h-10 w-10 items-center justify-center rounded-xl font-display text-base font-bold shadow-sm"
            style={{
              background: "#F5A524",
              color: "#101B3D",
            }}
          >
            B
          </span>
          <span className="font-display text-2xl font-bold tracking-tight text-[#101B3D]">
            Billing
          </span>
        </div>

        {/* Form Card */}
        <form
          onSubmit={handleSubmit}
          className="font-body w-full rounded-2xl border p-8 shadow-sm"
          style={{
            borderColor: "#E4E7EC",
            background: "#FFFFFF",
          }}
        >
          <h2
            className="font-display text-2xl font-semibold"
            style={{ color: "#101828" }}
          >
            Log in
          </h2>

          <p className="mt-1 text-sm" style={{ color: "#667085" }}>
            Access your billing dashboard.
          </p>

          {error && (
            <p
              className="mt-4 rounded-lg px-3 py-2 text-sm"
              style={{
                background: "#FEF3F2",
                color: "#B42318",
              }}
            >
              {error}
            </p>
          )}

          <label
            className="mt-6 block text-xs font-medium"
            style={{ color: "#101828" }}
          >
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
            style={{
              borderColor: "#E4E7EC",
              color: "#101828",
              "--tw-ring-color": "rgba(16,27,61,0.12)",
            }}
          />

          <label
            className="mt-4 block text-xs font-medium"
            style={{ color: "#101828" }}
          >
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
              style={{
                borderColor: "#E4E7EC",
                color: "#101828",
                "--tw-ring-color": "rgba(16,27,61,0.12)",
              }}
            />

            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2"
              style={{ color: "#667085" }}
              aria-label={
                showPassword ? "Hide password" : "Show password"
              }
            >
              <EyeIcon open={showPassword} />
            </button>
          </div>

          <div className="mt-3 flex justify-end">
            <Link
              href="/forgot-password"
              className="text-xs font-medium hover:underline"
              style={{ color: "#101B3D" }}
            >
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-6 w-full rounded-lg py-2.5 text-sm font-semibold transition disabled:opacity-50"
            style={{
              background: "#101B3D",
              color: "#FFFFFF",
            }}
          >
            {loading ? "Logging in..." : "Log in"}
          </button>

          <p
            className="mt-6 text-center text-sm"
            style={{ color: "#667085" }}
          >
            New here?{" "}
            <Link
              href="/register"
              className="font-medium hover:underline"
              style={{ color: "#101B3D" }}
            >
              Create an account
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          Loading...
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
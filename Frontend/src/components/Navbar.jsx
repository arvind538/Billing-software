"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import api from "@/lib/api";
import { getActiveCustomer, subscribeActiveCustomer } from "@/lib/activeCustomer";

const navLinks = [
  {
    href: "/billing",
    label: "Billing",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="h-[18px] w-[18px]">
        <path d="M6 2h9l4 4v16H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2Z" strokeWidth="1.8" />
        <path d="M14 2v5h5" strokeWidth="1.8" />
        <path d="M8 12h8M8 16h6" strokeWidth="1.8" />
      </svg>
    ),
  },
  {
    href: "/products",
    label: "Products",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="h-[18px] w-[18px]">
        <path d="m21 8-9-5-9 5 9 5 9-5Z" strokeWidth="1.8" />
        <path d="m3 8 9 5 9-5M3 13l9 5 9-5" strokeWidth="1.8" />
      </svg>
    ),
  },
  {
    href: "/customers",
    label: "Customers",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="h-[18px] w-[18px]">
        <circle cx="9" cy="8" r="3" strokeWidth="1.8" />
        <path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6" strokeWidth="1.8" />
        <path d="M16 5.5a3 3 0 0 1 0 5.8M18 14c1.8.8 3 2.7 3 6" strokeWidth="1.8" />
      </svg>
    ),
  },
  {
    href: "/invoices",
    label: "Invoices",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="h-[18px] w-[18px]">
        <path d="M5 3h14v18l-3-2-4 2-4-2-3 2V3Z" strokeWidth="1.8" />
        <path d="M8 8h8M8 12h8M8 16h5" strokeWidth="1.8" />
      </svg>
    ),
  },
];

function getInitials(name = "") {
  return (
    name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "U"
  );
}

function LogoutIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" strokeLinecap="round" />
      <path d="m16 17 5-5-5-5M21 12H9" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CustomerIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="8" r="3.2" />
      <path d="M5 20c0-3.6 3.1-6.4 7-6.4s7 2.8 7 6.4" strokeLinecap="round" />
    </svg>
  );
}

// =============================================
// PROFILE DROPDOWN (desktop + mobile dono use karte hain)
// =============================================

function ProfileMenu({ user, activeCustomer, onLogout, align = "right" }) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  if (!user) return null;

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center gap-2.5 rounded-xl px-2 py-1.5 transition-all duration-200 hover:bg-slate-50"
        aria-haspopup="true"
        aria-expanded={open}
      >
        <div className="relative shrink-0">
          <div
            className="flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold"
            style={{
              background: "linear-gradient(135deg, #101B3D 0%, #253761 100%)",
              color: "#F5A524",
            }}
          >
            {getInitials(user.name)}
          </div>

          {/* Active customer indicator dot */}
          {activeCustomer && (
            <span
              className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white"
              style={{ background: "#12B76A" }}
              title={`Active customer: ${activeCustomer.name}`}
            />
          )}
        </div>

        <div className="hidden text-left lg:block">
          <div className="max-w-[130px] truncate text-sm font-semibold" style={{ color: "#101828" }}>
            {user.name}
          </div>
          <div className="text-[11px]" style={{ color: "#98A2B3" }}>
            {user.role || "User"}
          </div>
        </div>

        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="hidden shrink-0 transition-transform duration-200 lg:block"
          style={{ color: "#98A2B3", transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
        >
          <path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <div
          className={`absolute top-[calc(100%+8px)] z-50 w-72 overflow-hidden rounded-2xl border bg-white shadow-xl ${align === "right" ? "right-0" : "left-0"
            }`}
          style={{ borderColor: "#EAECF0" }}
        >
          {/* User info header */}
          <div className="flex items-center gap-3 border-b p-4" style={{ borderColor: "#EAECF0" }}>
            <div
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-bold"
              style={{
                background: "linear-gradient(135deg, #101B3D 0%, #253761 100%)",
                color: "#F5A524",
              }}
            >
              {getInitials(user.name)}
            </div>

            <div className="min-w-0">
              <div className="truncate text-sm font-semibold" style={{ color: "#101828" }}>
                {user.name}
              </div>
              <div className="truncate text-xs" style={{ color: "#98A2B3" }}>
                {user.email || user.role || "User"}
              </div>
            </div>
          </div>

          {/* Selected customer section — sirf tab dikhega jab billing page pe koi customer select ho */}
          {activeCustomer && (
            <div className="border-b p-4" style={{ borderColor: "#EAECF0" }}>
              <div
                className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide"
                style={{ color: "#98A2B3" }}
              >
                <CustomerIcon />
                Selected Customer
              </div>

              <div className="text-sm font-semibold" style={{ color: "#101828" }}>
                {activeCustomer.name || "Walk-in Customer"}
              </div>

              <div className="mt-0.5 text-xs" style={{ color: "#667085" }}>
                {activeCustomer.phone || "No phone on file"}
              </div>

              {activeCustomer.email && (
                <div className="mt-0.5 truncate text-xs" style={{ color: "#667085" }}>
                  {activeCustomer.email}
                </div>
              )}
            </div>
          )}

          {/* Menu items */}
          <div className="p-1.5">
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                onLogout();
              }}
              className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors duration-150 hover:bg-red-50"
              style={{ color: "#D92D20" }}
            >
              <LogoutIcon />
              Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();

  const [user, setUser] = useState(null);
  const [activeCustomer, setActiveCustomerState] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const hideNavbar = pathname === "/login" || pathname === "/register";

  useEffect(() => {
    if (hideNavbar) return;

    let mounted = true;

    api
      .get("/auth/me")
      .then((res) => {
        if (mounted) setUser(res.data);
      })
      .catch((error) => {
        console.error("User fetch error:", error.response?.data || error.message);
        if (mounted) setUser(null);
      });

    return () => {
      mounted = false;
    };
  }, [hideNavbar]);

  // Billing page pe jo customer select hota hai, usko yahan live sync karo
  useEffect(() => {
    if (hideNavbar) return;

    setActiveCustomerState(getActiveCustomer());

    const unsubscribe = subscribeActiveCustomer((customer) => {
      setActiveCustomerState(customer);
    });

    return unsubscribe;
  }, [hideNavbar]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 5);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const handleLogout = async () => {
    try {
      await api.post("/auth/logout");
    } catch (error) {
      console.error("Logout error:", error.response?.data || error.message);
    } finally {
      setUser(null);
      router.push("/login");
      router.refresh();
    }
  };

  if (hideNavbar) {
    return null;
  }

  return (
    <nav
      className="sticky top-0 z-50 border-b bg-white transition-all duration-300"
      style={{
        borderColor: "#EAECF0",
        boxShadow: scrolled ? "0 8px 30px rgba(16,24,40,0.07)" : "0 1px 0 rgba(16,24,40,0.02)",
      }}
    >
      <div className="mx-auto flex h-[72px] max-w-screen-2xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* ================= LEFT SIDE ================= */}
        <div className="flex items-center gap-8">
          <Link href="/billing" className="group flex items-center gap-3">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-300 group-hover:scale-105 group-hover:shadow-lg"
              style={{ background: "linear-gradient(135deg, #101B3D 0%, #253761 100%)" }}
            >
              <span className="text-lg font-extrabold" style={{ color: "#F5A524" }}>
                B
              </span>
            </div>

            <div className="hidden sm:block">
              <div className="text-[17px] font-bold tracking-tight" style={{ color: "#101828" }}>
                Billing
                <span style={{ color: "#F5A524" }}>Software</span>
              </div>
              <div className="mt-0.5 text-[9px] font-semibold tracking-[0.12em]" style={{ color: "#98A2B3" }}>
                BUSINESS MANAGEMENT
              </div>
            </div>
          </Link>

          <div className="hidden items-center gap-1 md:flex">
            {navLinks.map((link) => {
              const active = pathname === link.href || pathname.startsWith(link.href + "/");

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className="group relative flex items-center gap-2 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all duration-200"
                  style={{
                    color: active ? "#101B3D" : "#667085",
                    background: active ? "#F5F6FA" : "transparent",
                  }}
                >
                  <span
                    className="transition-transform duration-200 group-hover:scale-110"
                    style={{ color: active ? "#F5A524" : "#98A2B3" }}
                  >
                    {link.icon}
                  </span>

                  <span>{link.label}</span>

                  {active && (
                    <span
                      className="absolute bottom-0 left-3 right-3 h-[2px] rounded-full"
                      style={{ background: "#F5A524" }}
                    />
                  )}
                </Link>
              );
            })}
          </div>
        </div>

        {/* ================= RIGHT SIDE ================= */}
        <div className="flex items-center gap-2">
          {/* Notification */}
          <button
            type="button"
            className="relative hidden h-10 w-10 items-center justify-center rounded-xl transition-all duration-200 hover:bg-slate-50 sm:flex"
            style={{ color: "#667085" }}
            aria-label="Notifications"
          >
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M10 21h4" strokeLinecap="round" />
            </svg>
            <span
              className="absolute right-2.5 top-2 h-2 w-2 rounded-full border-2 border-white"
              style={{ background: "#F5A524" }}
            />
          </button>

          <div className="hidden h-8 w-px bg-slate-200 sm:block" />

          {/* Profile dropdown — desktop + mobile dono, ek hi component */}
          <ProfileMenu user={user} activeCustomer={activeCustomer} onLogout={handleLogout} align="right" />

          {/* Hamburger — sirf nav links ke liye */}
          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            className="flex h-10 w-10 items-center justify-center rounded-xl transition hover:bg-slate-50 md:hidden"
            style={{ color: "#101828" }}
            aria-label="Toggle menu"
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 6l12 12M18 6 6 18" strokeLinecap="round" />
              </svg>
            ) : (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* ================= MOBILE NAV LINKS ================= */}
      {mobileOpen && (
        <div className="border-t bg-white px-4 py-4 md:hidden">
          <div className="space-y-1">
            {navLinks.map((link) => {
              const active = pathname === link.href || pathname.startsWith(link.href + "/");

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-all duration-200"
                  style={{
                    background: active ? "#F5F6FA" : "transparent",
                    color: active ? "#101B3D" : "#667085",
                  }}
                >
                  <span style={{ color: active ? "#F5A524" : "#98A2B3" }}>{link.icon}</span>
                  <span>{link.label}</span>

                  {active && (
                    <span className="ml-auto h-2 w-2 rounded-full" style={{ background: "#F5A524" }} />
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </nav>
  );
}
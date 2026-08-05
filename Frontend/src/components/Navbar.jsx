"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import api from "@/lib/api";

const navLinks = [
  {
    href: "/billing",
    label: "Billing",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        className="h-[18px] w-[18px]"
      >
        <path
          d="M6 2h9l4 4v16H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2Z"
          strokeWidth="1.8"
        />
        <path d="M14 2v5h5" strokeWidth="1.8" />
        <path d="M8 12h8M8 16h6" strokeWidth="1.8" />
      </svg>
    ),
  },

  {
    href: "/products",
    label: "Products",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        className="h-[18px] w-[18px]"
      >
        <path
          d="m21 8-9-5-9 5 9 5 9-5Z"
          strokeWidth="1.8"
        />
        <path
          d="m3 8 9 5 9-5M3 13l9 5 9-5"
          strokeWidth="1.8"
        />
      </svg>
    ),
  },

  {
    href: "/customers",
    label: "Customers",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        className="h-[18px] w-[18px]"
      >
        <circle cx="9" cy="8" r="3" strokeWidth="1.8" />

        <path
          d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6"
          strokeWidth="1.8"
        />

        <path
          d="M16 5.5a3 3 0 0 1 0 5.8M18 14c1.8.8 3 2.7 3 6"
          strokeWidth="1.8"
        />
      </svg>
    ),
  },

  {
    href: "/invoices",
    label: "Invoices",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        className="h-[18px] w-[18px]"
      >
        <path
          d="M5 3h14v18l-3-2-4 2-4-2-3 2V3Z"
          strokeWidth="1.8"
        />

        <path
          d="M8 8h8M8 12h8M8 16h5"
          strokeWidth="1.8"
        />
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

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();

  const [user, setUser] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const hideNavbar =
    pathname === "/login" ||
    pathname === "/register";

  // ==========================================
  // GET CURRENT USER
  // ==========================================

  useEffect(() => {
    if (hideNavbar) return;

    let mounted = true;

    api
      .get("/auth/me")
      .then((res) => {
        if (mounted) {
          setUser(res.data);
        }
      })
      .catch((error) => {
        console.error(
          "User fetch error:",
          error.response?.data || error.message
        );

        if (mounted) {
          setUser(null);
        }
      });

    return () => {
      mounted = false;
    };
  }, [hideNavbar]);

  // ==========================================
  // SCROLL EFFECT
  // ==========================================

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 5);
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // ==========================================
  // CLOSE MOBILE MENU ON PAGE CHANGE
  // ==========================================

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // ==========================================
  // LOGOUT
  // ==========================================

  const handleLogout = async () => {
    try {
      await api.post("/auth/logout");
    } catch (error) {
      console.error(
        "Logout error:",
        error.response?.data || error.message
      );
    } finally {
      setUser(null);
      router.push("/login");
      router.refresh();
    }
  };

  // Login/Register page par navbar hide
  if (hideNavbar) {
    return null;
  }

  return (
    <nav
      className="sticky top-0 z-50 border-b bg-white transition-all duration-300"
      style={{
        borderColor: "#EAECF0",
        boxShadow: scrolled
          ? "0 8px 30px rgba(16,24,40,0.07)"
          : "0 1px 0 rgba(16,24,40,0.02)",
      }}
    >
      {/* =====================================================
          DESKTOP / MAIN HEADER
      ====================================================== */}

      <div className="mx-auto flex h-[72px] max-w-screen-2xl items-center justify-between px-4 sm:px-6 lg:px-8">

        {/* ===================================================
            LEFT SIDE
        ==================================================== */}

        <div className="flex items-center gap-8">

          {/* ================= LOGO ================= */}

          <Link
            href="/billing"
            className="group flex items-center gap-3"
          >
            {/* Logo Icon */}

            <div
              className="flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-300 group-hover:scale-105 group-hover:shadow-lg"
              style={{
                background:
                  "linear-gradient(135deg, #101B3D 0%, #253761 100%)",
              }}
            >
              <span
                className="text-lg font-extrabold"
                style={{
                  color: "#F5A524",
                }}
              >
                B
              </span>
            </div>

            {/* Logo Text */}

            <div className="hidden sm:block">
              <div
                className="text-[17px] font-bold tracking-tight"
                style={{
                  color: "#101828",
                }}
              >
                Billing
                <span
                  style={{
                    color: "#F5A524",
                  }}
                >
                  Software
                </span>
              </div>

              <div
                className="mt-0.5 text-[9px] font-semibold tracking-[0.12em]"
                style={{
                  color: "#98A2B3",
                }}
              >
                BUSINESS MANAGEMENT
              </div>
            </div>
          </Link>

          {/* ================= DESKTOP NAV ================= */}

          <div className="hidden items-center gap-1 md:flex">
            {navLinks.map((link) => {
              const active =
                pathname === link.href ||
                pathname.startsWith(link.href + "/");

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className="group relative flex items-center gap-2 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all duration-200"
                  style={{
                    color: active
                      ? "#101B3D"
                      : "#667085",

                    background: active
                      ? "#F5F6FA"
                      : "transparent",
                  }}
                >
                  {/* ICON */}

                  <span
                    className="transition-transform duration-200 group-hover:scale-110"
                    style={{
                      color: active
                        ? "#F5A524"
                        : "#98A2B3",
                    }}
                  >
                    {link.icon}
                  </span>

                  {/* TEXT */}

                  <span>{link.label}</span>

                  {/* ACTIVE INDICATOR */}

                  {active && (
                    <span
                      className="absolute bottom-0 left-3 right-3 h-[2px] rounded-full"
                      style={{
                        background: "#F5A524",
                      }}
                    />
                  )}
                </Link>
              );
            })}
          </div>
        </div>

        {/* ===================================================
            RIGHT SIDE
        ==================================================== */}

        <div className="flex items-center gap-2">

          {/* ================= NOTIFICATION ================= */}

          <button
            type="button"
            className="relative hidden h-10 w-10 items-center justify-center rounded-xl transition-all duration-200 hover:bg-slate-50 sm:flex"
            style={{
              color: "#667085",
            }}
            aria-label="Notifications"
          >
            <svg
              width="19"
              height="19"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <path
                d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              <path
                d="M10 21h4"
                strokeLinecap="round"
              />
            </svg>

            {/* Notification Dot */}

            <span
              className="absolute right-2.5 top-2 h-2 w-2 rounded-full border-2 border-white"
              style={{
                background: "#F5A524",
              }}
            />
          </button>

          {/* ================= DIVIDER ================= */}

          <div className="hidden h-8 w-px bg-slate-200 sm:block" />

          {/* ================= USER ================= */}

          {user && (
            <div className="hidden items-center gap-2.5 rounded-xl px-2 py-1.5 sm:flex">

              {/* Avatar */}

              <div
                className="flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold"
                style={{
                  background:
                    "linear-gradient(135deg, #101B3D 0%, #253761 100%)",
                  color: "#F5A524",
                }}
              >
                {getInitials(user.name)}
              </div>

              {/* User Information */}

              <div className="hidden lg:block">
                <div
                  className="max-w-[130px] truncate text-sm font-semibold"
                  style={{
                    color: "#101828",
                  }}
                >
                  {user.name}
                </div>

                <div
                  className="text-[11px]"
                  style={{
                    color: "#98A2B3",
                  }}
                >
                  {user.role || "User"}
                </div>
              </div>
            </div>
          )}

          {/* ================= LOGOUT ================= */}

          <button
            type="button"
            onClick={handleLogout}
            className="hidden items-center gap-2 rounded-xl border px-3.5 py-2.5 text-sm font-semibold transition-all duration-200 hover:bg-slate-900 hover:text-white sm:flex"
            style={{
              borderColor: "#EAECF0",
              color: "#475467",
            }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <path
                d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"
                strokeLinecap="round"
              />

              <path
                d="m16 17 5-5-5-5M21 12H9"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>

            Logout
          </button>

          {/* ================= MOBILE MENU BUTTON ================= */}

          <button
            type="button"
            onClick={() =>
              setMobileOpen((prev) => !prev)
            }
            className="flex h-10 w-10 items-center justify-center rounded-xl transition hover:bg-slate-50 md:hidden"
            style={{
              color: "#101828",
            }}
            aria-label="Toggle menu"
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? (
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  d="M6 6l12 12M18 6 6 18"
                  strokeLinecap="round"
                />
              </svg>
            ) : (
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  d="M4 6h16M4 12h16M4 18h16"
                  strokeLinecap="round"
                />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* =====================================================
          MOBILE MENU
      ====================================================== */}

      {mobileOpen && (
        <div className="border-t bg-white px-4 py-4 md:hidden">

          {/* ================= MOBILE USER ================= */}

          {user && (
            <div className="mb-3 flex items-center gap-3 rounded-xl bg-slate-50 p-3">

              <div
                className="flex h-10 w-10 items-center justify-center rounded-full text-xs font-bold"
                style={{
                  background: "#101B3D",
                  color: "#F5A524",
                }}
              >
                {getInitials(user.name)}
              </div>

              <div>
                <div className="text-sm font-semibold text-slate-900">
                  {user.name}
                </div>

                <div className="text-xs text-slate-400">
                  {user.role || "User"}
                </div>
              </div>
            </div>
          )}

          {/* ================= MOBILE LINKS ================= */}

          <div className="space-y-1">
            {navLinks.map((link) => {
              const active =
                pathname === link.href ||
                pathname.startsWith(link.href + "/");

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-all duration-200"
                  style={{
                    background: active
                      ? "#F5F6FA"
                      : "transparent",

                    color: active
                      ? "#101B3D"
                      : "#667085",
                  }}
                >
                  <span
                    style={{
                      color: active
                        ? "#F5A524"
                        : "#98A2B3",
                    }}
                  >
                    {link.icon}
                  </span>

                  <span>{link.label}</span>

                  {active && (
                    <span
                      className="ml-auto h-2 w-2 rounded-full"
                      style={{
                        background: "#F5A524",
                      }}
                    />
                  )}
                </Link>
              );
            })}
          </div>

          {/* ================= MOBILE LOGOUT ================= */}

          <button
            type="button"
            onClick={handleLogout}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border py-3 text-sm font-semibold transition hover:bg-slate-900 hover:text-white"
            style={{
              borderColor: "#EAECF0",
              color: "#475467",
            }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <path
                d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"
                strokeLinecap="round"
              />

              <path
                d="m16 17 5-5-5-5M21 12H9"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>

            Logout
          </button>
        </div>
      )}
    </nav>
  );
}
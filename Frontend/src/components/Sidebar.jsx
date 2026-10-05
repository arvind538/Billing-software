"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import api from "@/lib/api";
import {
    getActiveCustomer,
    subscribeActiveCustomer,
} from "@/lib/activeCustomer";

// ======================================================
// NAVIGATION (Balothia Refrejoreon Electronic Items)
// ======================================================

const navLinks = [
    {
        href: "/billing",
        label: "Billing / Invoice",
        description: "Generate electronic bills",
        icon: (
            <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                className="h-[20px] w-[20px]"
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
        href: "/invoices",
        label: "Invoices",
        description: "View saved bills",
        icon: (
            <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                className="h-[20px] w-[20px]"
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

// ======================================================
// HELPERS
// ======================================================

function getInitials(name = "") {
    const safeName = String(name || "").trim();
    if (!safeName) return "U";
    return (
        safeName
            .split(/\s+/)
            .slice(0, 2)
            .map((part) => part?.[0]?.toUpperCase() || "")
            .join("") || "U"
    );
}

function getRoleBadgeStyle(role) {
    const normalized = String(role || "").toLowerCase();
    if (normalized === "admin") {
        return {
            label: "Admin",
            bg: "rgba(245, 165, 36, 0.15)",
            color: "#F5A524",
        };
    }
    if (normalized === "cashier") {
        return {
            label: "Cashier",
            bg: "rgba(18, 183, 106, 0.15)",
            color: "#12B76A",
        };
    }
    return {
        label: role || "User",
        bg: "rgba(255, 255, 255, 0.1)",
        color: "#CBD5E1",
    };
}

// ======================================================
// ICONS
// ======================================================

function LogoutIcon() {
    return (
        <svg
            width="18"
            height="18"
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
    );
}

function CustomerIcon() {
    return (
        <svg
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
        >
            <circle cx="12" cy="8" r="3.2" />
            <path
                d="M5 20c0-3.6 3.1-6.4 7-6.4s7 2.8 7 6.4"
                strokeLinecap="round"
            />
        </svg>
    );
}

function ChevronIcon({ open }) {
    return (
        <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className={`transition-transform duration-200 ${open ? "rotate-180" : "rotate-0"}`}
        >
            <path
                d="m6 9 6 6 6-6"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}

function MenuIcon() {
    return (
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
    );
}

function CloseIcon() {
    return (
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
    );
}

// ======================================================
// PROFILE DROPDOWN CONTENT
// ======================================================

function ProfileDropdownContent({
    user,
    activeCustomer,
    isAdmin,
    onLogout,
    closeMenu,
}) {
    const roleBadge = getRoleBadgeStyle(user.role);

    return (
        <>
            <div
                className="flex items-center gap-3 border-b p-4"
                style={{ borderColor: "#1E293B" }}
            >
                <div
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-bold"
                    style={{
                        background: "linear-gradient(135deg, #0A192F 0%, #1E293B 100%)",
                        color: "#F5A524",
                    }}
                >
                    {getInitials(user.name)}
                </div>

                <div className="min-w-0">
                    <div className="truncate text-sm font-semibold text-white">
                        {user.name || "User"}
                    </div>
                    {user.email && (
                        <div className="truncate text-xs text-slate-300">
                            {user.email}
                        </div>
                    )}
                    <span
                        className="mt-1 inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold"
                        style={{
                            background: roleBadge.bg,
                            color: roleBadge.color,
                        }}
                    >
                        {roleBadge.label}
                    </span>
                </div>
            </div>

            {activeCustomer && (
                <div
                    className="border-b p-4"
                    style={{ borderColor: "#1E293B" }}
                >
                    <div className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                        <CustomerIcon />
                        Selected Customer
                    </div>
                    <div className="text-sm font-semibold text-white">
                        {activeCustomer.name || "Walk-in Customer"}
                    </div>
                    <div className="mt-0.5 text-xs text-slate-300">
                        {activeCustomer.phone || "No phone on file"}
                    </div>
                </div>
            )}

            <div className="p-1.5">
                {isAdmin && (
                    <Link
                        href="/admin"
                        onClick={closeMenu}
                        className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors hover:bg-white/10"
                        style={{ color: "#F5A524" }}
                    >
                        Admin Panel
                    </Link>
                )}

                <button
                    type="button"
                    onClick={() => {
                        closeMenu();
                        onLogout();
                    }}
                    className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors hover:bg-red-500/10"
                    style={{ color: "#F87171" }}
                >
                    <LogoutIcon />
                    Logout
                </button>
            </div>
        </>
    );
}

// ======================================================
// PROFILE SECTION
// ======================================================

function ProfileSection({ user, activeCustomer, onLogout }) {
    const [open, setOpen] = useState(false);
    const menuRef = useRef(null);

    useEffect(() => {
        if (!open) return;
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [open]);

    if (!user) {
        return (
            <div
                className="mt-auto border-t p-3"
                style={{ borderColor: "#1E293B" }}
            >
                <div className="flex items-center gap-2">
                    <Link
                        href="/login"
                        className="flex-1 rounded-xl px-3 py-2.5 text-center text-sm font-semibold text-white transition-colors hover:bg-white/10"
                        style={{ background: "rgba(255,255,255,0.08)" }}
                    >
                        Login
                    </Link>
                    <Link
                        href="/register"
                        className="flex-1 rounded-xl px-3 py-2.5 text-center text-sm font-semibold text-white transition-opacity hover:opacity-90"
                        style={{ background: "#F5A524" }}
                    >
                        Register
                    </Link>
                </div>
            </div>
        );
    }

    const roleBadge = getRoleBadgeStyle(user.role);
    const isAdmin = String(user.role || "").toLowerCase() === "admin";

    return (
        <div
            ref={menuRef}
            className="relative mt-auto border-t p-3"
            style={{ borderColor: "#1E293B" }}
        >
            <button
                type="button"
                onClick={() => setOpen((prev) => !prev)}
                className="flex w-full items-center gap-3 rounded-xl px-2 py-2 transition-all duration-200"
                style={{
                    background: open ? "rgba(255, 255, 255, 0.08)" : "transparent",
                }}
            >
                <div className="relative shrink-0">
                    <div
                        className="flex h-10 w-10 items-center justify-center rounded-full text-xs font-bold"
                        style={{
                            background: "linear-gradient(135deg, #0A192F 0%, #1E293B 100%)",
                            color: "#F5A524",
                        }}
                    >
                        {getInitials(user.name)}
                    </div>
                    {activeCustomer && (
                        <span
                            className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-[#0A192F]"
                            style={{ background: "#12B76A" }}
                        />
                    )}
                </div>

                <div className="min-w-0 flex-1 text-left">
                    <div className="truncate text-sm font-semibold text-white">
                        {user.name || "User"}
                    </div>
                    <span
                        className="mt-0.5 inline-block rounded-full px-1.5 py-[1px] text-[10px] font-semibold"
                        style={{
                            background: roleBadge.bg,
                            color: roleBadge.color,
                        }}
                    >
                        {roleBadge.label}
                    </span>
                </div>

                <span className="text-slate-300">
                    <ChevronIcon open={open} />
                </span>
            </button>

            {open && (
                <div
                    className="absolute bottom-[calc(100%+8px)] left-3 right-3 z-[100] overflow-hidden rounded-2xl border bg-[#0A192F] shadow-2xl"
                    style={{ borderColor: "#1E293B" }}
                >
                    <ProfileDropdownContent
                        user={user}
                        activeCustomer={activeCustomer}
                        isAdmin={isAdmin}
                        onLogout={onLogout}
                        closeMenu={() => setOpen(false)}
                    />
                </div>
            )}
        </div>
    );
}

// ======================================================
// SIDEBAR (Balothia Refrejoreon Navy Blue Theme)
// ======================================================

export default function Sidebar() {
    const pathname = usePathname() || "";
    const router = useRouter();

    const [user, setUser] = useState(null);
    const [activeCustomer, setActiveCustomerState] = useState(null);
    const [mobileOpen, setMobileOpen] = useState(false);

    const hideSidebar = pathname === "/login" || pathname === "/register";

    useEffect(() => {
        if (hideSidebar) {
            document.body.style.paddingLeft = "";
            document.body.style.paddingTop = "";
            return;
        }

        const updateBodySpacing = () => {
            if (window.innerWidth >= 1024) {
                document.body.style.paddingLeft = "260px";
                document.body.style.paddingTop = "";
            } else {
                document.body.style.paddingLeft = "";
                document.body.style.paddingTop = "64px";
            }
        };

        updateBodySpacing();
        window.addEventListener("resize", updateBodySpacing);

        return () => {
            window.removeEventListener("resize", updateBodySpacing);
            document.body.style.paddingLeft = "";
            document.body.style.paddingTop = "";
        };
    }, [hideSidebar]);

    useEffect(() => {
        if (hideSidebar) return;
        api.get("/auth/me")
            .then((res) => setUser(res.data))
            .catch(() => setUser(null));
    }, [hideSidebar]);

    useEffect(() => {
        if (hideSidebar) return;
        try {
            setActiveCustomerState(getActiveCustomer());
        } catch {
            setActiveCustomerState(null);
        }
        const unsubscribe = subscribeActiveCustomer((customer) => {
            setActiveCustomerState(customer);
        });
        return () => {
            if (typeof unsubscribe === "function") unsubscribe();
        };
    }, [hideSidebar]);

    useEffect(() => {
        setMobileOpen(false);
    }, [pathname]);

    //     } catch { }
    //     setUser(null);
    //     router.push("/login");
    //     router.refresh();
    // };
    const handleLogout = async () => {
        try {
            await api.post("/auth/logout");
        } catch { }

        // 1. React state clear
        setUser(null);

        // 2. localStorage clear (login page yahan bhi token/user store karta hai)
        if (typeof window !== "undefined") {
            localStorage.removeItem("token");
            localStorage.removeItem("user");

            // 3. Cookie ko EXACT same attributes ke saath expire karo jaise login
            //    page ne set ki thi — production HTTPS ke liye Secure conditionally add
            const isSecure = window.location.protocol === "https:";
            document.cookie = `token=; path=/; max-age=0; SameSite=Lax${isSecure ? "; Secure" : ""}`;
        }

        // 4. Hard redirect — router.push nahi, taaki Next.js middleware turant
        //    fresh (cookie-less) state ke saath re-evaluate ho, aur login page
        //    guaranteed khule
        window.location.replace("/login");
    };

    if (hideSidebar) return null;

    const NavigationContent = ({ mobile = false }) => (
        <div className="space-y-1.5">
            {navLinks.map((link) => {
                const active =
                    pathname === link.href ||
                    pathname.startsWith(link.href + "/");

                return (
                    <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => {
                            if (mobile) setMobileOpen(false);
                        }}
                        className={`group relative flex items-center gap-3 rounded-xl px-3.5 py-3 transition-all duration-200 ${active
                            ? "bg-white/10 text-white"
                            : "text-slate-300 hover:bg-white/5 hover:text-white"
                            }`}
                        style={{
                            borderLeft: active ? "4px solid #F5A524" : "4px solid transparent",
                        }}
                    >
                        <span
                            className="shrink-0 transition-transform duration-200 group-hover:scale-110"
                            style={{
                                color: active ? "#F5A524" : "#94A3B8",
                            }}
                        >
                            {link.icon}
                        </span>

                        <div className="min-w-0 flex-1">
                            <div className="text-sm font-semibold">
                                {link.label}
                            </div>
                            <div
                                className="mt-0.5 text-[10px]"
                                style={{ color: "#94A3B8" }}
                            >
                                {link.description}
                            </div>
                        </div>
                    </Link>
                );
            })}
        </div>
    );

    return (
        <>
            {/* MOBILE TOP BAR */}
            <header className="fixed left-0 right-0 top-0 z-40 flex h-16 items-center justify-between border-b bg-[#0A192F] px-4 shadow-sm lg:hidden" style={{ borderColor: "#1E293B" }}>
                <Link href="/billing" className="flex items-center gap-2.5">
                    <div
                        className="flex h-9 w-9 items-center justify-center rounded-xl"
                        style={{ background: "linear-gradient(135deg, #0A192F 0%, #1E293B 100%)" }}
                    >
                        <span className="text-lg font-extrabold" style={{ color: "#F5A524" }}>
                            B
                        </span>
                    </div>
                    <div>
                        <div className="text-sm font-bold text-white">
                            Balothia <span style={{ color: "#F5A524" }}>Refrejoreon</span>
                        </div>
                        <div className="text-[8px] font-semibold tracking-widest text-slate-400">
                            ELECTRONIC BILLING
                        </div>
                    </div>
                </Link>

                <button
                    type="button"
                    onClick={() => setMobileOpen((prev) => !prev)}
                    className="flex h-10 w-10 items-center justify-center rounded-xl text-white hover:bg-white/10"
                    aria-label="Toggle sidebar"
                >
                    {mobileOpen ? <CloseIcon /> : <MenuIcon />}
                </button>
            </header>

            {/* MOBILE OVERLAY */}
            {mobileOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/50 backdrop-blur-[2px] lg:hidden"
                    onClick={() => setMobileOpen(false)}
                />
            )}

            {/* MOBILE SIDEBAR */}
            <aside
                className={`fixed bottom-0 left-0 top-0 z-50 w-[285px] border-r bg-[#0A192F] text-white shadow-2xl transition-transform duration-300 lg:hidden ${mobileOpen ? "translate-x-0" : "-translate-x-full"
                    }`}
                style={{ borderColor: "#1E293B" }}
            >
                <div
                    className="flex h-16 items-center justify-between border-b px-4"
                    style={{ borderColor: "#1E293B" }}
                >
                    <Link
                        href="/billing"
                        onClick={() => setMobileOpen(false)}
                        className="flex items-center gap-2.5"
                    >
                        <div
                            className="flex h-9 w-9 items-center justify-center rounded-xl"
                            style={{ background: "linear-gradient(135deg, #0A192F 0%, #1E293B 100%)" }}
                        >
                            <span className="text-lg font-extrabold" style={{ color: "#F5A524" }}>
                                B
                            </span>
                        </div>
                        <div>
                            <div className="text-sm font-bold text-white">
                                Balothia <span style={{ color: "#F5A524" }}>Refrejoreon</span>
                            </div>
                            <div className="text-[8px] font-semibold tracking-widest text-slate-400">
                                ELECTRONIC BILLING
                            </div>
                        </div>
                    </Link>

                    <button
                        type="button"
                        onClick={() => setMobileOpen(false)}
                        className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-300 hover:bg-white/10"
                    >
                        <CloseIcon />
                    </button>
                </div>

                <div className="flex h-[calc(100%-64px)] flex-col overflow-y-auto p-3">
                    <NavigationContent mobile />

                    {activeCustomer && (
                        <div
                            className="mt-5 rounded-xl border p-3"
                            style={{
                                borderColor: "#1E293B",
                                background: "rgba(255, 255, 255, 0.03)",
                            }}
                        >
                            <div className="mb-2 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                <CustomerIcon />
                                Active Buyer
                            </div>
                            <div className="truncate text-sm font-semibold text-white">
                                {activeCustomer.name || "Walk-in Customer"}
                            </div>
                            <div className="mt-1 text-xs text-slate-300">
                                {activeCustomer.phone || "No phone on file"}
                            </div>
                        </div>
                    )}

                    <ProfileSection
                        user={user}
                        activeCustomer={activeCustomer}
                        onLogout={handleLogout}
                    />
                </div>
            </aside>

            {/* DESKTOP SIDEBAR (Navy Blue Theme, Fixed Width, No Collapse) */}
            <aside
                className="fixed bottom-0 left-0 top-0 z-40 hidden w-[260px] border-r bg-[#0A192F] text-white transition-all duration-300 lg:flex lg:flex-col shadow-xl"
                style={{ borderColor: "#1E293B" }}
            >
                <div
                    className="flex h-[72px] shrink-0 items-center px-4 border-b"
                    style={{ borderColor: "#1E293B" }}
                >
                    <Link href="/billing" className="group flex items-center gap-3">
                        <div
                            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl shadow-md transition-transform duration-300 group-hover:scale-105"
                            style={{ background: "linear-gradient(135deg, #0A192F 0%, #1E293B 100%)" }}
                        >
                            <span className="text-lg font-extrabold" style={{ color: "#F5A524" }}>
                                B
                            </span>
                        </div>
                        <div>
                            <div className="text-[15px] font-bold tracking-tight text-white">
                                Balothia <span style={{ color: "#F5A524" }}>Refrejoreon</span>
                            </div>
                            <div className="mt-0.5 text-[9px] font-semibold tracking-[0.1em] text-slate-400">
                                ELECTRONIC APPLIANCES
                            </div>
                        </div>
                    </Link>
                </div>

                <div className="flex-1 overflow-y-auto p-3">
                    <div className="mb-3 px-3 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                        Main Menu
                    </div>

                    <NavigationContent />

                    {activeCustomer && (
                        <div
                            className="mt-6 rounded-xl border p-3"
                            style={{
                                borderColor: "#1E293B",
                                background: "rgba(255, 255, 255, 0.03)",
                            }}
                        >
                            <div className="mb-2 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                <CustomerIcon />
                                Active Buyer
                            </div>
                            <div className="truncate text-sm font-semibold text-white">
                                {activeCustomer.name || "Walk-in Customer"}
                            </div>
                            <div className="mt-1 truncate text-xs text-slate-300">
                                {activeCustomer.phone || "No phone on file"}
                            </div>
                        </div>
                    )}
                </div>

                {/* PROFILE SECTION */}
                <ProfileSection
                    user={user}
                    activeCustomer={activeCustomer}
                    onLogout={handleLogout}
                />
            </aside>
        </>
    );
}


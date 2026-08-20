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
// NAVIGATION
// ======================================================

const navLinks = [
    {
        href: "/billing",
        label: "Billing",
        description: "Create and manage bills",
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
        href: "/products",
        label: "Products",
        description: "Manage your products",
        icon: (
            <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                className="h-[20px] w-[20px]"
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
        description: "Manage customers",
        icon: (
            <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                className="h-[20px] w-[20px]"
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
        description: "View all invoices",
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
            bg: "#FEF3C7",
            color: "#92400E",
        };
    }

    if (normalized === "cashier") {
        return {
            label: "Cashier",
            bg: "#DCFCE7",
            color: "#166534",
        };
    }

    return {
        label: role || "User",
        bg: "#F1F5F9",
        color: "#475569",
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

function BellIcon() {
    return (
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
            <path d="M10 21h4" strokeLinecap="round" />
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
            className={`transition-transform duration-200 ${open ? "rotate-180" : "rotate-0"
                }`}
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

function CollapseIcon({ collapsed }) {
    return (
        <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
        >
            {collapsed ? (
                <path
                    d="m9 18 6-6-6-6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            ) : (
                <path
                    d="m15 18-6-6 6-6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            )}
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
                style={{ borderColor: "#EAECF0" }}
            >
                <div
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-bold"
                    style={{
                        background:
                            "linear-gradient(135deg, #101B3D 0%, #253761 100%)",
                        color: "#F5A524",
                    }}
                >
                    {getInitials(user.name)}
                </div>

                <div className="min-w-0">
                    <div
                        className="truncate text-sm font-semibold"
                        style={{ color: "#101828" }}
                    >
                        {user.name || "User"}
                    </div>

                    {user.email && (
                        <div
                            className="truncate text-xs"
                            style={{ color: "#98A2B3" }}
                        >
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
                    style={{ borderColor: "#EAECF0" }}
                >
                    <div
                        className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide"
                        style={{ color: "#98A2B3" }}
                    >
                        <CustomerIcon />
                        Selected Customer
                    </div>

                    <div
                        className="text-sm font-semibold"
                        style={{ color: "#101828" }}
                    >
                        {activeCustomer.name || "Walk-in Customer"}
                    </div>

                    <div
                        className="mt-0.5 text-xs"
                        style={{ color: "#667085" }}
                    >
                        {activeCustomer.phone || "No phone on file"}
                    </div>

                    {activeCustomer.email && (
                        <div
                            className="mt-0.5 truncate text-xs"
                            style={{ color: "#667085" }}
                        >
                            {activeCustomer.email}
                        </div>
                    )}
                </div>
            )}

            <div className="p-1.5">
                {isAdmin && (
                    <Link
                        href="/admin"
                        onClick={closeMenu}
                        className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors hover:bg-amber-50"
                        style={{ color: "#92400E" }}
                    >
                        <svg
                            width="17"
                            height="17"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.8"
                        >
                            <path d="M12 2 4 5v6c0 5 3.4 8.7 8 10 4.6-1.3 8-5 8-10V5l-8-3Z" />
                            <path
                                d="m9 12 2 2 4-4"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </svg>
                        Admin Panel
                    </Link>
                )}

                <button
                    type="button"
                    onClick={() => {
                        closeMenu();
                        onLogout();
                    }}
                    className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors hover:bg-red-50"
                    style={{ color: "#D92D20" }}
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

function ProfileSection({
    user,
    activeCustomer,
    onLogout,
    collapsed,
}) {
    const [open, setOpen] = useState(false);
    const menuRef = useRef(null);

    useEffect(() => {
        if (!open) return;

        const handleClickOutside = (event) => {
            if (
                menuRef.current &&
                !menuRef.current.contains(event.target)
            ) {
                setOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.removeEventListener(
                "mousedown",
                handleClickOutside
            );
        };
    }, [open]);

    if (!user) return null;

    const roleBadge = getRoleBadgeStyle(user.role);
    const isAdmin =
        String(user.role || "").toLowerCase() === "admin";

    return (
        <div
            ref={menuRef}
            className="relative mt-auto border-t p-3"
            style={{ borderColor: "#EAECF0" }}
        >
            <button
                type="button"
                onClick={() => setOpen((prev) => !prev)}
                className={`flex w-full items-center rounded-xl transition-all duration-200 ${collapsed
                    ? "justify-center p-2"
                    : "gap-3 px-2 py-2"
                    }`}
                style={{
                    background: open ? "#F5F6FA" : "transparent",
                }}
            >
                <div className="relative shrink-0">
                    <div
                        className="flex h-10 w-10 items-center justify-center rounded-full text-xs font-bold"
                        style={{
                            background:
                                "linear-gradient(135deg, #101B3D 0%, #253761 100%)",
                            color: "#F5A524",
                        }}
                    >
                        {getInitials(user.name)}
                    </div>

                    {activeCustomer && (
                        <span
                            className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white"
                            style={{ background: "#12B76A" }}
                            title={`Active customer: ${activeCustomer.name}`}
                        />
                    )}
                </div>

                {!collapsed && (
                    <>
                        <div className="min-w-0 flex-1 text-left">
                            <div
                                className="truncate text-sm font-semibold"
                                style={{ color: "#101828" }}
                            >
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

                        <ChevronIcon open={open} />
                    </>
                )}
            </button>

            {open && collapsed && (
                <div
                    className="absolute bottom-3 left-[calc(100%+10px)] z-[100] w-72 overflow-hidden rounded-2xl border bg-white shadow-2xl"
                    style={{ borderColor: "#EAECF0" }}
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

            {open && !collapsed && (
                <div
                    className="absolute bottom-[calc(100%+8px)] left-3 right-3 z-[100] overflow-hidden rounded-2xl border bg-white shadow-2xl"
                    style={{ borderColor: "#EAECF0" }}
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
// SIDEBAR
// ======================================================

export default function Sidebar() {
    const pathname = usePathname();
    const router = useRouter();

    const [user, setUser] = useState(null);
    const [activeCustomer, setActiveCustomerState] = useState(null);
    const [collapsed, setCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [notificationOpen, setNotificationOpen] = useState(false);

    const hideSidebar =
        pathname === "/login" || pathname === "/register";

    // ==================================================
    // BODY SPACING
    // IMPORTANT:
    // No styled-jsx here.
    // This prevents jsx-* hydration mismatch.
    // ==================================================

    useEffect(() => {
        if (hideSidebar) {
            document.body.style.paddingLeft = "";
            document.body.style.paddingTop = "";
            document.body.style.transition = "";

            return;
        }

        const updateBodySpacing = () => {
            if (window.innerWidth >= 1024) {
                document.body.style.paddingLeft = collapsed
                    ? "78px"
                    : "260px";

                document.body.style.paddingTop = "";
                document.body.style.transition =
                    "padding-left 300ms ease";
            } else {
                document.body.style.paddingLeft = "";
                document.body.style.paddingTop = "64px";
                document.body.style.transition = "";
            }
        };

        updateBodySpacing();

        window.addEventListener("resize", updateBodySpacing);

        return () => {
            window.removeEventListener(
                "resize",
                updateBodySpacing
            );

            document.body.style.paddingLeft = "";
            document.body.style.paddingTop = "";
            document.body.style.transition = "";
        };
    }, [collapsed, hideSidebar]);

    // ==================================================
    // FETCH USER
    // ==================================================

    useEffect(() => {
        if (hideSidebar) return;

        let mounted = true;

        api.get("/auth/me")
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

                if (error.response?.status === 401) {
                    api.post("/auth/logout").catch(() => { });
                }
            });

        return () => {
            mounted = false;
        };
    }, [hideSidebar]);

    // ==================================================
    // ACTIVE CUSTOMER
    // ==================================================

    useEffect(() => {
        if (hideSidebar) return;

        try {
            setActiveCustomerState(getActiveCustomer());
        } catch (error) {
            console.error(
                "Active customer read error:",
                error
            );

            setActiveCustomerState(null);
        }

        const unsubscribe = subscribeActiveCustomer(
            (customer) => {
                setActiveCustomerState(customer);
            }
        );

        return () => {
            if (typeof unsubscribe === "function") {
                unsubscribe();
            }
        };
    }, [hideSidebar]);

    // ==================================================
    // ROUTE CHANGE
    // ==================================================

    useEffect(() => {
        setMobileOpen(false);
        setNotificationOpen(false);
    }, [pathname]);

    // ==================================================
    // ESC KEY
    // ==================================================

    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === "Escape") {
                setMobileOpen(false);
                setNotificationOpen(false);
            }
        };

        document.addEventListener(
            "keydown",
            handleKeyDown
        );

        return () => {
            document.removeEventListener(
                "keydown",
                handleKeyDown
            );
        };
    }, []);

    // ==================================================
    // BODY SCROLL LOCK
    // ==================================================

    useEffect(() => {
        if (mobileOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }

        return () => {
            document.body.style.overflow = "";
        };
    }, [mobileOpen]);

    // ==================================================
    // LOGOUT
    // ==================================================

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

    if (hideSidebar) {
        return null;
    }

    // ==================================================
    // NAVIGATION
    // ==================================================

    const NavigationContent = ({ mobile = false }) => (
        <div className="space-y-1">
            {navLinks.map((link) => {
                const active =
                    pathname === link.href ||
                    pathname.startsWith(link.href + "/");

                return (
                    <Link
                        key={link.href}
                        href={link.href}
                        title={
                            !mobile && collapsed
                                ? link.label
                                : undefined
                        }
                        onClick={() => {
                            if (mobile) {
                                setMobileOpen(false);
                            }
                        }}
                        className={`group relative flex items-center rounded-xl transition-all duration-200 ${mobile
                            ? "gap-3 px-3 py-3.5"
                            : collapsed
                                ? "justify-center px-2 py-3"
                                : "gap-3 px-3 py-3"
                            }`}
                        style={{
                            background: active
                                ? "#F5F6FA"
                                : "transparent",
                            color: active
                                ? "#101B3D"
                                : "#667085",
                        }}
                    >
                        {active && (
                            <span
                                className="absolute left-0 top-1/2 h-7 w-1 -translate-y-1/2 rounded-r-full"
                                style={{
                                    background: "#F5A524",
                                }}
                            />
                        )}

                        <span
                            className="shrink-0 transition-transform duration-200 group-hover:scale-110"
                            style={{
                                color: active
                                    ? "#F5A524"
                                    : "#98A2B3",
                            }}
                        >
                            {link.icon}
                        </span>

                        {(!collapsed || mobile) && (
                            <div className="min-w-0 flex-1">
                                <div className="text-sm font-semibold">
                                    {link.label}
                                </div>

                                <div
                                    className="mt-0.5 hidden text-[10px] sm:block"
                                    style={{
                                        color: "#98A2B3",
                                    }}
                                >
                                    {link.description}
                                </div>
                            </div>
                        )}

                        {active &&
                            (!collapsed || mobile) && (
                                <span
                                    className="h-2 w-2 shrink-0 rounded-full"
                                    style={{
                                        background: "#F5A524",
                                    }}
                                />
                            )}

                        {collapsed && !mobile && (
                            <span className="pointer-events-none absolute left-[calc(100%+10px)] z-50 hidden whitespace-nowrap rounded-lg bg-slate-900 px-3 py-2 text-xs font-medium text-white shadow-lg group-hover:block">
                                {link.label}
                            </span>
                        )}
                    </Link>
                );
            })}
        </div>
    );

    // ==================================================
    // UI
    // ==================================================

    return (
        <>
            {/* MOBILE TOP BAR */}

            <header className="fixed left-0 right-0 top-0 z-40 flex h-16 items-center justify-between border-b bg-white px-4 shadow-sm lg:hidden">
                <Link
                    href="/billing"
                    className="flex items-center gap-2.5"
                >
                    <div
                        className="flex h-9 w-9 items-center justify-center rounded-xl"
                        style={{
                            background:
                                "linear-gradient(135deg, #101B3D 0%, #253761 100%)",
                        }}
                    >
                        <span
                            className="text-lg font-extrabold"
                            style={{ color: "#F5A524" }}
                        >
                            B
                        </span>
                    </div>

                    <div>
                        <div
                            className="text-sm font-bold"
                            style={{ color: "#101828" }}
                        >
                            Billing
                            <span style={{ color: "#F5A524" }}>
                                Software
                            </span>
                        </div>

                        <div
                            className="text-[8px] font-semibold tracking-widest"
                            style={{ color: "#98A2B3" }}
                        >
                            GROCERY MANAGEMENT
                        </div>
                    </div>
                </Link>

                <div className="flex items-center gap-1">
                    <button
                        type="button"
                        onClick={() =>
                            setNotificationOpen(
                                (prev) => !prev
                            )
                        }
                        className="relative flex h-10 w-10 items-center justify-center rounded-xl hover:bg-slate-50"
                        style={{ color: "#667085" }}
                        aria-label="Notifications"
                    >
                        <BellIcon />

                        <span
                            className="absolute right-2.5 top-2 h-2 w-2 rounded-full border-2 border-white"
                            style={{
                                background: "#F5A524",
                            }}
                        />
                    </button>

                    <button
                        type="button"
                        onClick={() =>
                            setMobileOpen(
                                (prev) => !prev
                            )
                        }
                        className="flex h-10 w-10 items-center justify-center rounded-xl hover:bg-slate-50"
                        style={{ color: "#101828" }}
                        aria-label="Toggle sidebar"
                        aria-expanded={mobileOpen}
                    >
                        {mobileOpen ? (
                            <CloseIcon />
                        ) : (
                            <MenuIcon />
                        )}
                    </button>
                </div>
            </header>

            {/* MOBILE OVERLAY */}

            {mobileOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[1px] lg:hidden"
                    onClick={() =>
                        setMobileOpen(false)
                    }
                />
            )}

            {/* MOBILE SIDEBAR */}

            <aside
                className={`fixed bottom-0 left-0 top-0 z-50 w-[285px] border-r bg-white shadow-2xl transition-transform duration-300 lg:hidden ${mobileOpen
                    ? "translate-x-0"
                    : "-translate-x-full"
                    }`}
                style={{
                    borderColor: "#EAECF0",
                }}
            >
                <div
                    className="flex h-16 items-center justify-between border-b px-4"
                    style={{
                        borderColor: "#EAECF0",
                    }}
                >
                    <Link
                        href="/billing"
                        onClick={() =>
                            setMobileOpen(false)
                        }
                        className="flex items-center gap-2.5"
                    >
                        <div
                            className="flex h-9 w-9 items-center justify-center rounded-xl"
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

                        <div>
                            <div
                                className="text-sm font-bold"
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
                                className="text-[8px] font-semibold tracking-widest"
                                style={{
                                    color: "#98A2B3",
                                }}
                            >
                                GROCERY MANAGEMENT
                            </div>
                        </div>
                    </Link>

                    <button
                        type="button"
                        onClick={() =>
                            setMobileOpen(false)
                        }
                        className="flex h-9 w-9 items-center justify-center rounded-lg hover:bg-slate-50"
                        aria-label="Close sidebar"
                    >
                        <CloseIcon />
                    </button>
                </div>

                <div className="flex h-[calc(100%-64px)] flex-col overflow-y-auto p-3">
                    <div
                        className="mb-3 px-3 text-[10px] font-bold uppercase tracking-widest"
                        style={{
                            color: "#98A2B3",
                        }}
                    >
                        Main Menu
                    </div>

                    <NavigationContent mobile />

                    {activeCustomer && (
                        <div
                            className="mt-5 rounded-xl border p-3"
                            style={{
                                borderColor: "#EAECF0",
                                background: "#F8FAFC",
                            }}
                        >
                            <div
                                className="mb-2 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider"
                                style={{
                                    color: "#98A2B3",
                                }}
                            >
                                <CustomerIcon />
                                Active Customer
                            </div>

                            <div
                                className="truncate text-sm font-semibold"
                                style={{
                                    color: "#101828",
                                }}
                            >
                                {activeCustomer.name ||
                                    "Walk-in Customer"}
                            </div>

                            <div
                                className="mt-1 text-xs"
                                style={{
                                    color: "#667085",
                                }}
                            >
                                {activeCustomer.phone ||
                                    "No phone on file"}
                            </div>
                        </div>
                    )}

                    <ProfileSection
                        user={user}
                        activeCustomer={activeCustomer}
                        onLogout={handleLogout}
                        collapsed={false}
                    />
                </div>
            </aside>

            {/* DESKTOP SIDEBAR */}

            <aside
                className={`fixed bottom-0 left-0 top-0 z-40 hidden border-r bg-white transition-all duration-300 lg:flex lg:flex-col ${collapsed
                    ? "w-[78px]"
                    : "w-[260px]"
                    }`}
                style={{
                    borderColor: "#EAECF0",
                    boxShadow:
                        "4px 0 20px rgba(16,24,40,0.04)",
                }}
            >
                <div
                    className={`flex h-[72px] shrink-0 items-center border-b ${collapsed
                        ? "justify-center px-2"
                        : "px-4"
                        }`}
                    style={{
                        borderColor: "#EAECF0",
                    }}
                >
                    <Link
                        href="/billing"
                        className="group flex items-center gap-3"
                        title={
                            collapsed
                                ? "Billing Software"
                                : undefined
                        }
                    >
                        <div
                            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-all duration-300 group-hover:scale-105 group-hover:shadow-lg"
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

                        {!collapsed && (
                            <div>
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
                                    GROCERY MANAGEMENT
                                </div>
                            </div>
                        )}
                    </Link>
                </div>

                <div className="flex-1 overflow-y-auto p-3">
                    {!collapsed && (
                        <div
                            className="mb-3 px-3 text-[10px] font-bold uppercase tracking-widest"
                            style={{
                                color: "#98A2B3",
                            }}
                        >
                            Main Menu
                        </div>
                    )}

                    <NavigationContent />

                    {activeCustomer && !collapsed && (
                        <div
                            className="mt-6 rounded-xl border p-3"
                            style={{
                                borderColor: "#EAECF0",
                                background: "#F8FAFC",
                            }}
                        >
                            <div
                                className="mb-2 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider"
                                style={{
                                    color: "#98A2B3",
                                }}
                            >
                                <CustomerIcon />
                                Active Customer
                            </div>

                            <div
                                className="truncate text-sm font-semibold"
                                style={{
                                    color: "#101828",
                                }}
                            >
                                {activeCustomer.name ||
                                    "Walk-in Customer"}
                            </div>

                            <div
                                className="mt-1 truncate text-xs"
                                style={{
                                    color: "#667085",
                                }}
                            >
                                {activeCustomer.phone ||
                                    "No phone on file"}
                            </div>
                        </div>
                    )}
                </div>

                {/* NOTIFICATIONS */}

                <div
                    className={`border-t p-3 ${collapsed
                        ? "flex justify-center"
                        : ""
                        }`}
                    style={{
                        borderColor: "#EAECF0",
                    }}
                >
                    <button
                        type="button"
                        onClick={() =>
                            setNotificationOpen(
                                (prev) => !prev
                            )
                        }
                        title={
                            collapsed
                                ? "Notifications"
                                : undefined
                        }
                        className={`group relative flex items-center rounded-xl transition-all hover:bg-slate-50 ${collapsed
                            ? "h-10 w-10 justify-center"
                            : "w-full gap-3 px-3 py-2.5"
                            }`}
                        style={{
                            color: "#667085",
                        }}
                    >
                        <span className="relative">
                            <BellIcon />

                            <span
                                className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full"
                                style={{
                                    background: "#F5A524",
                                }}
                            />
                        </span>

                        {!collapsed && (
                            <>
                                <span className="text-sm font-medium">
                                    Notifications
                                </span>

                                <span
                                    className="ml-auto rounded-full px-2 py-0.5 text-[9px] font-bold"
                                    style={{
                                        background: "#FEF3C7",
                                        color: "#92400E",
                                    }}
                                >
                                    New
                                </span>
                            </>
                        )}

                        {collapsed && (
                            <span className="pointer-events-none absolute left-[calc(100%+10px)] z-50 hidden whitespace-nowrap rounded-lg bg-slate-900 px-3 py-2 text-xs font-medium text-white shadow-lg group-hover:block">
                                Notifications
                            </span>
                        )}
                    </button>
                </div>

                {/* PROFILE */}

                <ProfileSection
                    user={user}
                    activeCustomer={activeCustomer}
                    onLogout={handleLogout}
                    collapsed={collapsed}
                />

                {/* COLLAPSE */}

                <div
                    className={`border-t p-3 ${collapsed
                        ? "flex justify-center"
                        : ""
                        }`}
                    style={{
                        borderColor: "#EAECF0",
                    }}
                >
                    <button
                        type="button"
                        onClick={() =>
                            setCollapsed(
                                (prev) => !prev
                            )
                        }
                        title={
                            collapsed
                                ? "Expand sidebar"
                                : "Collapse sidebar"
                        }
                        className={`flex items-center rounded-xl transition-all hover:bg-slate-50 ${collapsed
                            ? "h-10 w-10 justify-center"
                            : "w-full gap-3 px-3 py-2.5"
                            }`}
                        style={{
                            color: "#667085",
                        }}
                    >
                        <CollapseIcon
                            collapsed={collapsed}
                        />

                        {!collapsed && (
                            <span className="text-sm font-medium">
                                Collapse Sidebar
                            </span>
                        )}
                    </button>
                </div>
            </aside>

            {/* NOTIFICATION PANEL */}

            {notificationOpen && (
                <>
                    <div
                        className="fixed inset-0 z-[55]"
                        onClick={() =>
                            setNotificationOpen(false)
                        }
                    />

                    <div className="fixed right-4 top-[70px] z-[60] w-[320px] overflow-hidden rounded-2xl border bg-white shadow-2xl sm:right-6">
                        <div
                            className="border-b p-4"
                            style={{
                                borderColor: "#EAECF0",
                            }}
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3
                                        className="text-sm font-bold"
                                        style={{
                                            color: "#101828",
                                        }}
                                    >
                                        Notifications
                                    </h3>

                                    <p
                                        className="mt-0.5 text-xs"
                                        style={{
                                            color: "#98A2B3",
                                        }}
                                    >
                                        Your latest updates
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    onClick={() =>
                                        setNotificationOpen(
                                            false
                                        )
                                    }
                                    className="text-xs font-semibold"
                                    style={{
                                        color: "#F5A524",
                                    }}
                                >
                                    Close
                                </button>
                            </div>
                        </div>

                        <div className="p-4">
                            <div
                                className="rounded-xl border p-3"
                                style={{
                                    borderColor: "#EAECF0",
                                    background: "#F8FAFC",
                                }}
                            >
                                <div className="flex gap-3">
                                    <div
                                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
                                        style={{
                                            background:
                                                "#FEF3C7",
                                            color: "#92400E",
                                        }}
                                    >
                                        <BellIcon />
                                    </div>

                                    <div>
                                        <div
                                            className="text-sm font-semibold"
                                            style={{
                                                color: "#101828",
                                            }}
                                        >
                                            Welcome to Billing
                                            Software
                                        </div>

                                        <p
                                            className="mt-1 text-xs leading-5"
                                            style={{
                                                color: "#667085",
                                            }}
                                        >
                                            Manage your products,
                                            customers and invoices
                                            from one place.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </>
    );
}
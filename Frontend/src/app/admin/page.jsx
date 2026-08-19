
"use client";

import { useEffect, useMemo, useState } from "react";
import api from "@/lib/api";

function formatCurrency(amount) {
    const value = Number(amount) || 0;
    return `₹${value.toLocaleString("en-IN")}`;
}

function formatDate(dateStr) {
    if (!dateStr) return "—";

    const d = new Date(dateStr);

    if (isNaN(d.getTime())) return "—";

    return d.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
}

function getStatusStyle(status) {
    const normalized = (status || "").toLowerCase();

    if (normalized === "paid") {
        return {
            label: "Paid",
            bg: "#ECFDF3",
            color: "#027A48",
            dot: "#12B76A",
        };
    }

    if (normalized === "due") {
        return {
            label: "Due",
            bg: "#FEF3F2",
            color: "#B42318",
            dot: "#F04438",
        };
    }

    return {
        label: status || "Unknown",
        bg: "#F2F4F7",
        color: "#475467",
        dot: "#98A2B3",
    };
}

function getRoleBadgeStyle(role) {
    const normalized = (role || "").toLowerCase();

    if (normalized === "admin") {
        return {
            label: "Admin",
            bg: "#FFF8E7",
            color: "#B54708",
            dot: "#F79009",
        };
    }

    if (normalized === "cashier") {
        return {
            label: "Cashier",
            bg: "#ECFDF3",
            color: "#027A48",
            dot: "#12B76A",
        };
    }

    return {
        label: role || "User",
        bg: "#F2F4F7",
        color: "#475467",
        dot: "#98A2B3",
    };
}

function getDelayStyle(inv) {
    const status = (inv.status || "").toLowerCase();

    if (status === "paid") {
        return {
            label: "On time",
            bg: "#ECFDF3",
            color: "#027A48",
            dot: "#12B76A",
        };
    }

    const dueDateRaw = inv.dueDate || inv.due_date;

    if (!dueDateRaw) {
        return {
            label: "No date",
            bg: "#F2F4F7",
            color: "#667085",
            dot: "#98A2B3",
        };
    }

    const due = new Date(dueDateRaw);

    if (isNaN(due.getTime())) {
        return {
            label: "No date",
            bg: "#F2F4F7",
            color: "#667085",
            dot: "#98A2B3",
        };
    }

    const now = new Date();

    const diffDays = Math.floor(
        (now.getTime() - due.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (diffDays <= 0) {
        return {
            label: "Due soon",
            bg: "#FFFAEB",
            color: "#B54708",
            dot: "#F79009",
        };
    }

    return {
        label: `${diffDays}d late`,
        bg: "#FEF3F2",
        color: "#B42318",
        dot: "#F04438",
    };
}

/* =========================================================
   ICONS
========================================================= */

function Icon({ name, size = 20 }) {
    const common = {
        width: size,
        height: size,
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: "currentColor",
        strokeWidth: 1.8,
        strokeLinecap: "round",
        strokeLinejoin: "round",
    };

    const icons = {
        users: (
            <>
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </>
        ),

        products: (
            <>
                <path d="m21 16-9 5-9-5" />
                <path d="m3 8 9 5 9-5-9-5-9 5Z" />
                <path d="M3 12l9 5 9-5" />
            </>
        ),

        invoice: (
            <>
                <path d="M6 2h9l3 3v17H6z" />
                <path d="M9 13h6" />
                <path d="M9 17h4" />
                <path d="M9 9h6" />
            </>
        ),

        stock: (
            <>
                <path d="M12 3v18" />
                <path d="M17 8c0-2-2-3-5-3s-5 1-5 3 2 3 5 3 5 1 5 3-2 3-5 3-5-1-5-3" />
            </>
        ),

        warning: (
            <>
                <path d="M10.3 3.6 2.5 17a2 2 0 0 0 1.7 3h15.6a2 2 0 0 0 1.7-3L13.7 3.6a2 2 0 0 0-3.4 0Z" />
                <path d="M12 9v4" />
                <path d="M12 17h.01" />
            </>
        ),

        revenue: (
            <>
                <path d="M3 3v18h18" />
                <path d="m7 16 4-5 3 3 5-7" />
            </>
        ),

        search: (
            <>
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-4-4" />
            </>
        ),

        arrowUp: (
            <>
                <path d="m18 15-6-6-6 6" />
            </>
        ),

        refresh: (
            <>
                <path d="M20 11a8.1 8.1 0 0 0-15.5-2" />
                <path d="M4 5v4h4" />
                <path d="M4 13a8.1 8.1 0 0 0 15.5 2" />
                <path d="M20 19v-4h-4" />
            </>
        ),
    };

    return <svg {...common}>{icons[name]}</svg>;
}

/* =========================================================
   STAT CARD
========================================================= */

function StatCard({
    title,
    value,
    subtitle,
    icon,
    accent = "#155EEF",
    warning = false,
}) {
    return (
        <div
            className="group relative overflow-hidden rounded-2xl border bg-white p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
            style={{ borderColor: "#EAECF0" }}
        >
            <div
                className="absolute -right-10 -top-10 h-28 w-28 rounded-full opacity-10 transition-transform duration-300 group-hover:scale-125"
                style={{ background: accent }}
            />

            <div className="relative">
                <div className="flex items-start justify-between">
                    <div
                        className="flex h-11 w-11 items-center justify-center rounded-xl"
                        style={{
                            background: `${accent}12`,
                            color: accent,
                        }}
                    >
                        <Icon name={icon} size={21} />
                    </div>

                    {warning && (
                        <span
                            className="rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide"
                            style={{
                                background: "#FEF3F2",
                                color: "#B42318",
                            }}
                        >
                            Attention
                        </span>
                    )}
                </div>

                <p
                    className="mt-4 text-xs font-semibold uppercase tracking-wider"
                    style={{ color: "#98A2B3" }}
                >
                    {title}
                </p>

                <div className="mt-1 text-2xl font-bold" style={{ color: "#101828" }}>
                    {value}
                </div>

                {subtitle && (
                    <div className="mt-2 flex items-center gap-1 text-xs">
                        <span
                            className="flex items-center"
                            style={{ color: accent }}
                        >
                            <Icon name="arrowUp" size={13} />
                        </span>

                        <span style={{ color: "#667085" }}>{subtitle}</span>
                    </div>
                )}
            </div>
        </div>
    );
}

/* =========================================================
   BADGE
========================================================= */

function Badge({ bg, color, dot, children }) {
    return (
        <span
            className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold"
            style={{
                background: bg,
                color,
            }}
        >
            {dot && (
                <span
                    className="h-1.5 w-1.5 rounded-full"
                    style={{ background: dot }}
                />
            )}

            {children}
        </span>
    );
}

/* =========================================================
   TABLE UI
========================================================= */

function Th({ children }) {
    return (
        <th
            className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider"
            style={{
                color: "#667085",
                background: "#F9FAFB",
            }}
        >
            {children}
        </th>
    );
}

function Td({ children, bold = false, className = "" }) {
    return (
        <td
            className={`px-5 py-4 ${className}`}
            style={{
                color: bold ? "#101828" : "#667085",
                fontWeight: bold ? 600 : 400,
            }}
        >
            {children}
        </td>
    );
}

/* =========================================================
   MOBILE CARD
========================================================= */

function MobileCard({ children }) {
    return (
        <div
            className="rounded-2xl border bg-white p-4 shadow-sm"
            style={{ borderColor: "#EAECF0" }}
        >
            {children}
        </div>
    );
}

function EmptyState({ text }) {
    return (
        <div
            className="rounded-2xl border bg-white px-5 py-14 text-center"
            style={{ borderColor: "#EAECF0" }}
        >
            <div
                className="mx-auto flex h-12 w-12 items-center justify-center rounded-full"
                style={{
                    background: "#F2F4F7",
                    color: "#98A2B3",
                }}
            >
                <Icon name="search" size={20} />
            </div>

            <p className="mt-4 text-sm font-semibold" style={{ color: "#344054" }}>
                {text}
            </p>

            <p className="mt-1 text-xs" style={{ color: "#98A2B3" }}>
                Try another search keyword.
            </p>
        </div>
    );
}

/* =========================================================
   MAIN PAGE
========================================================= */

const TABS = [
    {
        id: "users",
        label: "Users",
        icon: "users",
    },
    {
        id: "products",
        label: "Products",
        icon: "products",
    },
    {
        id: "invoices",
        label: "Invoices",
        icon: "invoice",
    },
];

export default function AdminPanelPage() {
    const [activeTab, setActiveTab] = useState("users");

    const [stats, setStats] = useState(null);
    const [users, setUsers] = useState([]);
    const [products, setProducts] = useState([]);
    const [invoices, setInvoices] = useState([]);

    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState("");

    const fetchAdminData = async (showRefresh = false) => {
        try {
            setError("");

            if (showRefresh) {
                setRefreshing(true);
            } else {
                setLoading(true);
            }

            const [statsRes, usersRes, productsRes, invoicesRes] =
                await Promise.all([
                    api.get("/admin/stats"),
                    api.get("/admin/users"),
                    api.get("/admin/products"),
                    api.get("/admin/invoices"),
                ]);

            setStats(statsRes.data);
            setUsers(Array.isArray(usersRes.data) ? usersRes.data : []);
            setProducts(Array.isArray(productsRes.data) ? productsRes.data : []);
            setInvoices(Array.isArray(invoicesRes.data) ? invoicesRes.data : []);
        } catch (err) {
            console.error(
                "Admin data fetch error:",
                err.response?.data || err.message
            );

            setError(
                "Data load nahi ho paya. Please refresh karo ya dubara try karo."
            );
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchAdminData();
    }, []);

    const query = search.trim().toLowerCase();

    const filteredUsers = useMemo(() => {
        return users.filter(
            (u) =>
                u.name?.toLowerCase().includes(query) ||
                u.email?.toLowerCase().includes(query) ||
                u.role?.toLowerCase().includes(query)
        );
    }, [users, query]);

    const filteredProducts = useMemo(() => {
        return products.filter(
            (p) =>
                p.name?.toLowerCase().includes(query) ||
                p.sku?.toLowerCase().includes(query) ||
                p.category?.toLowerCase().includes(query)
        );
    }, [products, query]);

    const filteredInvoices = useMemo(() => {
        return invoices.filter(
            (inv) =>
                inv.invoiceNumber?.toLowerCase().includes(query) ||
                inv.customer?.name?.toLowerCase().includes(query) ||
                inv.status?.toLowerCase().includes(query)
        );
    }, [invoices, query]);

    const totalStockAvailable = products.reduce(
        (sum, p) => sum + (Number(p.stock) || 0),
        0
    );

    const overdueInvoicesCount = invoices.filter((inv) => {
        const status = (inv.status || "").toLowerCase();

        if (status === "paid") return false;

        const dueDateRaw = inv.dueDate || inv.due_date;

        if (!dueDateRaw) return false;

        const due = new Date(dueDateRaw);

        if (isNaN(due.getTime())) return false;

        return new Date() > due;
    }).length;

    const paidInvoices = invoices.filter(
        (inv) => (inv.status || "").toLowerCase() === "paid"
    ).length;

    const dueInvoices = invoices.filter(
        (inv) => (inv.status || "").toLowerCase() === "due"
    ).length;

    const lowStockProducts = products.filter(
        (p) => Number(p.stock) <= Number(p.lowStockAlert)
    );

    const currentDataCount =
        activeTab === "users"
            ? filteredUsers.length
            : activeTab === "products"
                ? filteredProducts.length
                : filteredInvoices.length;

    return (
        <div
            className="min-h-screen"
            style={{
                background:
                    "linear-gradient(180deg, #F8FAFC 0%, #F9FAFB 40%, #FFFFFF 100%)",
            }}
        >
            <div className="mx-auto max-w-[1700px] px-4 py-5 sm:px-6 sm:py-7 lg:px-8 xl:px-10">
                {/* =================================================
            HEADER
        ================================================= */}

                <div className="mb-6 flex flex-col gap-5 lg:mb-8 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                        <div className="mb-2 flex items-center gap-2">
                            <span
                                className="h-2 w-2 rounded-full"
                                style={{ background: "#12B76A" }}
                            />

                            <span
                                className="text-xs font-bold uppercase tracking-widest"
                                style={{ color: "#667085" }}
                            >
                                Dashboard Overview
                            </span>
                        </div>

                        <h1
                            className="text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl"
                            style={{ color: "#101828" }}
                        >
                            Admin Panel
                        </h1>

                        <p
                            className="mt-1.5 max-w-xl text-sm"
                            style={{ color: "#667085" }}
                        >
                            Manage your billing software, users, inventory and invoices from
                            one place.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={() => fetchAdminData(true)}
                        disabled={refreshing}
                        className="inline-flex w-fit items-center gap-2 rounded-xl border bg-white px-4 py-2.5 text-sm font-semibold shadow-sm transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
                        style={{
                            borderColor: "#EAECF0",
                            color: "#344054",
                        }}
                    >
                        <span className={refreshing ? "animate-spin" : ""}>
                            <Icon name="refresh" size={17} />
                        </span>

                        {refreshing ? "Refreshing..." : "Refresh Data"}
                    </button>
                </div>

                {/* =================================================
            STATS
        ================================================= */}

                <div className="mb-7 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <StatCard
                        title="Total Users"
                        value={stats?.totalUsers ?? "—"}
                        subtitle="Active system users"
                        icon="users"
                        accent="#155EEF"
                    />

                    <StatCard
                        title="Total Products"
                        value={stats?.totalProducts ?? "—"}
                        subtitle={`${totalStockAvailable} units available`}
                        icon="products"
                        accent="#7F56D9"
                    />

                    <StatCard
                        title="Revenue Collected"
                        value={formatCurrency(stats?.totalRevenue)}
                        subtitle={`${paidInvoices} paid invoices`}
                        icon="revenue"
                        accent="#039855"
                    />

                    <StatCard
                        title="Pending Dues"
                        value={formatCurrency(stats?.totalDue)}
                        subtitle={`${dueInvoices} invoices pending`}
                        icon="invoice"
                        accent="#F79009"
                        warning={Number(stats?.totalDue) > 0}
                    />
                </div>

                {/* =================================================
            SECONDARY STATS
        ================================================= */}

                <div className="mb-7 grid grid-cols-2 gap-3 sm:grid-cols-4">
                    <div
                        className="rounded-2xl border bg-white p-4"
                        style={{ borderColor: "#EAECF0" }}
                    >
                        <div className="flex items-center gap-2">
                            <div
                                className="flex h-9 w-9 items-center justify-center rounded-lg"
                                style={{
                                    background: "#ECFDF3",
                                    color: "#027A48",
                                }}
                            >
                                <Icon name="stock" size={17} />
                            </div>

                            <span
                                className="text-xs font-semibold"
                                style={{ color: "#667085" }}
                            >
                                Stock
                            </span>
                        </div>

                        <p
                            className="mt-3 text-xl font-bold"
                            style={{ color: "#101828" }}
                        >
                            {totalStockAvailable}
                        </p>

                        <p className="mt-0.5 text-[11px]" style={{ color: "#98A2B3" }}>
                            Total units
                        </p>
                    </div>

                    <div
                        className="rounded-2xl border bg-white p-4"
                        style={{ borderColor: "#EAECF0" }}
                    >
                        <div className="flex items-center gap-2">
                            <div
                                className="flex h-9 w-9 items-center justify-center rounded-lg"
                                style={{
                                    background: "#FEF3F2",
                                    color: "#B42318",
                                }}
                            >
                                <Icon name="warning" size={17} />
                            </div>

                            <span
                                className="text-xs font-semibold"
                                style={{ color: "#667085" }}
                            >
                                Low Stock
                            </span>
                        </div>

                        <p
                            className="mt-3 text-xl font-bold"
                            style={{ color: "#B42318" }}
                        >
                            {stats?.lowStockProducts ?? lowStockProducts.length}
                        </p>

                        <p className="mt-0.5 text-[11px]" style={{ color: "#98A2B3" }}>
                            Need attention
                        </p>
                    </div>

                    <div
                        className="rounded-2xl border bg-white p-4"
                        style={{ borderColor: "#EAECF0" }}
                    >
                        <div className="flex items-center gap-2">
                            <div
                                className="flex h-9 w-9 items-center justify-center rounded-lg"
                                style={{
                                    background: "#FEF3F2",
                                    color: "#B42318",
                                }}
                            >
                                <Icon name="invoice" size={17} />
                            </div>

                            <span
                                className="text-xs font-semibold"
                                style={{ color: "#667085" }}
                            >
                                Overdue
                            </span>
                        </div>

                        <p
                            className="mt-3 text-xl font-bold"
                            style={{ color: "#B42318" }}
                        >
                            {overdueInvoicesCount}
                        </p>

                        <p className="mt-0.5 text-[11px]" style={{ color: "#98A2B3" }}>
                            Payment delayed
                        </p>
                    </div>

                    <div
                        className="rounded-2xl border bg-white p-4"
                        style={{ borderColor: "#EAECF0" }}
                    >
                        <div className="flex items-center gap-2">
                            <div
                                className="flex h-9 w-9 items-center justify-center rounded-lg"
                                style={{
                                    background: "#EEF4FF",
                                    color: "#155EEF",
                                }}
                            >
                                <Icon name="invoice" size={17} />
                            </div>

                            <span
                                className="text-xs font-semibold"
                                style={{ color: "#667085" }}
                            >
                                Invoices
                            </span>
                        </div>

                        <p
                            className="mt-3 text-xl font-bold"
                            style={{ color: "#101828" }}
                        >
                            {stats?.totalInvoices ?? "—"}
                        </p>

                        <p className="mt-0.5 text-[11px]" style={{ color: "#98A2B3" }}>
                            Total generated
                        </p>
                    </div>
                </div>

                {/* =================================================
            TABS + SEARCH
        ================================================= */}

                <div
                    className="mb-5 rounded-2xl border bg-white p-2 shadow-sm"
                    style={{ borderColor: "#EAECF0" }}
                >
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                        <div className="flex overflow-x-auto">
                            {TABS.map((tab) => {
                                const active = activeTab === tab.id;

                                return (
                                    <button
                                        key={tab.id}
                                        type="button"
                                        onClick={() => {
                                            setActiveTab(tab.id);
                                            setSearch("");
                                        }}
                                        className="flex shrink-0 items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all"
                                        style={{
                                            background: active ? "#101828" : "transparent",
                                            color: active ? "#FFFFFF" : "#667085",
                                        }}
                                    >
                                        <Icon name={tab.icon} size={16} />

                                        {tab.label}
                                    </button>
                                );
                            })}
                        </div>

                        <div className="flex items-center gap-3 px-1 lg:px-0">
                            <div className="relative w-full lg:w-72">
                                <span
                                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2"
                                    style={{ color: "#98A2B3" }}
                                >
                                    <Icon name="search" size={17} />
                                </span>

                                <input
                                    type="text"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder={`Search ${activeTab}...`}
                                    className="w-full rounded-xl border py-2.5 pl-10 pr-4 text-sm outline-none transition focus:ring-2"
                                    style={{
                                        borderColor: "#EAECF0",
                                        color: "#101828",
                                    }}
                                />
                            </div>

                            <span
                                className="hidden whitespace-nowrap text-xs font-semibold sm:block"
                                style={{ color: "#98A2B3" }}
                            >
                                {currentDataCount} results
                            </span>
                        </div>
                    </div>
                </div>

                {/* =================================================
            ERROR
        ================================================= */}

                {error && (
                    <div
                        className="mb-5 flex items-center justify-between gap-4 rounded-2xl border p-4"
                        style={{
                            borderColor: "#FECDCA",
                            background: "#FFFBFA",
                        }}
                    >
                        <div className="flex items-center gap-3">
                            <div
                                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
                                style={{
                                    background: "#FEF3F2",
                                    color: "#B42318",
                                }}
                            >
                                <Icon name="warning" size={17} />
                            </div>

                            <p className="text-sm font-medium" style={{ color: "#B42318" }}>
                                {error}
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={() => fetchAdminData()}
                            className="shrink-0 text-xs font-bold underline"
                            style={{ color: "#B42318" }}
                        >
                            Retry
                        </button>
                    </div>
                )}

                {/* =================================================
            LOADING
        ================================================= */}

                {loading ? (
                    <div
                        className="rounded-2xl border bg-white p-12 text-center"
                        style={{ borderColor: "#EAECF0" }}
                    >
                        <div
                            className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-t-transparent"
                            style={{
                                borderColor: "#D0D5DD",
                                borderTopColor: "#155EEF",
                            }}
                        />

                        <p
                            className="mt-4 text-sm font-medium"
                            style={{ color: "#667085" }}
                        >
                            Dashboard data load ho raha hai...
                        </p>
                    </div>
                ) : (
                    <>
                        {/* =================================================
                USERS
            ================================================= */}

                        {activeTab === "users" && (
                            <>
                                {filteredUsers.length === 0 ? (
                                    <EmptyState text="Koi user nahi mila." />
                                ) : (
                                    <>
                                        <div
                                            className="hidden overflow-hidden rounded-2xl border bg-white shadow-sm md:block"
                                            style={{ borderColor: "#EAECF0" }}
                                        >
                                            <div className="overflow-x-auto">
                                                <table className="w-full min-w-[700px] text-left text-sm">
                                                    <thead>
                                                        <tr
                                                            className="border-b"
                                                            style={{ borderColor: "#EAECF0" }}
                                                        >
                                                            <Th>Name</Th>
                                                            <Th>Email</Th>
                                                            <Th>Role</Th>
                                                            <Th>Joined</Th>
                                                        </tr>
                                                    </thead>

                                                    <tbody>
                                                        {filteredUsers.map((u) => {
                                                            const roleBadge = getRoleBadgeStyle(u.role);

                                                            return (
                                                                <tr
                                                                    key={u._id}
                                                                    className="border-b transition hover:bg-gray-50 last:border-b-0"
                                                                    style={{ borderColor: "#EAECF0" }}
                                                                >
                                                                    <Td bold>
                                                                        <div className="flex items-center gap-3">
                                                                            <div
                                                                                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold"
                                                                                style={{
                                                                                    background: "#EEF4FF",
                                                                                    color: "#155EEF",
                                                                                }}
                                                                            >
                                                                                {(u.name || "U")
                                                                                    .slice(0, 1)
                                                                                    .toUpperCase()}
                                                                            </div>

                                                                            <span>{u.name || "—"}</span>
                                                                        </div>
                                                                    </Td>

                                                                    <Td>{u.email}</Td>

                                                                    <Td>
                                                                        <Badge
                                                                            bg={roleBadge.bg}
                                                                            color={roleBadge.color}
                                                                            dot={roleBadge.dot}
                                                                        >
                                                                            {roleBadge.label}
                                                                        </Badge>
                                                                    </Td>

                                                                    <Td>{formatDate(u.createdAt)}</Td>
                                                                </tr>
                                                            );
                                                        })}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>

                                        <div className="space-y-3 md:hidden">
                                            {filteredUsers.map((u) => {
                                                const roleBadge = getRoleBadgeStyle(u.role);

                                                return (
                                                    <MobileCard key={u._id}>
                                                        <div className="flex items-center gap-3">
                                                            <div
                                                                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full font-bold"
                                                                style={{
                                                                    background: "#EEF4FF",
                                                                    color: "#155EEF",
                                                                }}
                                                            >
                                                                {(u.name || "U")
                                                                    .slice(0, 1)
                                                                    .toUpperCase()}
                                                            </div>

                                                            <div className="min-w-0 flex-1">
                                                                <div
                                                                    className="truncate text-sm font-bold"
                                                                    style={{ color: "#101828" }}
                                                                >
                                                                    {u.name}
                                                                </div>

                                                                <div
                                                                    className="truncate text-xs"
                                                                    style={{ color: "#98A2B3" }}
                                                                >
                                                                    {u.email}
                                                                </div>
                                                            </div>

                                                            <Badge
                                                                bg={roleBadge.bg}
                                                                color={roleBadge.color}
                                                                dot={roleBadge.dot}
                                                            >
                                                                {roleBadge.label}
                                                            </Badge>
                                                        </div>

                                                        <div
                                                            className="mt-3 border-t pt-3 text-xs"
                                                            style={{
                                                                borderColor: "#F2F4F7",
                                                                color: "#667085",
                                                            }}
                                                        >
                                                            Joined {formatDate(u.createdAt)}
                                                        </div>
                                                    </MobileCard>
                                                );
                                            })}
                                        </div>
                                    </>
                                )}
                            </>
                        )}

                        {/* =================================================
                PRODUCTS
            ================================================= */}

                        {activeTab === "products" && (
                            <>
                                {filteredProducts.length === 0 ? (
                                    <EmptyState text="Koi product nahi mila." />
                                ) : (
                                    <>
                                        <div
                                            className="hidden overflow-hidden rounded-2xl border bg-white shadow-sm md:block"
                                            style={{ borderColor: "#EAECF0" }}
                                        >
                                            <div className="overflow-x-auto">
                                                <table className="w-full min-w-[900px] text-left text-sm">
                                                    <thead>
                                                        <tr
                                                            className="border-b"
                                                            style={{ borderColor: "#EAECF0" }}
                                                        >
                                                            <Th>Product</Th>
                                                            <Th>SKU</Th>
                                                            <Th>Category</Th>
                                                            <Th>Price</Th>
                                                            <Th>Stock Level</Th>
                                                        </tr>
                                                    </thead>

                                                    <tbody>
                                                        {filteredProducts.map((p) => {
                                                            const stock = Number(p.stock) || 0;
                                                            const alert = Number(p.lowStockAlert) || 0;

                                                            const low = stock <= alert;

                                                            const percentage =
                                                                alert > 0
                                                                    ? Math.min(
                                                                        100,
                                                                        Math.max(
                                                                            5,
                                                                            (stock / (alert * 3)) * 100
                                                                        )
                                                                    )
                                                                    : 100;

                                                            return (
                                                                <tr
                                                                    key={p._id}
                                                                    className="border-b transition hover:bg-gray-50 last:border-b-0"
                                                                    style={{ borderColor: "#EAECF0" }}
                                                                >
                                                                    <Td bold>
                                                                        <div className="flex items-center gap-3">
                                                                            <div
                                                                                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                                                                                style={{
                                                                                    background: low
                                                                                        ? "#FEF3F2"
                                                                                        : "#F4F3FF",
                                                                                    color: low
                                                                                        ? "#B42318"
                                                                                        : "#6941C6",
                                                                                }}
                                                                            >
                                                                                <Icon name="products" size={18} />
                                                                            </div>

                                                                            <div>
                                                                                <div>{p.name}</div>

                                                                                <div
                                                                                    className="mt-0.5 text-[11px] font-normal"
                                                                                    style={{ color: "#98A2B3" }}
                                                                                >
                                                                                    {p.unit || "unit"}
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </Td>

                                                                    <Td>{p.sku || "—"}</Td>

                                                                    <Td>
                                                                        <span
                                                                            className="rounded-lg px-2.5 py-1 text-xs font-medium"
                                                                            style={{
                                                                                background: "#F2F4F7",
                                                                                color: "#475467",
                                                                            }}
                                                                        >
                                                                            {p.category || "General"}
                                                                        </span>
                                                                    </Td>

                                                                    <Td bold>{formatCurrency(p.price)}</Td>

                                                                    <Td>
                                                                        <div className="w-52">
                                                                            <div className="mb-1.5 flex items-center justify-between">
                                                                                <span
                                                                                    className="text-xs font-semibold"
                                                                                    style={{
                                                                                        color: low
                                                                                            ? "#B42318"
                                                                                            : "#344054",
                                                                                    }}
                                                                                >
                                                                                    {stock} {p.unit || "units"}
                                                                                </span>

                                                                                {low && (
                                                                                    <span
                                                                                        className="text-[10px] font-bold uppercase"
                                                                                        style={{ color: "#B42318" }}
                                                                                    >
                                                                                        Low
                                                                                    </span>
                                                                                )}
                                                                            </div>

                                                                            <div
                                                                                className="h-1.5 overflow-hidden rounded-full"
                                                                                style={{
                                                                                    background: "#EAECF0",
                                                                                }}
                                                                            >
                                                                                <div
                                                                                    className="h-full rounded-full"
                                                                                    style={{
                                                                                        width: `${percentage}%`,
                                                                                        background: low
                                                                                            ? "#F04438"
                                                                                            : "#12B76A",
                                                                                    }}
                                                                                />
                                                                            </div>
                                                                        </div>
                                                                    </Td>
                                                                </tr>
                                                            );
                                                        })}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>

                                        <div className="space-y-3 md:hidden">
                                            {filteredProducts.map((p) => {
                                                const stock = Number(p.stock) || 0;
                                                const alert = Number(p.lowStockAlert) || 0;
                                                const low = stock <= alert;

                                                return (
                                                    <MobileCard key={p._id}>
                                                        <div className="flex items-start gap-3">
                                                            <div
                                                                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                                                                style={{
                                                                    background: low
                                                                        ? "#FEF3F2"
                                                                        : "#F4F3FF",
                                                                    color: low
                                                                        ? "#B42318"
                                                                        : "#6941C6",
                                                                }}
                                                            >
                                                                <Icon name="products" size={18} />
                                                            </div>

                                                            <div className="min-w-0 flex-1">
                                                                <div
                                                                    className="truncate text-sm font-bold"
                                                                    style={{ color: "#101828" }}
                                                                >
                                                                    {p.name}
                                                                </div>

                                                                <div
                                                                    className="mt-1 text-xs"
                                                                    style={{ color: "#98A2B3" }}
                                                                >
                                                                    {p.sku || "No SKU"} ·{" "}
                                                                    {p.category || "General"}
                                                                </div>
                                                            </div>

                                                            <div className="text-right">
                                                                <div
                                                                    className="text-sm font-bold"
                                                                    style={{ color: "#101828" }}
                                                                >
                                                                    {formatCurrency(p.price)}
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="mt-4">
                                                            <div className="mb-1.5 flex justify-between text-xs">
                                                                <span style={{ color: "#667085" }}>
                                                                    Available stock
                                                                </span>

                                                                <span
                                                                    className="font-bold"
                                                                    style={{
                                                                        color: low ? "#B42318" : "#027A48",
                                                                    }}
                                                                >
                                                                    {stock} {p.unit || "units"}
                                                                </span>
                                                            </div>

                                                            <div
                                                                className="h-2 overflow-hidden rounded-full"
                                                                style={{ background: "#EAECF0" }}
                                                            >
                                                                <div
                                                                    className="h-full rounded-full"
                                                                    style={{
                                                                        width: `${Math.min(
                                                                            100,
                                                                            Math.max(
                                                                                5,
                                                                                alert > 0
                                                                                    ? (stock / (alert * 3)) * 100
                                                                                    : 100
                                                                            )
                                                                        )}%`,
                                                                        background: low ? "#F04438" : "#12B76A",
                                                                    }}
                                                                />
                                                            </div>

                                                            {low && (
                                                                <div
                                                                    className="mt-2 flex items-center gap-1 text-[11px] font-semibold"
                                                                    style={{ color: "#B42318" }}
                                                                >
                                                                    <Icon name="warning" size={13} />
                                                                    Stock is running low
                                                                </div>
                                                            )}
                                                        </div>
                                                    </MobileCard>
                                                );
                                            })}
                                        </div>
                                    </>
                                )}
                            </>
                        )}

                        {/* =================================================
                INVOICES
            ================================================= */}

                        {activeTab === "invoices" && (
                            <>
                                {filteredInvoices.length === 0 ? (
                                    <EmptyState text="Koi invoice nahi mila." />
                                ) : (
                                    <>
                                        <div
                                            className="hidden overflow-hidden rounded-2xl border bg-white shadow-sm md:block"
                                            style={{ borderColor: "#EAECF0" }}
                                        >
                                            <div className="overflow-x-auto">
                                                <table className="w-full min-w-[1000px] text-left text-sm">
                                                    <thead>
                                                        <tr
                                                            className="border-b"
                                                            style={{ borderColor: "#EAECF0" }}
                                                        >
                                                            <Th>Invoice</Th>
                                                            <Th>Customer</Th>
                                                            <Th>Date</Th>
                                                            <Th>Amount</Th>
                                                            <Th>Payment</Th>
                                                            <Th>Status</Th>
                                                            <Th>Delay</Th>
                                                        </tr>
                                                    </thead>

                                                    <tbody>
                                                        {filteredInvoices.map((inv) => {
                                                            const status = getStatusStyle(inv.status);
                                                            const delay = getDelayStyle(inv);

                                                            return (
                                                                <tr
                                                                    key={inv._id}
                                                                    className="border-b transition hover:bg-gray-50 last:border-b-0"
                                                                    style={{ borderColor: "#EAECF0" }}
                                                                >
                                                                    <Td bold>
                                                                        <div className="flex items-center gap-2">
                                                                            <div
                                                                                className="flex h-8 w-8 items-center justify-center rounded-lg"
                                                                                style={{
                                                                                    background: "#EEF4FF",
                                                                                    color: "#155EEF",
                                                                                }}
                                                                            >
                                                                                <Icon name="invoice" size={15} />
                                                                            </div>

                                                                            {inv.invoiceNumber}
                                                                        </div>
                                                                    </Td>

                                                                    <Td>
                                                                        {inv.customer?.name || "Walk-in"}
                                                                    </Td>

                                                                    <Td>{formatDate(inv.createdAt)}</Td>

                                                                    <Td bold>
                                                                        {formatCurrency(inv.grandTotal)}
                                                                    </Td>

                                                                    <Td>
                                                                        <span
                                                                            className="capitalize"
                                                                            style={{ color: "#667085" }}
                                                                        >
                                                                            {inv.paymentMethod || "—"}
                                                                        </span>
                                                                    </Td>

                                                                    <Td>
                                                                        <Badge
                                                                            bg={status.bg}
                                                                            color={status.color}
                                                                            dot={status.dot}
                                                                        >
                                                                            {status.label}
                                                                        </Badge>
                                                                    </Td>

                                                                    <Td>
                                                                        <Badge
                                                                            bg={delay.bg}
                                                                            color={delay.color}
                                                                            dot={delay.dot}
                                                                        >
                                                                            {delay.label}
                                                                        </Badge>
                                                                    </Td>
                                                                </tr>
                                                            );
                                                        })}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>

                                        <div className="space-y-3 md:hidden">
                                            {filteredInvoices.map((inv) => {
                                                const status = getStatusStyle(inv.status);
                                                const delay = getDelayStyle(inv);

                                                return (
                                                    <MobileCard key={inv._id}>
                                                        <div className="flex items-start justify-between gap-3">
                                                            <div className="flex min-w-0 items-center gap-3">
                                                                <div
                                                                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                                                                    style={{
                                                                        background: "#EEF4FF",
                                                                        color: "#155EEF",
                                                                    }}
                                                                >
                                                                    <Icon name="invoice" size={18} />
                                                                </div>

                                                                <div className="min-w-0">
                                                                    <div
                                                                        className="truncate text-sm font-bold"
                                                                        style={{ color: "#101828" }}
                                                                    >
                                                                        {inv.invoiceNumber}
                                                                    </div>

                                                                    <div
                                                                        className="mt-1 truncate text-xs"
                                                                        style={{ color: "#98A2B3" }}
                                                                    >
                                                                        {inv.customer?.name || "Walk-in"}
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            <Badge
                                                                bg={status.bg}
                                                                color={status.color}
                                                                dot={status.dot}
                                                            >
                                                                {status.label}
                                                            </Badge>
                                                        </div>

                                                        <div
                                                            className="mt-4 grid grid-cols-2 gap-3 border-t pt-3"
                                                            style={{ borderColor: "#F2F4F7" }}
                                                        >
                                                            <div>
                                                                <p
                                                                    className="text-[10px] font-bold uppercase tracking-wide"
                                                                    style={{ color: "#98A2B3" }}
                                                                >
                                                                    Amount
                                                                </p>

                                                                <p
                                                                    className="mt-1 text-sm font-bold"
                                                                    style={{ color: "#101828" }}
                                                                >
                                                                    {formatCurrency(inv.grandTotal)}
                                                                </p>
                                                            </div>

                                                            <div>
                                                                <p
                                                                    className="text-[10px] font-bold uppercase tracking-wide"
                                                                    style={{ color: "#98A2B3" }}
                                                                >
                                                                    Payment
                                                                </p>

                                                                <p
                                                                    className="mt-1 text-sm capitalize"
                                                                    style={{ color: "#344054" }}
                                                                >
                                                                    {inv.paymentMethod || "—"}
                                                                </p>
                                                            </div>

                                                            <div>
                                                                <p
                                                                    className="text-[10px] font-bold uppercase tracking-wide"
                                                                    style={{ color: "#98A2B3" }}
                                                                >
                                                                    Invoice Date
                                                                </p>

                                                                <p
                                                                    className="mt-1 text-xs"
                                                                    style={{ color: "#667085" }}
                                                                >
                                                                    {formatDate(inv.createdAt)}
                                                                </p>
                                                            </div>

                                                            <div>
                                                                <p
                                                                    className="text-[10px] font-bold uppercase tracking-wide"
                                                                    style={{ color: "#98A2B3" }}
                                                                >
                                                                    Delay
                                                                </p>

                                                                <div className="mt-1">
                                                                    <Badge
                                                                        bg={delay.bg}
                                                                        color={delay.color}
                                                                        dot={delay.dot}
                                                                    >
                                                                        {delay.label}
                                                                    </Badge>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </MobileCard>
                                                );
                                            })}
                                        </div>
                                    </>
                                )}
                            </>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
















// "use client";

// import { useState, useEffect } from "react";
// import api from "@/lib/api";

// function getStatusStyle(status) {
//     const normalized = (status || "").toLowerCase();
//     if (normalized === "paid") return { label: "Paid", bg: "#DCFCE7", color: "#166534" };
//     if (normalized === "due") return { label: "Due", bg: "#FEE2E2", color: "#991B1B" };
//     return { label: status || "—", bg: "#F1F5F9", color: "#475569" };
// }

// function getRoleBadgeStyle(role) {
//     const normalized = (role || "").toLowerCase();
//     if (normalized === "admin") return { label: "Admin", bg: "#FEF3C7", color: "#92400E" };
//     if (normalized === "cashier") return { label: "Cashier", bg: "#DCFCE7", color: "#166534" };
//     return { label: role || "User", bg: "#F1F5F9", color: "#475569" };
// }

// // naya: invoice ki payment delay figure out karne ke liye
// function getDelayStyle(inv) {
//     const status = (inv.status || "").toLowerCase();

//     if (status === "paid") {
//         return { label: "On time", bg: "#DCFCE7", color: "#166534" };
//     }

//     const dueDateRaw = inv.dueDate || inv.due_date;
//     if (!dueDateRaw) return { label: "—", bg: "#F1F5F9", color: "#475569" };

//     const due = new Date(dueDateRaw);
//     if (isNaN(due)) return { label: "—", bg: "#F1F5F9", color: "#475569" };

//     const now = new Date();
//     const diffDays = Math.floor((now - due) / (1000 * 60 * 60 * 24));

//     if (diffDays <= 0) {
//         return { label: "Due soon", bg: "#FEF3C7", color: "#92400E" };
//     }
//     return { label: `${diffDays}d late`, bg: "#FEE2E2", color: "#991B1B" };
// }

// function formatCurrency(amount) {
//     const value = Number(amount) || 0;
//     return `₹${value.toLocaleString("en-IN")}`;
// }

// function formatDate(dateStr) {
//     if (!dateStr) return "—";
//     const d = new Date(dateStr);
//     if (isNaN(d)) return "—";
//     return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
// }

// function StatCard({ label, value, accent }) {
//     return (
//         <div className="rounded-2xl border bg-white p-4 sm:p-5" style={{ borderColor: "#EAECF0" }}>
//             <div className="text-xs font-semibold uppercase tracking-wide" style={{ color: "#98A2B3" }}>
//                 {label}
//             </div>
//             <div className="mt-2 text-xl font-bold sm:text-2xl" style={{ color: accent || "#101828" }}>
//                 {value}
//             </div>
//         </div>
//     );
// }

// const TABS = [
//     { id: "users", label: "Users" },
//     { id: "products", label: "Products" },
//     { id: "invoices", label: "Invoices" },
// ];

// export default function AdminPanelPage() {
//     const [activeTab, setActiveTab] = useState("users");
//     const [stats, setStats] = useState(null);
//     const [users, setUsers] = useState([]);
//     const [products, setProducts] = useState([]);
//     const [invoices, setInvoices] = useState([]);
//     const [search, setSearch] = useState("");
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState("");

//     useEffect(() => {
//         let mounted = true;

//         Promise.all([
//             api.get("/admin/stats"),
//             api.get("/admin/users"),
//             api.get("/admin/products"),
//             api.get("/admin/invoices"),
//         ])
//             .then(([statsRes, usersRes, productsRes, invoicesRes]) => {
//                 if (!mounted) return;
//                 setStats(statsRes.data);
//                 setUsers(usersRes.data);
//                 setProducts(productsRes.data);
//                 setInvoices(invoicesRes.data);
//             })
//             .catch((err) => {
//                 console.error("Admin data fetch error:", err.response?.data || err.message);
//                 if (mounted) setError("Data load nahi ho paya. Please refresh karo ya dubara try karo.");
//             })
//             .finally(() => {
//                 if (mounted) setLoading(false);
//             });

//         return () => {
//             mounted = false;
//         };
//     }, []);

//     const query = search.trim().toLowerCase();

//     const filteredUsers = users.filter(
//         (u) => u.name?.toLowerCase().includes(query) || u.email?.toLowerCase().includes(query)
//     );

//     const filteredProducts = products.filter(
//         (p) =>
//             p.name?.toLowerCase().includes(query) ||
//             p.sku?.toLowerCase().includes(query) ||
//             p.category?.toLowerCase().includes(query)
//     );

//     const filteredInvoices = invoices.filter(
//         (inv) =>
//             inv.invoiceNumber?.toLowerCase().includes(query) ||
//             inv.customer?.name?.toLowerCase().includes(query)
//     );

//     // naya: total stock available sabhi products me
//     const totalStockAvailable = products.reduce((sum, p) => sum + (Number(p.stock) || 0), 0);

//     // naya: kitne invoices overdue (delay) hain
//     const overdueInvoicesCount = invoices.filter((inv) => {
//         const status = (inv.status || "").toLowerCase();
//         if (status === "paid") return false;
//         const dueDateRaw = inv.dueDate || inv.due_date;
//         if (!dueDateRaw) return false;
//         const due = new Date(dueDateRaw);
//         if (isNaN(due)) return false;
//         return new Date() > due;
//     }).length;

//     return (
//         <div className="min-h-screen" style={{ background: "#F9FAFB" }}>
//             <div className="mx-auto max-w-screen-2xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
//                 {/* Header */}
//                 <div className="mb-6 flex flex-col gap-1 sm:mb-8">
//                     <h1 className="text-2xl font-bold sm:text-3xl" style={{ color: "#101828" }}>
//                         Admin Panel
//                     </h1>
//                     <p className="text-sm" style={{ color: "#667085" }}>
//                         Users, products aur invoices.
//                     </p>
//                 </div>

//                 {/* Stats */}
//                 <div className="mb-6 grid grid-cols-2 gap-3 sm:mb-8 sm:gap-4 lg:grid-cols-4 xl:grid-cols-8">
//                     <StatCard label="Total Users" value={stats?.totalUsers ?? "—"} />
//                     <StatCard label="Total Products" value={stats?.totalProducts ?? "—"} />
//                     <StatCard label="Stock Available" value={totalStockAvailable} accent="#166534" />
//                     <StatCard label="Total Invoices" value={stats?.totalInvoices ?? "—"} />
//                     <StatCard label="Low Stock" value={stats?.lowStockProducts ?? "—"} accent="#991B1B" />
//                     <StatCard label="Overdue Invoices" value={overdueInvoicesCount} accent="#991B1B" />
//                     <StatCard label="Revenue (Paid)" value={formatCurrency(stats?.totalRevenue)} accent="#166534" />
//                     <StatCard label="Pending Dues" value={formatCurrency(stats?.totalDue)} accent="#92400E" />
//                 </div>

//                 {/* Tabs */}
//                 <div className="mb-4 flex gap-1 overflow-x-auto rounded-xl border bg-white p-1" style={{ borderColor: "#EAECF0" }}>
//                     {TABS.map((tab) => (
//                         <button
//                             key={tab.id}
//                             type="button"
//                             onClick={() => setActiveTab(tab.id)}
//                             className="rounded-lg px-4 py-2 text-sm font-semibold transition-all duration-150 whitespace-nowrap"
//                             style={{
//                                 background: activeTab === tab.id ? "#101B3D" : "transparent",
//                                 color: activeTab === tab.id ? "#F5A524" : "#667085",
//                             }}
//                         >
//                             {tab.label}
//                         </button>
//                     ))}
//                 </div>

//                 {/* Search */}
//                 <div className="mb-4 sm:mb-5">
//                     <div className="relative max-w-md">
//                         <svg
//                             width="17"
//                             height="17"
//                             viewBox="0 0 24 24"
//                             fill="none"
//                             stroke="currentColor"
//                             strokeWidth="2"
//                             className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2"
//                             style={{ color: "#98A2B3" }}
//                         >
//                             <circle cx="11" cy="11" r="7" />
//                             <path d="m21 21-4.3-4.3" strokeLinecap="round" />
//                         </svg>
//                         <input
//                             type="text"
//                             value={search}
//                             onChange={(e) => setSearch(e.target.value)}
//                             placeholder={`Search ${activeTab}...`}
//                             className="w-full rounded-xl border py-2.5 pl-10 pr-4 text-sm outline-none transition focus:ring-2"
//                             style={{ borderColor: "#EAECF0", color: "#101828" }}
//                         />
//                     </div>
//                 </div>

//                 {error && (
//                     <div className="mb-4 rounded-xl border p-4 text-sm" style={{ borderColor: "#FEE2E2", background: "#FEF2F2", color: "#991B1B" }}>
//                         {error}
//                     </div>
//                 )}

//                 {loading ? (
//                     <div className="rounded-2xl border bg-white p-10 text-center text-sm" style={{ borderColor: "#EAECF0", color: "#98A2B3" }}>
//                         Data load ho raha hai...
//                     </div>
//                 ) : (
//                     <>
//                         {/* ===== USERS TAB ===== */}
//                         {activeTab === "users" && (
//                             <>
//                                 {filteredUsers.length === 0 ? (
//                                     <EmptyState text="Koi user nahi mila." />
//                                 ) : (
//                                     <>
//                                         <div className="hidden overflow-hidden rounded-2xl border bg-white md:block" style={{ borderColor: "#EAECF0" }}>
//                                             <table className="w-full text-left text-sm">
//                                                 <thead>
//                                                     <tr className="border-b" style={{ borderColor: "#EAECF0", background: "#F9FAFB" }}>
//                                                         <Th>Name</Th>
//                                                         <Th>Email</Th>
//                                                         <Th>Role</Th>
//                                                         <Th>Joined</Th>
//                                                     </tr>
//                                                 </thead>
//                                                 <tbody>
//                                                     {filteredUsers.map((u) => {
//                                                         const roleBadge = getRoleBadgeStyle(u.role);
//                                                         return (
//                                                             <tr key={u._id} className="border-b last:border-b-0" style={{ borderColor: "#EAECF0" }}>
//                                                                 <Td bold>{u.name}</Td>
//                                                                 <Td>{u.email}</Td>
//                                                                 <td className="px-5 py-3.5">
//                                                                     <Badge bg={roleBadge.bg} color={roleBadge.color}>{roleBadge.label}</Badge>
//                                                                 </td>
//                                                                 <Td>{formatDate(u.createdAt)}</Td>
//                                                             </tr>
//                                                         );
//                                                     })}
//                                                 </tbody>
//                                             </table>
//                                         </div>

//                                         <div className="space-y-3 md:hidden">
//                                             {filteredUsers.map((u) => {
//                                                 const roleBadge = getRoleBadgeStyle(u.role);
//                                                 return (
//                                                     <MobileCard key={u._id}>
//                                                         <div className="flex items-center justify-between">
//                                                             <div className="min-w-0">
//                                                                 <div className="truncate text-sm font-semibold" style={{ color: "#101828" }}>{u.name}</div>
//                                                                 <div className="truncate text-xs" style={{ color: "#98A2B3" }}>{u.email}</div>
//                                                             </div>
//                                                             <Badge bg={roleBadge.bg} color={roleBadge.color}>{roleBadge.label}</Badge>
//                                                         </div>
//                                                         <div className="mt-2 text-xs" style={{ color: "#667085" }}>Joined: {formatDate(u.createdAt)}</div>
//                                                     </MobileCard>
//                                                 );
//                                             })}
//                                         </div>
//                                     </>
//                                 )}
//                             </>
//                         )}

//                         {/* ===== PRODUCTS TAB ===== */}
//                         {activeTab === "products" && (
//                             <>
//                                 {filteredProducts.length === 0 ? (
//                                     <EmptyState text="Koi product nahi mila." />
//                                 ) : (
//                                     <>
//                                         <div className="hidden overflow-hidden rounded-2xl border bg-white md:block" style={{ borderColor: "#EAECF0" }}>
//                                             <table className="w-full text-left text-sm">
//                                                 <thead>
//                                                     <tr className="border-b" style={{ borderColor: "#EAECF0", background: "#F9FAFB" }}>
//                                                         <Th>Product</Th>
//                                                         <Th>SKU</Th>
//                                                         <Th>Category</Th>
//                                                         <Th>Price</Th>
//                                                         <Th>Stock</Th>
//                                                     </tr>
//                                                 </thead>
//                                                 <tbody>
//                                                     {filteredProducts.map((p) => {
//                                                         const low = p.stock <= p.lowStockAlert;
//                                                         return (
//                                                             <tr key={p._id} className="border-b last:border-b-0" style={{ borderColor: "#EAECF0" }}>
//                                                                 <Td bold>{p.name}</Td>
//                                                                 <Td>{p.sku}</Td>
//                                                                 <Td>{p.category}</Td>
//                                                                 <Td bold>{formatCurrency(p.price)}</Td>
//                                                                 <td className="px-5 py-3.5">
//                                                                     <Badge
//                                                                         bg={low ? "#FEE2E2" : "#DCFCE7"}
//                                                                         color={low ? "#991B1B" : "#166534"}
//                                                                     >
//                                                                         {p.stock} {p.unit}
//                                                                     </Badge>
//                                                                 </td>
//                                                             </tr>
//                                                         );
//                                                     })}
//                                                 </tbody>
//                                             </table>
//                                         </div>

//                                         <div className="space-y-3 md:hidden">
//                                             {filteredProducts.map((p) => {
//                                                 const low = p.stock <= p.lowStockAlert;
//                                                 return (
//                                                     <MobileCard key={p._id}>
//                                                         <div className="flex items-center justify-between">
//                                                             <div className="min-w-0">
//                                                                 <div className="truncate text-sm font-semibold" style={{ color: "#101828" }}>{p.name}</div>
//                                                                 <div className="truncate text-xs" style={{ color: "#98A2B3" }}>{p.sku} · {p.category}</div>
//                                                             </div>
//                                                             <Badge bg={low ? "#FEE2E2" : "#DCFCE7"} color={low ? "#991B1B" : "#166534"}>
//                                                                 {p.stock} {p.unit}
//                                                             </Badge>
//                                                         </div>
//                                                         <div className="mt-2 text-sm font-semibold" style={{ color: "#101828" }}>
//                                                             {formatCurrency(p.price)}
//                                                         </div>
//                                                     </MobileCard>
//                                                 );
//                                             })}
//                                         </div>
//                                     </>
//                                 )}
//                             </>
//                         )}

//                         {/* ===== INVOICES TAB ===== */}
//                         {activeTab === "invoices" && (
//                             <>
//                                 {filteredInvoices.length === 0 ? (
//                                     <EmptyState text="Koi invoice nahi mila." />
//                                 ) : (
//                                     <>
//                                         <div className="hidden overflow-hidden rounded-2xl border bg-white md:block" style={{ borderColor: "#EAECF0" }}>
//                                             <table className="w-full text-left text-sm">
//                                                 <thead>
//                                                     <tr className="border-b" style={{ borderColor: "#EAECF0", background: "#F9FAFB" }}>
//                                                         <Th>Invoice #</Th>
//                                                         <Th>Customer</Th>
//                                                         <Th>Date</Th>
//                                                         <Th>Amount</Th>
//                                                         <Th>Payment</Th>
//                                                         <Th>Status</Th>
//                                                         <Th>Delay</Th>
//                                                     </tr>
//                                                 </thead>
//                                                 <tbody>
//                                                     {filteredInvoices.map((inv) => {
//                                                         const status = getStatusStyle(inv.status);
//                                                         const delay = getDelayStyle(inv);
//                                                         return (
//                                                             <tr key={inv._id} className="border-b last:border-b-0" style={{ borderColor: "#EAECF0" }}>
//                                                                 <Td bold>{inv.invoiceNumber}</Td>
//                                                                 <Td>{inv.customer?.name || "Walk-in"}</Td>
//                                                                 <Td>{formatDate(inv.createdAt)}</Td>
//                                                                 <Td bold>{formatCurrency(inv.grandTotal)}</Td>
//                                                                 <Td className="capitalize">{inv.paymentMethod}</Td>
//                                                                 <td className="px-5 py-3.5">
//                                                                     <Badge bg={status.bg} color={status.color}>{status.label}</Badge>
//                                                                 </td>
//                                                                 <td className="px-5 py-3.5">
//                                                                     <Badge bg={delay.bg} color={delay.color}>{delay.label}</Badge>
//                                                                 </td>
//                                                             </tr>
//                                                         );
//                                                     })}
//                                                 </tbody>
//                                             </table>
//                                         </div>

//                                         <div className="space-y-3 md:hidden">
//                                             {filteredInvoices.map((inv) => {
//                                                 const status = getStatusStyle(inv.status);
//                                                 const delay = getDelayStyle(inv);
//                                                 return (
//                                                     <MobileCard key={inv._id}>
//                                                         <div className="flex items-center justify-between">
//                                                             <div className="min-w-0">
//                                                                 <div className="truncate text-sm font-semibold" style={{ color: "#101828" }}>
//                                                                     {inv.invoiceNumber}
//                                                                 </div>
//                                                                 <div className="truncate text-xs" style={{ color: "#98A2B3" }}>
//                                                                     {inv.customer?.name || "Walk-in"} · {formatDate(inv.createdAt)}
//                                                                 </div>
//                                                             </div>
//                                                             <Badge bg={status.bg} color={status.color}>{status.label}</Badge>
//                                                         </div>
//                                                         <div className="mt-2 flex items-center justify-between">
//                                                             <div className="text-sm font-semibold" style={{ color: "#101828" }}>
//                                                                 {formatCurrency(inv.grandTotal)}
//                                                             </div>
//                                                             <Badge bg={delay.bg} color={delay.color}>{delay.label}</Badge>
//                                                         </div>
//                                                     </MobileCard>
//                                                 );
//                                             })}
//                                         </div>
//                                     </>
//                                 )}
//                             </>
//                         )}
//                     </>
//                 )}
//             </div>
//         </div>
//     );
// }

// // ===== Small shared UI pieces =====

// function Th({ children }) {
//     return (
//         <th className="px-5 py-3 font-semibold" style={{ color: "#667085" }}>
//             {children}
//         </th>
//     );
// }

// function Td({ children, bold, className = "" }) {
//     return (
//         <td
//             className={`px-5 py-3.5 ${className}`}
//             style={{ color: bold ? "#101828" : "#667085", fontWeight: bold ? 600 : 400 }}
//         >
//             {children}
//         </td>
//     );
// }

// function Badge({ bg, color, children }) {
//     return (
//         <span
//             className="inline-block rounded-full px-2.5 py-1 text-xs font-semibold"
//             style={{ background: bg, color }}
//         >
//             {children}
//         </span>
//     );
// }

// function MobileCard({ children }) {
//     return (
//         <div className="rounded-2xl border bg-white p-4" style={{ borderColor: "#EAECF0" }}>
//             {children}
//         </div>
//     );
// }

// function EmptyState({ text }) {
//     return (
//         <div className="rounded-2xl border bg-white p-10 text-center text-sm" style={{ borderColor: "#EAECF0", color: "#98A2B3" }}>
//             {text}
//         </div>
//     );
// }
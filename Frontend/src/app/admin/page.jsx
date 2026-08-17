"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";

function getStatusStyle(status) {
    const normalized = (status || "").toLowerCase();
    if (normalized === "paid") return { label: "Paid", bg: "#DCFCE7", color: "#166534" };
    if (normalized === "due") return { label: "Due", bg: "#FEE2E2", color: "#991B1B" };
    return { label: status || "—", bg: "#F1F5F9", color: "#475569" };
}

function getRoleBadgeStyle(role) {
    const normalized = (role || "").toLowerCase();
    if (normalized === "admin") return { label: "Admin", bg: "#FEF3C7", color: "#92400E" };
    if (normalized === "cashier") return { label: "Cashier", bg: "#DCFCE7", color: "#166534" };
    return { label: role || "User", bg: "#F1F5F9", color: "#475569" };
}

function formatCurrency(amount) {
    const value = Number(amount) || 0;
    return `₹${value.toLocaleString("en-IN")}`;
}

function formatDate(dateStr) {
    if (!dateStr) return "—";
    const d = new Date(dateStr);
    if (isNaN(d)) return "—";
    return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

function StatCard({ label, value, accent }) {
    return (
        <div className="rounded-2xl border bg-white p-4 sm:p-5" style={{ borderColor: "#EAECF0" }}>
            <div className="text-xs font-semibold uppercase tracking-wide" style={{ color: "#98A2B3" }}>
                {label}
            </div>
            <div className="mt-2 text-xl font-bold sm:text-2xl" style={{ color: accent || "#101828" }}>
                {value}
            </div>
        </div>
    );
}

const TABS = [
    { id: "users", label: "Users" },
    { id: "products", label: "Products" },
    { id: "invoices", label: "Invoices" },
];

export default function AdminPanelPage() {
    const [activeTab, setActiveTab] = useState("users");
    const [stats, setStats] = useState(null);
    const [users, setUsers] = useState([]);
    const [products, setProducts] = useState([]);
    const [invoices, setInvoices] = useState([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let mounted = true;

        Promise.all([
            api.get("/admin/stats"),
            api.get("/admin/users"),
            api.get("/admin/products"),
            api.get("/admin/invoices"),
        ])
            .then(([statsRes, usersRes, productsRes, invoicesRes]) => {
                if (!mounted) return;
                setStats(statsRes.data);
                setUsers(usersRes.data);
                setProducts(productsRes.data);
                setInvoices(invoicesRes.data);
            })
            .catch((err) => {
                console.error("Admin data fetch error:", err.response?.data || err.message);
                if (mounted) setError("Data load nahi ho paya. Please refresh karo ya dubara try karo.");
            })
            .finally(() => {
                if (mounted) setLoading(false);
            });

        return () => {
            mounted = false;
        };
    }, []);

    const query = search.trim().toLowerCase();

    const filteredUsers = users.filter(
        (u) => u.name?.toLowerCase().includes(query) || u.email?.toLowerCase().includes(query)
    );

    const filteredProducts = products.filter(
        (p) =>
            p.name?.toLowerCase().includes(query) ||
            p.sku?.toLowerCase().includes(query) ||
            p.category?.toLowerCase().includes(query)
    );

    const filteredInvoices = invoices.filter(
        (inv) =>
            inv.invoiceNumber?.toLowerCase().includes(query) ||
            inv.customer?.name?.toLowerCase().includes(query)
    );

    return (
        <div className="min-h-screen" style={{ background: "#F9FAFB" }}>
            <div className="mx-auto max-w-screen-2xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
                {/* Header */}
                <div className="mb-6 flex flex-col gap-1 sm:mb-8">
                    <h1 className="text-2xl font-bold sm:text-3xl" style={{ color: "#101828" }}>
                        Admin Panel
                    </h1>
                    <p className="text-sm" style={{ color: "#667085" }}>
                        Users, products aur invoices.
                    </p>
                </div>

                {/* Stats */}
                <div className="mb-6 grid grid-cols-2 gap-3 sm:mb-8 sm:gap-4 lg:grid-cols-3 xl:grid-cols-6">
                    <StatCard label="Total Users" value={stats?.totalUsers ?? "—"} />
                    <StatCard label="Total Products" value={stats?.totalProducts ?? "—"} />
                    <StatCard label="Total Invoices" value={stats?.totalInvoices ?? "—"} />
                    <StatCard label="Low Stock" value={stats?.lowStockProducts ?? "—"} accent="#991B1B" />
                    <StatCard label="Revenue (Paid)" value={formatCurrency(stats?.totalRevenue)} accent="#166534" />
                    <StatCard label="Pending Dues" value={formatCurrency(stats?.totalDue)} accent="#92400E" />
                </div>

                {/* Tabs */}
                <div className="mb-4 flex gap-1 overflow-x-auto rounded-xl border bg-white p-1" style={{ borderColor: "#EAECF0" }}>
                    {TABS.map((tab) => (
                        <button
                            key={tab.id}
                            type="button"
                            onClick={() => setActiveTab(tab.id)}
                            className="rounded-lg px-4 py-2 text-sm font-semibold transition-all duration-150 whitespace-nowrap"
                            style={{
                                background: activeTab === tab.id ? "#101B3D" : "transparent",
                                color: activeTab === tab.id ? "#F5A524" : "#667085",
                            }}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Search */}
                <div className="mb-4 sm:mb-5">
                    <div className="relative max-w-md">
                        <svg
                            width="17"
                            height="17"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2"
                            style={{ color: "#98A2B3" }}
                        >
                            <circle cx="11" cy="11" r="7" />
                            <path d="m21 21-4.3-4.3" strokeLinecap="round" />
                        </svg>
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder={`Search ${activeTab}...`}
                            className="w-full rounded-xl border py-2.5 pl-10 pr-4 text-sm outline-none transition focus:ring-2"
                            style={{ borderColor: "#EAECF0", color: "#101828" }}
                        />
                    </div>
                </div>

                {error && (
                    <div className="mb-4 rounded-xl border p-4 text-sm" style={{ borderColor: "#FEE2E2", background: "#FEF2F2", color: "#991B1B" }}>
                        {error}
                    </div>
                )}

                {loading ? (
                    <div className="rounded-2xl border bg-white p-10 text-center text-sm" style={{ borderColor: "#EAECF0", color: "#98A2B3" }}>
                        Data load ho raha hai...
                    </div>
                ) : (
                    <>
                        {/* ===== USERS TAB ===== */}
                        {activeTab === "users" && (
                            <>
                                {filteredUsers.length === 0 ? (
                                    <EmptyState text="Koi user nahi mila." />
                                ) : (
                                    <>
                                        <div className="hidden overflow-hidden rounded-2xl border bg-white md:block" style={{ borderColor: "#EAECF0" }}>
                                            <table className="w-full text-left text-sm">
                                                <thead>
                                                    <tr className="border-b" style={{ borderColor: "#EAECF0", background: "#F9FAFB" }}>
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
                                                            <tr key={u._id} className="border-b last:border-b-0" style={{ borderColor: "#EAECF0" }}>
                                                                <Td bold>{u.name}</Td>
                                                                <Td>{u.email}</Td>
                                                                <td className="px-5 py-3.5">
                                                                    <Badge bg={roleBadge.bg} color={roleBadge.color}>{roleBadge.label}</Badge>
                                                                </td>
                                                                <Td>{formatDate(u.createdAt)}</Td>
                                                            </tr>
                                                        );
                                                    })}
                                                </tbody>
                                            </table>
                                        </div>

                                        <div className="space-y-3 md:hidden">
                                            {filteredUsers.map((u) => {
                                                const roleBadge = getRoleBadgeStyle(u.role);
                                                return (
                                                    <MobileCard key={u._id}>
                                                        <div className="flex items-center justify-between">
                                                            <div className="min-w-0">
                                                                <div className="truncate text-sm font-semibold" style={{ color: "#101828" }}>{u.name}</div>
                                                                <div className="truncate text-xs" style={{ color: "#98A2B3" }}>{u.email}</div>
                                                            </div>
                                                            <Badge bg={roleBadge.bg} color={roleBadge.color}>{roleBadge.label}</Badge>
                                                        </div>
                                                        <div className="mt-2 text-xs" style={{ color: "#667085" }}>Joined: {formatDate(u.createdAt)}</div>
                                                    </MobileCard>
                                                );
                                            })}
                                        </div>
                                    </>
                                )}
                            </>
                        )}

                        {/* ===== PRODUCTS TAB ===== */}
                        {activeTab === "products" && (
                            <>
                                {filteredProducts.length === 0 ? (
                                    <EmptyState text="Koi product nahi mila." />
                                ) : (
                                    <>
                                        <div className="hidden overflow-hidden rounded-2xl border bg-white md:block" style={{ borderColor: "#EAECF0" }}>
                                            <table className="w-full text-left text-sm">
                                                <thead>
                                                    <tr className="border-b" style={{ borderColor: "#EAECF0", background: "#F9FAFB" }}>
                                                        <Th>Product</Th>
                                                        <Th>SKU</Th>
                                                        <Th>Category</Th>
                                                        <Th>Price</Th>
                                                        <Th>Stock</Th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {filteredProducts.map((p) => {
                                                        const low = p.stock <= p.lowStockAlert;
                                                        return (
                                                            <tr key={p._id} className="border-b last:border-b-0" style={{ borderColor: "#EAECF0" }}>
                                                                <Td bold>{p.name}</Td>
                                                                <Td>{p.sku}</Td>
                                                                <Td>{p.category}</Td>
                                                                <Td bold>{formatCurrency(p.price)}</Td>
                                                                <td className="px-5 py-3.5">
                                                                    <Badge
                                                                        bg={low ? "#FEE2E2" : "#DCFCE7"}
                                                                        color={low ? "#991B1B" : "#166534"}
                                                                    >
                                                                        {p.stock} {p.unit}
                                                                    </Badge>
                                                                </td>
                                                            </tr>
                                                        );
                                                    })}
                                                </tbody>
                                            </table>
                                        </div>

                                        <div className="space-y-3 md:hidden">
                                            {filteredProducts.map((p) => {
                                                const low = p.stock <= p.lowStockAlert;
                                                return (
                                                    <MobileCard key={p._id}>
                                                        <div className="flex items-center justify-between">
                                                            <div className="min-w-0">
                                                                <div className="truncate text-sm font-semibold" style={{ color: "#101828" }}>{p.name}</div>
                                                                <div className="truncate text-xs" style={{ color: "#98A2B3" }}>{p.sku} · {p.category}</div>
                                                            </div>
                                                            <Badge bg={low ? "#FEE2E2" : "#DCFCE7"} color={low ? "#991B1B" : "#166534"}>
                                                                {p.stock} {p.unit}
                                                            </Badge>
                                                        </div>
                                                        <div className="mt-2 text-sm font-semibold" style={{ color: "#101828" }}>
                                                            {formatCurrency(p.price)}
                                                        </div>
                                                    </MobileCard>
                                                );
                                            })}
                                        </div>
                                    </>
                                )}
                            </>
                        )}

                        {/* ===== INVOICES TAB ===== */}
                        {activeTab === "invoices" && (
                            <>
                                {filteredInvoices.length === 0 ? (
                                    <EmptyState text="Koi invoice nahi mila." />
                                ) : (
                                    <>
                                        <div className="hidden overflow-hidden rounded-2xl border bg-white md:block" style={{ borderColor: "#EAECF0" }}>
                                            <table className="w-full text-left text-sm">
                                                <thead>
                                                    <tr className="border-b" style={{ borderColor: "#EAECF0", background: "#F9FAFB" }}>
                                                        <Th>Invoice #</Th>
                                                        <Th>Customer</Th>
                                                        <Th>Date</Th>
                                                        <Th>Amount</Th>
                                                        <Th>Payment</Th>
                                                        <Th>Status</Th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {filteredInvoices.map((inv) => {
                                                        const status = getStatusStyle(inv.status);
                                                        return (
                                                            <tr key={inv._id} className="border-b last:border-b-0" style={{ borderColor: "#EAECF0" }}>
                                                                <Td bold>{inv.invoiceNumber}</Td>
                                                                <Td>{inv.customer?.name || "Walk-in"}</Td>
                                                                <Td>{formatDate(inv.createdAt)}</Td>
                                                                <Td bold>{formatCurrency(inv.grandTotal)}</Td>
                                                                <Td className="capitalize">{inv.paymentMethod}</Td>
                                                                <td className="px-5 py-3.5">
                                                                    <Badge bg={status.bg} color={status.color}>{status.label}</Badge>
                                                                </td>
                                                            </tr>
                                                        );
                                                    })}
                                                </tbody>
                                            </table>
                                        </div>

                                        <div className="space-y-3 md:hidden">
                                            {filteredInvoices.map((inv) => {
                                                const status = getStatusStyle(inv.status);
                                                return (
                                                    <MobileCard key={inv._id}>
                                                        <div className="flex items-center justify-between">
                                                            <div className="min-w-0">
                                                                <div className="truncate text-sm font-semibold" style={{ color: "#101828" }}>
                                                                    {inv.invoiceNumber}
                                                                </div>
                                                                <div className="truncate text-xs" style={{ color: "#98A2B3" }}>
                                                                    {inv.customer?.name || "Walk-in"} · {formatDate(inv.createdAt)}
                                                                </div>
                                                            </div>
                                                            <Badge bg={status.bg} color={status.color}>{status.label}</Badge>
                                                        </div>
                                                        <div className="mt-2 text-sm font-semibold" style={{ color: "#101828" }}>
                                                            {formatCurrency(inv.grandTotal)}
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

// ===== Small shared UI pieces =====

function Th({ children }) {
    return (
        <th className="px-5 py-3 font-semibold" style={{ color: "#667085" }}>
            {children}
        </th>
    );
}

function Td({ children, bold, className = "" }) {
    return (
        <td
            className={`px-5 py-3.5 ${className}`}
            style={{ color: bold ? "#101828" : "#667085", fontWeight: bold ? 600 : 400 }}
        >
            {children}
        </td>
    );
}

function Badge({ bg, color, children }) {
    return (
        <span
            className="inline-block rounded-full px-2.5 py-1 text-xs font-semibold"
            style={{ background: bg, color }}
        >
            {children}
        </span>
    );
}

function MobileCard({ children }) {
    return (
        <div className="rounded-2xl border bg-white p-4" style={{ borderColor: "#EAECF0" }}>
            {children}
        </div>
    );
}

function EmptyState({ text }) {
    return (
        <div className="rounded-2xl border bg-white p-10 text-center text-sm" style={{ borderColor: "#EAECF0", color: "#98A2B3" }}>
            {text}
        </div>
    );
}
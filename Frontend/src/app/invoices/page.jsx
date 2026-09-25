"use client";

import { useEffect, useMemo, useState } from "react";
import api from "@/lib/api";
import { toast } from "react-toastify";

// =====================================================
// ICONS
// =====================================================
function EditIcon({ size = 15 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4Z" />
    </svg>
  );
}

function TrashIcon({ size = 15 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 6h18" />
      <path d="M8 6V4h8v2" />
      <path d="M19 6l-1 15H6L5 6" />
      <path d="M10 11v6" />
      <path d="M14 11v6" />
    </svg>
  );
}

function EyeIcon({ size = 15 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  // Modal states
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [editingInvoice, setEditingInvoice] = useState(null);
  const [editForm, setEditForm] = useState({ paymentMethod: "cash", date: "" });
  const [updating, setUpdating] = useState(false);

  // =====================================================
  // FETCH INVOICES + CUSTOMERS
  // =====================================================
  const fetchData = async () => {
    try {
      setLoading(true);
      const [invoiceRes, customerRes] = await Promise.all([
        api.get("/invoices"),
        api.get("/customers"),
      ]);

      setInvoices(Array.isArray(invoiceRes.data) ? invoiceRes.data : []);
      setCustomers(Array.isArray(customerRes.data) ? customerRes.data : []);
    } catch (error) {
      console.error("Invoices error:", error);
      toast.error(error?.response?.data?.message || "Invoices load nahi ho paaye.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // =====================================================
  // CUSTOMER RESOLVER
  // =====================================================
  const getCustomer = (invoice) => {
    if (invoice?.customer && typeof invoice.customer === "object" && invoice.customer._id) {
      return invoice.customer;
    }

    const customerId =
      typeof invoice?.customer === "string"
        ? invoice.customer
        : invoice?.customer?._id || invoice?.customerId || null;

    if (!customerId) return null;

    return customers.find((c) => String(c._id) === String(customerId)) || null;
  };

  const getInitials = (name = "") => {
    const cleanName = String(name).trim();
    if (!cleanName) return "CU";
    const words = cleanName.split(/\s+/);
    if (words.length === 1) return words[0].substring(0, 2).toUpperCase();
    return (words[0].charAt(0) + words[1].charAt(0)).toUpperCase();
  };

  // =====================================================
  // SEARCH FILTER
  // =====================================================
  const filteredInvoices = useMemo(() => {
    const value = search.toLowerCase().trim();
    if (!value) return invoices;

    return invoices.filter((invoice) => {
      const customer = getCustomer(invoice);
      return (
        invoice?.invoiceNumber?.toLowerCase().includes(value) ||
        customer?.name?.toLowerCase().includes(value) ||
        customer?.phone?.toLowerCase().includes(value) ||
        customer?.email?.toLowerCase().includes(value) ||
        invoice?.paymentMethod?.toLowerCase().includes(value)
      );
    });
  }, [invoices, customers, search]);

  // =====================================================
  // STATS
  // =====================================================
  const totalInvoices = invoices.length;
  const totalSales = invoices.reduce((sum, inv) => sum + Number(inv?.grandTotal || 0), 0);
  const cashInvoices = invoices.filter((inv) => inv?.paymentMethod?.toLowerCase() === "cash").length;
  const upiInvoices = invoices.filter((inv) => inv?.paymentMethod?.toLowerCase() === "upi").length;

  const filteredSubtotal = filteredInvoices.reduce((sum, inv) => sum + Number(inv?.subtotal || 0), 0);
  const filteredTax = filteredInvoices.reduce((sum, inv) => sum + Number(inv?.taxTotal || 0), 0);
  const filteredGrandTotal = filteredInvoices.reduce((sum, inv) => sum + Number(inv?.grandTotal || 0), 0);

  const getPaymentStyle = (method) => {
    const payment = method?.toLowerCase();
    if (payment === "cash") return "bg-emerald-50 text-emerald-700 border-emerald-200";
    if (payment === "upi") return "bg-purple-50 text-purple-700 border-purple-200";
    if (payment === "card") return "bg-blue-50 text-blue-700 border-blue-200";
    return "bg-slate-100 text-slate-600 border-slate-200";
  };

  const formatDate = (date) => {
    if (!date) return "-";
    try {
      const parsedDate = new Date(date);
      if (Number.isNaN(parsedDate.getTime())) return "-";
      return parsedDate.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch {
      return "-";
    }
  };

  // =====================================================
  // MODAL ACTIONS
  // =====================================================
  const openInvoice = (invoice) => {
    const customer = getCustomer(invoice);
    setSelectedInvoice({
      ...invoice,
      customer: customer || null,
    });
  };

  const closeInvoice = () => setSelectedInvoice(null);

  // Edit Handlers
  const handleOpenEdit = (invoice) => {
    setEditingInvoice(invoice);
    const existingDate = invoice.createdAt || invoice.date;
    const formattedDate = existingDate ? new Date(existingDate).toISOString().split("T")[0] : "";
    setEditForm({
      paymentMethod: invoice.paymentMethod?.toLowerCase() || "cash",
      date: formattedDate,
    });
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editingInvoice) return;

    try {
      setUpdating(true);
      await api.put(`/invoices/${editingInvoice._id}`, {
        paymentMethod: editForm.paymentMethod,
        date: editForm.date ? new Date(editForm.date) : new Date(),
      });

      toast.success("Invoice updated successfully!");
      setEditingInvoice(null);
      await fetchData();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to update invoice.");
    } finally {
      setUpdating(false);
    }
  };

  // Delete Handler
  const handleDeleteInvoice = async (id, invoiceNumber) => {
    if (!window.confirm(`Are you sure you want to permanently delete invoice ${invoiceNumber || ""}?`)) {
      return;
    }

    try {
      await api.delete(`/invoices/${id}`);
      toast.success(`Invoice ${invoiceNumber || ""} deleted successfully.`);
      if (selectedInvoice?._id === id) setSelectedInvoice(null);
      await fetchData();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to delete invoice.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/70 p-3 sm:p-5 lg:p-6 xl:p-8">
      <div className="mx-auto max-w-[1600px] space-y-4 sm:space-y-6">

        {/* HEADER BAR */}
        <header className="flex flex-col gap-3 rounded-2xl border border-slate-200/90 bg-white p-4 shadow-xs transition-all sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500 ring-4 ring-emerald-50" />
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Sales Ledger
              </span>
            </div>
            <h1 className="mt-1 text-xl font-extrabold tracking-tight text-slate-900 sm:text-2xl lg:text-3xl">
              Invoice History
            </h1>
            <p className="mt-0.5 text-xs text-slate-500 sm:text-sm">
              View, edit, inspect, and manage point-of-sale customer receipts.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center sm:gap-3">
            <div className="rounded-xl border border-slate-200/80 bg-slate-50/70 px-3.5 py-2">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Invoices</p>
              <p className="mt-0.5 text-base sm:text-lg font-black text-slate-900">{totalInvoices}</p>
            </div>
            <div className="rounded-xl border border-slate-200/80 bg-slate-50/70 px-3.5 py-2">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Volume</p>
              <p className="mt-0.5 text-base sm:text-lg font-black text-emerald-600">₹{totalSales.toFixed(2)}</p>
            </div>
            <div className="rounded-xl border border-slate-200/80 bg-slate-50/70 px-3.5 py-2 hidden lg:block">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Cash Txns</p>
              <p className="mt-0.5 text-base font-black text-slate-800">{cashInvoices}</p>
            </div>
            <div className="rounded-xl border border-slate-200/80 bg-slate-50/70 px-3.5 py-2 hidden lg:block">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">UPI Txns</p>
              <p className="mt-0.5 text-base font-black text-purple-600">{upiInvoices}</p>
            </div>
          </div>
        </header>

        {/* SEARCH BAR */}
        <section className="flex flex-col gap-3 rounded-2xl border border-slate-200/90 bg-white p-3.5 sm:p-5 shadow-xs sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-sm sm:text-base font-bold text-slate-900">Recorded Bills</h2>
            <p className="text-xs text-slate-400">Manage receipts or click action buttons to edit and remove.</p>
          </div>

          <div className="flex w-full sm:w-auto items-center gap-2">
            <div className="relative w-full sm:w-80">
              <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                🔍
              </span>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search invoice no, client, phone..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2 pl-9 pr-4 text-xs sm:text-sm font-medium text-slate-900 outline-none transition-all placeholder:text-slate-400 hover:border-slate-300 focus:border-indigo-600 focus:bg-white focus:ring-4 focus:ring-indigo-600/10"
              />
            </div>
            <div className="flex items-center justify-between rounded-xl bg-indigo-50/70 border border-indigo-100 px-3.5 py-2 text-xs font-bold text-indigo-700 shrink-0">
              <span>{filteredInvoices.length} Bills</span>
            </div>
          </div>
        </section>

        {/* 1. DESKTOP VIEW: DATA TABLE */}
        <div className="hidden overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-xs md:block">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[950px] border-collapse text-left text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/75 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="px-4 py-3.5 text-center w-12">#</th>
                  <th className="px-4 py-3.5">Invoice</th>
                  <th className="px-4 py-3.5">Date</th>
                  <th className="px-4 py-3.5">Customer</th>
                  <th className="px-4 py-3.5 text-center">Items</th>
                  <th className="px-4 py-3.5 text-center">Mode</th>
                  <th className="px-4 py-3.5 text-right">Subtotal</th>
                  <th className="px-4 py-3.5 text-right">Tax</th>
                  <th className="px-4 py-3.5 text-right">Total</th>
                  <th className="px-4 py-3.5 text-center">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100 font-medium">
                {loading ? (
                  <tr>
                    <td colSpan={10} className="py-16 text-center text-slate-400">
                      <div className="flex flex-col items-center justify-center">
                        <span className="h-7 w-7 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
                        <span className="mt-2 text-xs font-semibold">Loading invoices...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredInvoices.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="py-14 text-center text-slate-400">
                      <div className="text-3xl">🧾</div>
                      <p className="mt-2 text-sm font-bold text-slate-700">No invoices found</p>
                      <p className="mt-0.5 text-xs text-slate-400">Try modifying your search query.</p>
                    </td>
                  </tr>
                ) : (
                  filteredInvoices.map((invoice, index) => {
                    const customer = getCustomer(invoice);
                    const subtotal = Number(invoice?.subtotal || 0);
                    const tax = Number(invoice?.taxTotal || 0);
                    const grandTotal = Number(invoice?.grandTotal || 0);

                    return (
                      <tr
                        key={invoice?._id || index}
                        className="transition-colors hover:bg-indigo-50/30"
                      >
                        <td className="px-4 py-3.5 text-center font-mono text-xs text-slate-400">
                          {index + 1}
                        </td>

                        <td className="px-4 py-3.5 font-mono text-xs font-bold text-indigo-700">
                          {invoice?.invoiceNumber || "-"}
                        </td>

                        <td className="px-4 py-3.5 text-xs text-slate-600 whitespace-nowrap">
                          {formatDate(invoice?.createdAt || invoice?.date)}
                        </td>

                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-2.5">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-xs font-bold text-indigo-700">
                              {getInitials(customer?.name)}
                            </div>
                            <div className="min-w-0">
                              <p className="max-w-[170px] truncate font-bold text-slate-900 text-xs sm:text-sm">
                                {customer?.name || "Walk-in Customer"}
                              </p>
                              <p className="text-[10px] text-slate-400 font-mono">
                                {customer?.phone || "No phone"}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-4 py-3.5 text-center">
                          <span className="rounded-lg bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-700 font-mono">
                            {invoice?.items?.length || 0}
                          </span>
                        </td>

                        <td className="px-4 py-3.5 text-center">
                          <span
                            className={`rounded-lg border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${getPaymentStyle(
                              invoice?.paymentMethod
                            )}`}
                          >
                            {invoice?.paymentMethod || "N/A"}
                          </span>
                        </td>

                        <td className="px-4 py-3.5 text-right font-medium text-slate-700">
                          ₹{subtotal.toFixed(2)}
                        </td>

                        <td className="px-4 py-3.5 text-right font-medium text-amber-600">
                          ₹{tax.toFixed(2)}
                        </td>

                        <td className="px-4 py-3.5 text-right font-black text-emerald-600">
                          ₹{grandTotal.toFixed(2)}
                        </td>

                        <td className="px-4 py-3.5 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => openInvoice(invoice)}
                              className="rounded-lg border border-slate-200 bg-slate-50 p-1.5 text-slate-700 hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-600 transition-all cursor-pointer active:scale-95"
                              title="View Invoice"
                            >
                              <EyeIcon size={14} />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleOpenEdit(invoice)}
                              className="rounded-lg border border-slate-200 bg-slate-50 p-1.5 text-indigo-600 hover:border-indigo-400 hover:bg-indigo-100 transition-all cursor-pointer active:scale-95"
                              title="Edit Mode/Date"
                            >
                              <EditIcon size={14} />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteInvoice(invoice._id, invoice.invoiceNumber)}
                              className="rounded-lg border border-red-200 bg-red-50/70 p-1.5 text-red-600 hover:bg-red-500 hover:text-white transition-all cursor-pointer active:scale-95"
                              title="Delete Record"
                            >
                              <TrashIcon size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>

              {!loading && filteredInvoices.length > 0 && (
                <tfoot>
                  <tr className="border-t-2 border-slate-200 bg-slate-50/80 font-bold text-xs sm:text-sm">
                    <td colSpan={6} className="px-4 py-3.5 text-right uppercase tracking-wider text-slate-500">
                      Summary Total:
                    </td>
                    <td className="px-4 py-3.5 text-right text-slate-800">₹{filteredSubtotal.toFixed(2)}</td>
                    <td className="px-4 py-3.5 text-right text-amber-600">₹{filteredTax.toFixed(2)}</td>
                    <td className="px-4 py-3.5 text-right text-emerald-700 bg-emerald-50">₹{filteredGrandTotal.toFixed(2)}</td>
                    <td />
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </div>

        {/* 2. MOBILE VIEW: RESPONSIVE STACKED CARDS */}
        <div className="space-y-3 md:hidden">
          {loading ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-slate-400">
              <span className="mx-auto block h-6 w-6 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
              <p className="mt-2 text-xs font-semibold">Loading invoices...</p>
            </div>
          ) : filteredInvoices.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-400">
              <div className="text-3xl">🧾</div>
              <p className="mt-2 text-sm font-bold text-slate-700">No invoices available</p>
            </div>
          ) : (
            filteredInvoices.map((invoice) => {
              const customer = getCustomer(invoice);
              const grandTotal = Number(invoice?.grandTotal || 0);

              return (
                <div
                  key={invoice._id}
                  className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-xs space-y-3 transition-all"
                >
                  <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-2.5">
                    <div>
                      <p className="font-mono text-xs font-extrabold text-indigo-700">
                        {invoice?.invoiceNumber || "-"}
                      </p>
                      <p className="text-[11px] text-slate-400 font-medium">
                        {formatDate(invoice?.createdAt || invoice?.date)}
                      </p>
                    </div>

                    <span
                      className={`rounded-lg border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${getPaymentStyle(
                        invoice?.paymentMethod
                      )}`}
                    >
                      {invoice?.paymentMethod || "N/A"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <div>
                      <p className="font-bold text-slate-900 text-sm">{customer?.name || "Walk-in Customer"}</p>
                      <p className="text-[11px] text-slate-400 font-mono">{customer?.phone || "No phone"}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-slate-400 uppercase font-bold">Total</p>
                      <p className="text-base font-black text-emerald-600">₹{grandTotal.toFixed(2)}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t border-slate-100 pt-2.5">
                    <span className="text-xs text-slate-500 font-semibold">
                      {invoice?.items?.length || 0} Products
                    </span>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => openInvoice(invoice)}
                        className="rounded-lg border border-slate-200 px-3 py-1 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
                      >
                        View
                      </button>
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(invoice)}
                        className="rounded-lg border border-indigo-200 px-3 py-1 text-xs font-bold text-indigo-600 hover:bg-indigo-50 cursor-pointer"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteInvoice(invoice._id, invoice.invoiceNumber)}
                        className="rounded-lg border border-red-200 px-3 py-1 text-xs font-bold text-red-600 hover:bg-red-50 cursor-pointer"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* FOOTER */}
        <footer className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between text-[11px] text-slate-400 gap-1 pb-4">
          <span>Invoices & Receipt Settlement Center</span>
          <span>{invoices.length} total database records</span>
        </footer>
      </div>

      {/* =====================================================
          1. INVOICE VIEW DETAIL MODAL
      ===================================================== */}
      {selectedInvoice && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-3 sm:p-5 backdrop-blur-xs transition-all duration-200"
          onClick={closeInvoice}
        >
          <div
            className="max-h-[92vh] w-full max-w-4xl overflow-hidden rounded-2xl sm:rounded-3xl bg-white shadow-2xl border border-slate-100 flex flex-col animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-200 bg-white px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-lg text-white shadow-xs">
                  🧾
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-slate-900">
                    Receipt Details
                  </h2>
                  <p className="font-mono text-xs font-bold text-indigo-600">
                    {selectedInvoice.invoiceNumber || "-"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    closeInvoice();
                    handleOpenEdit(selectedInvoice);
                  }}
                  className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-100 cursor-pointer"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleDeleteInvoice(selectedInvoice._id, selectedInvoice.invoiceNumber);
                  }}
                  className="rounded-xl border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-bold text-red-600 hover:bg-red-500 hover:text-white cursor-pointer"
                >
                  Delete
                </button>
                <button
                  type="button"
                  onClick={closeInvoice}
                  className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 cursor-pointer"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Modal Scroll Body */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
              {/* Customer Box */}
              <div className="rounded-2xl border border-slate-200/80 bg-slate-50/70 p-4 sm:p-5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                  Customer Profile
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs sm:text-sm">
                  <div>
                    <span className="text-slate-400 text-[11px] block">Name</span>
                    <strong className="text-slate-900 font-bold">{selectedInvoice.customer?.name || "Walk-in Customer"}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[11px] block">Phone</span>
                    <strong className="text-slate-900 font-mono">{selectedInvoice.customer?.phone || "N/A"}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[11px] block">Email</span>
                    <strong className="text-slate-900 truncate block">{selectedInvoice.customer?.email || "N/A"}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[11px] block">Location</span>
                    <strong className="text-slate-900">{selectedInvoice.customer?.address || "N/A"}</strong>
                  </div>
                </div>
              </div>

              {/* Items List */}
              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                <div className="border-b border-slate-100 bg-slate-50 px-4 py-2.5">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Items Purchased</h4>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs sm:text-sm text-left">
                    <thead className="bg-slate-50/60 text-slate-400 text-[10px] uppercase font-bold border-b border-slate-100">
                      <tr>
                        <th className="px-4 py-2.5">#</th>
                        <th className="px-4 py-2.5">Description</th>
                        <th className="px-4 py-2.5 text-center">Qty</th>
                        <th className="px-4 py-2.5 text-right">Price</th>
                        <th className="px-4 py-2.5 text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {selectedInvoice.items?.map((item, idx) => {
                        const price = Number(item?.price || item?.product?.price || 0);
                        const qty = Number(item?.qty || 1);
                        return (
                          <tr key={idx}>
                            <td className="px-4 py-2.5 text-slate-400 font-mono">{idx + 1}</td>
                            <td className="px-4 py-2.5 font-bold text-slate-800">{item?.name || item?.product?.name || "Appliance"}</td>
                            <td className="px-4 py-2.5 text-center">{qty}</td>
                            <td className="px-4 py-2.5 text-right">₹{price.toFixed(2)}</td>
                            <td className="px-4 py-2.5 text-right font-bold text-slate-900">₹{(price * qty).toFixed(2)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Financial Computation */}
              <div className="ml-auto w-full max-w-sm rounded-2xl border border-slate-200/80 bg-slate-50/70 p-4 space-y-2 text-xs sm:text-sm">
                <div className="flex justify-between text-slate-500">
                  <span>Subtotal</span>
                  <span className="font-semibold text-slate-800">₹{Number(selectedInvoice.subtotal || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Tax Amount</span>
                  <span className="font-semibold text-amber-600">₹{Number(selectedInvoice.taxTotal || 0).toFixed(2)}</span>
                </div>
                <div className="border-t border-slate-200 pt-2 flex justify-between items-center text-sm font-bold text-slate-900">
                  <span>Grand Total</span>
                  <span className="text-base sm:text-lg font-black text-emerald-600">₹{Number(selectedInvoice.grandTotal || 0).toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Modal Bottom Footer */}
            <div className="border-t border-slate-100 bg-slate-50 px-5 py-3 flex justify-end">
              <button
                type="button"
                onClick={closeInvoice}
                className="rounded-xl bg-slate-900 px-6 py-2 text-xs sm:text-sm font-bold text-white hover:bg-slate-800 cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================
          2. INVOICE EDIT MODAL
      ===================================================== */}
      {editingInvoice && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-3 sm:p-5 backdrop-blur-xs transition-all duration-200"
          onClick={() => setEditingInvoice(null)}
        >
          <div
            className="w-full max-w-md overflow-hidden rounded-2xl sm:rounded-3xl bg-white shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-200 bg-white px-5 py-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">Edit Invoice Parameters</h3>
                <p className="text-xs text-indigo-600 font-mono font-bold">{editingInvoice.invoiceNumber}</p>
              </div>
              <button
                type="button"
                onClick={() => setEditingInvoice(null)}
                className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="p-5 space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-600">
                  Payment Mode
                </label>
                <select
                  value={editForm.paymentMethod}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, paymentMethod: e.target.value }))}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs sm:text-sm font-bold text-slate-800 outline-none focus:border-indigo-600 focus:bg-white"
                >
                  <option value="cash">Cash (💵)</option>
                  <option value="upi">UPI (📱)</option>
                  <option value="card">Card (💳)</option>
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-600">
                  Billing Date
                </label>
                <input
                  type="date"
                  value={editForm.date}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, date: e.target.value }))}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs sm:text-sm font-bold text-slate-800 outline-none focus:border-indigo-600 focus:bg-white"
                />
              </div>

              <div className="border-t border-slate-100 pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingInvoice(null)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="rounded-xl bg-indigo-600 px-5 py-2 text-xs font-bold text-white hover:bg-indigo-700 disabled:opacity-60 cursor-pointer"
                >
                  {updating ? "Saving..." : "Update Invoice"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { toast } from "react-toastify";

const emptyForm = {
  name: "",
  phone: "",
  email: "",
  address: "",
};

// ========================================
// HELPERS
// ========================================
const getInitials = (name = "") => {
  const cleanName = String(name).trim();
  if (!cleanName) return "CU";
  const words = cleanName.split(/\s+/);
  if (words.length === 1) {
    return words[0].substring(0, 2).toUpperCase();
  }
  return (words[0].charAt(0) + words[1].charAt(0)).toUpperCase();
};

const formatCurrency = (amount) => {
  return `₹${Number(amount || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

// ========================================
// ICONS
// ========================================
function UsersIcon({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function UserPlusIcon({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M15 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="8" cy="7" r="4" />
      <path d="M19 8v6" />
      <path d="M22 11h-6" />
    </svg>
  );
}

function SearchIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-4-4" />
    </svg>
  );
}

function PhoneIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.12.9.33 1.78.62 2.63a2 2 0 0 1-.45 2.11L8 9.73a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.85.29 1.73.5 2.63.62A2 2 0 0 1 22 16.92z" />
    </svg>
  );
}

function MailIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3 7 9 6 9-6" />
    </svg>
  );
}

function MapPinIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  );
}

function ArrowRightIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M5 12h14" />
      <path d="m13 6 6 6-6 6" />
    </svg>
  );
}

function PlusIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 5v14" />
      <path d="M5 12h14" />
    </svg>
  );
}

function EyeIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function CloseIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}

// ========================================
// STAT CARD
// ========================================
function StatCard({ title, value, subtitle, icon, iconBg, iconColor }) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-4 sm:p-5 shadow-xs transition-all duration-300 hover:-translate-y-0.5 hover:border-indigo-300 hover:shadow-md">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-400">
            {title}
          </p>
          <p className="mt-1 text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900">
            {value}
          </p>
          {subtitle && (
            <p className="mt-0.5 text-[11px] text-slate-400 font-medium">
              {subtitle}
            </p>
          )}
        </div>

        <div
          className="flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-105"
          style={{ background: iconBg, color: iconColor }}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}

// ========================================
// INPUT FIELD
// ========================================
function InputField({
  label,
  name,
  value,
  onChange,
  placeholder,
  icon,
  type = "text",
  required = false,
}) {
  return (
    <div className="w-full">
      <label className="mb-1.5 block text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-600">
        {label}
        {required && <span className="ml-1 text-red-500">*</span>}
      </label>

      <div className="relative">
        <div className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
          {icon}
        </div>

        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pl-10 pr-3.5 text-xs sm:text-sm font-semibold text-slate-800 outline-none transition-all placeholder:text-slate-400 placeholder:font-normal hover:border-slate-300 focus:border-indigo-600 focus:bg-white focus:ring-4 focus:ring-indigo-600/10"
        />
      </div>
    </div>
  );
}

// ========================================
// CUSTOMER CARD (MOBILE VIEW)
// ========================================
function CustomerMobileCard({ customer, index, onSelect, onView }) {
  return (
    <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-xs transition-all duration-200 hover:border-indigo-300 hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <button
          type="button"
          onClick={() => onView(customer)}
          className="flex min-w-0 items-center gap-3 text-left cursor-pointer group"
        >
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-sm font-bold text-white shadow-xs transition-transform group-hover:scale-105">
            {getInitials(customer.name)}
          </div>

          <div className="min-w-0">
            <p className="truncate font-bold text-slate-900 group-hover:text-indigo-600 transition-colors text-sm">
              {customer.name || "Unknown Customer"}
            </p>
            <p className="text-[11px] text-slate-400 font-medium">
              ID #{index + 1}
            </p>
          </div>
        </button>

        <span className="shrink-0 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-600 border border-emerald-200/60">
          Active
        </span>
      </div>

      <div className="mt-3.5 grid grid-cols-1 gap-2 border-t border-slate-100 pt-3 text-xs text-slate-600">
        <div className="flex items-center gap-2">
          <span className="text-slate-400"><PhoneIcon size={14} /></span>
          <span className="font-mono font-medium">{customer.phone || "No phone"}</span>
        </div>

        <div className="flex items-center gap-2 truncate">
          <span className="text-slate-400"><MailIcon size={14} /></span>
          <span className="truncate">{customer.email || "No email"}</span>
        </div>

        <div className="flex items-center gap-2 truncate">
          <span className="text-slate-400"><MapPinIcon size={14} /></span>
          <span className="truncate">{customer.address || "No address"}</span>
        </div>
      </div>

      <div className="mt-3.5 flex items-center justify-between border-t border-slate-100 pt-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Purchases
          </p>
          <p className="text-sm font-black text-emerald-600">
            {formatCurrency(customer.totalPurchases)}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onView(customer)}
            className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-700 transition hover:bg-slate-100 cursor-pointer active:scale-95"
            title="View Details"
          >
            <EyeIcon size={13} />
            <span>Details</span>
          </button>

          <button
            type="button"
            onClick={() => onSelect(customer)}
            className="inline-flex items-center gap-1 rounded-xl bg-indigo-600 px-3 py-1.5 text-xs font-bold text-white shadow-xs transition hover:bg-indigo-700 cursor-pointer active:scale-95"
          >
            <span>Bill</span>
            <ArrowRightIcon size={12} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ========================================
// MAIN COMPONENT
// ========================================
export default function CustomersPage() {
  const router = useRouter();

  const [customers, setCustomers] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Center Modal Popup State
  const [activeCustomerView, setActiveCustomerView] = useState(null);

  // Close on ESC key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setActiveCustomerView(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const res = await api.get("/customers");
      setCustomers(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error("Customers fetch error:", error.response?.data || error.message);
      toast.error(error.response?.data?.message || "Customers load nahi ho paaye.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name.trim()) {
      toast.error("Customer name required hai.");
      return;
    }
    if (!form.phone.trim()) {
      toast.error("Phone number required hai.");
      return;
    }

    try {
      setSaving(true);
      await api.post("/customers", {
        name: form.name.trim(),
        phone: form.phone.trim(),
        email: form.email.trim(),
        address: form.address.trim(),
      });

      setForm(emptyForm);
      await fetchCustomers();
      toast.success("Customer added successfully.");
    } catch (error) {
      console.error("Customer save error:", error.response?.data || error.message);
      toast.error(error.response?.data?.message || "Customer save failed.");
    } finally {
      setSaving(false);
    }
  };

  const selectCustomer = (customer) => {
    if (typeof window !== "undefined") {
      sessionStorage.setItem("selectedCustomer", JSON.stringify(customer));
    }
    router.push("/billing");
  };

  const handleOpenCustomerDetail = (customer) => {
    setActiveCustomerView(customer);
  };

  const filteredCustomers = useMemo(() => {
    const searchText = search.toLowerCase().trim();
    if (!searchText) return customers;

    return customers.filter((customer) => {
      return (
        customer.name?.toLowerCase().includes(searchText) ||
        customer.phone?.toLowerCase().includes(searchText) ||
        customer.email?.toLowerCase().includes(searchText) ||
        customer.address?.toLowerCase().includes(searchText)
      );
    });
  }, [customers, search]);

  const totalCustomers = customers.length;
  const totalBusiness = customers.reduce(
    (sum, customer) => sum + Number(customer.totalPurchases || 0),
    0
  );
  const averagePurchase = totalCustomers > 0 ? totalBusiness / totalCustomers : 0;

  return (
    <div className="min-h-screen bg-slate-50/70 p-3 sm:p-5 lg:p-6 xl:p-8">
      <div className="mx-auto max-w-[1600px] space-y-4 sm:space-y-6">

        {/* HERO BANNER */}
        <header className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-[#0e1726] p-4 sm:p-6 lg:p-7 shadow-lg text-white">
          <div className="absolute -right-12 -top-12 h-44 w-44 rounded-full bg-indigo-500/20 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-16 left-1/4 h-44 w-44 rounded-full bg-violet-500/10 blur-3xl pointer-events-none" />

          <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3.5 sm:gap-4">
              <div className="flex h-12 w-12 sm:h-14 sm:w-14 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-indigo-300 ring-1 ring-white/15 backdrop-blur">
                <UsersIcon size={26} />
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight text-white">
                    Customers
                  </h1>
                  <span className="rounded-full bg-emerald-400/20 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-300 border border-emerald-400/30">
                    CRM Master
                  </span>
                </div>
                <p className="mt-0.5 text-xs sm:text-sm text-slate-300">
                  Manage client directories, billing history and profiles.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              <div className="rounded-xl border border-white/10 bg-white/5 px-3.5 py-2 text-center backdrop-blur">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Total Records
                </p>
                <p className="text-base sm:text-lg font-black text-white">
                  {totalCustomers}
                </p>
              </div>

              <div className="rounded-xl border border-white/10 bg-white/5 px-3.5 py-2 text-center backdrop-blur">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Total Turnover
                </p>
                <p className="text-base sm:text-lg font-black text-emerald-400">
                  {formatCurrency(totalBusiness)}
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* STATS OVERVIEW */}
        <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <StatCard
            title="Total Clients"
            value={totalCustomers}
            subtitle="Registered active customers"
            icon={<UsersIcon size={20} />}
            iconBg="#EEF2FF"
            iconColor="#4F46E5"
          />
          <StatCard
            title="Total Invoiced"
            value={formatCurrency(totalBusiness)}
            subtitle="Aggregated customer turnover"
            icon={<span className="text-base font-bold">₹</span>}
            iconBg="#ECFDF5"
            iconColor="#059669"
          />
          <StatCard
            title="Avg Purchase Value"
            value={formatCurrency(averagePurchase)}
            subtitle="Mean sales ticket per client"
            icon={<span className="text-base font-bold">📈</span>}
            iconBg="#FFF7ED"
            iconColor="#EA580C"
          />
        </section>

        {/* ADD CUSTOMER FORM CARD */}
        <section className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-xs">
          <div className="border-b border-slate-100 bg-slate-50/50 px-4 py-3.5 sm:px-6">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-700">
                <UserPlusIcon size={18} />
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-bold text-slate-900">
                  Register New Customer
                </h2>
                <p className="text-[11px] sm:text-xs text-slate-400">
                  Add client records for instant point-of-sale invoicing.
                </p>
              </div>
            </div>
          </div>

          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-2 sm:gap-4 sm:p-6 xl:grid-cols-4"
          >
            <InputField
              label="Full Name"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="e.g. Arvind Kumar"
              icon={<UsersIcon size={15} />}
              required
            />

            <InputField
              label="Phone Number"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              placeholder="e.g. +91 98765 43210"
              icon={<PhoneIcon size={15} />}
              required
            />

            <InputField
              label="Email Address"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="customer@email.com"
              icon={<MailIcon size={15} />}
            />

            <InputField
              label="Address / Location"
              name="address"
              value={form.address}
              onChange={handleChange}
              placeholder="Street or City location"
              icon={<MapPinIcon size={15} />}
            />

            <div className="sm:col-span-2 xl:col-span-4 pt-1">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-2.5 text-xs sm:text-sm font-bold text-white shadow-xs transition-all hover:bg-indigo-700 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
              >
                {saving ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    <span>Saving Profile...</span>
                  </>
                ) : (
                  <>
                    <PlusIcon size={16} />
                    <span>Add Customer</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </section>

        {/* DIRECTORY FILTER & SEARCH HEADER */}
        <section className="flex flex-col gap-3 rounded-2xl border border-slate-200/90 bg-white p-3.5 sm:p-5 shadow-xs sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-sm sm:text-base font-bold text-slate-900">
              Customer Directory
            </h2>
            <p className="text-xs text-slate-400">
              Click any customer to view details in popup or start billing.
            </p>
          </div>

          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
            <div className="relative w-full sm:w-80">
              <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                <SearchIcon size={15} />
              </div>

              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search name, phone, address..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2 pl-9 pr-4 text-xs sm:text-sm font-medium text-slate-900 outline-none transition-all placeholder:text-slate-400 hover:border-slate-300 focus:border-indigo-600 focus:bg-white focus:ring-4 focus:ring-indigo-600/10"
              />
            </div>

            <div className="flex items-center justify-between sm:justify-center rounded-xl bg-indigo-50/70 border border-indigo-100 px-3.5 py-2 text-xs font-bold text-indigo-700 shrink-0">
              <span>Results</span>
              <span className="ml-2 font-black">{filteredCustomers.length}</span>
            </div>
          </div>
        </section>

        {/* CUSTOMER DATA CONTAINER */}
        {loading ? (
          <div className="rounded-2xl border border-slate-200/90 bg-white p-14 text-center shadow-xs">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-3 border-indigo-600 border-t-transparent" />
            <p className="mt-3 text-xs sm:text-sm font-bold text-slate-700">
              Loading customers...
            </p>
            <p className="text-xs text-slate-400">Please wait while data is synced.</p>
          </div>
        ) : filteredCustomers.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-5 py-14 text-center shadow-xs">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 text-2xl">
              👥
            </div>
            <h3 className="mt-3 text-sm sm:text-base font-bold text-slate-800">
              No customers found
            </h3>
            <p className="mx-auto mt-1 max-w-sm text-xs text-slate-400">
              {search
                ? "Try searching with another name, phone number or address."
                : "Add your first client using the form above."}
            </p>
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="mt-3.5 rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-1.5 text-xs font-bold text-indigo-700 hover:bg-indigo-100 cursor-pointer active:scale-95"
              >
                Clear Filter
              </button>
            )}
          </div>
        ) : (
          <>
            {/* 1. DESKTOP VIEW: DATA TABLE */}
            <div className="hidden overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-xs md:block">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[950px] border-collapse text-left text-xs sm:text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50/75 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      <th className="w-12 px-4 py-3.5 text-center">#</th>
                      <th className="px-4 py-3.5">Customer Profile</th>
                      <th className="px-4 py-3.5">Contact Details</th>
                      <th className="px-4 py-3.5">Registered Address</th>
                      <th className="px-4 py-3.5 text-right">Lifetime Business</th>
                      <th className="px-4 py-3.5 text-center">Actions</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100 font-medium">
                    {filteredCustomers.map((customer, index) => (
                      <tr
                        key={customer._id}
                        onClick={() => handleOpenCustomerDetail(customer)}
                        className="group transition-colors hover:bg-indigo-50/40 cursor-pointer"
                      >
                        <td className="px-4 py-3.5 text-center font-mono text-xs text-slate-400">
                          {String(index + 1).padStart(2, "0")}
                        </td>

                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-xs font-bold text-white shadow-xs transition-transform group-hover:scale-105">
                              {getInitials(customer.name)}
                            </div>
                            <div className="min-w-0">
                              <p className="max-w-[200px] truncate font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                                {customer.name || "Unknown Customer"}
                              </p>
                              <p className="text-[10px] text-slate-400 font-medium">Verified Customer</p>
                            </div>
                          </div>
                        </td>

                        <td className="px-4 py-3.5 text-xs text-slate-600">
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5 font-mono font-medium">
                              <PhoneIcon size={12} className="text-slate-400" />
                              <span>{customer.phone || "No phone"}</span>
                            </div>
                            <div className="flex items-center gap-1.5 truncate max-w-[200px] text-slate-400">
                              <MailIcon size={12} />
                              <span className="truncate">{customer.email || "No email"}</span>
                            </div>
                          </div>
                        </td>

                        <td className="px-4 py-3.5 text-xs text-slate-600 max-w-[220px]">
                          <div className="flex items-center gap-1.5 truncate">
                            <MapPinIcon size={13} className="text-slate-400 shrink-0" />
                            <span className="truncate">{customer.address || "No address"}</span>
                          </div>
                        </td>

                        <td className="px-4 py-3.5 text-right">
                          <div className="inline-flex flex-col items-end">
                            <span className="font-extrabold text-emerald-600">
                              {formatCurrency(customer.totalPurchases)}
                            </span>
                            <span className="text-[10px] text-slate-400 font-medium">Recorded</span>
                          </div>
                        </td>

                        <td className="px-4 py-3.5 text-center" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleOpenCustomerDetail(customer)}
                              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-bold text-slate-700 hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-600 transition-all cursor-pointer active:scale-95"
                              title="Inspect Customer"
                            >
                              <EyeIcon size={13} />
                              <span>View</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => selectCustomer(customer)}
                              className="inline-flex items-center gap-1 rounded-lg bg-indigo-600 px-2.5 py-1 text-xs font-bold text-white shadow-2xs hover:bg-indigo-700 transition-all cursor-pointer active:scale-95"
                              title="Create Invoice"
                            >
                              <span>Bill</span>
                              <ArrowRightIcon size={12} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/50 px-5 py-3 text-[11px] text-slate-400">
                <span>
                  Showing <strong className="text-slate-600 font-bold">{filteredCustomers.length}</strong> of {customers.length} total customers
                </span>
                <span>Click any row for popup details</span>
              </div>
            </div>

            {/* 2. MOBILE VIEW: RESPONSIVE CARDS */}
            <div className="space-y-3 md:hidden">
              {filteredCustomers.map((customer, index) => (
                <CustomerMobileCard
                  key={customer._id}
                  customer={customer}
                  index={index}
                  onSelect={selectCustomer}
                  onView={handleOpenCustomerDetail}
                />
              ))}
            </div>
          </>
        )}

        {/* FOOTER */}
        <footer className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between text-[11px] text-slate-400 gap-1 pb-4">
          <span>Customer Relationship & Billing Directory</span>
          <span>{customers.length} total active database entries</span>
        </footer>
      </div>

      {/* ========================================
          CENTER POPUP MODAL (DETAILED VIEW)
      ======================================== */}
      {activeCustomerView && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/50 backdrop-blur-sm transition-all duration-200">

          {/* Backdrop Click Closes Modal */}
          <div
            className="fixed inset-0 cursor-pointer"
            onClick={() => setActiveCustomerView(null)}
          />

          {/* Modal Card */}
          <div className="relative z-10 w-full max-w-lg overflow-hidden rounded-2xl sm:rounded-3xl bg-white shadow-2xl border border-slate-100 transition-all transform animate-in fade-in zoom-in-95 duration-200">

            {/* Modal Top Header */}
            <div className="relative bg-gradient-to-r from-slate-900 to-[#101B3D] p-5 sm:p-6 text-white">
              <button
                type="button"
                onClick={() => setActiveCustomerView(null)}
                className="absolute right-4 top-4 rounded-xl bg-white/10 p-2 text-slate-300 hover:bg-white/20 hover:text-white transition-colors cursor-pointer"
                title="Close (Esc)"
              >
                <CloseIcon size={16} />
              </button>

              <div className="flex items-center gap-3.5">
                <div className="flex h-12 w-12 sm:h-14 sm:w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-base sm:text-lg font-bold text-white shadow-md ring-2 ring-white/20">
                  {getInitials(activeCustomerView.name)}
                </div>

                <div className="min-w-0 pr-8">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg sm:text-xl font-bold truncate">
                      {activeCustomerView.name || "Unknown Customer"}
                    </h3>
                  </div>
                  <p className="mt-0.5 text-xs text-indigo-200">
                    Client ID: {activeCustomerView._id ? String(activeCustomerView._id).slice(-6).toUpperCase() : "N/A"}
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-5 sm:p-6 space-y-4 max-h-[70vh] overflow-y-auto">

              {/* Turnover Stats Box */}
              <div className="flex items-center justify-between rounded-2xl bg-emerald-50 border border-emerald-200/60 p-4">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">
                    Lifetime Invoiced Amount
                  </p>
                  <p className="mt-1 text-2xl font-black text-emerald-700">
                    {formatCurrency(activeCustomerView.totalPurchases)}
                  </p>
                </div>
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-lg">
                  💰
                </span>
              </div>

              {/* Information Grid */}
              <div className="space-y-2.5">
                <div className="flex items-start gap-3 rounded-xl border border-slate-200/70 bg-slate-50/70 p-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-indigo-600 shadow-2xs">
                    <PhoneIcon size={15} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Phone Number
                    </p>
                    <p className="mt-0.5 text-xs sm:text-sm font-bold font-mono text-slate-800">
                      {activeCustomerView.phone || "No phone provided"}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-xl border border-slate-200/70 bg-slate-50/70 p-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-indigo-600 shadow-2xs">
                    <MailIcon size={15} />
                  </div>
                  <div className="min-w-0 truncate">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Email Address
                    </p>
                    <p className="mt-0.5 text-xs sm:text-sm font-semibold text-slate-800 truncate">
                      {activeCustomerView.email || "No email recorded"}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-xl border border-slate-200/70 bg-slate-50/70 p-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-indigo-600 shadow-2xs">
                    <MapPinIcon size={15} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Registered Address / Location
                    </p>
                    <p className="mt-0.5 text-xs sm:text-sm font-medium text-slate-800 leading-relaxed">
                      {activeCustomerView.address || "No address provided on record"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Bottom Action Footer */}
            <div className="border-t border-slate-100 bg-slate-50/60 p-4 sm:p-5 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setActiveCustomerView(null)}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs sm:text-sm font-bold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer active:scale-95"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => selectCustomer(activeCustomerView)}
                className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-xs sm:text-sm font-bold text-white shadow-xs hover:bg-indigo-700 transition-all cursor-pointer active:scale-95"
              >
                <span>Generate Bill</span>
                <ArrowRightIcon size={14} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
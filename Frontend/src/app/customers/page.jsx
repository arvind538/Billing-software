
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

  return (
    words[0].charAt(0) + words[1].charAt(0)
  ).toUpperCase();
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
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function UserPlusIcon({ size = 20 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path d="M15 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="8" cy="7" r="4" />
      <path d="M19 8v6" />
      <path d="M22 11h-6" />
    </svg>
  );
}

function SearchIcon({ size = 18 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-4-4" />
    </svg>
  );
}

function PhoneIcon({ size = 16 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.12.9.33 1.78.62 2.63a2 2 0 0 1-.45 2.11L8 9.73a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.85.29 1.73.5 2.63.62A2 2 0 0 1 22 16.92z" />
    </svg>
  );
}

function MailIcon({ size = 16 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3 7 9 6 9-6" />
    </svg>
  );
}

function MapPinIcon({ size = 16 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  );
}

function ArrowRightIcon({ size = 16 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M5 12h14" />
      <path d="m13 6 6 6-6 6" />
    </svg>
  );
}

function PlusIcon({ size = 18 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M12 5v14" />
      <path d="M5 12h14" />
    </svg>
  );
}

// ========================================
// STAT CARD
// ========================================

function StatCard({
  title,
  value,
  subtitle,
  icon,
  iconBg,
  iconColor,
}) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md sm:p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            {title}
          </p>

          <p className="mt-2 text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
            {value}
          </p>

          {subtitle && (
            <p className="mt-1 text-[11px] text-slate-400">
              {subtitle}
            </p>
          )}
        </div>

        <div
          className="flex h-10 w-10 items-center justify-center rounded-xl"
          style={{
            background: iconBg,
            color: iconColor,
          }}
        >
          {icon}
        </div>
      </div>

      <div className="absolute -bottom-6 -right-6 h-20 w-20 rounded-full bg-slate-50 opacity-0 transition group-hover:opacity-100" />
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
    <div>
      <label className="mb-1.5 block text-xs font-semibold text-slate-600">
        {label}
        {required && (
          <span className="ml-1 text-red-500">*</span>
        )}
      </label>

      <div className="relative">
        <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
          {icon}
        </div>

        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pl-10 pr-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
        />
      </div>
    </div>
  );
}

// ========================================
// CUSTOMER CARD MOBILE
// ========================================

function CustomerMobileCard({ customer, index, onSelect }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <button
          type="button"
          onClick={() => onSelect(customer)}
          className="flex min-w-0 items-center gap-3 text-left"
        >
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-sm font-bold text-white shadow-sm">
            {getInitials(customer.name)}
          </div>

          <div className="min-w-0">
            <p className="truncate font-semibold text-slate-900">
              {customer.name || "Unknown Customer"}
            </p>

            <p className="mt-0.5 text-[11px] text-slate-400">
              Customer #{index + 1}
            </p>
          </div>
        </button>

        <span className="shrink-0 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-600">
          Active
        </span>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-2 border-t border-slate-100 pt-3">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <PhoneIcon size={14} />
          <span className="truncate">
            {customer.phone || "No phone"}
          </span>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-500">
          <MailIcon size={14} />
          <span className="truncate">
            {customer.email || "No email"}
          </span>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-500">
          <MapPinIcon size={14} />
          <span className="truncate">
            {customer.address || "No address"}
          </span>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
            Total Purchases
          </p>

          <p className="mt-0.5 text-base font-bold text-emerald-600">
            {formatCurrency(customer.totalPurchases)}
          </p>
        </div>

        <button
          type="button"
          onClick={() => onSelect(customer)}
          className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-indigo-700"
        >
          Billing
          <ArrowRightIcon size={13} />
        </button>
      </div>
    </div>
  );
}

// ========================================
// MAIN
// ========================================

export default function CustomersPage() {
  const router = useRouter();

  const [customers, setCustomers] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // ========================================
  // FETCH CUSTOMERS
  // ========================================

  const fetchCustomers = async () => {
    try {
      setLoading(true);

      const res = await api.get("/customers");

      setCustomers(
        Array.isArray(res.data)
          ? res.data
          : []
      );
    } catch (error) {
      console.error(
        "Customers fetch error:",
        error.response?.data || error.message
      );

      toast.error(
        error.response?.data?.message ||
        "Customers load nahi ho paaye."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  // ========================================
  // INPUT
  // ========================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ========================================
  // ADD CUSTOMER
  // ========================================

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
      console.error(
        "Customer save error:",
        error.response?.data || error.message
      );

      toast.error(
        error.response?.data?.message ||
        "Customer save failed."
      );
    } finally {
      setSaving(false);
    }
  };

  // ========================================
  // SELECT CUSTOMER
  // ========================================

  const selectCustomer = (customer) => {
    if (typeof window !== "undefined") {
      sessionStorage.setItem(
        "selectedCustomer",
        JSON.stringify(customer)
      );
    }

    router.push("/billing");
  };

  // ========================================
  // SEARCH
  // ========================================

  const filteredCustomers = useMemo(() => {
    const searchText = search
      .toLowerCase()
      .trim();

    if (!searchText) return customers;

    return customers.filter((customer) => {
      return (
        customer.name
          ?.toLowerCase()
          .includes(searchText) ||
        customer.phone
          ?.toLowerCase()
          .includes(searchText) ||
        customer.email
          ?.toLowerCase()
          .includes(searchText) ||
        customer.address
          ?.toLowerCase()
          .includes(searchText)
      );
    });
  }, [customers, search]);

  // ========================================
  // SUMMARY
  // ========================================

  const totalCustomers = customers.length;

  const totalBusiness = customers.reduce(
    (sum, customer) =>
      sum +
      Number(customer.totalPurchases || 0),
    0
  );

  const averagePurchase =
    totalCustomers > 0
      ? totalBusiness / totalCustomers
      : 0;

  return (
    <div className="min-h-screen bg-[#F6F8FC]">
      <div className="mx-auto max-w-[1500px] px-4 py-5 sm:px-6 sm:py-7 lg:px-8 lg:py-8">

        {/* ========================================
            HERO HEADER
        ======================================== */}

        <div className="relative mb-6 overflow-hidden rounded-3xl bg-[#101B3D] p-5 shadow-lg sm:p-7">
          {/* Background decoration */}
          <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-indigo-500/20 blur-2xl" />
          <div className="absolute -bottom-20 left-1/3 h-48 w-48 rounded-full bg-violet-500/10 blur-3xl" />

          <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-indigo-300 ring-1 ring-white/10 backdrop-blur">
                <UsersIcon size={28} />
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                    Customers
                  </h1>

                  <span className="rounded-full bg-emerald-400/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-300 ring-1 ring-emerald-400/20">
                    CRM
                  </span>
                </div>

                <p className="mt-1 text-sm text-slate-300">
                  Manage customers, purchases and billing information.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-center backdrop-blur">
                <p className="text-[10px] uppercase tracking-wider text-slate-400">
                  Customers
                </p>

                <p className="text-lg font-bold text-white">
                  {totalCustomers}
                </p>
              </div>

              <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-center backdrop-blur">
                <p className="text-[10px] uppercase tracking-wider text-slate-400">
                  Business
                </p>

                <p className="text-lg font-bold text-emerald-300">
                  {formatCurrency(totalBusiness)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================
            STAT CARDS
        ======================================== */}

        <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <StatCard
            title="Total Customers"
            value={totalCustomers}
            subtitle="Registered customers"
            icon={<UsersIcon />}
            iconBg="#EEF2FF"
            iconColor="#4F46E5"
          />

          <StatCard
            title="Total Purchases"
            value={formatCurrency(totalBusiness)}
            subtitle="Customer purchase value"
            icon={
              <span className="text-lg font-bold">
                ₹
              </span>
            }
            iconBg="#ECFDF3"
            iconColor="#059669"
          />

          <StatCard
            title="Average Purchase"
            value={formatCurrency(averagePurchase)}
            subtitle="Per customer average"
            icon={
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
              >
                <path d="M3 3v18h18" />
                <path d="m7 16 4-5 3 3 6-8" />
              </svg>
            }
            iconBg="#FFF7ED"
            iconColor="#EA580C"
          />
        </div>

        {/* ========================================
            ADD CUSTOMER
        ======================================== */}

        <div className="mb-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          {/* Form Header */}

          <div className="border-b border-slate-100 bg-gradient-to-r from-white to-indigo-50/40 px-5 py-4 sm:px-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600">
                <UserPlusIcon />
              </div>

              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Add New Customer
                </h2>

                <p className="mt-0.5 text-xs text-slate-400">
                  Add customer details for billing and invoices.
                </p>
              </div>
            </div>
          </div>

          {/* Form */}

          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 gap-4 p-5 sm:p-6 md:grid-cols-2 xl:grid-cols-4"
          >
            <InputField
              label="Customer Name"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="e.g. Rahul Sharma"
              icon={<UsersIcon size={16} />}
              required
            />

            <InputField
              label="Phone Number"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              placeholder="9876543210"
              icon={<PhoneIcon />}
              required
            />

            <InputField
              label="Email Address"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="customer@email.com"
              icon={<MailIcon />}
            />

            <InputField
              label="Address"
              name="address"
              value={form.address}
              onChange={handleChange}
              placeholder="Customer address"
              icon={<MapPinIcon />}
            />

            <div className="md:col-span-2 xl:col-span-4">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-sm shadow-indigo-600/20 transition hover:bg-indigo-700 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
              >
                {saving ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Adding Customer...
                  </>
                ) : (
                  <>
                    <PlusIcon size={17} />
                    Add Customer
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* ========================================
            CUSTOMER LIST HEADER
        ======================================== */}

        <div className="mb-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Customer Directory
              </h2>

              <p className="mt-1 text-xs text-slate-400">
                Search and select a customer for billing.
              </p>
            </div>

            <div className="flex w-full flex-col gap-3 sm:flex-row lg:w-auto">
              {/* Search */}

              <div className="relative w-full sm:w-[340px]">
                <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                  <SearchIcon size={17} />
                </div>

                <input
                  value={search}
                  onChange={(e) =>
                    setSearch(e.target.value)
                  }
                  placeholder="Search name, phone, email..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
                />
              </div>

              <div className="flex items-center justify-center rounded-xl bg-indigo-50 px-4 py-2.5 text-xs font-semibold text-indigo-600">
                {filteredCustomers.length} Results
              </div>
            </div>
          </div>
        </div>

        {/* ========================================
            CUSTOMER DATA
        ======================================== */}

        {loading ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
            <div className="mx-auto h-9 w-9 animate-spin rounded-full border-4 border-slate-200 border-t-indigo-600" />

            <p className="mt-4 text-sm font-medium text-slate-500">
              Loading customers...
            </p>

            <p className="mt-1 text-xs text-slate-400">
              Please wait a moment.
            </p>
          </div>
        ) : filteredCustomers.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white px-5 py-16 text-center shadow-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-500">
              <UsersIcon size={30} />
            </div>

            <h3 className="mt-4 font-bold text-slate-800">
              No customers found
            </h3>

            <p className="mx-auto mt-1 max-w-sm text-sm text-slate-400">
              {search
                ? "Try searching with another name, phone number or email."
                : "Add your first customer using the form above."}
            </p>

            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="mt-4 rounded-xl bg-indigo-50 px-4 py-2 text-xs font-semibold text-indigo-600 hover:bg-indigo-100"
              >
                Clear Search
              </button>
            )}
          </div>
        ) : (
          <>
            {/* ========================================
                DESKTOP TABLE
            ======================================== */}

            <div className="hidden overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm md:block">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1050px] text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50/80">
                      <th className="w-14 px-4 py-4 text-center text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        #
                      </th>

                      <th className="px-5 py-4 text-left text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        Customer
                      </th>

                      <th className="px-5 py-4 text-left text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        Contact
                      </th>

                      <th className="px-5 py-4 text-left text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        Address
                      </th>

                      <th className="px-5 py-4 text-right text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        Purchases
                      </th>

                      <th className="px-5 py-4 text-center text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        Action
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredCustomers.map(
                      (customer, index) => (
                        <tr
                          key={customer._id}
                          className="group border-b border-slate-100 transition last:border-0 hover:bg-indigo-50/30"
                        >
                          {/* INDEX */}

                          <td className="px-4 py-4 text-center text-xs font-medium text-slate-400">
                            {String(index + 1).padStart(
                              2,
                              "0"
                            )}
                          </td>

                          {/* CUSTOMER */}

                          <td className="px-5 py-4">
                            <button
                              type="button"
                              onClick={() =>
                                selectCustomer(customer)
                              }
                              className="group/customer flex items-center gap-3 text-left"
                            >
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-xs font-bold text-white shadow-sm transition group-hover/customer:scale-105">
                                {getInitials(
                                  customer.name
                                )}
                              </div>

                              <div className="min-w-0">
                                <p className="max-w-[180px] truncate font-semibold text-slate-800 transition group-hover/customer:text-indigo-600">
                                  {customer.name ||
                                    "Unknown Customer"}
                                </p>

                                <p className="mt-0.5 text-[10px] font-medium text-slate-400">
                                  Customer
                                </p>
                              </div>
                            </button>
                          </td>

                          {/* CONTACT */}

                          <td className="px-5 py-4">
                            <div className="space-y-1.5">
                              <div className="flex items-center gap-2 text-xs text-slate-600">
                                <PhoneIcon size={13} />

                                <span>
                                  {customer.phone ||
                                    "No phone"}
                                </span>
                              </div>

                              <div className="flex max-w-[210px] items-center gap-2 truncate text-xs text-slate-400">
                                <MailIcon size={13} />

                                <span className="truncate">
                                  {customer.email ||
                                    "No email"}
                                </span>
                              </div>
                            </div>
                          </td>

                          {/* ADDRESS */}

                          <td className="max-w-[230px] px-5 py-4">
                            <div className="flex items-center gap-2 text-xs text-slate-500">
                              <MapPinIcon size={13} />

                              <span className="truncate">
                                {customer.address ||
                                  "No address"}
                              </span>
                            </div>
                          </td>

                          {/* PURCHASE */}

                          <td className="px-5 py-4 text-right">
                            <div className="inline-flex flex-col items-end">
                              <span className="font-bold text-emerald-600">
                                {formatCurrency(
                                  customer.totalPurchases
                                )}
                              </span>

                              <span className="mt-0.5 text-[10px] text-slate-400">
                                Total business
                              </span>
                            </div>
                          </td>

                          {/* ACTION */}

                          <td className="px-5 py-4 text-center">
                            <button
                              type="button"
                              onClick={() =>
                                selectCustomer(customer)
                              }
                              className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-50 px-3.5 py-2 text-xs font-semibold text-indigo-600 transition hover:bg-indigo-600 hover:text-white"
                            >
                              Use in Billing
                              <ArrowRightIcon size={13} />
                            </button>
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>

              {/* TABLE FOOTER */}

              <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/50 px-5 py-3">
                <p className="text-[11px] text-slate-400">
                  Showing{" "}
                  <span className="font-semibold text-slate-600">
                    {filteredCustomers.length}
                  </span>{" "}
                  of{" "}
                  <span className="font-semibold text-slate-600">
                    {customers.length}
                  </span>{" "}
                  customers
                </p>

                <p className="text-[11px] text-slate-400">
                  Click customer to use in billing
                </p>
              </div>
            </div>

            {/* ========================================
                MOBILE CARDS
            ======================================== */}

            <div className="space-y-3 md:hidden">
              {filteredCustomers.map(
                (customer, index) => (
                  <CustomerMobileCard
                    key={customer._id}
                    customer={customer}
                    index={index}
                    onSelect={selectCustomer}
                  />
                )
              )}
            </div>
          </>
        )}

        {/* ========================================
            FOOTER
        ======================================== */}

        <div className="mt-5 flex flex-col gap-2 text-[11px] text-slate-400 sm:flex-row sm:items-center sm:justify-between">
          <span>
            Customer management & billing system
          </span>

          <span>
            {customers.length} total records
          </span>
        </div>
      </div>
    </div>
  );
}









// "use client";

// import { useEffect, useState } from "react";
// import { useRouter } from "next/navigation";
// import api from "@/lib/api";
// import { toast } from "react-toastify";

// const emptyForm = {
//   name: "",
//   phone: "",
//   email: "",
//   address: "",
// };

// // ========================================
// // GET CUSTOMER INITIALS
// // ========================================

// const getInitials = (name = "") => {
//   const cleanName = String(name).trim();

//   if (!cleanName) {
//     return "CU";
//   }

//   const words = cleanName.split(/\s+/);

//   if (words.length === 1) {
//     return words[0].substring(0, 2).toUpperCase();
//   }

//   return (
//     words[0].charAt(0) +
//     words[1].charAt(0)
//   ).toUpperCase();
// };

// export default function CustomersPage() {
//   const router = useRouter();

//   const [customers, setCustomers] = useState([]);
//   const [form, setForm] = useState(emptyForm);
//   const [search, setSearch] = useState("");
//   const [loading, setLoading] = useState(true);
//   const [saving, setSaving] = useState(false);

//   // ========================================
//   // FETCH CUSTOMERS
//   // ========================================

//   const fetchCustomers = async () => {
//     try {
//       setLoading(true);

//       const res = await api.get("/customers");

//       setCustomers(
//         Array.isArray(res.data)
//           ? res.data
//           : []
//       );
//     } catch (error) {
//       toast.error(
//         "Customers fetch error:",
//         error.response?.data || error.message
//       );

//       alert(
//         error.response?.data?.message ||
//         "Customers load nahi ho paaye."
//       );
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchCustomers();
//   }, []);

//   // ========================================
//   // INPUT CHANGE
//   // ========================================

//   const handleChange = (e) => {
//     const { name, value } = e.target;

//     setForm((prev) => ({
//       ...prev,
//       [name]: value,
//     }));
//   };

//   // ========================================
//   // ADD CUSTOMER
//   // ========================================

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     if (!form.name.trim()) {
//       alert("Customer name required hai.");
//       return;
//     }

//     if (!form.phone.trim()) {
//       alert("Phone number required hai.");
//       return;
//     }

//     try {
//       setSaving(true);

//       await api.post("/customers", {
//         name: form.name.trim(),
//         phone: form.phone.trim(),
//         email: form.email.trim(),
//         address: form.address.trim(),
//       });

//       setForm(emptyForm);

//       await fetchCustomers();

//       toast.success("Customer Added successfully.");
//     } catch (error) {
//       toast.error(
//         "Customer save error:",
//         error.response?.data || error.message
//       );

//       alert(
//         error.response?.data?.message ||
//         "Customer no't saved."
//       );
//     } finally {
//       setSaving(false);
//     }
//   };

//   // ========================================
//   // SELECT CUSTOMER
//   // ========================================

//   const selectCustomer = (customer) => {
//     if (typeof window !== "undefined") {
//       sessionStorage.setItem(
//         "selectedCustomer",
//         JSON.stringify(customer)
//       );
//     }

//     router.push("/billing");
//   };

//   // ========================================
//   // SEARCH
//   // ========================================

//   const filteredCustomers = customers.filter(
//     (customer) => {
//       const searchText = search
//         .toLowerCase()
//         .trim();

//       return (
//         customer.name
//           ?.toLowerCase()
//           .includes(searchText) ||
//         customer.phone
//           ?.toLowerCase()
//           .includes(searchText) ||
//         customer.email
//           ?.toLowerCase()
//           .includes(searchText) ||
//         customer.address
//           ?.toLowerCase()
//           .includes(searchText)
//       );
//     }
//   );

//   // ========================================
//   // TOTAL PURCHASE
//   // ========================================

//   const totalBusiness = customers.reduce(
//     (sum, customer) =>
//       sum +
//       Number(customer.totalPurchases || 0),
//     0
//   );

//   return (
//     <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">

//       <div className="mx-auto max-w-7xl">

//         {/* =================================
//             HEADER
//         ================================== */}

//         <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">

//           <div>
//             <h1 className="text-2xl font-bold text-slate-900">
//               Customers
//             </h1>

//             <p className="mt-1 text-sm text-slate-500">
//               Manage your customers and billing information
//             </p>
//           </div>

//           {/* SUMMARY */}

//           <div className="flex gap-3">

//             <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
//               <p className="text-xs text-slate-400">
//                 Total Customers
//               </p>

//               <p className="mt-1 text-xl font-bold text-slate-900">
//                 {customers.length}
//               </p>
//             </div>

//             <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
//               <p className="text-xs text-slate-400">
//                 Total Purchases
//               </p>

//               <p className="mt-1 text-xl font-bold text-emerald-600">
//                 ₹{totalBusiness.toFixed(2)}
//               </p>
//             </div>

//           </div>

//         </div>

//         {/* =================================
//             ADD CUSTOMER FORM
//         ================================== */}

//         <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

//           <div className="mb-4">
//             <h2 className="text-base font-semibold text-slate-900">
//               Add New Customer
//             </h2>

//             <p className="mt-1 text-xs text-slate-400">
//               Customer details billing invoice ke liye use hongi.
//             </p>
//           </div>

//           <form
//             onSubmit={handleSubmit}
//             className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4"
//           >

//             {/* NAME */}

//             <div>
//               <label className="mb-1.5 block text-xs font-semibold text-slate-600">
//                 Customer Name
//               </label>

//               <input
//                 name="name"
//                 value={form.name}
//                 onChange={handleChange}
//                 placeholder="Enter customer name"
//                 className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
//                 required
//               />
//             </div>

//             {/* PHONE */}

//             <div>
//               <label className="mb-1.5 block text-xs font-semibold text-slate-600">
//                 Phone
//               </label>

//               <input
//                 name="phone"
//                 value={form.phone}
//                 onChange={handleChange}
//                 placeholder="Enter phone number"
//                 className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
//                 required
//               />
//             </div>

//             {/* EMAIL */}

//             <div>
//               <label className="mb-1.5 block text-xs font-semibold text-slate-600">
//                 Email
//               </label>

//               <input
//                 type="email"
//                 name="email"
//                 value={form.email}
//                 onChange={handleChange}
//                 placeholder="customer@email.com"
//                 className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
//               />
//             </div>

//             {/* ADDRESS */}

//             <div>
//               <label className="mb-1.5 block text-xs font-semibold text-slate-600">
//                 Address
//               </label>

//               <input
//                 name="address"
//                 value={form.address}
//                 onChange={handleChange}
//                 placeholder="Enter address"
//                 className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
//               />
//             </div>

//             {/* BUTTON */}

//             <div className="md:col-span-2 xl:col-span-4">

//               <button
//                 type="submit"
//                 disabled={saving}
//                 className="rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
//               >
//                 {saving
//                   ? "Adding Customer..."
//                   : "+ Add Customer"}
//               </button>

//             </div>

//           </form>
//         </div>

//         {/* =================================
//             SEARCH
//         ================================== */}

//         <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

//           <div className="relative w-full sm:max-w-sm">

//             <svg
//               className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
//               viewBox="0 0 24 24"
//               fill="none"
//               stroke="currentColor"
//               strokeWidth="2"
//             >
//               <circle cx="11" cy="11" r="7" />
//               <path d="m20 20-4-4" />
//             </svg>

//             <input
//               value={search}
//               onChange={(e) =>
//                 setSearch(e.target.value)
//               }
//               placeholder="Search customer..."
//               className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-4 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
//             />

//           </div>

//           <p className="text-sm text-slate-500">
//             Showing{" "}
//             <span className="font-semibold text-slate-900">
//               {filteredCustomers.length}
//             </span>{" "}
//             customers
//           </p>

//         </div>

//         {/* =================================
//             EXCEL STYLE TABLE
//         ================================== */}

//         <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

//           <div className="overflow-x-auto">

//             <table className="w-full min-w-[900px] text-sm">

//               <thead className="bg-slate-50">

//                 <tr className="border-b border-slate-200">

//                   <th className="px-5 py-4 text-left font-semibold text-slate-600">
//                     #
//                   </th>

//                   <th className="px-5 py-4 text-left font-semibold text-slate-600">
//                     Customer
//                   </th>

//                   <th className="px-5 py-4 text-left font-semibold text-slate-600">
//                     Phone
//                   </th>

//                   <th className="px-5 py-4 text-left font-semibold text-slate-600">
//                     Email
//                   </th>

//                   <th className="px-5 py-4 text-left font-semibold text-slate-600">
//                     Address
//                   </th>

//                   <th className="px-5 py-4 text-right font-semibold text-slate-600">
//                     Total Purchases
//                   </th>

//                   <th className="px-5 py-4 text-center font-semibold text-slate-600">
//                     Action
//                   </th>

//                 </tr>

//               </thead>

//               <tbody>

//                 {loading ? (

//                   <tr>
//                     <td
//                       colSpan="7"
//                       className="py-12 text-center text-slate-400"
//                     >
//                       Loading customers...
//                     </td>
//                   </tr>

//                 ) : filteredCustomers.length === 0 ? (

//                   <tr>
//                     <td
//                       colSpan="7"
//                       className="py-12 text-center"
//                     >

//                       <div className="text-3xl">
//                         👤
//                       </div>

//                       <p className="mt-2 font-medium text-slate-600">
//                         No customers found
//                       </p>

//                       <p className="mt-1 text-xs text-slate-400">
//                         Add your first customer above.
//                       </p>

//                     </td>
//                   </tr>

//                 ) : (

//                   filteredCustomers.map(
//                     (customer, index) => (

//                       <tr
//                         key={customer._id}
//                         className="border-b border-slate-100 transition hover:bg-indigo-50/40"
//                       >

//                         {/* NUMBER */}

//                         <td className="px-5 py-4 text-slate-400">
//                           {index + 1}
//                         </td>

//                         {/* CUSTOMER */}

//                         <td className="px-5 py-4">

//                           <button
//                             type="button"
//                             onClick={() =>
//                               selectCustomer(
//                                 customer
//                               )
//                             }
//                             className="group flex items-center gap-3 text-left"
//                             title="Click to use this customer in Billing"
//                           >

//                             {/* INITIALS */}

//                             <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-700">
//                               {getInitials(
//                                 customer.name
//                               )}
//                             </div>

//                             <div>

//                               <p className="font-semibold text-slate-800 group-hover:text-indigo-600">
//                                 {customer.name ||
//                                   "Unknown Customer"}
//                               </p>

//                               <p className="text-[11px] text-indigo-500 opacity-0 transition group-hover:opacity-100">
//                                 Click to Billing →
//                               </p>

//                             </div>

//                           </button>

//                         </td>

//                         {/* PHONE */}

//                         <td className="px-5 py-4 text-slate-600">
//                           {customer.phone || "-"}
//                         </td>

//                         {/* EMAIL */}

//                         <td className="px-5 py-4 text-slate-600">
//                           {customer.email || "-"}
//                         </td>

//                         {/* ADDRESS */}

//                         <td className="max-w-[220px] px-5 py-4 text-slate-600">

//                           <span className="block truncate">
//                             {customer.address || "-"}
//                           </span>

//                         </td>

//                         {/* PURCHASE */}

//                         <td className="px-5 py-4 text-right font-semibold text-emerald-600">
//                           ₹
//                           {Number(
//                             customer.totalPurchases ||
//                             0
//                           ).toFixed(2)}
//                         </td>

//                         {/* ACTION */}

//                         <td className="px-5 py-4 text-center">

//                           <button
//                             type="button"
//                             onClick={() =>
//                               selectCustomer(
//                                 customer
//                               )
//                             }
//                             className="rounded-lg bg-indigo-50 px-3 py-2 text-xs font-semibold text-indigo-600 transition hover:bg-indigo-600 hover:text-white"
//                           >
//                             Use in Billing
//                           </button>

//                         </td>

//                       </tr>

//                     )
//                   )

//                 )}

//               </tbody>

//             </table>

//           </div>

//         </div>

//         {/* FOOTER NOTE */}

//         <div className="mt-3 flex items-center justify-between text-xs text-slate-400">

//           <span>
//             Customer name par click karke billing page me customer select karein.
//           </span>

//           <span>
//             {customers.length} Records
//           </span>

//         </div>

//       </div>
//     </div>
//   );
// }
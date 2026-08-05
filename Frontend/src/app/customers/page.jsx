"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";

const emptyForm = {
  name: "",
  phone: "",
  email: "",
  address: "",
};

// ========================================
// GET CUSTOMER INITIALS
// ========================================

const getInitials = (name = "") => {
  const cleanName = String(name).trim();

  if (!cleanName) {
    return "CU";
  }

  const words = cleanName.split(/\s+/);

  if (words.length === 1) {
    return words[0].substring(0, 2).toUpperCase();
  }

  return (
    words[0].charAt(0) +
    words[1].charAt(0)
  ).toUpperCase();
};

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

      alert(
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
  // INPUT CHANGE
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
      alert("Customer name required hai.");
      return;
    }

    if (!form.phone.trim()) {
      alert("Phone number required hai.");
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

      alert("Customer successfully add ho gaya.");
    } catch (error) {
      console.error(
        "Customer save error:",
        error.response?.data || error.message
      );

      alert(
        error.response?.data?.message ||
          "Customer save nahi ho paya."
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

  const filteredCustomers = customers.filter(
    (customer) => {
      const searchText = search
        .toLowerCase()
        .trim();

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
    }
  );

  // ========================================
  // TOTAL PURCHASE
  // ========================================

  const totalBusiness = customers.reduce(
    (sum, customer) =>
      sum +
      Number(customer.totalPurchases || 0),
    0
  );

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">

      <div className="mx-auto max-w-7xl">

        {/* =================================
            HEADER
        ================================== */}

        <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">

          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Customers
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Manage your customers and billing information
            </p>
          </div>

          {/* SUMMARY */}

          <div className="flex gap-3">

            <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
              <p className="text-xs text-slate-400">
                Total Customers
              </p>

              <p className="mt-1 text-xl font-bold text-slate-900">
                {customers.length}
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
              <p className="text-xs text-slate-400">
                Total Purchases
              </p>

              <p className="mt-1 text-xl font-bold text-emerald-600">
                ₹{totalBusiness.toFixed(2)}
              </p>
            </div>

          </div>

        </div>

        {/* =================================
            ADD CUSTOMER FORM
        ================================== */}

        <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

          <div className="mb-4">
            <h2 className="text-base font-semibold text-slate-900">
              Add New Customer
            </h2>

            <p className="mt-1 text-xs text-slate-400">
              Customer details billing invoice ke liye use hongi.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4"
          >

            {/* NAME */}

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                Customer Name
              </label>

              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Enter customer name"
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                required
              />
            </div>

            {/* PHONE */}

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                Phone
              </label>

              <input
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="Enter phone number"
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                required
              />
            </div>

            {/* EMAIL */}

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                Email
              </label>

              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="customer@email.com"
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />
            </div>

            {/* ADDRESS */}

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                Address
              </label>

              <input
                name="address"
                value={form.address}
                onChange={handleChange}
                placeholder="Enter address"
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />
            </div>

            {/* BUTTON */}

            <div className="md:col-span-2 xl:col-span-4">

              <button
                type="submit"
                disabled={saving}
                className="rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving
                  ? "Adding Customer..."
                  : "+ Add Customer"}
              </button>

            </div>

          </form>
        </div>

        {/* =================================
            SEARCH
        ================================== */}

        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

          <div className="relative w-full sm:max-w-sm">

            <svg
              className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-4-4" />
            </svg>

            <input
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              placeholder="Search customer..."
              className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-4 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            />

          </div>

          <p className="text-sm text-slate-500">
            Showing{" "}
            <span className="font-semibold text-slate-900">
              {filteredCustomers.length}
            </span>{" "}
            customers
          </p>

        </div>

        {/* =================================
            EXCEL STYLE TABLE
        ================================== */}

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

          <div className="overflow-x-auto">

            <table className="w-full min-w-[900px] text-sm">

              <thead className="bg-slate-50">

                <tr className="border-b border-slate-200">

                  <th className="px-5 py-4 text-left font-semibold text-slate-600">
                    #
                  </th>

                  <th className="px-5 py-4 text-left font-semibold text-slate-600">
                    Customer
                  </th>

                  <th className="px-5 py-4 text-left font-semibold text-slate-600">
                    Phone
                  </th>

                  <th className="px-5 py-4 text-left font-semibold text-slate-600">
                    Email
                  </th>

                  <th className="px-5 py-4 text-left font-semibold text-slate-600">
                    Address
                  </th>

                  <th className="px-5 py-4 text-right font-semibold text-slate-600">
                    Total Purchases
                  </th>

                  <th className="px-5 py-4 text-center font-semibold text-slate-600">
                    Action
                  </th>

                </tr>

              </thead>

              <tbody>

                {loading ? (

                  <tr>
                    <td
                      colSpan="7"
                      className="py-12 text-center text-slate-400"
                    >
                      Loading customers...
                    </td>
                  </tr>

                ) : filteredCustomers.length === 0 ? (

                  <tr>
                    <td
                      colSpan="7"
                      className="py-12 text-center"
                    >

                      <div className="text-3xl">
                        👤
                      </div>

                      <p className="mt-2 font-medium text-slate-600">
                        No customers found
                      </p>

                      <p className="mt-1 text-xs text-slate-400">
                        Add your first customer above.
                      </p>

                    </td>
                  </tr>

                ) : (

                  filteredCustomers.map(
                    (customer, index) => (

                      <tr
                        key={customer._id}
                        className="border-b border-slate-100 transition hover:bg-indigo-50/40"
                      >

                        {/* NUMBER */}

                        <td className="px-5 py-4 text-slate-400">
                          {index + 1}
                        </td>

                        {/* CUSTOMER */}

                        <td className="px-5 py-4">

                          <button
                            type="button"
                            onClick={() =>
                              selectCustomer(
                                customer
                              )
                            }
                            className="group flex items-center gap-3 text-left"
                            title="Click to use this customer in Billing"
                          >

                            {/* INITIALS */}

                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-700">
                              {getInitials(
                                customer.name
                              )}
                            </div>

                            <div>

                              <p className="font-semibold text-slate-800 group-hover:text-indigo-600">
                                {customer.name ||
                                  "Unknown Customer"}
                              </p>

                              <p className="text-[11px] text-indigo-500 opacity-0 transition group-hover:opacity-100">
                                Click to Billing →
                              </p>

                            </div>

                          </button>

                        </td>

                        {/* PHONE */}

                        <td className="px-5 py-4 text-slate-600">
                          {customer.phone || "-"}
                        </td>

                        {/* EMAIL */}

                        <td className="px-5 py-4 text-slate-600">
                          {customer.email || "-"}
                        </td>

                        {/* ADDRESS */}

                        <td className="max-w-[220px] px-5 py-4 text-slate-600">

                          <span className="block truncate">
                            {customer.address || "-"}
                          </span>

                        </td>

                        {/* PURCHASE */}

                        <td className="px-5 py-4 text-right font-semibold text-emerald-600">
                          ₹
                          {Number(
                            customer.totalPurchases ||
                              0
                          ).toFixed(2)}
                        </td>

                        {/* ACTION */}

                        <td className="px-5 py-4 text-center">

                          <button
                            type="button"
                            onClick={() =>
                              selectCustomer(
                                customer
                              )
                            }
                            className="rounded-lg bg-indigo-50 px-3 py-2 text-xs font-semibold text-indigo-600 transition hover:bg-indigo-600 hover:text-white"
                          >
                            Use in Billing
                          </button>

                        </td>

                      </tr>

                    )
                  )

                )}

              </tbody>

            </table>

          </div>

        </div>

        {/* FOOTER NOTE */}

        <div className="mt-3 flex items-center justify-between text-xs text-slate-400">

          <span>
            Customer name par click karke billing page me customer select karein.
          </span>

          <span>
            {customers.length} Records
          </span>

        </div>

      </div>
    </div>
  );
}
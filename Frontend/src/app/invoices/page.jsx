"use client";

import { useEffect, useMemo, useState } from "react";
import api from "@/lib/api";
import { toast } from "react-toastify";

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedInvoice, setSelectedInvoice] = useState(null);

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

      const invoiceData = Array.isArray(invoiceRes.data)
        ? invoiceRes.data
        : [];

      const customerData = Array.isArray(customerRes.data)
        ? customerRes.data
        : [];

      setInvoices(invoiceData);
      setCustomers(customerData);
    } catch (error) {
      console.error("Invoices / Customers error:", error);

      toast.error(
        error?.response?.data?.message ||
        "Invoices / Customers load nahi ho paaye."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // =====================================================
  // GET CUSTOMER
  // =====================================================

  const getCustomer = (invoice) => {
    // Customer already populated
    if (
      invoice?.customer &&
      typeof invoice.customer === "object" &&
      invoice.customer._id
    ) {
      return invoice.customer;
    }

    // Customer ID
    const customerId =
      typeof invoice?.customer === "string"
        ? invoice.customer
        : invoice?.customer?._id ||
        invoice?.customerId ||
        null;

    if (!customerId) {
      return null;
    }

    return (
      customers.find(
        (customer) =>
          String(customer._id) === String(customerId)
      ) || null
    );
  };

  // =====================================================
  // GET INITIALS
  // =====================================================

  const getInitials = (name = "") => {
    const cleanName = String(name).trim();

    if (!cleanName) {
      return "CU";
    }

    const words = cleanName.split(/\s+/);

    if (words.length === 1) {
      return words[0]
        .substring(0, 2)
        .toUpperCase();
    }

    return (
      words[0].charAt(0) +
      words[1].charAt(0)
    ).toUpperCase();
  };

  // =====================================================
  // SEARCH
  // =====================================================

  const filteredInvoices = useMemo(() => {
    const value = search.toLowerCase().trim();

    if (!value) {
      return invoices;
    }

    return invoices.filter((invoice) => {
      const customer = getCustomer(invoice);

      return (
        invoice?.invoiceNumber
          ?.toLowerCase()
          .includes(value) ||
        customer?.name
          ?.toLowerCase()
          .includes(value) ||
        customer?.phone
          ?.toLowerCase()
          .includes(value) ||
        customer?.email
          ?.toLowerCase()
          .includes(value) ||
        invoice?.paymentMethod
          ?.toLowerCase()
          .includes(value)
      );
    });
  }, [invoices, customers, search]);

  // =====================================================
  // SUMMARY
  // =====================================================

  const totalInvoices = invoices.length;

  const totalSales = invoices.reduce(
    (sum, invoice) =>
      sum + Number(invoice?.grandTotal || 0),
    0
  );

  const cashInvoices = invoices.filter(
    (invoice) =>
      invoice?.paymentMethod?.toLowerCase() === "cash"
  ).length;

  const upiInvoices = invoices.filter(
    (invoice) =>
      invoice?.paymentMethod?.toLowerCase() === "upi"
  ).length;

  // =====================================================
  // FILTERED TOTALS
  // =====================================================

  const filteredSubtotal = filteredInvoices.reduce(
    (sum, invoice) =>
      sum + Number(invoice?.subtotal || 0),
    0
  );

  const filteredTax = filteredInvoices.reduce(
    (sum, invoice) =>
      sum + Number(invoice?.taxTotal || 0),
    0
  );

  const filteredGrandTotal = filteredInvoices.reduce(
    (sum, invoice) =>
      sum + Number(invoice?.grandTotal || 0),
    0
  );

  // =====================================================
  // PAYMENT STYLE
  // =====================================================

  const getPaymentStyle = (method) => {
    const payment = method?.toLowerCase();

    if (payment === "cash") {
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    }

    if (payment === "upi") {
      return "bg-purple-50 text-purple-700 border-purple-200";
    }

    if (payment === "card") {
      return "bg-blue-50 text-blue-700 border-blue-200";
    }

    return "bg-slate-100 text-slate-600 border-slate-200";
  };

  // =====================================================
  // DATE FORMAT
  // =====================================================

  const formatDate = (date) => {
    if (!date) {
      return "-";
    }

    try {
      const parsedDate = new Date(date);

      if (Number.isNaN(parsedDate.getTime())) {
        return "-";
      }

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
  // OPEN INVOICE
  // =====================================================

  const openInvoice = (invoice) => {
    const customer = getCustomer(invoice);

    setSelectedInvoice({
      ...invoice,
      customer: customer || null,
    });
  };

  // =====================================================
  // CLOSE INVOICE
  // =====================================================

  const closeInvoice = () => {
    setSelectedInvoice(null);
  };

  // =====================================================
  // PAGE
  // =====================================================

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="mb-6 flex flex-col justify-between gap-4 lg:flex-row lg:items-center">

          {/* TITLE */}

          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Invoice History
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              View and manage your generated invoices
            </p>
          </div>

          {/* SUMMARY */}

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">

            {/* TOTAL INVOICES */}

            <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
              <p className="text-xs text-slate-400">
                Total Invoices
              </p>

              <p className="mt-1 text-xl font-bold text-slate-900">
                {totalInvoices}
              </p>
            </div>

            {/* SALES */}

            <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
              <p className="text-xs text-slate-400">
                Total Sales
              </p>

              <p className="mt-1 text-xl font-bold text-emerald-600">
                ₹{totalSales.toFixed(2)}
              </p>
            </div>

            {/* CASH */}

            <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
              <p className="text-xs text-slate-400">
                Cash
              </p>

              <p className="mt-1 text-xl font-bold text-slate-900">
                {cashInvoices}
              </p>
            </div>

            {/* UPI */}

            <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
              <p className="text-xs text-slate-400">
                UPI
              </p>

              <p className="mt-1 text-xl font-bold text-purple-600">
                {upiInvoices}
              </p>
            </div>

          </div>
        </div>

        {/* =================================================
            SEARCH
        ================================================= */}

        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

          <div className="relative w-full sm:max-w-md">

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
              type="text"
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              placeholder="Search invoice, customer, phone..."
              className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            />

          </div>

          <p className="text-sm text-slate-500">
            Showing{" "}
            <span className="font-semibold text-slate-900">
              {filteredInvoices.length}
            </span>{" "}
            invoices
          </p>

        </div>

        {/* =================================================
            TABLE CARD
        ================================================= */}

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

          {/* TABLE HEADER */}

          <div className="flex flex-col gap-3 border-b border-slate-200 bg-white px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">

            <div className="flex items-center gap-3">

              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-sm">
                🧾
              </div>

              <div>
                <h2 className="text-base font-semibold text-slate-900">
                  Invoice Records
                </h2>

                <p className="text-xs text-slate-400">
                  All generated sales invoices
                </p>
              </div>

            </div>

            <div className="w-fit rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-600">
              Total Records:{" "}
              <span className="text-indigo-600">
                {invoices.length}
              </span>
            </div>

          </div>

          {/* =================================================
              TABLE
          ================================================= */}

          <div className="overflow-x-auto">

            <table className="w-full min-w-[1100px] text-sm">

              <thead className="bg-slate-50">

                <tr className="border-b border-slate-200">

                  <th className="px-4 py-4 text-center font-semibold text-slate-600">
                    #
                  </th>

                  <th className="px-5 py-4 text-left font-semibold text-slate-600">
                    Invoice
                  </th>

                  <th className="px-5 py-4 text-left font-semibold text-slate-600">
                    Date
                  </th>

                  <th className="px-5 py-4 text-left font-semibold text-slate-600">
                    Customer
                  </th>

                  <th className="px-5 py-4 text-center font-semibold text-slate-600">
                    Items
                  </th>

                  <th className="px-5 py-4 text-center font-semibold text-slate-600">
                    Payment
                  </th>

                  <th className="px-5 py-4 text-right font-semibold text-slate-600">
                    Subtotal
                  </th>

                  <th className="px-5 py-4 text-right font-semibold text-slate-600">
                    Tax
                  </th>

                  <th className="px-5 py-4 text-right font-semibold text-slate-600">
                    Grand Total
                  </th>

                  <th className="px-5 py-4 text-center font-semibold text-slate-600">
                    Action
                  </th>

                </tr>

              </thead>

              <tbody>

                {/* LOADING */}

                {loading ? (

                  <tr>
                    <td
                      colSpan={10}
                      className="py-12 text-center text-slate-400"
                    >

                      <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-indigo-600" />

                      <p className="mt-3 text-sm">
                        Loading invoices...
                      </p>

                    </td>
                  </tr>

                ) : filteredInvoices.length === 0 ? (

                  /* EMPTY */

                  <tr>
                    <td
                      colSpan={10}
                      className="py-12 text-center"
                    >

                      <div className="text-3xl">
                        🧾
                      </div>

                      <p className="mt-2 font-medium text-slate-600">
                        No invoices found
                      </p>

                      <p className="mt-1 text-xs text-slate-400">
                        Try another search or create a new invoice.
                      </p>

                    </td>
                  </tr>

                ) : (

                  filteredInvoices.map(
                    (invoice, index) => {

                      const customer =
                        getCustomer(invoice);

                      const subtotal =
                        Number(
                          invoice?.subtotal || 0
                        );

                      const tax =
                        Number(
                          invoice?.taxTotal || 0
                        );

                      const grandTotal =
                        Number(
                          invoice?.grandTotal || 0
                        );

                      return (

                        <tr
                          key={
                            invoice?._id ||
                            index
                          }
                          className="border-b border-slate-100 transition hover:bg-indigo-50/40"
                        >

                          {/* NUMBER */}

                          <td className="px-4 py-4 text-center text-slate-400">
                            {index + 1}
                          </td>

                          {/* INVOICE */}

                          <td className="px-5 py-4">

                            <div className="flex items-center gap-2">

                              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-100 text-sm">
                                🧾
                              </div>

                              <span className="font-mono text-xs font-bold text-indigo-700">
                                {invoice?.invoiceNumber ||
                                  "-"}
                              </span>

                            </div>

                          </td>

                          {/* DATE */}

                          <td className="whitespace-nowrap px-5 py-4 text-xs text-slate-600">
                            {formatDate(
                              invoice?.createdAt ||
                              invoice?.date
                            )}
                          </td>

                          {/* CUSTOMER */}

                          <td className="px-5 py-4">

                            <div className="flex items-center gap-3">

                              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-700">
                                {getInitials(
                                  customer?.name
                                )}
                              </div>

                              <div className="min-w-0">

                                <p className="max-w-[180px] truncate font-semibold text-slate-800">
                                  {customer?.name ||
                                    "Walk-in Customer"}
                                </p>

                                <p className="mt-0.5 text-[11px] text-slate-400">
                                  {customer?.phone ||
                                    "No phone number"}
                                </p>

                              </div>

                            </div>

                          </td>

                          {/* ITEMS */}

                          <td className="px-5 py-4 text-center">

                            <span className="inline-flex min-w-[30px] justify-center rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                              {invoice?.items?.length ||
                                0}
                            </span>

                          </td>

                          {/* PAYMENT */}

                          <td className="px-5 py-4 text-center">

                            <span
                              className={`inline-flex min-w-[65px] justify-center rounded-lg border px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wide ${getPaymentStyle(
                                invoice?.paymentMethod
                              )}`}
                            >
                              {invoice?.paymentMethod ||
                                "N/A"}
                            </span>

                          </td>

                          {/* SUBTOTAL */}

                          <td className="px-5 py-4 text-right font-medium text-slate-700">
                            ₹{subtotal.toFixed(2)}
                          </td>

                          {/* TAX */}

                          <td className="px-5 py-4 text-right font-medium text-amber-600">
                            ₹{tax.toFixed(2)}
                          </td>

                          {/* GRAND TOTAL */}

                          <td className="px-5 py-4 text-right">

                            <span className="font-bold text-emerald-600">
                              ₹{grandTotal.toFixed(2)}
                            </span>

                          </td>

                          {/* ACTION */}

                          <td className="px-5 py-4 text-center">

                            <button
                              type="button"
                              onClick={() =>
                                openInvoice(invoice)
                              }
                              className="rounded-lg bg-indigo-50 px-3 py-2 text-xs font-semibold text-indigo-600 transition hover:bg-indigo-600 hover:text-white"
                            >
                              View
                            </button>

                          </td>

                        </tr>

                      );
                    }
                  )

                )}

              </tbody>

              {/* =================================================
                  TOTAL FOOTER
              ================================================= */}

              {!loading &&
                filteredInvoices.length > 0 && (

                  <tfoot>

                    <tr className="bg-slate-50">

                      <td
                        colSpan={6}
                        className="px-5 py-4 text-right text-xs font-bold uppercase tracking-wide text-slate-500"
                      >
                        Total
                      </td>

                      <td className="px-5 py-4 text-right font-bold text-slate-800">
                        ₹{filteredSubtotal.toFixed(2)}
                      </td>

                      <td className="px-5 py-4 text-right font-bold text-amber-600">
                        ₹{filteredTax.toFixed(2)}
                      </td>

                      <td className="bg-emerald-50 px-5 py-4 text-right font-bold text-emerald-700">
                        ₹{filteredGrandTotal.toFixed(2)}
                      </td>

                      <td />
                    </tr>

                  </tfoot>

                )}

            </table>

          </div>

        </div>

        {/* =================================================
            FOOTER
        ================================================= */}

        <div className="mt-3 flex flex-col gap-1 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between">

          <span>
            Invoice history & sales records
          </span>

          <span>
            {invoices.length} Records
          </span>

        </div>

      </div>

      {/* =====================================================
          INVOICE DETAILS MODAL
      ===================================================== */}

      {selectedInvoice && (

        <div
          className="fixed inset-0 z-[999] flex items-center justify-center bg-slate-950/60 p-3 backdrop-blur-sm sm:p-5"
          onClick={closeInvoice}
        >

          <div
            className="max-h-[92vh] w-full max-w-4xl overflow-hidden rounded-2xl bg-white shadow-2xl"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            {/* MODAL HEADER */}

            <div className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-4 sm:px-6">

              <div className="flex min-w-0 items-center gap-3">

                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-lg text-white">
                  🧾
                </div>

                <div className="min-w-0">

                  <h2 className="truncate text-base font-bold text-slate-900 sm:text-lg">
                    Invoice Details
                  </h2>

                  <p className="font-mono text-xs text-indigo-600">
                    {selectedInvoice.invoiceNumber ||
                      "-"}
                  </p>

                </div>

              </div>

              <button
                type="button"
                onClick={closeInvoice}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500 transition hover:bg-red-50 hover:text-red-600"
              >
                ✕
              </button>

            </div>

            {/* MODAL BODY */}

            <div className="max-h-[calc(92vh-130px)] overflow-y-auto p-4 sm:p-6">

              <div className="space-y-5">

                {/* CUSTOMER INFO */}

                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:p-5">

                  <div className="mb-4 flex items-center gap-3">

                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 text-white">
                      👤
                    </div>

                    <div>
                      <h3 className="font-semibold text-slate-900">
                        Customer Information
                      </h3>

                      <p className="text-xs text-slate-400">
                        Billing customer details
                      </p>
                    </div>

                  </div>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">

                    <InfoBox
                      title="Customer Name"
                      value={
                        selectedInvoice.customer
                          ?.name ||
                        "Walk-in Customer"
                      }
                    />

                    <InfoBox
                      title="Phone"
                      value={
                        selectedInvoice.customer
                          ?.phone ||
                        "Not Available"
                      }
                    />

                    <InfoBox
                      title="Email"
                      value={
                        selectedInvoice.customer
                          ?.email ||
                        "Not Available"
                      }
                    />

                    <InfoBox
                      title="Address"
                      value={
                        selectedInvoice.customer
                          ?.address ||
                        "Not Available"
                      }
                    />

                  </div>

                </div>

                {/* INVOICE INFO */}

                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">

                  <InfoBox
                    title="Invoice"
                    value={
                      selectedInvoice.invoiceNumber ||
                      "-"
                    }
                    valueClass="font-mono text-indigo-600"
                  />

                  <InfoBox
                    title="Date"
                    value={formatDate(
                      selectedInvoice.createdAt ||
                      selectedInvoice.date
                    )}
                  />

                  <div className="rounded-xl border border-slate-200 bg-white p-4">

                    <p className="text-xs text-slate-400">
                      Payment
                    </p>

                    <span
                      className={`mt-1 inline-flex rounded-lg border px-2.5 py-1 text-[10px] font-bold uppercase ${getPaymentStyle(
                        selectedInvoice.paymentMethod
                      )}`}
                    >
                      {selectedInvoice.paymentMethod ||
                        "N/A"}
                    </span>

                  </div>

                  <InfoBox
                    title="Items"
                    value={
                      selectedInvoice.items?.length ||
                      0
                    }
                  />

                </div>

                {/* PRODUCTS */}

                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">

                  <div className="border-b border-slate-200 bg-slate-50 px-4 py-3">

                    <h3 className="font-semibold text-slate-900">
                      Purchased Products
                    </h3>

                    <p className="text-xs text-slate-400">
                      Products included in this invoice
                    </p>

                  </div>

                  <div className="overflow-x-auto">

                    <table className="w-full min-w-[600px] text-sm">

                      <thead className="bg-slate-50">

                        <tr className="border-b border-slate-200">

                          <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">
                            #
                          </th>

                          <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">
                            Product
                          </th>

                          <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500">
                            Qty
                          </th>

                          <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500">
                            Price
                          </th>

                          <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500">
                            Total
                          </th>

                        </tr>

                      </thead>

                      <tbody>

                        {selectedInvoice.items?.length > 0 ? (

                          selectedInvoice.items.map(
                            (item, index) => {

                              const qty =
                                Number(
                                  item?.qty || 0
                                );

                              const price =
                                Number(
                                  item?.price ||
                                  item?.product?.price ||
                                  0
                                );

                              const total =
                                Number(
                                  item?.total ||
                                  price * qty
                                );

                              return (

                                <tr
                                  key={
                                    item?._id ||
                                    `${index}-${item?.productId ||
                                    item?.name ||
                                    "product"
                                    }`
                                  }
                                  className="border-b border-slate-100 hover:bg-slate-50"
                                >

                                  <td className="px-4 py-3 text-slate-400">
                                    {index + 1}
                                  </td>

                                  <td className="px-4 py-3 font-semibold text-slate-800">
                                    {item?.name ||
                                      item?.product?.name ||
                                      "Product"}
                                  </td>

                                  <td className="px-4 py-3 text-center font-semibold text-slate-700">
                                    {qty}
                                  </td>

                                  <td className="px-4 py-3 text-right text-slate-600">
                                    ₹{price.toFixed(2)}
                                  </td>

                                  <td className="px-4 py-3 text-right font-bold text-slate-800">
                                    ₹{total.toFixed(2)}
                                  </td>

                                </tr>

                              );
                            }
                          )

                        ) : (

                          <tr>
                            <td
                              colSpan={5}
                              className="py-8 text-center text-sm text-slate-400"
                            >
                              No products found
                            </td>
                          </tr>

                        )}

                      </tbody>

                    </table>

                  </div>

                </div>

                {/* TOTALS */}

                <div className="ml-auto w-full max-w-sm rounded-2xl border border-slate-200 bg-slate-50 p-5">

                  <div className="flex justify-between py-1.5 text-sm">

                    <span className="text-slate-500">
                      Subtotal
                    </span>

                    <span className="font-semibold text-slate-800">
                      ₹
                      {Number(
                        selectedInvoice.subtotal ||
                        0
                      ).toFixed(2)}
                    </span>

                  </div>

                  <div className="flex justify-between py-1.5 text-sm">

                    <span className="text-slate-500">
                      Tax
                    </span>

                    <span className="font-semibold text-amber-600">
                      ₹
                      {Number(
                        selectedInvoice.taxTotal ||
                        0
                      ).toFixed(2)}
                    </span>

                  </div>

                  <div className="my-2 border-t border-slate-200" />

                  <div className="flex items-center justify-between">

                    <span className="font-bold text-slate-900">
                      Grand Total
                    </span>

                    <span className="text-xl font-bold text-emerald-600">
                      ₹
                      {Number(
                        selectedInvoice.grandTotal ||
                        0
                      ).toFixed(2)}
                    </span>

                  </div>

                </div>

              </div>

            </div>

            {/* MODAL FOOTER */}

            <div className="flex justify-end border-t border-slate-200 bg-slate-50 px-4 py-3 sm:px-6">

              <button
                type="button"
                onClick={closeInvoice}
                className="rounded-lg bg-slate-900 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700"
              >
                Close
              </button>

            </div>

          </div>

        </div>

      )}

    </div>
  );
}

// =====================================================
// INFO BOX
// =====================================================

function InfoBox({
  title,
  value,
  valueClass = "font-semibold text-slate-800",
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">

      <p className="text-xs font-medium text-slate-400">
        {title}
      </p>

      <p
        className={`mt-1 break-words text-sm ${valueClass}`}
      >
        {value}
      </p>

    </div>
  );
}







// "use client";

// import { useEffect, useMemo, useState } from "react";
// import api from "@/lib/api";
// import { toast } from "react-toastify";

// export default function InvoicesPage() {
//   const [invoices, setInvoices] = useState([]);
//   const [customers, setCustomers] = useState([]);
//   const [search, setSearch] = useState("");
//   const [loading, setLoading] = useState(true);
//   const [selectedInvoice, setSelectedInvoice] = useState(null);

//   // =====================================================
//   // FETCH INVOICES + CUSTOMERS
//   // =====================================================

//   const fetchData = async () => {
//     try {
//       setLoading(true);

//       const [invoiceRes, customerRes] = await Promise.all([
//         api.get("/invoices"),
//         api.get("/customers"),
//       ]);

//       const invoiceData = Array.isArray(invoiceRes.data)
//         ? invoiceRes.data
//         : [];

//       const customerData = Array.isArray(customerRes.data)
//         ? customerRes.data
//         : [];

//       setInvoices(invoiceData);
//       setCustomers(customerData);

//       console.log("Invoices:", invoiceData);
//       console.log("Customers:", customerData);
//     } catch (err) {
//       toast.error(
//         "Invoices / Customers error:",
//         err.response?.data || err.message
//       );

//       alert(
//         err.response?.data?.message ||
//         "Invoices / Customers no't loaded."
//       );
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchData();
//   }, []);

//   // =====================================================
//   // FIND CUSTOMER
//   // =====================================================

//   const getCustomer = (invoice) => {
//     // Agar invoice ke andar customer already object hai
//     if (
//       invoice?.customer &&
//       typeof invoice.customer === "object" &&
//       invoice.customer._id
//     ) {
//       return invoice.customer;
//     }

//     // Customer ID
//     const customerId =
//       typeof invoice?.customer === "string"
//         ? invoice.customer
//         : invoice?.customer?._id ||
//         invoice?.customerId ||
//         null;

//     if (!customerId) {
//       return null;
//     }

//     // Customers array se matching customer
//     const customer = customers.find(
//       (customer) =>
//         String(customer._id) === String(customerId)
//     );

//     return customer || null;
//   };

//   // =====================================================
//   // SEARCH
//   // =====================================================

//   const filteredInvoices = useMemo(() => {
//     const value = search.toLowerCase().trim();

//     if (!value) {
//       return invoices;
//     }

//     return invoices.filter((invoice) => {
//       const customer = getCustomer(invoice);

//       return (
//         invoice.invoiceNumber
//           ?.toLowerCase()
//           .includes(value) ||
//         customer?.name
//           ?.toLowerCase()
//           .includes(value) ||
//         customer?.phone
//           ?.toLowerCase()
//           .includes(value) ||
//         customer?.email
//           ?.toLowerCase()
//           .includes(value) ||
//         invoice.paymentMethod
//           ?.toLowerCase()
//           .includes(value)
//       );
//     });
//   }, [invoices, customers, search]);

//   // =====================================================
//   // SUMMARY
//   // =====================================================

//   const totalInvoices = invoices.length;

//   const totalSales = invoices.reduce(
//     (sum, invoice) =>
//       sum + Number(invoice.grandTotal || 0),
//     0
//   );

//   const cashInvoices = invoices.filter(
//     (invoice) =>
//       invoice.paymentMethod?.toLowerCase() === "cash"
//   ).length;

//   const upiInvoices = invoices.filter(
//     (invoice) =>
//       invoice.paymentMethod?.toLowerCase() === "upi"
//   ).length;

//   // =====================================================
//   // PAYMENT STYLE
//   // =====================================================

//   const getPaymentStyle = (method) => {
//     const payment = method?.toLowerCase();

//     if (payment === "cash") {
//       return "bg-emerald-50 text-emerald-700 border border-emerald-200";
//     }

//     if (payment === "upi") {
//       return "bg-purple-50 text-purple-700 border border-purple-200";
//     }

//     if (payment === "card") {
//       return "bg-blue-50 text-blue-700 border border-blue-200";
//     }

//     return "bg-slate-100 text-slate-600 border border-slate-200";
//   };

//   // =====================================================
//   // DATE FORMAT
//   // =====================================================

//   const formatDate = (date) => {
//     if (!date) {
//       return "-";
//     }

//     try {
//       return new Date(date).toLocaleDateString(
//         "en-IN",
//         {
//           day: "2-digit",
//           month: "short",
//           year: "numeric",
//         }
//       );
//     } catch {
//       return "-";
//     }
//   };

//   // =====================================================
//   // OPEN INVOICE POPUP
//   // =====================================================

//   const openInvoice = (invoice) => {
//     const customer = getCustomer(invoice);

//     setSelectedInvoice({
//       ...invoice,
//       customer: customer || null,
//     });
//   };

//   // =====================================================
//   // CLOSE POPUP
//   // =====================================================

//   const closeInvoice = () => {
//     setSelectedInvoice(null);
//   };

//   // =====================================================
//   // RETURN
//   // =====================================================

//   return (
//     <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">

//       <div className="mx-auto max-w-7xl">

//         {/* =================================================
//             HEADER
//         ================================================= */}

//         <div className="mb-6 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

//           {/* TITLE */}

//           <div className="flex items-center gap-3">

//             <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600 text-xl text-white shadow-md">
//               🧾
//             </div>

//             <div>
//               <h1 className="text-2xl font-bold tracking-tight text-slate-900">
//                 Invoice History
//               </h1>

//               <p className="mt-1 text-sm text-slate-500">
//                 View and manage all generated invoices
//               </p>
//             </div>

//           </div>


//           {/* =================================================
//               SUMMARY CARDS
//           ================================================= */}

//           <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">

//             {/* INVOICES */}

//             <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">

//               <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
//                 Invoices
//               </p>

//               <p className="mt-1 text-xl font-bold text-slate-900">
//                 {totalInvoices}
//               </p>

//             </div>


//             {/* SALES */}

//             <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">

//               <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
//                 Total Sales
//               </p>

//               <p className="mt-1 text-xl font-bold text-emerald-600">
//                 ₹{totalSales.toFixed(2)}
//               </p>

//             </div>


//             {/* CASH */}

//             <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">

//               <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
//                 Cash
//               </p>

//               <p className="mt-1 text-xl font-bold text-slate-800">
//                 {cashInvoices}
//               </p>

//             </div>


//             {/* UPI */}

//             <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">

//               <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
//                 UPI
//               </p>

//               <p className="mt-1 text-xl font-bold text-purple-600">
//                 {upiInvoices}
//               </p>

//             </div>

//           </div>

//         </div>


//         {/* =================================================
//             SEARCH BAR
//         ================================================= */}

//         <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

//           <div className="relative w-full sm:max-w-md">

//             <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">
//               🔍
//             </span>

//             <input
//               type="text"
//               value={search}
//               onChange={(e) =>
//                 setSearch(e.target.value)
//               }
//               placeholder="Search invoice, customer, phone, email..."
//               className="
//                 w-full
//                 rounded-xl
//                 border
//                 border-slate-200
//                 bg-white
//                 py-2.5
//                 pl-9
//                 pr-4
//                 text-sm
//                 text-slate-800
//                 outline-none
//                 transition
//                 placeholder:text-slate-400
//                 focus:border-indigo-500
//                 focus:ring-2
//                 focus:ring-indigo-100
//               "
//             />

//           </div>


//           <div className="text-sm text-slate-500">

//             Showing{" "}

//             <span className="font-bold text-slate-900">
//               {filteredInvoices.length}
//             </span>

//             {" "}of{" "}

//             <span className="font-bold text-slate-900">
//               {invoices.length}
//             </span>

//             {" "}invoices

//           </div>

//         </div>


//         {/* =================================================
//             EXCEL STYLE TABLE
//         ================================================= */}

//         <div className="overflow-hidden rounded-2xl border border-slate-300 bg-white shadow-md">

//           {/* TABLE TOOLBAR */}

//           <div className="flex flex-col gap-3 border-b border-slate-300 bg-slate-50 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">

//             <div className="flex items-center gap-3">

//               <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-600 text-white shadow-sm">
//                 📊
//               </div>

//               <div>

//                 <h2 className="text-base font-bold text-slate-900">
//                   Sales Invoice Records
//                 </h2>

//                 <p className="text-xs text-slate-500">
//                   Invoice data • Excel style sheet
//                 </p>

//               </div>

//             </div>


//             <div className="flex items-center gap-2">

//               <span className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 shadow-sm">

//                 Total Records:{" "}

//                 <span className="text-indigo-600">
//                   {invoices.length}
//                 </span>

//               </span>

//             </div>

//           </div>


//           {/* TABLE SCROLL */}

//           <div className="overflow-x-auto">

//             <table className="w-full min-w-[1250px] border-collapse text-sm">

//               {/* =================================================
//                   TABLE HEADER
//               ================================================= */}

//               <thead>

//                 <tr className="bg-slate-200">

//                   <th className="w-[55px] border border-slate-300 px-3 py-3 text-center text-xs font-bold uppercase tracking-wide text-slate-700">
//                     #
//                   </th>

//                   <th className="border border-slate-300 px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-700">
//                     Invoice #
//                   </th>

//                   <th className="border border-slate-300 px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-700">
//                     Date
//                   </th>

//                   <th className="min-w-[220px] border border-slate-300 px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-700">
//                     Customer
//                   </th>

//                   <th className="border border-slate-300 px-4 py-3 text-center text-xs font-bold uppercase tracking-wide text-slate-700">
//                     Items
//                   </th>

//                   <th className="border border-slate-300 px-4 py-3 text-center text-xs font-bold uppercase tracking-wide text-slate-700">
//                     Payment
//                   </th>

//                   <th className="border border-slate-300 px-4 py-3 text-right text-xs font-bold uppercase tracking-wide text-slate-700">
//                     Subtotal
//                   </th>

//                   <th className="border border-slate-300 px-4 py-3 text-right text-xs font-bold uppercase tracking-wide text-slate-700">
//                     Tax
//                   </th>

//                   <th className="border border-slate-300 px-4 py-3 text-right text-xs font-bold uppercase tracking-wide text-slate-700">
//                     Grand Total
//                   </th>

//                   <th className="border border-slate-300 px-4 py-3 text-center text-xs font-bold uppercase tracking-wide text-slate-700">
//                     Action
//                   </th>

//                 </tr>

//               </thead>


//               {/* =================================================
//                   TABLE BODY
//               ================================================= */}

//               <tbody>

//                 {/* LOADING */}

//                 {loading ? (

//                   <tr>

//                     <td
//                       colSpan="10"
//                       className="border border-slate-300 py-16 text-center"
//                     >

//                       <div className="mx-auto h-9 w-9 animate-spin rounded-full border-4 border-slate-200 border-t-indigo-600" />

//                       <p className="mt-3 text-sm font-medium text-slate-500">
//                         Loading invoices...
//                       </p>

//                     </td>

//                   </tr>

//                 ) : filteredInvoices.length === 0 ? (

//                   /* EMPTY */

//                   <tr>

//                     <td
//                       colSpan="10"
//                       className="border border-slate-300 py-16 text-center"
//                     >

//                       <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-2xl">
//                         🧾
//                       </div>

//                       <p className="mt-3 font-semibold text-slate-700">
//                         No invoices found
//                       </p>

//                       <p className="mt-1 text-xs text-slate-400">
//                         Try another search or generate a new invoice.
//                       </p>

//                     </td>

//                   </tr>

//                 ) : (

//                   /* DATA */

//                   filteredInvoices.map(
//                     (invoice, index) => {

//                       const customer =
//                         getCustomer(invoice);

//                       const subtotal =
//                         Number(
//                           invoice.subtotal || 0
//                         );

//                       const tax =
//                         Number(
//                           invoice.taxTotal || 0
//                         );

//                       const grandTotal =
//                         Number(
//                           invoice.grandTotal || 0
//                         );

//                       return (

//                         <tr
//                           key={invoice._id}
//                           className={`
//                             border-b
//                             border-slate-300
//                             transition
//                             hover:bg-indigo-50
//                             ${index % 2 === 0
//                               ? "bg-white"
//                               : "bg-slate-50/60"
//                             }
//                           `}
//                         >

//                           {/* SERIAL */}

//                           <td className="border border-slate-300 px-3 py-3 text-center text-xs font-medium text-slate-500">
//                             {index + 1}
//                           </td>


//                           {/* INVOICE */}

//                           <td className="border border-slate-300 px-4 py-3">

//                             <div className="flex items-center gap-2">

//                               <span className="flex h-7 w-7 items-center justify-center rounded-md bg-indigo-100 text-xs">
//                                 🧾
//                               </span>

//                               <span className="font-mono text-xs font-bold text-indigo-700">
//                                 {invoice.invoiceNumber || "-"}
//                               </span>

//                             </div>

//                           </td>


//                           {/* DATE */}

//                           <td className="whitespace-nowrap border border-slate-300 px-4 py-3 text-xs font-medium text-slate-600">

//                             {formatDate(
//                               invoice.createdAt ||
//                               invoice.date
//                             )}

//                           </td>


//                           {/* CUSTOMER */}

//                           <td className="border border-slate-300 px-4 py-3">

//                             <div className="flex items-center gap-3">

//                               <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-sm">
//                                 👤
//                               </div>

//                               <div className="min-w-0">

//                                 <p className="truncate text-sm font-semibold text-slate-800">
//                                   {customer?.name ||
//                                     "Walk-in Customer"}
//                                 </p>

//                                 <p className="mt-0.5 text-[11px] text-slate-400">
//                                   {customer?.phone ||
//                                     "No phone number"}
//                                 </p>

//                               </div>

//                             </div>

//                           </td>


//                           {/* ITEMS */}

//                           <td className="border border-slate-300 px-4 py-3 text-center">

//                             <span className="inline-flex min-w-[32px] justify-center rounded-md border border-slate-300 bg-white px-2 py-1 text-xs font-bold text-slate-700 shadow-sm">
//                               {invoice.items?.length || 0}
//                             </span>

//                           </td>


//                           {/* PAYMENT */}

//                           <td className="border border-slate-300 px-4 py-3 text-center">

//                             <span
//                               className={`
//                                 inline-flex
//                                 min-w-[70px]
//                                 justify-center
//                                 rounded-md
//                                 px-2.5
//                                 py-1.5
//                                 text-[10px]
//                                 font-bold
//                                 uppercase
//                                 tracking-wide
//                                 ${getPaymentStyle(
//                                 invoice.paymentMethod
//                               )}
//                               `}
//                             >
//                               {invoice.paymentMethod ||
//                                 "N/A"}
//                             </span>

//                           </td>


//                           {/* SUBTOTAL */}

//                           <td className="border border-slate-300 px-4 py-3 text-right font-medium text-slate-700">
//                             ₹{subtotal.toFixed(2)}
//                           </td>


//                           {/* TAX */}

//                           <td className="border border-slate-300 px-4 py-3 text-right font-medium text-amber-600">
//                             ₹{tax.toFixed(2)}
//                           </td>


//                           {/* GRAND TOTAL */}

//                           <td className="border border-slate-300 bg-emerald-50/50 px-4 py-3 text-right">

//                             <span className="text-sm font-bold text-emerald-700">
//                               ₹{grandTotal.toFixed(2)}
//                             </span>

//                           </td>


//                           {/* ACTION */}

//                           <td className="border border-slate-300 px-4 py-3 text-center">

//                             <button
//                               type="button"
//                               onClick={() =>
//                                 openInvoice(invoice)
//                               }
//                               className="
//                                 inline-flex
//                                 items-center
//                                 gap-1.5
//                                 rounded-md
//                                 border
//                                 border-indigo-200
//                                 bg-indigo-50
//                                 px-3
//                                 py-1.5
//                                 text-xs
//                                 font-bold
//                                 text-indigo-600
//                                 shadow-sm
//                                 transition
//                                 hover:border-indigo-600
//                                 hover:bg-indigo-600
//                                 hover:text-white
//                                 active:scale-95
//                               "
//                             >
//                               👁 View
//                             </button>

//                           </td>

//                         </tr>

//                       );
//                     }
//                   )

//                 )}

//               </tbody>


//               {/* =================================================
//                   EXCEL TOTAL FOOTER
//               ================================================= */}

//               {!loading &&
//                 filteredInvoices.length > 0 && (

//                   <tfoot>

//                     <tr className="bg-slate-100 font-bold">

//                       <td
//                         colSpan="6"
//                         className="
//                           border
//                           border-slate-300
//                           px-4
//                           py-3
//                           text-right
//                           text-xs
//                           uppercase
//                           tracking-wide
//                           text-slate-600
//                         "
//                       >
//                         Total
//                       </td>


//                       {/* SUBTOTAL TOTAL */}

//                       <td className="border border-slate-300 px-4 py-3 text-right text-slate-800">

//                         ₹
//                         {filteredInvoices
//                           .reduce(
//                             (sum, invoice) =>
//                               sum +
//                               Number(
//                                 invoice.subtotal || 0
//                               ),
//                             0
//                           )
//                           .toFixed(2)}

//                       </td>


//                       {/* TAX TOTAL */}

//                       <td className="border border-slate-300 px-4 py-3 text-right text-amber-600">

//                         ₹
//                         {filteredInvoices
//                           .reduce(
//                             (sum, invoice) =>
//                               sum +
//                               Number(
//                                 invoice.taxTotal || 0
//                               ),
//                             0
//                           )
//                           .toFixed(2)}

//                       </td>


//                       {/* GRAND TOTAL */}

//                       <td className="border border-slate-300 bg-emerald-100 px-4 py-3 text-right text-emerald-700">

//                         ₹
//                         {filteredInvoices
//                           .reduce(
//                             (sum, invoice) =>
//                               sum +
//                               Number(
//                                 invoice.grandTotal || 0
//                               ),
//                             0
//                           )
//                           .toFixed(2)}

//                       </td>


//                       <td className="border border-slate-300 bg-slate-100" />

//                     </tr>

//                   </tfoot>

//                 )}

//             </table>

//           </div>

//         </div>


//         {/* =================================================
//             FOOTER INFO
//         ================================================= */}

//         <div className="mt-3 flex flex-col gap-1 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between">

//           <span>
//             Invoice history & sales records
//           </span>

//           <span>
//             {invoices.length} total records
//           </span>

//         </div>

//       </div>


//       {/* =====================================================
//           CUSTOMER + INVOICE POPUP
//       ===================================================== */}

//       {selectedInvoice && (

//         <div
//           className="
//             fixed
//             inset-0
//             z-[999]
//             flex
//             items-center
//             justify-center
//             bg-slate-950/60
//             p-4
//             backdrop-blur-sm
//           "
//           onClick={closeInvoice}
//         >

//           <div
//             className="
//               max-h-[90vh]
//               w-full
//               max-w-4xl
//               overflow-y-auto
//               rounded-2xl
//               bg-white
//               shadow-2xl
//             "
//             onClick={(e) =>
//               e.stopPropagation()
//             }
//           >

//             {/* =================================================
//                 POPUP HEADER
//             ================================================= */}

//             <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">

//               <div className="flex items-center gap-3">

//                 <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-600 text-xl text-white">
//                   🧾
//                 </div>

//                 <div>

//                   <h2 className="text-lg font-bold text-slate-900">
//                     Customer & Invoice Details
//                   </h2>

//                   <p className="font-mono text-xs text-indigo-600">
//                     {selectedInvoice.invoiceNumber ||
//                       "-"}
//                   </p>

//                 </div>

//               </div>


//               <button
//                 type="button"
//                 onClick={closeInvoice}
//                 className="
//                   flex
//                   h-9
//                   w-9
//                   items-center
//                   justify-center
//                   rounded-lg
//                   bg-slate-100
//                   text-slate-500
//                   transition
//                   hover:bg-red-50
//                   hover:text-red-600
//                 "
//               >
//                 ✕
//               </button>

//             </div>


//             {/* =================================================
//                 POPUP CONTENT
//             ================================================= */}

//             <div className="space-y-5 p-6">

//               {/* =================================================
//                   CUSTOMER INFORMATION
//               ================================================= */}

//               <div className="rounded-2xl border border-indigo-100 bg-indigo-50/50 p-5">

//                 <div className="mb-4 flex items-center gap-2">

//                   <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 text-white">
//                     👤
//                   </div>

//                   <div>

//                     <h3 className="font-bold text-slate-900">
//                       Customer Information
//                     </h3>

//                     <p className="text-xs text-slate-500">
//                       Customer details
//                     </p>

//                   </div>

//                 </div>


//                 <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

//                   {/* NAME */}

//                   <div className="rounded-xl border border-slate-200 bg-white p-4">

//                     <p className="text-xs font-medium text-slate-400">
//                       Customer Name
//                     </p>

//                     <p className="mt-1 text-base font-bold text-slate-900">
//                       {selectedInvoice.customer
//                         ?.name ||
//                         "Walk-in Customer"}
//                     </p>

//                   </div>


//                   {/* PHONE */}

//                   <div className="rounded-xl border border-slate-200 bg-white p-4">

//                     <p className="text-xs font-medium text-slate-400">
//                       Phone Number
//                     </p>

//                     <p className="mt-1 text-base font-bold text-slate-900">
//                       {selectedInvoice.customer
//                         ?.phone ||
//                         "Not Available"}
//                     </p>

//                   </div>


//                   {/* EMAIL */}

//                   <div className="rounded-xl border border-slate-200 bg-white p-4">

//                     <p className="text-xs font-medium text-slate-400">
//                       Email Address
//                     </p>

//                     <p className="mt-1 break-all text-sm font-semibold text-slate-800">
//                       {selectedInvoice.customer
//                         ?.email ||
//                         "Not Available"}
//                     </p>

//                   </div>


//                   {/* ADDRESS */}

//                   <div className="rounded-xl border border-slate-200 bg-white p-4">

//                     <p className="text-xs font-medium text-slate-400">
//                       Address
//                     </p>

//                     <p className="mt-1 text-sm font-semibold text-slate-800">
//                       {selectedInvoice.customer
//                         ?.address ||
//                         "Not Available"}
//                     </p>

//                   </div>

//                 </div>

//               </div>


//               {/* =================================================
//                   INVOICE INFORMATION
//               ================================================= */}

//               <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">

//                 <div className="rounded-xl border border-slate-200 bg-white p-4">

//                   <p className="text-xs text-slate-400">
//                     Invoice
//                   </p>

//                   <p className="mt-1 font-mono font-bold text-indigo-600">
//                     {selectedInvoice.invoiceNumber ||
//                       "-"}
//                   </p>

//                 </div>


//                 <div className="rounded-xl border border-slate-200 bg-white p-4">

//                   <p className="text-xs text-slate-400">
//                     Date
//                   </p>

//                   <p className="mt-1 font-semibold text-slate-800">
//                     {formatDate(
//                       selectedInvoice.createdAt ||
//                       selectedInvoice.date
//                     )}
//                   </p>

//                 </div>


//                 <div className="rounded-xl border border-slate-200 bg-white p-4">

//                   <p className="text-xs text-slate-400">
//                     Payment
//                   </p>

//                   <span
//                     className={`
//                       mt-1
//                       inline-flex
//                       rounded-full
//                       px-2
//                       py-1
//                       text-[11px]
//                       font-bold
//                       uppercase
//                       ${getPaymentStyle(
//                       selectedInvoice.paymentMethod
//                     )}
//                     `}
//                   >
//                     {selectedInvoice.paymentMethod ||
//                       "N/A"}
//                   </span>

//                 </div>


//                 <div className="rounded-xl border border-slate-200 bg-white p-4">

//                   <p className="text-xs text-slate-400">
//                     Items
//                   </p>

//                   <p className="mt-1 font-bold text-slate-800">
//                     {selectedInvoice.items?.length ||
//                       0}
//                   </p>

//                 </div>

//               </div>


//               {/* =================================================
//                   PURCHASED PRODUCTS
//               ================================================= */}

//               <div className="overflow-hidden rounded-xl border border-slate-200">

//                 <div className="border-b border-slate-200 bg-slate-100 px-4 py-3">

//                   <h3 className="font-bold text-slate-800">
//                     Purchased Products
//                   </h3>

//                 </div>


//                 <div className="overflow-x-auto">

//                   <table className="w-full min-w-[650px] border-collapse text-sm">

//                     <thead>

//                       <tr className="bg-slate-50">

//                         <th className="border border-slate-200 px-4 py-3 text-left text-xs font-bold text-slate-500">
//                           #
//                         </th>

//                         <th className="border border-slate-200 px-4 py-3 text-left text-xs font-bold text-slate-500">
//                           Product
//                         </th>

//                         <th className="border border-slate-200 px-4 py-3 text-center text-xs font-bold text-slate-500">
//                           Qty
//                         </th>

//                         <th className="border border-slate-200 px-4 py-3 text-right text-xs font-bold text-slate-500">
//                           Price
//                         </th>

//                         <th className="border border-slate-200 px-4 py-3 text-right text-xs font-bold text-slate-500">
//                           Total
//                         </th>

//                       </tr>

//                     </thead>


//                     <tbody>

//                       {selectedInvoice.items?.length > 0 ? (

//                         selectedInvoice.items.map(
//                           (item, index) => {

//                             const qty =
//                               Number(
//                                 item.qty || 0
//                               );

//                             const price =
//                               Number(
//                                 item.price ||
//                                 item.product?.price ||
//                                 0
//                               );

//                             const total =
//                               Number(
//                                 item.total ||
//                                 price * qty
//                               );

//                             return (

//                               <tr
//                                 key={
//                                   item._id ||
//                                   `${index}-${item.productId || item.name}`
//                                 }
//                                 className="hover:bg-slate-50"
//                               >

//                                 <td className="border border-slate-200 px-4 py-3 text-slate-400">
//                                   {index + 1}
//                                 </td>

//                                 <td className="border border-slate-200 px-4 py-3 font-semibold text-slate-800">
//                                   {item.name ||
//                                     item.product?.name ||
//                                     "Product"}
//                                 </td>

//                                 <td className="border border-slate-200 px-4 py-3 text-center font-semibold">
//                                   {qty}
//                                 </td>

//                                 <td className="border border-slate-200 px-4 py-3 text-right text-slate-600">
//                                   ₹{price.toFixed(2)}
//                                 </td>

//                                 <td className="border border-slate-200 px-4 py-3 text-right font-bold text-slate-800">
//                                   ₹{total.toFixed(2)}
//                                 </td>

//                               </tr>

//                             );
//                           }
//                         )

//                       ) : (

//                         <tr>

//                           <td
//                             colSpan="5"
//                             className="border border-slate-200 py-8 text-center text-sm text-slate-400"
//                           >
//                             No products found
//                           </td>

//                         </tr>

//                       )}

//                     </tbody>

//                   </table>

//                 </div>

//               </div>


//               {/* =================================================
//                   TOTALS
//               ================================================= */}

//               <div className="ml-auto w-full max-w-sm rounded-xl border border-slate-200 bg-slate-50 p-5">

//                 <div className="flex justify-between py-1.5">

//                   <span className="text-slate-500">
//                     Subtotal
//                   </span>

//                   <b className="text-slate-800">
//                     ₹
//                     {Number(
//                       selectedInvoice.subtotal || 0
//                     ).toFixed(2)}
//                   </b>

//                 </div>


//                 <div className="flex justify-between py-1.5">

//                   <span className="text-slate-500">
//                     Tax
//                   </span>

//                   <b className="text-amber-600">
//                     ₹
//                     {Number(
//                       selectedInvoice.taxTotal || 0
//                     ).toFixed(2)}
//                   </b>

//                 </div>


//                 <div className="my-2 border-t border-slate-200" />


//                 <div className="flex justify-between">

//                   <span className="font-bold text-slate-900">
//                     Grand Total
//                   </span>

//                   <span className="text-xl font-bold text-emerald-600">
//                     ₹
//                     {Number(
//                       selectedInvoice.grandTotal || 0
//                     ).toFixed(2)}
//                   </span>

//                 </div>

//               </div>

//             </div>


//             {/* =================================================
//                 POPUP FOOTER
//             ================================================= */}

//             <div className="flex justify-end border-t border-slate-200 bg-slate-50 px-6 py-4">

//               <button
//                 type="button"
//                 onClick={closeInvoice}
//                 className="
//                   rounded-lg
//                   bg-slate-900
//                   px-6
//                   py-2
//                   text-sm
//                   font-semibold
//                   text-white
//                   transition
//                   hover:bg-slate-700
//                 "
//               >
//                 Close
//               </button>

//             </div>

//           </div>

//         </div>

//       )}

//     </div>
//   );
// }

"use client";

import { setActiveCustomer } from "@/lib/activeCustomer";
import { useEffect, useMemo, useState } from "react";
import api from "@/lib/api";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { toast } from "react-toastify";

const emptyCustomer = {
  _id: "",
  name: "",
  phone: "",
  email: "",
  address: "",
};

export default function BillingPage() {
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);

  const [search, setSearch] = useState("");
  const [customerSearch, setCustomerSearch] = useState("");

  const [cart, setCart] = useState([]);
  const [selectedCustomer, setSelectedCustomer] =
    useState(emptyCustomer);

  const [paymentMethod, setPaymentMethod] =
    useState("cash");

  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  // =========================================================
  // LOAD PRODUCTS + CUSTOMERS
  // =========================================================

  useEffect(() => {
    const loadData = async () => {
      try {
        const [productsRes, customersRes] =
          await Promise.all([
            api.get("/products"),
            api.get("/customers"),
          ]);

        setProducts(
          Array.isArray(productsRes.data)
            ? productsRes.data
            : []
        );

        setCustomers(
          Array.isArray(customersRes.data)
            ? customersRes.data
            : []
        );
      } catch (error) {
        toast.error(
          `Data loading error: ${error.response?.data?.message ||
          error.message
          }`
        );
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // =========================================================
  // RESTORE SELECTED CUSTOMER
  // =========================================================

  useEffect(() => {
    const savedCustomer =
      sessionStorage.getItem("selectedCustomer");

    if (savedCustomer) {
      try {
        const customer =
          JSON.parse(savedCustomer);

        const customerData = {
          _id: customer._id || "",
          name: customer.name || "",
          phone: customer.phone || "",
          email: customer.email || "",
          address: customer.address || "",
        };

        setSelectedCustomer(customerData);
        setActiveCustomer(customerData);

        sessionStorage.removeItem(
          "selectedCustomer"
        );
      } catch (error) {
        console.error(
          "Selected customer error:",
          error
        );
      }
    }
  }, []);

  // =========================================================
  // FILTER PRODUCTS
  // =========================================================

  const filteredProducts = useMemo(() => {
    const value = search
      .toLowerCase()
      .trim();

    return products.filter((product) => {
      return (
        product.name
          ?.toLowerCase()
          .includes(value) ||
        product.sku
          ?.toLowerCase()
          .includes(value)
      );
    });
  }, [products, search]);

  // =========================================================
  // FILTER CUSTOMERS
  // =========================================================

  const filteredCustomers = useMemo(() => {
    const value = customerSearch
      .toLowerCase()
      .trim();

    if (!value) {
      return customers.slice(0, 8);
    }

    return customers.filter((customer) => {
      return (
        customer.name
          ?.toLowerCase()
          .includes(value) ||
        customer.phone
          ?.toLowerCase()
          .includes(value) ||
        customer.email
          ?.toLowerCase()
          .includes(value)
      );
    });
  }, [customers, customerSearch]);

  // =========================================================
  // SELECT CUSTOMER
  // =========================================================

  const selectCustomer = (customer) => {
    const customerData = {
      _id: customer._id || "",
      name: customer.name || "",
      phone: customer.phone || "",
      email: customer.email || "",
      address: customer.address || "",
    };

    setSelectedCustomer(customerData);
    setActiveCustomer(customerData);
    setCustomerSearch("");
  };

  // =========================================================
  // CLEAR CUSTOMER
  // =========================================================

  const clearCustomer = () => {
    setSelectedCustomer(emptyCustomer);
    setActiveCustomer(null);
    setCustomerSearch("");
  };

  // =========================================================
  // ADD PRODUCT TO CART
  // =========================================================

  const addToCart = (product) => {
    if (Number(product.stock) <= 0) {
      toast.warn("This product is out of stock.");
      return;
    }

    setCart((prev) => {
      const existing = prev.find(
        (item) =>
          item.productId === product._id
      );

      if (existing) {
        if (
          existing.qty >=
          Number(product.stock)
        ) {
          toast.warn(
            "Stock limit reached for this product."
          );

          return prev;
        }

        return prev.map((item) =>
          item.productId === product._id
            ? {
              ...item,
              qty: item.qty + 1,
            }
            : item
        );
      }

      return [
        ...prev,
        {
          productId: product._id,
          name: product.name,
          sku: product.sku || "-",
          price: Number(product.price || 0),
          taxRate: Number(
            product.taxRate || 0
          ),
          stock: Number(
            product.stock || 0
          ),
          qty: 1,
        },
      ];
    });
  };

  // =========================================================
  // UPDATE QTY
  // =========================================================

  const updateQty = (productId, qty) => {
    const newQty = Number(qty);

    if (
      newQty <= 0 ||
      Number.isNaN(newQty)
    ) {
      setCart((prev) =>
        prev.filter(
          (item) =>
            item.productId !== productId
        )
      );

      return;
    }

    setCart((prev) =>
      prev.map((item) =>
        item.productId === productId
          ? {
            ...item,
            qty:
              item.stock &&
                newQty > item.stock
                ? item.stock
                : newQty,
          }
          : item
      )
    );
  };

  // =========================================================
  // REMOVE ITEM
  // =========================================================

  const removeItem = (productId) => {
    setCart((prev) =>
      prev.filter(
        (item) =>
          item.productId !== productId
      )
    );
  };

  // =========================================================
  // CALCULATIONS
  // =========================================================

  const totalItems = cart.reduce(
    (sum, item) =>
      sum + Number(item.qty || 0),
    0
  );

  const subtotal = cart.reduce(
    (sum, item) =>
      sum +
      Number(item.price || 0) *
      Number(item.qty || 0),
    0
  );

  const taxTotal = cart.reduce(
    (sum, item) =>
      sum +
      (Number(item.price || 0) *
        Number(item.qty || 0) *
        Number(item.taxRate || 0)) /
      100,
    0
  );

  const grandTotal =
    subtotal + taxTotal;

  // =========================================================
  // NUMBER TO WORDS
  // =========================================================

  const numberToWords = (amount) => {
    const ones = [
      "",
      "One",
      "Two",
      "Three",
      "Four",
      "Five",
      "Six",
      "Seven",
      "Eight",
      "Nine",
      "Ten",
      "Eleven",
      "Twelve",
      "Thirteen",
      "Fourteen",
      "Fifteen",
      "Sixteen",
      "Seventeen",
      "Eighteen",
      "Nineteen",
    ];

    const tens = [
      "",
      "",
      "Twenty",
      "Thirty",
      "Forty",
      "Fifty",
      "Sixty",
      "Seventy",
      "Eighty",
      "Ninety",
    ];

    const convert = (num) => {
      if (num < 20) {
        return ones[num];
      }

      if (num < 100) {
        return (
          tens[Math.floor(num / 10)] +
          (num % 10
            ? " " + ones[num % 10]
            : "")
        );
      }

      if (num < 1000) {
        return (
          ones[Math.floor(num / 100)] +
          " Hundred" +
          (num % 100
            ? " " + convert(num % 100)
            : "")
        );
      }

      if (num < 100000) {
        return (
          convert(Math.floor(num / 1000)) +
          " Thousand" +
          (num % 1000
            ? " " + convert(num % 1000)
            : "")
        );
      }

      if (num < 10000000) {
        return (
          convert(
            Math.floor(num / 100000)
          ) +
          " Lakh" +
          (num % 100000
            ? " " +
            convert(num % 100000)
            : "")
        );
      }

      return (
        convert(
          Math.floor(num / 10000000)
        ) +
        " Crore" +
        (num % 10000000
          ? " " +
          convert(
            num % 10000000
          )
          : "")
      );
    };

    const rupees = Math.floor(amount);

    const paise = Math.round(
      (amount - rupees) * 100
    );

    let result =
      rupees === 0
        ? "Zero Rupees"
        : `${convert(rupees)} Rupees`;

    if (paise > 0) {
      result += ` and ${convert(
        paise
      )} Paise`;
    }

    return `${result} Only`;
  };

  // =========================================================
  // GENERATE PDF
  // =========================================================

  const generateInvoicePDF = (
    invoiceNumber
  ) => {
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const pageWidth =
      doc.internal.pageSize.getWidth();

    const pageHeight =
      doc.internal.pageSize.getHeight();

    const margin = 12;

    // Outer border
    doc.setDrawColor(40, 40, 40);
    doc.setLineWidth(0.4);

    doc.rect(
      margin,
      margin,
      pageWidth - margin * 2,
      pageHeight - margin * 2
    );

    // Company
    doc.setFont(
      "helvetica",
      "bold"
    );

    doc.setFontSize(20);
    doc.setTextColor(
      16,
      27,
      61
    );

    doc.text(
      "PayFourSave",
      margin + 6,
      22
    );

    doc.setFontSize(9);
    doc.setFont(
      "helvetica",
      "normal"
    );

    doc.setTextColor(
      90,
      90,
      90
    );

    doc.text(
      "Professional Billing & Invoice Management",
      margin + 6,
      28
    );

    doc.text(
      "GSTIN: 08ABCDE1234F1Z5",
      margin + 6,
      34
    );

    doc.text(
      "Jaipur, Rajasthan, India",
      margin + 6,
      39
    );

    // Invoice heading
    doc.setFont(
      "helvetica",
      "bold"
    );

    doc.setFontSize(18);
    doc.setTextColor(
      245,
      165,
      36
    );

    doc.text(
      "TAX INVOICE",
      pageWidth - margin - 6,
      22,
      {
        align: "right",
      }
    );

    doc.setFontSize(9);
    doc.setTextColor(
      60,
      60,
      60
    );

    doc.setFont(
      "helvetica",
      "normal"
    );

    doc.text(
      `Invoice No: ${invoiceNumber}`,
      pageWidth - margin - 6,
      29,
      {
        align: "right",
      }
    );

    doc.text(
      `Date: ${new Date().toLocaleDateString(
        "en-IN"
      )}`,
      pageWidth - margin - 6,
      35,
      {
        align: "right",
      }
    );

    doc.text(
      `Payment: ${paymentMethod.toUpperCase()}`,
      pageWidth - margin - 6,
      41,
      {
        align: "right",
      }
    );

    doc.setDrawColor(
      220,
      220,
      220
    );

    doc.line(
      margin + 5,
      45,
      pageWidth - margin - 5,
      45
    );

    // Customer
    doc.setFont(
      "helvetica",
      "bold"
    );

    doc.setFontSize(10);
    doc.setTextColor(
      16,
      27,
      61
    );

    doc.text(
      "BILL TO",
      margin + 6,
      53
    );

    doc.setFont(
      "helvetica",
      "normal"
    );

    doc.setFontSize(9);
    doc.setTextColor(
      50,
      50,
      50
    );

    doc.text(
      `Name: ${selectedCustomer.name ||
      "Walk-in Customer"
      }`,
      margin + 6,
      60
    );

    doc.text(
      `Phone: ${selectedCustomer.phone ||
      "-"
      }`,
      margin + 6,
      66
    );

    doc.text(
      `Email: ${selectedCustomer.email ||
      "-"
      }`,
      margin + 6,
      72
    );

    doc.text(
      `Address: ${selectedCustomer.address ||
      "-"
      }`,
      margin + 6,
      78
    );

    // Table
    const tableRows = cart.map(
      (item, index) => {
        const taxable =
          item.price * item.qty;

        const tax =
          (taxable * item.taxRate) /
          100;

        const total =
          taxable + tax;

        return [
          index + 1,
          item.name,
          item.sku,
          item.qty,
          `Rs. ${item.price.toFixed(
            2
          )}`,
          `${item.taxRate}%`,
          `Rs. ${tax.toFixed(2)}`,
          `Rs. ${total.toFixed(
            2
          )}`,
        ];
      }
    );

    autoTable(doc, {
      startY: 85,

      margin: {
        left: margin + 5,
        right: margin + 5,
      },

      head: [
        [
          "#",
          "Product",
          "SKU",
          "Qty",
          "Rate",
          "Tax",
          "Tax Amt.",
          "Amount",
        ],
      ],

      body: tableRows,

      theme: "grid",

      styles: {
        font: "helvetica",
        fontSize: 8,
        cellPadding: 3,
        lineColor: [
          210,
          210,
          210,
        ],
        lineWidth: 0.2,
        textColor: [
          40,
          40,
          40,
        ],
      },

      headStyles: {
        fillColor: [
          16,
          27,
          61,
        ],
        textColor: [
          255,
          255,
          255,
        ],
        fontStyle: "bold",
        halign: "center",
      },

      columnStyles: {
        0: {
          halign: "center",
          cellWidth: 9,
        },
        1: {
          cellWidth: 42,
        },
        2: {
          cellWidth: 23,
        },
        3: {
          halign: "center",
          cellWidth: 12,
        },
        4: {
          halign: "right",
          cellWidth: 25,
        },
        5: {
          halign: "center",
          cellWidth: 16,
        },
        6: {
          halign: "right",
          cellWidth: 25,
        },
        7: {
          halign: "right",
          cellWidth: 27,
        },
      },
    });

    const finalY =
      doc.lastAutoTable.finalY + 8;

    const totalX =
      pageWidth - margin - 6;

    doc.setFontSize(9);

    doc.setFont(
      "helvetica",
      "normal"
    );

    doc.setTextColor(
      70,
      70,
      70
    );

    doc.text(
      "Subtotal:",
      totalX - 55,
      finalY
    );

    doc.text(
      `Rs. ${subtotal.toFixed(
        2
      )}`,
      totalX,
      finalY,
      {
        align: "right",
      }
    );

    doc.text(
      "Tax:",
      totalX - 55,
      finalY + 6
    );

    doc.text(
      `Rs. ${taxTotal.toFixed(
        2
      )}`,
      totalX,
      finalY + 6,
      {
        align: "right",
      }
    );

    doc.setFillColor(
      16,
      27,
      61
    );

    doc.roundedRect(
      totalX - 72,
      finalY + 10,
      72,
      12,
      2,
      2,
      "F"
    );

    doc.setFont(
      "helvetica",
      "bold"
    );

    doc.setFontSize(11);

    doc.setTextColor(
      255,
      255,
      255
    );

    doc.text(
      "GRAND TOTAL",
      totalX - 66,
      finalY + 18
    );

    doc.text(
      `Rs. ${grandTotal.toFixed(
        2
      )}`,
      totalX - 5,
      finalY + 18,
      {
        align: "right",
      }
    );

    doc.setTextColor(
      50,
      50,
      50
    );

    doc.setFontSize(8);

    doc.setFont(
      "helvetica",
      "normal"
    );

    doc.text(
      `Amount in Words: ${numberToWords(
        grandTotal
      )}`,
      margin + 6,
      finalY + 31
    );

    doc.setFont(
      "helvetica",
      "bold"
    );

    doc.setFontSize(9);

    doc.setTextColor(
      16,
      27,
      61
    );

    doc.text(
      "Terms & Conditions",
      margin + 6,
      finalY + 44
    );

    doc.setFont(
      "helvetica",
      "normal"
    );

    doc.setFontSize(7.5);

    doc.setTextColor(
      90,
      90,
      90
    );

    doc.text(
      "1. Goods once sold are subject to company return policy.",
      margin + 6,
      finalY + 50
    );

    doc.text(
      "2. Please retain this invoice for future reference.",
      margin + 6,
      finalY + 56
    );

    doc.text(
      "3. All disputes are subject to local jurisdiction.",
      margin + 6,
      finalY + 62
    );

    doc.setFont(
      "helvetica",
      "normal"
    );

    doc.setFontSize(8);

    doc.text(
      "Authorized Signature",
      pageWidth - margin - 6,
      pageHeight - 31,
      {
        align: "right",
      }
    );

    doc.line(
      pageWidth - margin - 55,
      pageHeight - 34,
      pageWidth - margin - 6,
      pageHeight - 34
    );

    doc.setFontSize(7);

    doc.setTextColor(
      130,
      130,
      130
    );

    doc.text(
      "Thank you for your business!",
      pageWidth / 2,
      pageHeight - 20,
      {
        align: "center",
      }
    );

    doc.text(
      "Generated by Billing Software",
      pageWidth / 2,
      pageHeight - 16,
      {
        align: "center",
      }
    );

    doc.output(
      "dataurlnewwindow"
    );
  };

  // =========================================================
  // CHECKOUT
  // =========================================================

  const checkout = async () => {
    if (cart.length === 0) {
      toast.warn(
        "Please add at least one product."
      );
      return;
    }

    try {
      setGenerating(true);

      const payload = {
        customerId:
          selectedCustomer._id ||
          null,

        items: cart.map((item) => ({
          productId: item.productId,
          qty: item.qty,
        })),

        paymentMethod,
      };

      const res = await api.post(
        "/invoices",
        payload
      );

      const invoiceNumber =
        res.data?.invoiceNumber ||
        `INV-${Date.now()}`;

      generateInvoicePDF(
        invoiceNumber
      );

      toast.success(
        `Bill generated successfully: ${invoiceNumber}`
      );

      setCart([]);
      clearCustomer();
    } catch (error) {
      console.error(
        "Invoice error:",
        error.response?.data ||
        error.message
      );

      toast.error(
        error.response?.data
          ?.message ||
        "Bill generate nahi ho paya."
      );
    } finally {
      setGenerating(false);
    }
  };

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-indigo-600" />

          <p className="mt-3 text-sm text-slate-500">
            Loading billing data...
          </p>
        </div>
      </div>
    );
  }

  // =========================================================
  // UI
  // =========================================================

  return (
    <div className="min-h-screen bg-slate-50 p-3 sm:p-5 lg:p-6 xl:p-8">
      <div className="mx-auto max-w-[1600px]">

        {/* ===================================================
            HEADER
        =================================================== */}

        <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between lg:mb-6">

          <div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-emerald-500" />

              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Billing
              </span>
            </div>

            <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
              Create Invoice
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Create professional tax
              invoice for your customer.
            </p>
          </div>

          {/* Current total */}

          <div className="flex items-center justify-between gap-5 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm sm:min-w-[210px] sm:px-5">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Current Total
              </p>

              <p className="mt-0.5 text-2xl font-extrabold text-indigo-600">
                ₹
                {grandTotal.toFixed(2)}
              </p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-xl">
              🧾
            </div>
          </div>
        </div>

        {/* ===================================================
            CUSTOMER
        =================================================== */}

        <section className="mb-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">

          <div className="mb-4 flex items-center justify-between gap-3">

            <div>
              <h2 className="text-base font-bold text-slate-900">
                Customer Details
              </h2>

              <p className="mt-0.5 text-xs text-slate-400">
                Select customer for this invoice
              </p>
            </div>

            {selectedCustomer._id && (
              <button
                type="button"
                onClick={clearCustomer}
                className="shrink-0 rounded-lg px-3 py-2 text-xs font-semibold text-red-500 transition hover:bg-red-50"
              >
                Clear
              </button>
            )}
          </div>

          {/* Customer Search */}

          <div className="relative mb-4">
            <input
              value={
                customerSearch ||
                selectedCustomer.name
              }
              onChange={(e) => {
                setCustomerSearch(
                  e.target.value
                );

                if (
                  selectedCustomer._id
                ) {
                  setSelectedCustomer(
                    emptyCustomer
                  );

                  setActiveCustomer(
                    null
                  );
                }
              }}
              placeholder="Search customer by name, phone or email..."
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            />

            {customerSearch &&
              !selectedCustomer._id &&
              filteredCustomers.length >
              0 && (
                <div className="absolute left-0 right-0 top-full z-40 mt-2 max-h-64 overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-2xl">

                  {filteredCustomers.map(
                    (customer) => (
                      <button
                        type="button"
                        key={
                          customer._id
                        }
                        onClick={() =>
                          selectCustomer(
                            customer
                          )
                        }
                        className="flex w-full items-center justify-between gap-4 border-b border-slate-100 px-4 py-3 text-left transition last:border-0 hover:bg-indigo-50"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-slate-800">
                            {
                              customer.name
                            }
                          </p>

                          <p className="mt-0.5 truncate text-xs text-slate-400">
                            {
                              customer.phone
                            }

                            {customer.email
                              ? ` · ${customer.email}`
                              : ""}
                          </p>
                        </div>

                        <span className="shrink-0 rounded-lg bg-indigo-50 px-2.5 py-1.5 text-xs font-bold text-indigo-600">
                          Select
                        </span>
                      </button>
                    )
                  )}
                </div>
              )}
          </div>

          {/* Customer information */}

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5">
              <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                Customer Name
              </p>

              <p className="mt-1.5 truncate text-sm font-bold text-slate-800">
                {selectedCustomer.name ||
                  "Walk-in Customer"}
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5">
              <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                Phone
              </p>

              <p className="mt-1.5 truncate text-sm font-semibold text-slate-700">
                {selectedCustomer.phone ||
                  "-"}
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5">
              <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                Email
              </p>

              <p className="mt-1.5 truncate text-sm font-semibold text-slate-700">
                {selectedCustomer.email ||
                  "-"}
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5">
              <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                Address
              </p>

              <p className="mt-1.5 truncate text-sm font-semibold text-slate-700">
                {selectedCustomer.address ||
                  "-"}
              </p>
            </div>
          </div>
        </section>

        {/* ===================================================
            MAIN DESKTOP LAYOUT

            lg = 1024px
            LEFT = flexible
            RIGHT = 360px
        =================================================== */}

        <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-[minmax(0,1fr)_360px] xl:grid-cols-[minmax(0,1fr)_400px] 2xl:gap-6">

          {/* =================================================
              LEFT CONTENT
          ================================================= */}

          <main className="min-w-0">

            {/* Product Search */}

            <section className="mb-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">

              <div className="flex flex-col gap-3 sm:flex-row">

                <div className="relative flex-1">
                  <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                    🔎
                  </span>

                  <input
                    value={search}
                    onChange={(e) =>
                      setSearch(
                        e.target.value
                      )
                    }
                    placeholder="Search product / scan SKU..."
                    className="w-full rounded-xl border border-slate-200 py-3 pl-11 pr-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  />
                </div>

                <div className="flex items-center justify-center rounded-xl bg-slate-50 px-5 py-3 text-sm font-semibold text-slate-500">
                  {filteredProducts.length}{" "}
                  Products
                </div>
              </div>
            </section>

            {/* =================================================
                PRODUCT CARDS
            ================================================= */}

            <section className="mb-5">

              <div className="mb-3 flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    Products
                  </h2>

                  <p className="text-xs text-slate-400">
                    Add products to invoice
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-2">

                {filteredProducts.map(
                  (product) => {
                    const cartItem =
                      cart.find(
                        (item) =>
                          item.productId ===
                          product._id
                      );

                    const outOfStock =
                      Number(
                        product.stock
                      ) <= 0;

                    return (
                      <div
                        key={product._id}
                        className="group rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-indigo-300 hover:shadow-md"
                      >
                        <div className="mb-3 flex items-start justify-between gap-2">

                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-lg">
                            📦
                          </div>

                          <span
                            className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${outOfStock
                              ? "bg-red-50 text-red-600"
                              : "bg-emerald-50 text-emerald-600"
                              }`}
                          >
                            {outOfStock
                              ? "Out of Stock"
                              : `Stock: ${product.stock}`}
                          </span>
                        </div>

                        <p className="truncate font-bold text-slate-800">
                          {product.name}
                        </p>

                        <p className="mt-1 truncate text-xs text-slate-400">
                          SKU:{" "}
                          {product.sku ||
                            "-"}
                        </p>

                        <div className="mt-4 flex items-center justify-between gap-3">

                          <div>
                            <p className="text-lg font-extrabold text-indigo-600">
                              ₹
                              {Number(
                                product.price ||
                                0
                              ).toFixed(
                                2
                              )}
                            </p>

                            <p className="text-[11px] text-slate-400">
                              Tax:{" "}
                              {product.taxRate ||
                                0}
                              %
                            </p>
                          </div>

                          {cartItem ? (
                            <div className="flex h-9 items-center gap-2 rounded-lg bg-indigo-600 px-1.5 ">

                              <button
                                type="button"
                                onClick={() =>
                                  updateQty(
                                    product._id,
                                    cartItem.qty -
                                    1
                                  )
                                }
                                className="flex h-6 w-5 shrink-0 items-center justify-center rounded-md bg-white/20 text-sm font-bold leading-none text-white hover:bg-white/30"
                              >
                                −
                              </button>

                              <span className="min-w-[1.25rem] text-center text-sm font-bold leading-none text-white">
                                {
                                  cartItem.qty
                                }
                              </span>

                              <button
                                type="button"
                                onClick={() =>
                                  addToCart(
                                    product
                                  )
                                }
                                disabled={
                                  cartItem.qty >=
                                  Number(
                                    product.stock
                                  )
                                }
                                className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-white/20 text-sm font-bold leading-none text-white hover:bg-white/30 disabled:cursor-not-allowed disabled:opacity-40"
                              >
                                +
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() =>
                                addToCart(
                                  product
                                )
                              }
                              disabled={
                                outOfStock
                              }
                              className="outline flex h-9 shrink-0 items-center justify-center rounded-lg bg-indigo-600 px-4 text-xs font-bold leading-none text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                              + Add
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  }
                )}

                {filteredProducts.length ===
                  0 && (
                    <div className="col-span-full rounded-2xl border border-dashed border-slate-300 bg-white py-14 text-center">

                      <div className="text-4xl">
                        📦
                      </div>

                      <p className="mt-3 font-semibold text-slate-600">
                        No products found
                      </p>

                      <p className="mt-1 text-xs text-slate-400">
                        Try another product
                        name or SKU.
                      </p>
                    </div>
                  )}
              </div>
            </section>

            {/* =================================================
                INVOICE TABLE
            ================================================= */}

            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

              <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-4 py-4 sm:px-5">

                <div>
                  <h2 className="font-bold text-slate-900">
                    Invoice Items
                  </h2>

                  <p className="mt-0.5 text-xs text-slate-400">
                    Review products and quantities
                  </p>
                </div>

                <span className="shrink-0 rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-600">
                  {cart.length} Items
                </span>
              </div>

              <div className="overflow-x-auto">

                <table className="w-full min-w-[900px] border-collapse text-sm">

                  <thead>
                    <tr className="border-b border-slate-300 bg-slate-100">

                      <th className="border-r border-slate-200 px-3 py-3 text-center font-bold text-slate-600">
                        #
                      </th>

                      <th className="border-r border-slate-200 px-3 py-3 text-left font-bold text-slate-600">
                        Product
                      </th>

                      <th className="border-r border-slate-200 px-3 py-3 text-left font-bold text-slate-600">
                        SKU
                      </th>

                      <th className="border-r border-slate-200 px-3 py-3 text-center font-bold text-slate-600">
                        Qty
                      </th>

                      <th className="border-r border-slate-200 px-3 py-3 text-right font-bold text-slate-600">
                        Rate
                      </th>

                      <th className="border-r border-slate-200 px-3 py-3 text-center font-bold text-slate-600">
                        Tax %
                      </th>

                      <th className="border-r border-slate-200 px-3 py-3 text-right font-bold text-slate-600">
                        Tax
                      </th>

                      <th className="border-r border-slate-200 px-3 py-3 text-right font-bold text-slate-600">
                        Total
                      </th>

                      <th className="px-3 py-3 text-center font-bold text-slate-600">
                        Action
                      </th>
                    </tr>
                  </thead>

                  <tbody>

                    {cart.length === 0 ? (
                      <tr>
                        <td
                          colSpan="9"
                          className="py-16 text-center"
                        >
                          <div className="text-4xl">
                            🧾
                          </div>

                          <p className="mt-3 font-semibold text-slate-600">
                            No items added
                          </p>

                          <p className="mt-1 text-xs text-slate-400">
                            Product cards ke Add
                            button par click
                            karein.
                          </p>
                        </td>
                      </tr>
                    ) : (
                      cart.map(
                        (
                          item,
                          index
                        ) => {
                          const taxable =
                            item.price *
                            item.qty;

                          const tax =
                            (taxable *
                              item.taxRate) /
                            100;

                          const total =
                            taxable + tax;

                          return (
                            <tr
                              key={
                                item.productId
                              }
                              className="border-b border-slate-200 transition hover:bg-indigo-50/30"
                            >
                              <td className="border-r border-slate-100 px-3 py-3 text-center text-slate-400">
                                {index +
                                  1}
                              </td>

                              <td className="max-w-[240px] border-r border-slate-100 px-3 py-3 font-semibold text-slate-800">
                                <div className="truncate">
                                  {
                                    item.name
                                  }
                                </div>
                              </td>

                              <td className="border-r border-slate-100 px-3 py-3 text-xs text-slate-500">
                                {
                                  item.sku
                                }
                              </td>

                              <td className="border-r border-slate-100 px-3 py-3 text-center">

                                <input
                                  type="number"
                                  min="1"
                                  max={
                                    item.stock
                                  }
                                  value={
                                    item.qty
                                  }
                                  onChange={(
                                    e
                                  ) =>
                                    updateQty(
                                      item.productId,
                                      e.target
                                        .value
                                    )
                                  }
                                  className="w-16 rounded-lg border border-slate-200 px-2 py-1.5 text-center text-sm font-semibold outline-none focus:border-indigo-500"
                                />
                              </td>

                              <td className="border-r border-slate-100 px-3 py-3 text-right font-medium text-slate-700">
                                ₹
                                {item.price.toFixed(
                                  2
                                )}
                              </td>

                              <td className="border-r border-slate-100 px-3 py-3 text-center">
                                <span className="rounded-full bg-amber-50 px-2 py-1 text-xs font-semibold text-amber-600">
                                  {
                                    item.taxRate
                                  }
                                  %
                                </span>
                              </td>

                              <td className="border-r border-slate-100 px-3 py-3 text-right text-slate-600">
                                ₹
                                {tax.toFixed(
                                  2
                                )}
                              </td>

                              <td className="border-r border-slate-100 px-3 py-3 text-right font-bold text-slate-900">
                                ₹
                                {total.toFixed(
                                  2
                                )}
                              </td>

                              <td className="px-3 py-3 text-center">
                                <button
                                  type="button"
                                  onClick={() =>
                                    removeItem(
                                      item.productId
                                    )
                                  }
                                  className="rounded-lg px-2.5 py-1.5 text-red-500 transition hover:bg-red-50"
                                >
                                  ×
                                </button>
                              </td>
                            </tr>
                          );
                        }
                      )
                    )}

                  </tbody>
                </table>
              </div>
            </section>
          </main>

          {/* =================================================
              RIGHT BILL SUMMARY

              IMPORTANT:
              lg = desktop
              sticky = scroll ke time visible
          ================================================= */}

          <aside className="min-w-0 lg:sticky lg:top-24 lg:self-start">

            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

              {/* Summary Header */}

              <div className="border-b border-slate-200 bg-white px-5 py-4">

                <div className="flex items-center justify-between">

                  <div>
                    <h2 className="text-lg font-extrabold text-slate-900">
                      Bill Summary
                    </h2>

                    <p className="mt-0.5 text-xs text-slate-400">
                      Final invoice amount
                    </p>
                  </div>

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-lg">
                    🧾
                  </div>
                </div>
              </div>

              {/* Summary Body */}

              <div className="p-5">

                {/* Customer mini card */}

                <div className="mb-5 rounded-xl border border-slate-200 bg-slate-50 p-3">

                  <div className="flex items-center justify-between gap-3">

                    <div className="min-w-0">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Customer
                      </p>

                      <p className="mt-1 truncate text-sm font-bold text-slate-800">
                        {selectedCustomer.name ||
                          "Walk-in Customer"}
                      </p>
                    </div>

                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-sm shadow-sm">
                      👤
                    </div>
                  </div>

                  {selectedCustomer.phone && (
                    <p className="mt-1 text-xs text-slate-500">
                      {selectedCustomer.phone}
                    </p>
                  )}
                </div>

                {/* Calculations */}

                <div className="space-y-3">

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">
                      Items
                    </span>

                    <span className="font-bold text-slate-800">
                      {totalItems}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">
                      Subtotal
                    </span>

                    <span className="font-semibold text-slate-800">
                      ₹
                      {subtotal.toFixed(
                        2
                      )}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">
                      Total Tax
                    </span>

                    <span className="font-semibold text-amber-600">
                      ₹
                      {taxTotal.toFixed(
                        2
                      )}
                    </span>
                  </div>
                </div>

                {/* Divider */}

                <div className="my-5 border-t border-dashed border-slate-200" />

                {/* Grand Total */}

                <div className="rounded-2xl bg-[#101B3D] p-5">

                  <div className="flex items-start justify-between gap-3">

                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
                        Grand Total
                      </p>

                      <p className="mt-1 text-3xl font-extrabold text-white">
                        ₹
                        {grandTotal.toFixed(
                          2
                        )}
                      </p>
                    </div>

                    <span className="rounded-full bg-emerald-400/15 px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider text-emerald-300">
                      Payable
                    </span>
                  </div>
                </div>

                {/* Payment Method */}

                <div className="mt-5">

                  <label className="mb-2 block text-xs font-bold text-slate-600">
                    Payment Method
                  </label>

                  <div className="grid grid-cols-3 gap-2">

                    {[
                      {
                        value: "cash",
                        label: "Cash",
                        icon: "💵",
                      },
                      {
                        value: "upi",
                        label: "UPI",
                        icon: "📱",
                      },
                      {
                        value: "card",
                        label: "Card",
                        icon: "💳",
                      },
                    ].map(
                      (method) => {
                        const active =
                          paymentMethod ===
                          method.value;

                        return (
                          <button
                            key={
                              method.value
                            }
                            type="button"
                            onClick={() =>
                              setPaymentMethod(
                                method.value
                              )
                            }
                            className={`rounded-xl border px-2 py-3 transition ${active
                              ? "border-indigo-500 bg-indigo-50 text-indigo-700 shadow-sm"
                              : "border-slate-200 bg-white text-slate-600 hover:border-indigo-300 hover:bg-indigo-50/50"
                              }`}
                          >
                            <div className="text-base">
                              {
                                method.icon
                              }
                            </div>

                            <div className="mt-1 text-[11px] font-bold">
                              {
                                method.label
                              }
                            </div>
                          </button>
                        );
                      }
                    )}
                  </div>
                </div>

                {/* Generate Button */}

                <button
                  type="button"
                  onClick={checkout}
                  disabled={
                    cart.length === 0 ||
                    generating
                  }
                  className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3.5 text-sm font-bold text-white shadow-sm transition hover:bg-indigo-700 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {generating ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />

                      Generating...
                    </>
                  ) : (
                    <>
                      <span>📄</span>

                      Generate Bill & PDF
                    </>
                  )}
                </button>

                {/* Helper */}

                <p className="mt-3 text-center text-[10px] leading-4 text-slate-400">
                  A4 Tax Invoice PDF will
                  open automatically after
                  successful checkout.
                </p>

              </div>
            </div>

            {/* Desktop quick info */}

            <div className="mt-3 hidden rounded-xl border border-slate-200 bg-white p-3 lg:block">
              <div className="flex items-center gap-2">

                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-sm">
                  ✓
                </div>

                <div>
                  <p className="text-xs font-bold text-slate-700">
                    Ready to Generate
                  </p>

                  <p className="text-[10px] text-slate-400">
                    Stock limits are applied
                    automatically.
                  </p>
                </div>

              </div>
            </div>

          </aside>
        </div>
      </div>
    </div>
  );
}





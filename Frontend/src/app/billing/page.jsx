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
  gstin: "",
};

// =========================================================
// SELLER / COMPANY DETAILS
// =========================================================
const COMPANY = {
  name: "BALOTHIA REFREJOREON",
  addressLine1: "Plot No. 36, Agra Road, Sumel Road,",
  addressLine2: "Pooja Vihar, Jaipur, Rajasthan - 302031",
  gstin: "08AKXPU5096P1ZM",
  state: "Rajasthan (08)",
  mobile: "7877669506",
  email: "balothiarefrigeration@gmail.com",
  placeOfSupply: "Rajasthan",
  bank: {
    accountName: "BALOTHIA REFREJOREON",
    bankName: "IDFC FIRST",
    branch: "Raja Park-Jaipur Branch",
    accountNo: "57891782557",
    ifsc: "IDFB0042129",
    swift: "IDFBINBBMUM",
  },
};

export default function BillingPage() {
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);

  const [search, setSearch] = useState("");
  const [customerSearch, setCustomerSearch] = useState("");

  const [cart, setCart] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(emptyCustomer);

  const [paymentMethod, setPaymentMethod] = useState("cash");

  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  // =========================================================
  // LOAD PRODUCTS + CUSTOMERS
  // =========================================================
  useEffect(() => {
    const loadData = async () => {
      try {
        const [productsRes, customersRes] = await Promise.all([
          api.get("/products"),
          api.get("/customers"),
        ]);

        setProducts(
          Array.isArray(productsRes.data) ? productsRes.data : []
        );

        setCustomers(
          Array.isArray(customersRes.data) ? customersRes.data : []
        );
      } catch (error) {
        toast.error(
          `Data loading error: ${error.response?.data?.message || error.message
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
    const savedCustomer = sessionStorage.getItem("selectedCustomer");

    if (savedCustomer) {
      try {
        const customer = JSON.parse(savedCustomer);

        const customerData = {
          _id: customer._id || "",
          name: customer.name || "",
          phone: customer.phone || "",
          email: customer.email || "",
          address: customer.address || "",
          gstin: customer.gstin || customer.gst || customer.gstNo || customer.gstNumber || "",
        };

        setSelectedCustomer(customerData);
        setActiveCustomer(customerData);

        sessionStorage.removeItem("selectedCustomer");
      } catch (error) {
        console.error("Selected customer error:", error);
      }
    }
  }, []);

  // =========================================================
  // FILTER PRODUCTS
  // =========================================================
  const filteredProducts = useMemo(() => {
    const value = search.toLowerCase().trim();

    return products.filter((product) => {
      return (
        product.name?.toLowerCase().includes(value) ||
        product.sku?.toLowerCase().includes(value)
      );
    });
  }, [products, search]);

  // =========================================================
  // FILTER CUSTOMERS
  // =========================================================
  const filteredCustomers = useMemo(() => {
    const value = customerSearch.toLowerCase().trim();

    if (!value) {
      return customers.slice(0, 8);
    }

    return customers.filter((customer) => {
      return (
        customer.name?.toLowerCase().includes(value) ||
        customer.phone?.toLowerCase().includes(value) ||
        customer.email?.toLowerCase().includes(value) ||
        customer.gstin?.toLowerCase().includes(value) ||
        customer.gst?.toLowerCase().includes(value)
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
      gstin: customer.gstin || customer.gst || customer.gstNo || customer.gstNumber || "",
    };

    setSelectedCustomer(customerData);
    setActiveCustomer(customerData);
    setCustomerSearch("");
  };

  // =========================================================
  // MANUAL EDIT OF CUSTOMER FIELDS
  // =========================================================
  const updateCustomerField = (field, value) => {
    setSelectedCustomer((prev) => {
      const next = { ...prev, [field]: value };
      setActiveCustomer(next);
      return next;
    });
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
        (item) => item.productId === product._id
      );

      if (existing) {
        if (existing.qty >= Number(product.stock)) {
          toast.warn("Stock limit reached for this product.");
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
          hsn: product.hsn || product.hsnCode || "-",
          price: Number(product.price || 0),
          taxRate: Number(product.taxRate || 0),
          stock: Number(product.stock || 0),
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

    if (newQty <= 0 || Number.isNaN(newQty)) {
      setCart((prev) =>
        prev.filter((item) => item.productId !== productId)
      );
      return;
    }

    setCart((prev) =>
      prev.map((item) =>
        item.productId === productId
          ? {
            ...item,
            qty:
              item.stock && newQty > item.stock
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
      prev.filter((item) => item.productId !== productId)
    );
  };

  // =========================================================
  // CALCULATIONS
  // =========================================================
  const totalItems = cart.reduce(
    (sum, item) => sum + Number(item.qty || 0),
    0
  );

  const subtotal = cart.reduce(
    (sum, item) =>
      sum + Number(item.price || 0) * Number(item.qty || 0),
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

  const grandTotal = subtotal + taxTotal;

  const cgstTotal = taxTotal / 2;
  const sgstTotal = taxTotal / 2;
  const effectiveTaxRate =
    subtotal > 0 ? (taxTotal / subtotal) * 100 : 0;
  const halfTaxRate = effectiveTaxRate / 2;

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
      if (num < 20) return ones[num];
      if (num < 100)
        return (
          tens[Math.floor(num / 10)] +
          (num % 10 ? " " + ones[num % 10] : "")
        );
      if (num < 1000)
        return (
          ones[Math.floor(num / 100)] +
          " Hundred" +
          (num % 100 ? " " + convert(num % 100) : "")
        );
      if (num < 100000)
        return (
          convert(Math.floor(num / 1000)) +
          " Thousand" +
          (num % 1000 ? " " + convert(num % 1000) : "")
        );
      if (num < 10000000)
        return (
          convert(Math.floor(num / 100000)) +
          " Lakh" +
          (num % 100000 ? " " + convert(num % 100000) : "")
        );
      return (
        convert(Math.floor(num / 10000000)) +
        " Crore" +
        (num % 10000000 ? " " + convert(num % 10000000) : "")
      );
    };

    const rupees = Math.floor(amount);
    const paise = Math.round((amount - rupees) * 100);

    let result =
      rupees === 0
        ? "Zero Rupees"
        : `${convert(rupees)} Rupees`;

    if (paise > 0) {
      result += ` and ${convert(paise)} Paise`;
    }

    return `${result} Only`;
  };

  // =========================================================
  // GENERATE PDF
  // =========================================================
  const generateInvoicePDF = (invoiceNumber) => {
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 10;
    const contentWidth = pageWidth - margin * 2;

    const COLOR_ICE_BLUE = [237, 244, 250];
    const COLOR_NAVY_TEXT = [16, 76, 126];
    const COLOR_ORANGE = [237, 125, 32];
    const COLOR_BORDER = [205, 218, 228];

    doc.setDrawColor(...COLOR_BORDER);
    doc.setLineWidth(0.35);
    doc.rect(
      margin,
      margin,
      contentWidth,
      pageHeight - margin * 2
    );

    const headerBannerHeight = 11;
    doc.setFillColor(...COLOR_ICE_BLUE);
    doc.rect(margin, margin, contentWidth, headerBannerHeight, "F");

    doc.setDrawColor(...COLOR_BORDER);
    doc.setLineWidth(0.3);
    doc.line(
      margin + contentWidth * 0.65,
      margin,
      margin + contentWidth * 0.65,
      margin + headerBannerHeight
    );

    doc.setDrawColor(...COLOR_ORANGE);
    doc.setLineWidth(0.7);
    doc.line(
      margin,
      margin + headerBannerHeight,
      margin + contentWidth,
      margin + headerBannerHeight
    );

    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(...COLOR_NAVY_TEXT);
    doc.text(COMPANY.name, margin + 4, margin + 7.5);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("TAX INVOICE", margin + contentWidth * 0.68, margin + 7.5);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(80, 80, 80);
    doc.text(COMPANY.addressLine1, margin + 4, 27);
    doc.text(COMPANY.addressLine2, margin + 4, 32);
    doc.text(`GSTIN: ${COMPANY.gstin}`, margin + 4, 37);
    doc.text(`State: ${COMPANY.state}`, margin + 4, 42);
    doc.text(
      `Mobile: ${COMPANY.mobile}   Email: ${COMPANY.email}`,
      margin + 4,
      47
    );

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(60, 60, 60);
    doc.text(
      `Invoice No.: ${invoiceNumber}`,
      pageWidth - margin - 4,
      27,
      { align: "right" }
    );
    doc.text(
      `Invoice Date: ${new Date().toLocaleDateString("en-IN")}`,
      pageWidth - margin - 4,
      32,
      { align: "right" }
    );
    doc.text(
      `Place of Supply: ${COMPANY.placeOfSupply}`,
      pageWidth - margin - 4,
      37,
      { align: "right" }
    );
    doc.text(
      "Reverse Charge: No",
      pageWidth - margin - 4,
      42,
      { align: "right" }
    );
    doc.text(
      `Payment: ${paymentMethod.toUpperCase()}`,
      pageWidth - margin - 4,
      47,
      { align: "right" }
    );

    doc.setDrawColor(...COLOR_BORDER);
    doc.setLineWidth(0.3);
    doc.line(margin, 51, pageWidth - margin, 51);

    const buyerHeaderY = 53;
    const buyerHeaderHeight = 6.5;

    doc.setFillColor(...COLOR_ICE_BLUE);
    doc.rect(margin, buyerHeaderY, contentWidth, buyerHeaderHeight, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(...COLOR_NAVY_TEXT);
    doc.text("BUYER (BILL TO)", margin + 4, buyerHeaderY + 4.6);

    const buyerMaxWidth = contentWidth - 8;
    let buyerY = buyerHeaderY + buyerHeaderHeight + 4;

    const buyerName =
      (selectedCustomer.name || "").trim() || "Walk-in Customer";
    const buyerAddress = (selectedCustomer.address || "").trim();

    const nameLocationLine = buyerAddress
      ? `${buyerName}, ${buyerAddress}`
      : buyerName;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(30, 30, 30);
    const nameLocationLines = doc.splitTextToSize(
      nameLocationLine,
      buyerMaxWidth
    );
    doc.text(nameLocationLines, margin + 4, buyerY);
    buyerY += nameLocationLines.length * 4 + 1;

    // GSTIN value extraction
    const rawGstin =
      selectedCustomer.gstin ||
      selectedCustomer.gst ||
      selectedCustomer.gstNo ||
      selectedCustomer.gstNumber ||
      "";
    const customerGstin = String(rawGstin).trim().toUpperCase() || "-";

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(70, 70, 70);
    doc.text(
      `Phone: ${(selectedCustomer.phone || "").trim() || "-"}   Email: ${(selectedCustomer.email || "").trim() || "-"
      }   GSTIN: ${customerGstin}`,
      margin + 4,
      buyerY
    );
    buyerY += 4.5;

    const itemsTableStartY = Math.max(76, buyerY + 2);

    const tableRows = cart.map((item, index) => {
      const amount = item.price * item.qty;
      return [
        index + 1,
        item.name,
        item.hsn || "-",
        item.qty,
        `Rs. ${item.price.toFixed(2)}`,
        `Rs. ${amount.toFixed(2)}`,
      ];
    });

    autoTable(doc, {
      startY: itemsTableStartY,
      margin: { left: margin, right: margin },
      head: [["S.No.", "Description", "HSN/SAC", "Qty", "Rate", "Amount"]],
      body: tableRows,
      theme: "grid",
      styles: {
        font: "helvetica",
        fontSize: 8,
        cellPadding: 2.8,
        lineColor: COLOR_BORDER,
        lineWidth: 0.25,
        textColor: [50, 50, 50],
      },
      headStyles: {
        fillColor: COLOR_ICE_BLUE,
        textColor: COLOR_NAVY_TEXT,
        fontStyle: "bold",
        halign: "center",
      },
      columnStyles: {
        0: { halign: "center", cellWidth: 14 },
        1: { cellWidth: 78 },
        2: { halign: "center", cellWidth: 24 },
        3: { halign: "center", cellWidth: 18 },
        4: { halign: "right", cellWidth: 28 },
        5: { halign: "right", cellWidth: 28 },
      },
    });

    const summaryWidth = 85;
    const summaryStartX = pageWidth - margin - summaryWidth;
    const summaryStartY = doc.lastAutoTable.finalY + 4;

    autoTable(doc, {
      startY: summaryStartY,
      margin: { left: summaryStartX, right: margin },
      tableWidth: summaryWidth,
      body: [
        ["Taxable Value", `Rs. ${subtotal.toFixed(2)}`],
        [`CGST @ ${halfTaxRate.toFixed(1)}%`, `Rs. ${cgstTotal.toFixed(2)}`],
        [`SGST @ ${halfTaxRate.toFixed(1)}%`, `Rs. ${sgstTotal.toFixed(2)}`],
        ["TOTAL PAYABLE", `Rs. ${grandTotal.toFixed(2)}`],
      ],
      theme: "grid",
      styles: {
        font: "helvetica",
        fontSize: 8,
        cellPadding: 2.5,
        lineColor: COLOR_BORDER,
        lineWidth: 0.2,
      },
      columnStyles: {
        0: { cellWidth: 45, textColor: [60, 60, 60] },
        1: {
          cellWidth: 40,
          halign: "right",
          fontStyle: "bold",
          textColor: [30, 30, 30],
        },
      },
      didParseCell: function (data) {
        if (data.row.index === 3) {
          data.cell.styles.fillColor = COLOR_ORANGE;
          data.cell.styles.textColor = [255, 255, 255];
          data.cell.styles.fontStyle = "bold";
          data.cell.styles.fontSize = 8.8;
        }
      },
    });

    let cursorY = doc.lastAutoTable.finalY + 5;

    doc.setFillColor(...COLOR_ICE_BLUE);
    doc.setDrawColor(...COLOR_BORDER);
    doc.setLineWidth(0.3);
    doc.rect(margin, cursorY, contentWidth, 12, "FD");

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(70, 70, 70);
    doc.text("Amount Chargeable (in words):", margin + 3.5, cursorY + 4.5);

    doc.setFont("helvetica", "normal");
    doc.setTextColor(30, 30, 30);
    doc.text(
      `INR ${numberToWords(grandTotal)}`,
      margin + 3.5,
      cursorY + 9
    );

    cursorY += 16;

    const columnGap = 5;
    const splitColWidth = (contentWidth - columnGap) / 2;
    const leftColX = margin;
    const rightColX = leftColX + splitColWidth + columnGap;
    const subBannerHeight = 6.5;

    doc.setFillColor(...COLOR_ICE_BLUE);
    doc.rect(leftColX, cursorY, splitColWidth, subBannerHeight, "F");
    doc.setDrawColor(...COLOR_BORDER);
    doc.rect(leftColX, cursorY, splitColWidth, subBannerHeight, "S");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(...COLOR_NAVY_TEXT);
    doc.text("BANK DETAILS", leftColX + 3, cursorY + 4.5);

    doc.setFillColor(...COLOR_ICE_BLUE);
    doc.rect(rightColX, cursorY, splitColWidth, subBannerHeight, "F");
    doc.rect(rightColX, cursorY, splitColWidth, subBannerHeight, "S");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(...COLOR_NAVY_TEXT);
    doc.text("TAX SUMMARY", rightColX + 3, cursorY + 4.5);

    const detailStartY = cursorY + subBannerHeight + 3.5;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(70, 70, 70);

    const bankLines = [
      `Account Name: ${COMPANY.bank.accountName}`,
      `Bank: ${COMPANY.bank.bankName}`,
      `Branch: ${COMPANY.bank.branch}`,
      `Account No.: ${COMPANY.bank.accountNo}`,
      `IFSC: ${COMPANY.bank.ifsc}`,
      `SWIFT: ${COMPANY.bank.swift}`,
    ];

    bankLines.forEach((line, i) => {
      doc.text(line, leftColX + 2, detailStartY + i * 4);
    });

    autoTable(doc, {
      startY: detailStartY - 1,
      margin: { left: rightColX, right: margin },
      tableWidth: splitColWidth,
      head: [["Taxable", "CGST", "SGST", "Total Tax"]],
      body: [
        [
          `Rs. ${subtotal.toFixed(2)}`,
          `Rs. ${cgstTotal.toFixed(2)}`,
          `Rs. ${sgstTotal.toFixed(2)}`,
          `Rs. ${taxTotal.toFixed(2)}`,
        ],
      ],
      theme: "grid",
      styles: {
        font: "helvetica",
        fontSize: 7,
        cellPadding: 2,
        lineColor: COLOR_BORDER,
        lineWidth: 0.2,
        textColor: [50, 50, 50],
        halign: "center",
      },
      headStyles: {
        fillColor: COLOR_ICE_BLUE,
        textColor: COLOR_NAVY_TEXT,
        fontStyle: "bold",
      },
    });

    cursorY =
      Math.max(
        detailStartY + bankLines.length * 4,
        doc.lastAutoTable.finalY
      ) + 6;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(...COLOR_NAVY_TEXT);
    doc.text("Declaration", margin + 4, cursorY);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(100, 100, 100);
    doc.text(
      "We declare that this invoice shows the actual price of the goods and",
      margin + 4,
      cursorY + 4
    );
    doc.text(
      "services described and that all particulars are true and correct.",
      margin + 4,
      cursorY + 7.5
    );

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(60, 60, 60);
    doc.text(
      `For ${COMPANY.name}`,
      pageWidth - margin - 4,
      pageHeight - 32,
      { align: "right" }
    );

    doc.setDrawColor(...COLOR_BORDER);
    doc.line(
      pageWidth - margin - 50,
      pageHeight - 22,
      pageWidth - margin - 4,
      pageHeight - 22
    );

    doc.text(
      "Authorised Signatory",
      pageWidth - margin - 4,
      pageHeight - 17,
      { align: "right" }
    );

    doc.setFontSize(6.8);
    doc.setTextColor(140, 140, 140);
    doc.text(
      "Computer-generated tax invoice — Thank you for your business!",
      pageWidth / 2,
      pageHeight - 6,
      { align: "center" }
    );

    const isMobile =
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      ) || window.innerWidth < 768;

    if (isMobile) {
      doc.save(`${invoiceNumber}.pdf`);
    } else {
      const blob = doc.output("blob");
      const blobUrl = URL.createObjectURL(blob);
      window.open(blobUrl, "_blank");
    }
  };

  // =========================================================
  // CHECKOUT
  // =========================================================
  const checkout = async () => {
    if (cart.length === 0) {
      toast.warn("Please add at least one product.");
      return;
    }

    try {
      setGenerating(true);

      const payload = {
        customerId: selectedCustomer._id || null,
        customerDetails: {
          name: selectedCustomer.name,
          phone: selectedCustomer.phone,
          email: selectedCustomer.email,
          address: selectedCustomer.address,
          gstin: selectedCustomer.gstin,
        },
        items: cart.map((item) => ({
          productId: item.productId,
          qty: item.qty,
        })),
        paymentMethod,
      };

      const res = await api.post("/invoices", payload);

      const invoiceNumber =
        res.data?.invoiceNumber || `INV-${Date.now()}`;

      generateInvoicePDF(invoiceNumber);

      toast.success(`Bill generated successfully: ${invoiceNumber}`);

      setCart([]);
      clearCustomer();
    } catch (error) {
      console.error(
        "Invoice error:",
        error.response?.data || error.message
      );

      toast.error(
        error.response?.data?.message || "Bill generate nahi ho paya."
      );
    } finally {
      setGenerating(false);
    }
  };

  // =========================================================
  // LOADING STATE
  // =========================================================
  if (loading) {
    return (
      <div className="flex min-h-[75vh] items-center justify-center bg-slate-50 p-4">
        <div className="flex flex-col items-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-indigo-600 sm:h-12 sm:w-12" />
          <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-slate-500 sm:text-sm">
            Loading billing workspace...
          </p>
        </div>
      </div>
    );
  }

  // =========================================================
  // MAIN VIEW
  // =========================================================
  return (
    <div className="min-h-screen bg-slate-50/70 p-3 sm:p-5 lg:p-6 xl:p-8">
      <div className="mx-auto max-w-[1600px] space-y-4 sm:space-y-6">

        {/* TOP HEADER BAR */}
        <header className="flex flex-col gap-3 rounded-2xl border border-slate-200/90 bg-white p-4 shadow-xs transition-all sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500 ring-4 ring-emerald-50" />
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                POS Workspace
              </span>
            </div>
            <h1 className="mt-1 text-xl font-extrabold tracking-tight text-slate-900 sm:text-2xl lg:text-3xl">
              Create Invoice
            </h1>
            <p className="mt-0.5 text-xs text-slate-500 sm:text-sm">
              Generate quick invoices and professional GST tax receipts.
            </p>
          </div>

          <div className="flex items-center justify-between gap-4 rounded-xl border border-indigo-100 bg-indigo-50/40 px-4 py-2.5 transition-all hover:bg-indigo-50/70 sm:min-w-[220px] sm:px-5 sm:py-3">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-700">
                Current Payable
              </p>
              <p className="mt-0.5 text-xl font-black text-indigo-700 sm:text-2xl">
                ₹{grandTotal.toFixed(2)}
              </p>
            </div>
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-lg text-white shadow-sm shadow-indigo-200">
              🧾
            </div>
          </div>
        </header>

        {/* CUSTOMER PROFILE CARD */}
        <section className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-xs transition-all sm:p-6">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900 sm:text-base">
                Customer Details
              </h2>
              <p className="text-xs text-slate-400">
                Pick a stored client or manually enter details (including Buyer GSTIN).
              </p>
            </div>

            {(selectedCustomer._id ||
              selectedCustomer.name ||
              selectedCustomer.phone ||
              selectedCustomer.email ||
              selectedCustomer.address ||
              selectedCustomer.gstin) && (
                <button
                  type="button"
                  onClick={clearCustomer}
                  className="rounded-lg border border-red-200 bg-red-50/60 px-3 py-1.5 text-xs font-bold text-red-600 transition-all duration-150 hover:bg-red-500 hover:text-white active:scale-95 cursor-pointer"
                >
                  Clear Customer
                </button>
              )}
          </div>

          {/* Customer Search Dropdown */}
          <div className="relative mb-4">
            <input
              value={customerSearch}
              onChange={(e) => setCustomerSearch(e.target.value)}
              placeholder="Search customer by name, mobile number, email or GSTIN..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm font-medium text-slate-800 outline-none transition-all placeholder:text-slate-400 hover:border-slate-300 focus:border-indigo-600 focus:bg-white focus:ring-4 focus:ring-indigo-600/10 sm:py-3"
            />

            {customerSearch && filteredCustomers.length > 0 && (
              <div className="absolute left-0 right-0 top-full z-40 mt-1.5 max-h-64 overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-xl">
                {filteredCustomers.map((customer) => (
                  <button
                    type="button"
                    key={customer._id}
                    onClick={() => selectCustomer(customer)}
                    className="flex w-full items-center justify-between gap-3 border-b border-slate-100 px-4 py-3 text-left transition-colors last:border-0 hover:bg-indigo-50/80 cursor-pointer"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-slate-900">
                        {customer.name}
                      </p>
                      <p className="mt-0.5 truncate text-xs text-slate-400">
                        {customer.phone || "No phone"} {customer.email ? ` · ${customer.email}` : ""}
                        {(customer.gstin || customer.gst) ? ` · GSTIN: ${customer.gstin || customer.gst}` : ""}
                      </p>
                    </div>
                    <span className="shrink-0 rounded-lg bg-indigo-50 px-2.5 py-1 text-xs font-bold text-indigo-700 transition group-hover:bg-indigo-600 group-hover:text-white">
                      Apply
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Editable Fields Grid (5 Columns with GSTIN Input) */}
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-5">
            <div className="rounded-xl border border-slate-200/80 bg-slate-50/70 p-3 transition-colors hover:border-indigo-200 focus-within:border-indigo-600 focus-within:bg-white">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Customer Name
              </label>
              <input
                value={selectedCustomer.name}
                onChange={(e) => updateCustomerField("name", e.target.value)}
                placeholder="Walk-in Customer"
                className="mt-1 w-full bg-transparent text-sm font-bold text-slate-800 outline-none placeholder:font-normal placeholder:text-slate-400"
              />
            </div>

            <div className="rounded-xl border border-slate-200/80 bg-slate-50/70 p-3 transition-colors hover:border-indigo-200 focus-within:border-indigo-600 focus-within:bg-white">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Phone Number
              </label>
              <input
                value={selectedCustomer.phone}
                onChange={(e) => updateCustomerField("phone", e.target.value)}
                placeholder="e.g. +91 98765 43210"
                className="mt-1 w-full bg-transparent text-sm font-semibold text-slate-700 outline-none placeholder:font-normal placeholder:text-slate-400 font-mono"
              />
            </div>

            <div className="rounded-xl border border-slate-200/80 bg-slate-50/70 p-3 transition-colors hover:border-indigo-200 focus-within:border-indigo-600 focus-within:bg-white">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Email Address
              </label>
              <input
                value={selectedCustomer.email}
                onChange={(e) => updateCustomerField("email", e.target.value)}
                placeholder="name@domain.com"
                className="mt-1 w-full bg-transparent text-sm font-semibold text-slate-700 outline-none placeholder:font-normal placeholder:text-slate-400"
              />
            </div>

            <div className="rounded-xl border border-slate-200/80 bg-slate-50/70 p-3 transition-colors hover:border-indigo-200 focus-within:border-indigo-600 focus-within:bg-white">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Address / City
              </label>
              <input
                value={selectedCustomer.address}
                onChange={(e) => updateCustomerField("address", e.target.value)}
                placeholder="Street address or city..."
                className="mt-1 w-full bg-transparent text-sm font-semibold text-slate-700 outline-none placeholder:font-normal placeholder:text-slate-400"
              />
            </div>

            {/* Buyer GSTIN Input Field */}
            <div className="rounded-xl border border-slate-200/80 bg-slate-50/70 p-3 transition-colors hover:border-indigo-200 focus-within:border-indigo-600 focus-within:bg-white">
              <label className="text-[10px] font-bold uppercase tracking-wider text-indigo-600">
                Buyer GSTIN
              </label>
              <input
                value={selectedCustomer.gstin}
                onChange={(e) => updateCustomerField("gstin", e.target.value.toUpperCase())}
                placeholder="e.g. 08AAACR5055K1Z8"
                className="mt-1 w-full bg-transparent text-sm font-bold text-indigo-700 font-mono uppercase outline-none placeholder:font-normal placeholder:text-slate-400"
              />
            </div>
          </div>
        </section>

        {/* WORKSPACE DUAL-PANE LAYOUT */}
        <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-[minmax(0,1fr)_370px] xl:grid-cols-[minmax(0,1fr)_420px] lg:gap-6">

          {/* LEFT: PRODUCTS LIST & CART TABLE */}
          <main className="min-w-0 space-y-4 sm:space-y-6">

            {/* Search Filter Bar */}
            <section className="rounded-2xl border border-slate-200/90 bg-white p-3.5 shadow-xs transition-all sm:p-4">
              <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center">
                <div className="relative flex-1">
                  <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-slate-400">
                    🔍
                  </span>
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search product name or SKU code..."
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/60 py-2.5 pl-10 pr-4 text-xs sm:text-sm font-medium text-slate-900 outline-none transition-all placeholder:text-slate-400 hover:border-slate-300 focus:border-indigo-600 focus:bg-white focus:ring-4 focus:ring-indigo-600/10"
                  />
                </div>

                <div className="flex items-center justify-between sm:justify-center rounded-xl bg-slate-100 px-4 py-2.5 text-xs font-bold text-slate-600 shrink-0">
                  <span>Available Stock</span>
                  <span className="ml-2 font-extrabold text-indigo-700">{filteredProducts.length}</span>
                </div>
              </div>
            </section>

            {/* Product Cards Grid */}
            <section className="space-y-2.5">
              <div className="flex items-center justify-between px-1">
                <div>
                  <h2 className="text-sm font-bold text-slate-900 sm:text-base">
                    Catalogue
                  </h2>
                  <p className="text-xs text-slate-400">
                    Tap Add to add item into the invoice cart.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-2">
                {filteredProducts.map((product) => {
                  const cartItem = cart.find(
                    (item) => item.productId === product._id
                  );
                  const outOfStock = Number(product.stock) <= 0;

                  return (
                    <div
                      key={product._id}
                      className="group flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-4 text-left shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:border-indigo-300 hover:shadow-md"
                    >
                      <div>
                        <div className="mb-2 flex items-start justify-between gap-2">
                          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-base transition-transform group-hover:scale-105">
                            📦
                          </div>

                          <span
                            className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${outOfStock
                              ? "bg-red-50 text-red-600 border border-red-200/50"
                              : "bg-emerald-50 text-emerald-600 border border-emerald-200/50"
                              }`}
                          >
                            {outOfStock ? "Out of Stock" : `Stock: ${product.stock}`}
                          </span>
                        </div>

                        <p className="line-clamp-1 font-bold text-slate-800 transition-colors group-hover:text-indigo-600 text-sm sm:text-base">
                          {product.name}
                        </p>

                        <p className="mt-0.5 truncate text-xs text-slate-400 font-mono">
                          SKU: {product.sku || "-"}
                        </p>
                      </div>

                      <div className="mt-4 flex items-center justify-between gap-2 border-t border-slate-100 pt-3">
                        <div>
                          <p className="text-base sm:text-lg font-extrabold text-indigo-600">
                            ₹{Number(product.price || 0).toFixed(2)}
                          </p>
                          <p className="text-[10px] font-medium text-slate-400">
                            GST: {product.taxRate || 0}%
                          </p>
                        </div>

                        {cartItem ? (
                          <div className="flex h-8 sm:h-9 items-center gap-1.5 rounded-xl bg-indigo-600 px-1.5 shadow-sm">
                            <button
                              type="button"
                              onClick={() => updateQty(product._id, cartItem.qty - 1)}
                              className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-white/20 text-xs font-bold text-white transition hover:bg-white/30 active:scale-90 cursor-pointer"
                              title="Decrease"
                            >
                              −
                            </button>

                            <span className="min-w-[1.25rem] text-center text-xs sm:text-sm font-extrabold text-white">
                              {cartItem.qty}
                            </span>

                            <button
                              type="button"
                              onClick={() => addToCart(product)}
                              disabled={cartItem.qty >= Number(product.stock)}
                              className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-white/20 text-xs font-bold text-white transition hover:bg-white/30 active:scale-90 disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer"
                              title="Increase"
                            >
                              +
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => addToCart(product)}
                            disabled={outOfStock}
                            className="inline-flex h-8 sm:h-9 items-center justify-center rounded-xl bg-indigo-600 px-3.5 text-xs font-bold text-white shadow-xs transition-all hover:bg-indigo-700 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer"
                          >
                            + Add
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}

                {filteredProducts.length === 0 && (
                  <div className="col-span-full rounded-2xl border border-dashed border-slate-300 bg-white py-12 text-center">
                    <div className="text-3xl">📦</div>
                    <p className="mt-2 text-sm font-bold text-slate-700">
                      No matching products
                    </p>
                    <p className="mt-0.5 text-xs text-slate-400">
                      Try searching with another product term or SKU.
                    </p>
                  </div>
                )}
              </div>
            </section>

            {/* CART TABLE VIEW */}
            <section className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-xs">
              <div className="flex items-center justify-between border-b border-slate-200/80 bg-slate-50/50 px-4 py-3.5 sm:px-5">
                <div>
                  <h2 className="text-sm sm:text-base font-bold text-slate-900">
                    Selected Items
                  </h2>
                  <p className="text-xs text-slate-400">
                    Check item rates, tax deductions, and quantities.
                  </p>
                </div>

                <span className="shrink-0 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-0.5 text-xs font-bold text-indigo-700">
                  {cart.length} in Cart
                </span>
              </div>

              {/* Responsive Table Wrapper */}
              <div className="overflow-x-auto">
                <table className="w-full min-w-[650px] border-collapse text-left text-xs sm:text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-100/70 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      <th className="px-3 py-3 text-center">#</th>
                      <th className="px-3 py-3">Product</th>
                      <th className="px-3 py-3">SKU</th>
                      <th className="px-3 py-3 text-center">Qty</th>
                      <th className="px-3 py-3 text-right">Price</th>
                      <th className="px-3 py-3 text-center">GST</th>
                      <th className="px-3 py-3 text-right">Tax</th>
                      <th className="px-3 py-3 text-right">Total</th>
                      <th className="px-3 py-3 text-center">Del</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100 font-medium">
                    {cart.length === 0 ? (
                      <tr>
                        <td colSpan="9" className="py-12 text-center text-slate-400">
                          <div className="text-3xl">🧾</div>
                          <p className="mt-2 text-sm font-semibold text-slate-600">
                            No items in current invoice
                          </p>
                          <p className="text-xs text-slate-400">
                            Click on Catalogue &apos;+ Add&apos; button above.
                          </p>
                        </td>
                      </tr>
                    ) : (
                      cart.map((item, index) => {
                        const taxable = item.price * item.qty;
                        const tax = (taxable * item.taxRate) / 100;
                        const total = taxable + tax;

                        return (
                          <tr
                            key={item.productId}
                            className="transition-colors hover:bg-slate-50/80"
                          >
                            <td className="px-3 py-3 text-center text-slate-400 font-mono text-xs">
                              {index + 1}
                            </td>

                            <td className="max-w-[200px] truncate px-3 py-3 font-bold text-slate-800">
                              {item.name}
                            </td>

                            <td className="px-3 py-3 text-xs text-slate-400 font-mono">
                              {item.sku}
                            </td>

                            <td className="px-3 py-3 text-center">
                              <input
                                type="number"
                                min="1"
                                max={item.stock}
                                value={item.qty}
                                onChange={(e) => updateQty(item.productId, e.target.value)}
                                className="w-14 rounded-lg border border-slate-200 bg-slate-50 py-1 text-center font-bold text-slate-800 outline-none focus:border-indigo-600 focus:bg-white focus:ring-2 focus:ring-indigo-100 font-mono"
                              />
                            </td>

                            <td className="px-3 py-3 text-right text-slate-700">
                              ₹{item.price.toFixed(2)}
                            </td>

                            <td className="px-3 py-3 text-center">
                              <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-bold text-amber-700">
                                {item.taxRate}%
                              </span>
                            </td>

                            <td className="px-3 py-3 text-right text-slate-600 font-medium">
                              ₹{tax.toFixed(2)}
                            </td>

                            <td className="px-3 py-3 text-right font-black text-slate-900">
                              ₹{total.toFixed(2)}
                            </td>

                            <td className="px-3 py-3 text-center">
                              <button
                                type="button"
                                onClick={() => removeItem(item.productId)}
                                className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 transition hover:bg-red-50 hover:text-red-600 cursor-pointer"
                                title="Remove item"
                              >
                                ✕
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </main>

          {/* RIGHT: BILL SUMMARY & CHECKOUT */}
          <aside className="w-full lg:sticky lg:top-6 lg:self-start">
            <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-xs">

              <div className="flex items-center justify-between border-b border-slate-200/80 px-5 py-4">
                <div>
                  <h2 className="text-base font-extrabold text-slate-900">
                    Bill Summary
                  </h2>
                  <p className="text-xs text-slate-400">
                    Payment details & dispatch breakdown.
                  </p>
                </div>
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-base">
                  💳
                </span>
              </div>

              <div className="p-4 sm:p-5 space-y-4">

                {/* Active Customer Badge */}
                <div className="rounded-xl border border-slate-200/80 bg-slate-50/70 p-3">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Billed To
                  </p>
                  <p className="mt-0.5 truncate text-sm font-bold text-slate-800">
                    {selectedCustomer.name || "Walk-in Customer"}
                  </p>
                  {selectedCustomer.phone && (
                    <p className="mt-0.5 text-xs text-slate-500 font-mono">
                      Phone: {selectedCustomer.phone}
                    </p>
                  )}
                  {selectedCustomer.gstin && (
                    <p className="mt-0.5 text-xs font-bold text-indigo-700 font-mono uppercase">
                      GSTIN: {selectedCustomer.gstin}
                    </p>
                  )}
                </div>

                {/* Amount Computations */}
                <div className="space-y-2.5 text-xs sm:text-sm">
                  <div className="flex items-center justify-between text-slate-500 font-medium">
                    <span>Total Quantity</span>
                    <span className="font-bold text-slate-800">{totalItems} Pcs</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-500 font-medium">
                    <span>Taxable Base</span>
                    <span className="font-semibold text-slate-800">₹{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-500 font-medium">
                    <span>GST (CGST + SGST)</span>
                    <span className="font-semibold text-amber-600">₹{taxTotal.toFixed(2)}</span>
                  </div>
                </div>

                {/* Grand Total Box */}
                <div className="rounded-xl bg-[#0e1726] p-4 text-white shadow-inner">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Total Amount Due
                      </p>
                      <p className="mt-1 text-2xl font-black text-white sm:text-3xl">
                        ₹{grandTotal.toFixed(2)}
                      </p>
                    </div>
                    <span className="rounded-full bg-emerald-500/20 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-400 border border-emerald-500/30">
                      INR Total
                    </span>
                  </div>
                </div>

                {/* Payment Selector */}
                <div>
                  <label className="mb-1.5 block text-xs font-bold text-slate-600">
                    Payment Channel
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { value: "cash", label: "Cash", icon: "💵" },
                      { value: "upi", label: "UPI", icon: "📱" },
                      { value: "card", label: "Card", icon: "💳" },
                    ].map((method) => {
                      const active = paymentMethod === method.value;
                      return (
                        <button
                          key={method.value}
                          type="button"
                          onClick={() => setPaymentMethod(method.value)}
                          className={`flex flex-col items-center justify-center rounded-xl border py-2.5 transition-all cursor-pointer ${active
                            ? "border-indigo-600 bg-indigo-50/80 text-indigo-700 shadow-xs"
                            : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                            }`}
                        >
                          <span className="text-base">{method.icon}</span>
                          <span className="mt-1 text-xs font-bold">{method.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Checkout Button */}
                <button
                  type="button"
                  onClick={checkout}
                  disabled={cart.length === 0 || generating}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3.5 text-sm font-bold text-white shadow-sm transition-all hover:bg-indigo-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer"
                >
                  {generating ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      <span>Generating Invoice...</span>
                    </>
                  ) : (
                    <>
                      <span>🧾</span>
                      <span>Generate Bill & PDF</span>
                    </>
                  )}
                </button>

                <p className="text-center text-[10px] text-slate-400">
                  Mobile devices par PDF download hogi, Desktop par preview open hoga.
                </p>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
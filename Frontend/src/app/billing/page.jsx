"use client";

import { setActiveCustomer } from "@/lib/activeCustomer";
import { useEffect, useMemo, useState } from "react";
import api from "@/lib/api";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { toast } from "react-toastify";
import { z } from "zod";

// =========================================================
// CONSTANTS
// =========================================================
const emptyCustomer = {
  _id: "",
  name: "",
  phone: "",
  email: "",
  address: "",
  gstin: "",
};

const emptyProductForm = {
  name: "",
  sku: "",
  hsn: "",
  price: "",
  taxRate: "18",
  qty: "1",
};

const GST_RATES = [0, 5, 10, 12, 18, 20, 28, 30];

// Stock UI hata diya hai, par backend ko stock field chahiye hota hai.
// Isliye naye product pe ye default value jayegi (UI me kahin show nahi hoti).
const DEFAULT_STOCK = 9999;

const TERMS = [
  "Goods once sold will not be taken back or exchanged.",
  "Warranty is as per the manufacturer's terms only. No warranty on physical damage, burning or misuse.",
  "Please check the goods at the time of delivery. No complaint will be entertained afterwards.",
  "Payment is due immediately. Interest may be charged on delayed payments.",
  "All disputes are subject to Jaipur jurisdiction only.",
  "E. & O.E. (Errors and omissions excepted).",
];

const DECLARATION_TEXT =
  "We declare that this invoice shows the actual price of the goods and services described and that all particulars are true and correct.";

// =========================================================
// ZOD SCHEMAS
// =========================================================
const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
const phoneRegex = /^[6-9]\d{9}$/;

// Naya customer save karne ke liye (name + phone required)
const customerSchema = z.object({
  name: z
    .string({ error: "Name is required" })
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name too long"),
  phone: z
    .string({ error: "Phone is required" })
    .trim()
    .regex(phoneRegex, "Enter a valid 10-digit phone number"),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("Invalid email address")
    .optional()
    .or(z.literal("")),
  address: z.string().trim().max(250, "Address too long").optional().or(z.literal("")),
  gstin: z
    .string()
    .trim()
    .toUpperCase()
    .optional()
    .refine((val) => !val || gstinRegex.test(val), { error: "Invalid GSTIN format" }),
});

// Product add + edit dono ke liye
const productSchema = z.object({
  name: z
    .string({ error: "Product name is required" })
    .trim()
    .min(2, "Product name must be at least 2 characters")
    .max(120, "Product name too long"),
  sku: z.string().trim().max(50, "SKU too long").optional(),
  hsn: z.string().trim().max(20, "HSN too long").optional(),
  price: z.coerce
    .number({ error: "Price must be a number" })
    .positive("Price must be greater than 0"),
  taxRate: z.coerce
    .number({ error: "GST must be a number" })
    .min(0, "GST cannot be negative")
    .max(100, "GST cannot be more than 100"),
  qty: z.coerce
    .number({ error: "Quantity must be a number" })
    .int("Quantity must be a whole number")
    .min(1, "Quantity must be at least 1"),
});

// Checkout validation (customer optional = walk-in allowed)
const checkoutSchema = z.object({
  customerDetails: z.object({
    name: z.string().trim().optional(),
    phone: z
      .string()
      .trim()
      .optional()
      .refine((val) => !val || phoneRegex.test(val), {
        error: "Enter a valid 10-digit phone number",
      }),
    email: z
      .string()
      .trim()
      .optional()
      .refine((val) => !val || z.string().email().safeParse(val).success, {
        error: "Invalid email address",
      }),
    address: z.string().trim().optional(),
    gstin: z
      .string()
      .trim()
      .optional()
      .refine((val) => !val || gstinRegex.test(val), {
        error: "Invalid GSTIN format",
      }),
  }),
  items: z
    .array(
      z.object({
        productId: z.string({ error: "Invalid product" }).min(1),
        qty: z.coerce
          .number({ error: "Quantity must be a number" })
          .int()
          .positive("Quantity must be at least 1"),
      })
    )
    .min(1, "Cart is empty — please add at least one product"),
  paymentMethod: z.enum(["cash", "upi", "card"], {
    error: "Select a valid payment method",
  }),
});

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

// =========================================================
// HELPERS
// =========================================================
const mapIssues = (error) => {
  const errors = {};
  error.issues.forEach((issue) => {
    const key = issue.path[issue.path.length - 1];
    if (!errors[key]) errors[key] = issue.message;
  });
  return errors;
};

const normalizeCustomer = (c = {}) => ({
  _id: c._id || "",
  name: c.name || "",
  phone: c.phone || "",
  email: c.email || "",
  address: c.address || "",
  gstin: c.gstin || c.gst || c.gstNo || c.gstNumber || "",
});

const toCartItem = (product, qty = 1) => ({
  productId: product._id,
  name: product.name,
  sku: product.sku || "-",
  hsn: product.hsn || product.hsnCode || "",
  price: Number(product.price || 0),
  taxRate: Number(product.taxRate || 0),
  stock: Number(product.stock ?? DEFAULT_STOCK),
  qty: Number(qty) || 1,
});

const money = (n) =>
  `₹${Number(n || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

// "BR/2026-27/001" jaise number me "/" file name me allowed nahi hota
const toSafeFileName = (value) => String(value).replace(/[\/\\:*?"<>|]/g, "-");

// ---------- Invoice number: BR/2026-27/001 ----------
const getFinancialYear = (date = new Date()) => {
  const y = date.getFullYear();
  const start = date.getMonth() >= 3 ? y : y - 1; // FY April se start
  return `${start}-${String((start + 1) % 100).padStart(2, "0")}`;
};

const formatInvoiceNumber = (raw) => {
  const value = String(raw || "").trim();
  if (!value) return "";
  if (/^BR\/\d{4}-\d{2}\/\d+$/i.test(value)) return value; // already sahi format
  const m = value.match(/(\d+)\s*$/);
  if (!m) return value;
  return `BR/${getFinancialYear()}/${String(Number(m[1])).padStart(3, "0")}`;
};

// "jaipur" -> "Jaipur", "ASHISH KUMAR" -> "Ashish Kumar" (mixed case ko touch nahi karta)
const toTitleCase = (str = "") => {
  const s = String(str).trim();
  if (!s) return "";
  if (s !== s.toLowerCase() && s !== s.toUpperCase()) return s;
  return s.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
};

// ---------- PDF font (₹ symbol ke liye) ----------
const PDF_FONT = "NotoSans";
const fontCache = {};

const fetchFontBase64 = async (url) => {
  if (fontCache[url]) return fontCache[url];
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Font load failed: ${url}`);
  const bytes = new Uint8Array(await res.arrayBuffer());
  let binary = "";
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode.apply(null, bytes.subarray(i, i + chunk));
  }
  const b64 = btoa(binary);
  fontCache[url] = b64;
  return b64;
};

const registerPdfFonts = async (doc) => {
  const [regular, bold] = await Promise.all([
    fetchFontBase64("/fonts/NotoSans-Regular.ttf"),
    fetchFontBase64("/fonts/NotoSans-Bold.ttf"),
  ]);
  doc.addFileToVFS("NotoSans-Regular.ttf", regular);
  doc.addFont("NotoSans-Regular.ttf", PDF_FONT, "normal");
  doc.addFileToVFS("NotoSans-Bold.ttf", bold);
  doc.addFont("NotoSans-Bold.ttf", PDF_FONT, "bold");
};

const inputBase =
  "w-full rounded-xl border bg-slate-50/50 px-3.5 py-2.5 text-sm font-semibold text-slate-800 outline-none transition-all placeholder:font-normal placeholder:text-slate-400 hover:border-slate-300 focus:bg-white focus:ring-4";

function TextInput({
  label,
  value,
  onChange,
  error,
  placeholder,
  type = "text",
  mono = false,
  required = false,
  inputMode,
  uppercase = false,
  min,
}) {
  return (
    <div className="w-full">
      <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-slate-500">
        {label}
        {required && <span className="ml-1 text-red-500">*</span>}
      </label>
      <input
        type={type}
        value={value}
        min={min}
        inputMode={inputMode}
        onChange={onChange}
        placeholder={placeholder}
        className={`${inputBase} ${mono ? "font-mono" : ""} ${uppercase ? "uppercase" : ""} ${error
          ? "border-red-400 focus:border-red-500 focus:ring-red-500/10"
          : "border-slate-200 focus:border-indigo-600 focus:ring-indigo-600/10"
          }`}
      />
      {error && <p className="mt-1 text-[11px] font-semibold text-red-500">{error}</p>}
    </div>
  );
}

function GstSelect({ value, onChange, error }) {
  return (
    <div className="w-full">
      <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-slate-500">
        GST %
      </label>
      <select
        value={value}
        onChange={onChange}
        className={`${inputBase} cursor-pointer ${error
          ? "border-red-400 focus:border-red-500 focus:ring-red-500/10"
          : "border-slate-200 focus:border-indigo-600 focus:ring-indigo-600/10"
          }`}
      >
        {GST_RATES.map((r) => (
          <option key={r} value={r}>
            {r}%
          </option>
        ))}
      </select>
      {error && <p className="mt-1 text-[11px] font-semibold text-red-500">{error}</p>}
    </div>
  );
}

// =========================================================
// MAIN COMPONENT
// =========================================================
export default function BillingPage() {
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);

  const [search, setSearch] = useState("");
  const [customerSearch, setCustomerSearch] = useState("");

  const [cart, setCart] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(emptyCustomer);
  const [fieldErrors, setFieldErrors] = useState({});

  const [productForm, setProductForm] = useState(emptyProductForm);
  const [productErrors, setProductErrors] = useState({});
  const [addingProduct, setAddingProduct] = useState(false);

  const [editItem, setEditItem] = useState(null);
  const [editErrors, setEditErrors] = useState({});
  const [savingEdit, setSavingEdit] = useState(false);

  const [savingCustomer, setSavingCustomer] = useState(false);
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
        setProducts(Array.isArray(productsRes.data) ? productsRes.data : []);
        setCustomers(Array.isArray(customersRes.data) ? customersRes.data : []);
      } catch (error) {
        toast.error(
          `Data loading error: ${error.response?.data?.message || error.message}`
        );
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // Customers page se aaya hua customer restore
  useEffect(() => {
    const saved = sessionStorage.getItem("selectedCustomer");
    if (saved) {
      try {
        const customerData = normalizeCustomer(JSON.parse(saved));
        setSelectedCustomer(customerData);
        setActiveCustomer(customerData);
        sessionStorage.removeItem("selectedCustomer");
      } catch (error) {
        console.error("Selected customer error:", error);
      }
    }
  }, []);

  // ESC se edit popup band
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") setEditItem(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // =========================================================
  // FILTERS
  // =========================================================
  const filteredProducts = useMemo(() => {
    const value = search.toLowerCase().trim();
    if (!value) return [];
    return products
      .filter(
        (p) =>
          p.name?.toLowerCase().includes(value) ||
          p.sku?.toLowerCase().includes(value)
      )
      .slice(0, 8);
  }, [products, search]);

  const filteredCustomers = useMemo(() => {
    const value = customerSearch.toLowerCase().trim();
    if (!value) return [];
    return customers
      .filter(
        (c) =>
          c.name?.toLowerCase().includes(value) ||
          c.phone?.toLowerCase().includes(value) ||
          c.email?.toLowerCase().includes(value) ||
          c.gstin?.toLowerCase().includes(value) ||
          c.gst?.toLowerCase().includes(value)
      )
      .slice(0, 8);
  }, [customers, customerSearch]);

  // =========================================================
  // CUSTOMER ACTIONS
  // =========================================================
  const selectCustomer = (customer) => {
    const data = normalizeCustomer(customer);
    setSelectedCustomer(data);
    setActiveCustomer(data);
    setCustomerSearch("");
    setFieldErrors({});
  };

  const updateCustomerField = (field, value) => {
    const next = { ...selectedCustomer, [field]: value };
    setSelectedCustomer(next);
    setActiveCustomer(next);
    if (fieldErrors[field]) {
      setFieldErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const clearCustomer = () => {
    setSelectedCustomer(emptyCustomer);
    setActiveCustomer(null);
    setCustomerSearch("");
    setFieldErrors({});
  };

  // Naya customer database me save karo
  const handleSaveCustomer = async () => {
    const result = customerSchema.safeParse({
      name: selectedCustomer.name,
      phone: selectedCustomer.phone,
      email: selectedCustomer.email,
      address: selectedCustomer.address,
      gstin: selectedCustomer.gstin,
    });

    if (!result.success) {
      const errors = mapIssues(result.error);
      setFieldErrors(errors);
      toast.error(Object.values(errors)[0] || "Please fix highlighted fields.");
      return;
    }

    setFieldErrors({});

    try {
      setSavingCustomer(true);
      const res = await api.post("/customers", result.data);
      let created = res.data?.customer || res.data?.data || res.data;

      if (!created?._id) {
        const list = await api.get("/customers");
        const arr = Array.isArray(list.data) ? list.data : [];
        setCustomers(arr);
        created = arr.find((c) => c.phone === result.data.phone);
      } else {
        setCustomers((prev) => [created, ...prev]);
      }

      const data = normalizeCustomer({ ...result.data, ...created });
      setSelectedCustomer(data);
      setActiveCustomer(data);
      toast.success("Customer saved successfully.");
    } catch (error) {
      if (error.response?.data?.errors) {
        const backendErrors = {};
        error.response.data.errors.forEach((fe) => {
          backendErrors[fe.field] = fe.message;
        });
        setFieldErrors(backendErrors);
      }
      toast.error(error.response?.data?.message || "Customer save failed.");
    } finally {
      setSavingCustomer(false);
    }
  };

  // =========================================================
  // CART ACTIONS
  // =========================================================
  const addToCart = (product, qty = 1) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.productId === product._id);
      if (existing) {
        return prev.map((i) =>
          i.productId === product._id ? { ...i, qty: i.qty + Number(qty) } : i
        );
      }
      return [...prev, toCartItem(product, qty)];
    });
  };

  const addExistingProduct = (product) => {
    addToCart(product, 1);
    setSearch("");
    toast.success(`${product.name} added to bill`);
  };

  const updateQty = (productId, qty) => {
    const n = Math.floor(Number(qty));
    if (Number.isNaN(n)) return;
    const safe = Math.min(Math.max(n, 1), 99999);
    setCart((prev) =>
      prev.map((i) => (i.productId === productId ? { ...i, qty: safe } : i))
    );
  };

  const removeItem = (productId) => {
    setCart((prev) => prev.filter((i) => i.productId !== productId));
  };

  const deleteItem = (item) => {
    removeItem(item.productId);
    toast.info(`${item.name} removed from bill`);
  };

  // =========================================================
  // ADD NEW PRODUCT -> DB me save + bill me auto add
  // =========================================================
  const handleProductFormChange = (field, value) => {
    setProductForm((prev) => ({ ...prev, [field]: value }));
    if (productErrors[field]) {
      setProductErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();

    const result = productSchema.safeParse(productForm);
    if (!result.success) {
      const errors = mapIssues(result.error);
      setProductErrors(errors);
      toast.error(Object.values(errors)[0] || "Please fix highlighted fields.");
      return;
    }

    setProductErrors({});
    const { name, sku, hsn, price, taxRate, qty } = result.data;

    const payload = {
      name,
      sku: sku || `SKU-${Date.now().toString().slice(-6)}`,
      hsn: hsn || "",
      price,
      taxRate,
      stock: DEFAULT_STOCK,
    };

    try {
      setAddingProduct(true);
      const res = await api.post("/products", payload);
      let created = res.data?.product || res.data?.data || res.data;

      if (!created?._id) {
        const list = await api.get("/products");
        const arr = Array.isArray(list.data) ? list.data : [];
        setProducts(arr);
        created = arr.find((p) => p.sku === payload.sku) || arr.find((p) => p.name === name);
      } else {
        setProducts((prev) => [created, ...prev]);
      }

      if (!created?._id) throw new Error("Product save hua, par ID nahi mili.");

      // Product turant bill table me add
      addToCart({ ...payload, ...created }, qty);
      setProductForm(emptyProductForm);
      toast.success(`${name} added to bill`);
    } catch (error) {
      console.error("Product add error:", error.response?.data || error.message);
      toast.error(error.response?.data?.message || error.message || "Product save failed.");
    } finally {
      setAddingProduct(false);
    }
  };

  // =========================================================
  // EDIT ITEM
  // =========================================================
  const openEdit = (item) => {
    setEditItem({
      productId: item.productId,
      name: item.name,
      sku: item.sku === "-" ? "" : item.sku,
      hsn: item.hsn || "",
      price: String(item.price),
      taxRate: String(item.taxRate),
      qty: String(item.qty),
      stock: item.stock,
    });
    setEditErrors({});
  };

  const handleEditChange = (field, value) => {
    setEditItem((prev) => ({ ...prev, [field]: value }));
    if (editErrors[field]) {
      setEditErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const saveEdit = async (e) => {
    e.preventDefault();

    const result = productSchema.safeParse(editItem);
    if (!result.success) {
      const errors = mapIssues(result.error);
      setEditErrors(errors);
      toast.error(Object.values(errors)[0] || "Please fix highlighted fields.");
      return;
    }

    const { name, sku, hsn, price, taxRate, qty } = result.data;
    const payload = {
      name,
      hsn: hsn || "",
      price,
      taxRate,
      stock: editItem.stock ?? DEFAULT_STOCK,
    };
    if (sku) payload.sku = sku;

    try {
      setSavingEdit(true);
      await api.put(`/products/${editItem.productId}`, payload);

      setProducts((prev) =>
        prev.map((p) => (p._id === editItem.productId ? { ...p, ...payload } : p))
      );

      setCart((prev) =>
        prev.map((i) =>
          i.productId === editItem.productId
            ? { ...i, name, sku: sku || i.sku, hsn: hsn || "", price, taxRate, qty }
            : i
        )
      );

      toast.success("Item updated successfully.");
      setEditItem(null);
    } catch (error) {
      toast.error(error.response?.data?.message || "Item update failed.");
    } finally {
      setSavingEdit(false);
    }
  };

  // =========================================================
  // CALCULATIONS
  // =========================================================
  const totalItems = cart.reduce((sum, i) => sum + Number(i.qty || 0), 0);
  const subtotal = cart.reduce((sum, i) => sum + i.price * i.qty, 0);
  const taxTotal = cart.reduce((sum, i) => sum + (i.price * i.qty * i.taxRate) / 100, 0);
  const grandTotal = subtotal + taxTotal;

  const cgstTotal = taxTotal / 2;
  const sgstTotal = taxTotal / 2;
  const effectiveTaxRate = subtotal > 0 ? (taxTotal / subtotal) * 100 : 0;
  const halfTaxRate = effectiveTaxRate / 2;

  // =========================================================
  // NUMBER TO WORDS
  // =========================================================
  const numberToWords = (amount) => {
    const ones = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
    const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

    const convert = (num) => {
      if (num < 20) return ones[num];
      if (num < 100) return tens[Math.floor(num / 10)] + (num % 10 ? " " + ones[num % 10] : "");
      if (num < 1000) return ones[Math.floor(num / 100)] + " Hundred" + (num % 100 ? " " + convert(num % 100) : "");
      if (num < 100000) return convert(Math.floor(num / 1000)) + " Thousand" + (num % 1000 ? " " + convert(num % 1000) : "");
      if (num < 10000000) return convert(Math.floor(num / 100000)) + " Lakh" + (num % 100000 ? " " + convert(num % 100000) : "");
      return convert(Math.floor(num / 10000000)) + " Crore" + (num % 10000000 ? " " + convert(num % 10000000) : "");
    };

    const rupees = Math.floor(amount);
    const paise = Math.round((amount - rupees) * 100);

    let result = rupees === 0 ? "Zero Rupees" : `${convert(rupees)} Rupees`;
    if (paise > 0) result += ` and ${convert(paise)} Paise`;
    return `${result} Only`;
  };

  // =========================================================
  // GENERATE PDF
  // =========================================================
  const generateInvoicePDF = async (invoiceNumber) => {
    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    await registerPdfFonts(doc);

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 10;
    const contentWidth = pageWidth - margin * 2;

    const COLOR_ICE_BLUE = [237, 244, 250];
    const COLOR_NAVY_TEXT = [16, 76, 126];
    const COLOR_ORANGE = [237, 125, 32];
    const COLOR_BORDER = [205, 218, 228];
    const COLOR_DARK_TEXT = [25, 30, 40];
    const COLOR_MID_TEXT = [55, 60, 70];
    const COLOR_HEADER_BG = [19, 89, 143];
    const COLOR_HEADER_TEXT = [255, 255, 255];

    // ---------- Items ke hisaab se auto-compact ----------
    const itemCount = cart.length;
    const compact = itemCount > 3;
    const veryCompact = itemCount > 5;
    const rowPad = veryCompact ? 1.7 : compact ? 2.3 : 3;
    const tblFont = veryCompact ? 8 : 8.5;
    const buyerLineStep = veryCompact ? 3.9 : 4.3;
    const buyerGap = veryCompact ? 0.6 : 1.2;

    const drawPageBorder = () => {
      doc.setDrawColor(...COLOR_BORDER);
      doc.setLineWidth(0.35);
      doc.rect(margin, margin, contentWidth, pageHeight - margin * 2);
    };

    drawPageBorder();

    // ---------- TOP BANNER ----------
    const headerBannerHeight = 11;
    doc.setFillColor(...COLOR_ICE_BLUE);
    doc.rect(margin, margin, contentWidth, headerBannerHeight, "F");

    doc.setDrawColor(...COLOR_BORDER);
    doc.setLineWidth(0.3);
    doc.line(margin + contentWidth * 0.65, margin, margin + contentWidth * 0.65, margin + headerBannerHeight);

    doc.setDrawColor(...COLOR_ORANGE);
    doc.setLineWidth(0.7);
    doc.line(margin, margin + headerBannerHeight, margin + contentWidth, margin + headerBannerHeight);

    doc.setFont(PDF_FONT, "bold");
    doc.setFontSize(12);
    doc.setTextColor(...COLOR_NAVY_TEXT);
    doc.text(COMPANY.name, margin + 4, margin + 7.5);

    doc.setFontSize(11);
    doc.text("TAX INVOICE", margin + contentWidth * 0.68, margin + 7.5);

    // ---------- SELLER (LEFT) ----------
    doc.setFont(PDF_FONT, "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(...COLOR_MID_TEXT);
    doc.text(COMPANY.addressLine1, margin + 4, 27);
    doc.text(COMPANY.addressLine2, margin + 4, 32);
    doc.text(`GSTIN: ${COMPANY.gstin}`, margin + 4, 37);
    doc.text(`State: ${COMPANY.state}`, margin + 4, 42);
    doc.text(`Mobile: ${COMPANY.mobile}   Email: ${COMPANY.email}`, margin + 4, 47);

    // ---------- INVOICE META (RIGHT) ----------
    doc.setTextColor(...COLOR_DARK_TEXT);
    const rightX = pageWidth - margin - 4;
    doc.text(`Invoice No: ${invoiceNumber}`, rightX, 27, { align: "right" });
    doc.text(`Invoice Date: ${new Date().toLocaleDateString("en-GB")}`, rightX, 32, { align: "right" });
    doc.text(`Place of Supply: ${COMPANY.placeOfSupply}`, rightX, 37, { align: "right" });
    doc.text("Reverse Charge: No", rightX, 42, { align: "right" });
    doc.text(`Payment: ${paymentMethod.toUpperCase()}`, rightX, 47, { align: "right" });

    doc.setDrawColor(...COLOR_BORDER);
    doc.setLineWidth(0.3);
    doc.line(margin, 51, pageWidth - margin, 51);

    // ---------- BUYER (BILL TO) ----------
    const buyerHeaderY = 53;
    const buyerHeaderHeight = 6.5;

    doc.setFillColor(...COLOR_HEADER_BG);
    doc.rect(margin, buyerHeaderY, contentWidth, buyerHeaderHeight, "F");

    doc.setFont(PDF_FONT, "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(...COLOR_HEADER_TEXT);
    doc.text("BUYER (BILL TO)", margin + 4, buyerHeaderY + 4.6);

    const buyerRows = [
      ["Name", toTitleCase(selectedCustomer.name) || "Walk-in Customer"],
      ["Address", toTitleCase(selectedCustomer.address)],
      ["Phone", String(selectedCustomer.phone || "").trim()],
      ["Email", String(selectedCustomer.email || "").trim()],
      ["GSTIN", String(selectedCustomer.gstin || "").trim().toUpperCase()],
    ].filter(([, value]) => value);

    const labelX = margin + 4;
    const valueX = margin + 26;
    const valueMaxWidth = contentWidth - 30;
    let buyerY = buyerHeaderY + buyerHeaderHeight + 4.5;

    buyerRows.forEach(([label, value], idx) => {
      const isName = idx === 0;

      doc.setFont(PDF_FONT, "bold");
      doc.setFontSize(8);
      doc.setTextColor(...COLOR_MID_TEXT);
      doc.text(`${label}`, labelX, buyerY);
      doc.text(":", valueX - 3, buyerY);

      doc.setFont(PDF_FONT, "bold");
      doc.setFontSize(isName ? 9.5 : 8.5);
      doc.setTextColor(...COLOR_DARK_TEXT);
      const lines = doc.splitTextToSize(value, valueMaxWidth);
      doc.text(lines, valueX, buyerY);

      buyerY += lines.length * buyerLineStep + buyerGap;
    });

    const buyerBottom = buyerY - 1;
    doc.setDrawColor(...COLOR_BORDER);
    doc.setLineWidth(0.3);
    doc.rect(margin, buyerHeaderY, contentWidth, buyerBottom - buyerHeaderY, "S");

    const itemsTableStartY = buyerBottom + 4;

    // ---------- ITEMS TABLE ----------
    const tableRows = cart.map((item, index) => [
      index + 1,
      item.name,
      item.hsn || item.sku || "-",
      item.qty,
      money(item.price),
      money(item.price * item.qty),
    ]);

    autoTable(doc, {
      startY: itemsTableStartY,
      margin: { left: margin, right: margin },
      head: [["S.No.", "Description", "HSN/SAC", "Qty", "Rate", "Amount"]],
      body: tableRows,
      theme: "grid",
      styles: {
        font: PDF_FONT,
        fontSize: tblFont,
        cellPadding: rowPad,
        lineColor: COLOR_BORDER,
        lineWidth: 0.25,
        textColor: COLOR_DARK_TEXT,
        fontStyle: "bold",
        valign: "middle",
      },
      headStyles: {
        fillColor: COLOR_HEADER_BG,
        textColor: COLOR_HEADER_TEXT,
        fontStyle: "bold",
        fontSize: tblFont + 0.2,
        halign: "center",
      },
      alternateRowStyles: { fillColor: [249, 251, 253] },
      columnStyles: {
        0: { halign: "center", cellWidth: 14, fontStyle: "bold", textColor: COLOR_MID_TEXT },
        1: { cellWidth: 78, fontStyle: "bold", textColor: COLOR_DARK_TEXT },
        2: { halign: "center", cellWidth: 24, fontStyle: "bold", textColor: COLOR_NAVY_TEXT },
        3: { halign: "center", cellWidth: 18, fontStyle: "bold", textColor: [37, 99, 235] },
        4: { halign: "right", cellWidth: 28, fontStyle: "bold", textColor: COLOR_MID_TEXT },
        5: { halign: "right", cellWidth: 28, fontStyle: "bold", textColor: COLOR_DARK_TEXT },
      },
      didDrawPage: () => drawPageBorder(),
    });

    // ---------- FOOTER SIZE (pehle calculate, taaki bottom me fix ho sake) ----------
    const thankYouHeight = 8;
    const footerLeftWidth = contentWidth * 0.7;
    const footerTextWidth = footerLeftWidth - 8;
    const footerLineH = 3.3;

    // NOTE: font pehle set karo, tabhi wrapping sahi measure hoti hai
    doc.setFont(PDF_FONT, "bold");
    doc.setFontSize(7);
    const declarationLines = doc.splitTextToSize(DECLARATION_TEXT, footerTextWidth);

    doc.setFontSize(6.8);
    const termsLines = TERMS.flatMap((t, i) =>
      doc.splitTextToSize(`${i + 1}. ${t}`, footerTextWidth)
    );

    const footerHeight =
      5 + 4 + declarationLines.length * footerLineH + 3 + 4 + termsLines.length * footerLineH + 4;
    const footerTop = pageHeight - margin - thankYouHeight - footerHeight;

    let cursorY = doc.lastAutoTable.finalY + 4;

    // Totals + words + bank + tax summary ke liye ~78mm chahiye
    const bodyBlockHeight = 78;
    if (cursorY + bodyBlockHeight > footerTop - 2) {
      doc.addPage();
      drawPageBorder();
      cursorY = margin + 6;
    }

    // ---------- AMOUNT IN WORDS ----------
    doc.setFillColor(...COLOR_ICE_BLUE);
    doc.setDrawColor(...COLOR_BORDER);
    doc.setLineWidth(0.3);
    doc.rect(margin, cursorY, contentWidth, 12, "FD");

    doc.setFont(PDF_FONT, "bold");
    doc.setFontSize(8);
    doc.setTextColor(...COLOR_MID_TEXT);
    doc.text("Amount Chargeable (in words):", margin + 3.5, cursorY + 4.5);

    doc.setTextColor(...COLOR_DARK_TEXT);
    doc.text(`INR ${numberToWords(grandTotal)}`, margin + 3.5, cursorY + 9);

    cursorY += 15;

    // ---------- BANK DETAILS (left) | TOTALS (right) ----------
    const summaryWidth = 85;
    const columnGap = 5;
    const bankWidth = contentWidth - summaryWidth - columnGap;
    const summaryStartX = pageWidth - margin - summaryWidth;
    const subBannerHeight = 6.5;
    const bankBoxHeight = 34;

    // Bank box
    doc.setFillColor(...COLOR_HEADER_BG);
    doc.rect(margin, cursorY, bankWidth, subBannerHeight, "F");
    doc.setDrawColor(...COLOR_BORDER);
    doc.setLineWidth(0.3);
    doc.rect(margin, cursorY, bankWidth, bankBoxHeight, "S");

    doc.setFont(PDF_FONT, "bold");
    doc.setFontSize(8);
    doc.setTextColor(...COLOR_HEADER_TEXT);
    doc.text("BANK DETAILS", margin + 3, cursorY + 4.5);

    const bankStartY = cursorY + subBannerHeight + 4.5;
    doc.setFont(PDF_FONT, "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(...COLOR_MID_TEXT);

    const bankLines = [
      `Account Name: ${COMPANY.bank.accountName}`,
      `Bank: ${COMPANY.bank.bankName}`,
      `Branch: ${COMPANY.bank.branch}`,
      `Account No.: ${COMPANY.bank.accountNo}`,
      `IFSC: ${COMPANY.bank.ifsc}`,
      `SWIFT: ${COMPANY.bank.swift}`,
    ];
    bankLines.forEach((line, i) => {
      doc.text(line, margin + 3, bankStartY + i * 4);
    });

    // Totals table
    autoTable(doc, {
      startY: cursorY,
      margin: { left: summaryStartX, right: margin },
      tableWidth: summaryWidth,
      body: [
        ["Taxable Value", money(subtotal)],
        [`CGST @ ${halfTaxRate.toFixed(1)}%`, money(cgstTotal)],
        [`SGST @ ${halfTaxRate.toFixed(1)}%`, money(sgstTotal)],
        ["TOTAL PAYABLE", money(grandTotal)],
      ],
      theme: "grid",
      styles: {
        font: PDF_FONT,
        fontSize: 8.5,
        cellPadding: 2.4,
        lineColor: COLOR_BORDER,
        lineWidth: 0.2,
        fontStyle: "bold",
      },
      columnStyles: {
        0: { cellWidth: 45, textColor: COLOR_MID_TEXT, fontStyle: "bold" },
        1: { cellWidth: 40, halign: "right", fontStyle: "bold", textColor: COLOR_DARK_TEXT },
      },
      didParseCell: function (data) {
        if (data.row.index === 3) {
          data.cell.styles.fillColor = COLOR_ORANGE;
          data.cell.styles.textColor = [255, 255, 255];
          data.cell.styles.fontStyle = "bold";
          data.cell.styles.fontSize = 9.2;
        }
      },
      didDrawPage: () => drawPageBorder(),
    });

    cursorY = Math.max(cursorY + bankBoxHeight, doc.lastAutoTable.finalY) + 4;

    // ---------- TAX SUMMARY (full width) ----------
    doc.setFillColor(...COLOR_HEADER_BG);
    doc.rect(margin, cursorY, contentWidth, subBannerHeight, "F");
    doc.setDrawColor(...COLOR_BORDER);
    doc.rect(margin, cursorY, contentWidth, subBannerHeight, "S");
    doc.setFont(PDF_FONT, "bold");
    doc.setFontSize(8);
    doc.setTextColor(...COLOR_HEADER_TEXT);
    doc.text("TAX SUMMARY", margin + 3, cursorY + 4.5);

    autoTable(doc, {
      startY: cursorY + subBannerHeight,
      margin: { left: margin, right: margin },
      tableWidth: contentWidth,
      head: [["Taxable", "CGST", "SGST", "Total Tax"]],
      body: [[money(subtotal), money(cgstTotal), money(sgstTotal), money(taxTotal)]],
      theme: "grid",
      styles: {
        font: PDF_FONT,
        fontSize: 7.5,
        cellPadding: 2,
        lineColor: COLOR_BORDER,
        lineWidth: 0.2,
        textColor: COLOR_DARK_TEXT,
        fontStyle: "bold",
        halign: "center",
      },
      headStyles: {
        fillColor: COLOR_ICE_BLUE,
        textColor: COLOR_NAVY_TEXT,
        fontStyle: "bold",
      },
      didDrawPage: () => drawPageBorder(),
    });

    // ---------- FOOTER: Declaration + Terms (left) | Signature (right) ----------
    doc.setDrawColor(...COLOR_BORDER);
    doc.setLineWidth(0.3);
    doc.line(margin, footerTop, pageWidth - margin, footerTop);
    doc.line(
      margin + footerLeftWidth,
      footerTop,
      margin + footerLeftWidth,
      footerTop + footerHeight
    );

    // Declaration
    let fy = footerTop + 5;
    doc.setFont(PDF_FONT, "bold");
    doc.setFontSize(8);
    doc.setTextColor(...COLOR_NAVY_TEXT);
    doc.text("Declaration", margin + 4, fy);
    fy += 4;

    doc.setFont(PDF_FONT, "bold");
    doc.setFontSize(7);
    doc.setTextColor(...COLOR_MID_TEXT);
    doc.text(declarationLines, margin + 4, fy, { lineHeightFactor: 1.35 });
    fy += declarationLines.length * footerLineH + 3;

    // Terms & Conditions
    doc.setFont(PDF_FONT, "bold");
    doc.setFontSize(8);
    doc.setTextColor(...COLOR_NAVY_TEXT);
    doc.text("Terms & Conditions", margin + 4, fy);
    fy += 4;

    doc.setFont(PDF_FONT, "bold");
    doc.setFontSize(6.8);
    doc.setTextColor(...COLOR_MID_TEXT);
    doc.text(termsLines, margin + 4, fy, { lineHeightFactor: 1.35 });

    // Signature (right panel)
    const sigCenterX = margin + footerLeftWidth + (contentWidth - footerLeftWidth) / 2;
    doc.setFont(PDF_FONT, "bold");
    doc.setFontSize(8);
    doc.setTextColor(...COLOR_DARK_TEXT);
    doc.text(`For ${COMPANY.name}`, sigCenterX, footerTop + 6, {
      align: "center",
      maxWidth: contentWidth - footerLeftWidth - 4,
    });

    const sigLineY = footerTop + footerHeight - 10;
    doc.setDrawColor(120, 120, 120);
    doc.setLineWidth(0.3);
    doc.line(sigCenterX - 20, sigLineY, sigCenterX + 20, sigLineY);
    doc.setFont(PDF_FONT, "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(...COLOR_MID_TEXT);
    doc.text("Authorised Signatory", sigCenterX, sigLineY + 4.5, { align: "center" });

    // ---------- THANK YOU STRIP ----------
    const thankY = pageHeight - margin - thankYouHeight;
    doc.setFillColor(...COLOR_ICE_BLUE);
    doc.rect(margin, thankY, contentWidth, thankYouHeight, "F");
    doc.setDrawColor(...COLOR_BORDER);
    doc.setLineWidth(0.3);
    doc.line(margin, thankY, pageWidth - margin, thankY);

    doc.setFont(PDF_FONT, "bold");
    doc.setFontSize(7);
    doc.setTextColor(...COLOR_NAVY_TEXT);
    doc.text(
      "Computer-generated tax invoice — Thank you for your business!",
      pageWidth / 2,
      thankY + 5,
      { align: "center" }
    );

    // ---------- OUTPUT ----------
    const isMobile =
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
      window.innerWidth < 768;

    if (isMobile) {
      doc.save(`${toSafeFileName(invoiceNumber)}.pdf`);
    } else {
      const blob = doc.output("blob");
      window.open(URL.createObjectURL(blob), "_blank");
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

    const validationPayload = {
      customerDetails: {
        name: selectedCustomer.name,
        phone: selectedCustomer.phone,
        email: selectedCustomer.email,
        address: selectedCustomer.address,
        gstin: selectedCustomer.gstin,
      },
      items: cart.map((i) => ({ productId: i.productId, qty: i.qty })),
      paymentMethod,
    };

    const result = checkoutSchema.safeParse(validationPayload);

    if (!result.success) {
      const errors = mapIssues(result.error);
      setFieldErrors(errors);
      toast.error(Object.values(errors)[0] || "Please fix the highlighted fields.");
      return;
    }

    setFieldErrors({});

    try {
      setGenerating(true);

      const payload = {
        customerId: selectedCustomer._id || null,
        customerDetails: result.data.customerDetails,
        items: result.data.items,
        paymentMethod: result.data.paymentMethod,
      };

      const res = await api.post("/invoices", payload);

      // Backend ka number (INV-0012 etc.) -> BR/2026-27/012 format me
      const invoiceNumber = formatInvoiceNumber(
        res.data?.invoiceNumber || res.data?.invoice?.invoiceNumber || ""
      );

      if (!invoiceNumber) {
        toast.warn("Bill save ho gaya, par invoice number backend se nahi mila.");
      }

      try {
        await generateInvoicePDF(invoiceNumber || "N/A");
      } catch (pdfError) {
        console.error("PDF error:", pdfError);
        toast.error("PDF nahi ban payi — public/fonts me NotoSans fonts check karo.");
      }

      toast.success(
        invoiceNumber
          ? `Bill generated successfully: ${invoiceNumber}`
          : "Bill generated successfully."
      );

      setCart([]);
      clearCustomer();
    } catch (error) {
      console.error("Invoice error:", error.response?.data || error.message);
      toast.error(error.response?.data?.message || "Bill generate nahi ho paya.");
    } finally {
      setGenerating(false);
    }
  };

  // =========================================================
  // SMALL UI PIECES
  // =========================================================
  const renderQty = (item) => (
    <div
      onClick={(e) => e.stopPropagation()}
      className="inline-flex h-9 items-center gap-0.5 rounded-xl bg-slate-100 px-1"
    >
      <button
        type="button"
        onClick={() => updateQty(item.productId, item.qty - 1)}
        className="flex h-7 w-7 items-center justify-center rounded-lg bg-white text-sm font-bold text-slate-700 shadow-xs transition hover:bg-slate-200 active:scale-90 cursor-pointer"
      >
        −
      </button>
      <input
        type="number"
        min="1"
        value={item.qty}
        onChange={(e) => updateQty(item.productId, e.target.value)}
        className="w-10 bg-transparent text-center font-mono text-sm font-bold text-slate-800 outline-none"
      />
      <button
        type="button"
        onClick={() => updateQty(item.productId, item.qty + 1)}
        className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600 text-sm font-bold text-white shadow-xs transition hover:bg-indigo-700 active:scale-90 cursor-pointer"
      >
        +
      </button>
    </div>
  );

  const renderActions = (item) => (
    <div className="flex items-center justify-end gap-1.5">
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          openEdit(item);
        }}
        className="inline-flex items-center gap-1 rounded-lg border border-amber-200 bg-amber-50 px-2.5 py-1.5 text-xs font-bold text-amber-700 transition hover:bg-amber-100 active:scale-95 cursor-pointer"
        title="Edit item"
      >
        <span>✏️</span>
        <span>Edit</span>
      </button>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          deleteItem(item);
        }}
        className="inline-flex items-center gap-1 rounded-lg border border-rose-200 bg-rose-50 px-2.5 py-1.5 text-xs font-bold text-rose-600 transition hover:bg-rose-100 active:scale-95 cursor-pointer"
        title="Delete item"
      >
        <span>🗑️</span>
        <span>Delete</span>
      </button>
    </div>
  );

  const hasCustomerData =
    selectedCustomer._id ||
    selectedCustomer.name ||
    selectedCustomer.phone ||
    selectedCustomer.email ||
    selectedCustomer.address ||
    selectedCustomer.gstin;

  const canSaveCustomer = !selectedCustomer._id && (selectedCustomer.name || selectedCustomer.phone);

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

        {/* TOP HEADER */}
        <header className="flex flex-col gap-3 rounded-2xl border border-slate-200/90 bg-white p-4 shadow-xs sm:flex-row sm:items-center sm:justify-between sm:p-6">
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
              Customer, product aur bill — sab ek hi jagah.
            </p>
          </div>

          <div className="flex items-center justify-between gap-4 rounded-xl border border-indigo-100 bg-indigo-50/40 px-4 py-2.5 sm:min-w-[220px] sm:px-5 sm:py-3">
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

        {/* STEP 1: CUSTOMER */}
        <section className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-xs sm:p-6">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <div className="flex items-center gap-3">
              <div>
                <h2 className="text-sm font-bold text-slate-900 sm:text-base">Customer Details</h2>
                <p className="text-xs text-slate-400">
                  Search for existing customers or add new ones; leave blank or mark as walk-in.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {canSaveCustomer && (
                <button
                  type="button"
                  onClick={handleSaveCustomer}
                  disabled={savingCustomer}
                  className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-emerald-700 active:scale-95 disabled:opacity-50 cursor-pointer"
                >
                  {savingCustomer ? "Saving..." : "+ Save Customer"}
                </button>
              )}
              {hasCustomerData && (
                <button
                  type="button"
                  onClick={clearCustomer}
                  className="rounded-lg border border-red-200 bg-red-50/60 px-3 py-1.5 text-xs font-bold text-red-600 transition hover:bg-red-500 hover:text-white active:scale-95 cursor-pointer"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          <div className="relative mb-4">
            <input
              value={customerSearch}
              onChange={(e) => setCustomerSearch(e.target.value)}
              placeholder="Search customer by name, mobile, email or GSTIN..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm font-medium text-slate-800 outline-none transition-all placeholder:text-slate-400 hover:border-slate-300 focus:border-indigo-600 focus:bg-white focus:ring-4 focus:ring-indigo-600/10 sm:py-3"
            />

            {customerSearch && (
              <div className="absolute left-0 right-0 top-full z-40 mt-1.5 max-h-64 overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-xl">
                {filteredCustomers.length === 0 ? (
                  <p className="px-4 py-3 text-xs text-slate-400">
                    Customer nahi mila — neeche details bharke &quot;Save Customer&quot; dabao.
                  </p>
                ) : (
                  filteredCustomers.map((customer) => (
                    <button
                      type="button"
                      key={customer._id}
                      onClick={() => selectCustomer(customer)}
                      className="flex w-full items-center justify-between gap-3 border-b border-slate-100 px-4 py-3 text-left transition-colors last:border-0 hover:bg-indigo-50/80 cursor-pointer"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold text-slate-900">{customer.name}</p>
                        <p className="mt-0.5 truncate text-xs text-slate-400">
                          {customer.phone || "No phone"}
                          {customer.email ? ` · ${customer.email}` : ""}
                          {customer.gstin || customer.gst ? ` · GSTIN: ${customer.gstin || customer.gst}` : ""}
                        </p>
                      </div>
                      <span className="shrink-0 rounded-lg bg-indigo-50 px-2.5 py-1 text-xs font-bold text-indigo-700">
                        Apply
                      </span>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>

          <div className="grid sm:grid-cols-1 gap-3 lg:grid-cols-2 xl:grid-cols-5">
            <TextInput
              label="Enter your Customer Name."
              value={selectedCustomer.name}
              onChange={(e) => updateCustomerField("name", e.target.value)}
              placeholder="Enter your Customer Name."
              error={fieldErrors.name}
            />
            <TextInput
              label="Phone Number"
              value={selectedCustomer.phone}
              onChange={(e) => updateCustomerField("phone", e.target.value)}
              placeholder="Enter your Phone Number."
              mono
              inputMode="numeric"
              error={fieldErrors.phone}
            />
            <TextInput
              label="Email Address"
              value={selectedCustomer.email}
              onChange={(e) => updateCustomerField("email", e.target.value)}
              placeholder="Enter your Customer Email."
              error={fieldErrors.email}
            />
            <TextInput
              label="Address / City"
              value={selectedCustomer.address}
              onChange={(e) => updateCustomerField("address", e.target.value)}
              placeholder="Enter address or city..."
              error={fieldErrors.address}
            />
            {/* <TextInput
              label="Buyer GSTIN"
              value={selectedCustomer.gstin}
              onChange={(e) => updateCustomerField("gstin", e.target.value.toUpperCase())}
              placeholder="08AAACR5055K1Z8"
              mono
              uppercase
              error={fieldErrors.gstin}
            /> */}
          </div>
        </section>

        {/* WORKSPACE */}
        <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-[minmax(0,1fr)_370px] lg:gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">

          {/* LEFT */}
          <main className="min-w-0 space-y-4 sm:space-y-6">

            {/* STEP 2: PRODUCT ADD */}
            <section className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-xs sm:p-6">
              <div className="mb-4 flex items-center gap-3 border-b border-slate-100 pb-3">

                <div>
                  <h2 className="text-sm font-bold text-slate-900 sm:text-base">Add Electronic Product</h2>
                  <p className="text-xs text-slate-400">
                    Product add karte hi neeche bill table me apne-aap aa jayega.
                  </p>
                </div>
              </div>

              {/* Saved product search */}
              <div className="relative mb-4">
                <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm">
                  🔍
                </span>
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Saved product search karo (naam ya SKU)..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/60 py-2.5 pl-10 pr-4 text-xs font-medium text-slate-900 outline-none transition-all placeholder:text-slate-400 hover:border-slate-300 focus:border-indigo-600 focus:bg-white focus:ring-4 focus:ring-indigo-600/10 sm:text-sm"
                />

                {search.trim() && (
                  <div className="absolute left-0 right-0 top-full z-40 mt-1.5 max-h-64 overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-xl">
                    {filteredProducts.length === 0 ? (
                      <p className="px-4 py-3 text-xs text-slate-400">
                        Didn&apos;t find the product? Add a new one using the form below.
                      </p>
                    ) : (
                      filteredProducts.map((product) => (
                        <button
                          type="button"
                          key={product._id}
                          onClick={() => addExistingProduct(product)}
                          className="flex w-full items-center justify-between gap-3 border-b border-slate-100 px-4 py-3 text-left transition-colors last:border-0 hover:bg-indigo-50/80 cursor-pointer"
                        >
                          <div className="min-w-0">
                            <p className="truncate text-sm font-bold text-slate-900">{product.name}</p>
                            <p className="mt-0.5 truncate font-mono text-xs text-slate-400">
                              SKU: {product.sku || "-"} · GST {product.taxRate || 0}%
                            </p>
                          </div>
                          <div className="flex shrink-0 items-center gap-2">
                            <span className="text-sm font-extrabold text-indigo-600">
                              {money(product.price)}
                            </span>
                            <span className="rounded-lg bg-indigo-600 px-2.5 py-1 text-xs font-bold text-white">
                              + Add
                            </span>
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>

              {/* New product form — 3 clean rows */}
              <form onSubmit={handleAddProduct} noValidate className="space-y-4">
                {/* Row 1: Name (full width) */}
                <TextInput
                  label="Product Name"
                  value={productForm.name}
                  onChange={(e) => handleProductFormChange("name", e.target.value)}
                  placeholder="e.g. Voltas 1.5 Ton AC"
                  required
                  error={productErrors.name}
                />

                {/* Row 2: SKU, HSN, Price, GST */}
                <div className="grid sm:grid-cols-2 gap-4 xl:grid-cols-4">
                  {/* <TextInput
                    label="SKU / Model"
                    value={productForm.sku}
                    onChange={(e) => handleProductFormChange("sku", e.target.value)}
                    placeholder="Auto if empty"
                    mono
                    error={productErrors.sku}
                  /> */}
                  <TextInput
                    label="SKU/HSN Code"
                    value={productForm.hsn}
                    onChange={(e) => handleProductFormChange("hsn", e.target.value)}
                    placeholder="e.g. 8415"
                    mono
                    error={productErrors.hsn}
                  />
                  <TextInput
                    label="Price (₹)"
                    type="number"
                    min="0"
                    inputMode="decimal"
                    value={productForm.price}
                    onChange={(e) => handleProductFormChange("price", e.target.value)}
                    placeholder="0.00"
                    mono
                    required
                    error={productErrors.price}
                  />
                  <GstSelect
                    value={productForm.taxRate}
                    onChange={(e) => handleProductFormChange("taxRate", e.target.value)}
                    error={productErrors.taxRate}
                  />
                </div>

                {/* Row 3: Qty + Add button */}
                <div className="flex items-end gap-3">
                  <div className="w-28 shrink-0">
                    <TextInput
                      label="Qty"
                      type="number"
                      min="1"
                      inputMode="numeric"
                      value={productForm.qty}
                      onChange={(e) => handleProductFormChange("qty", e.target.value)}
                      mono
                      error={productErrors.qty}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={addingProduct}
                    className="inline-flex h-[42px] flex-1 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 text-sm font-bold text-white shadow-xs transition-all hover:bg-indigo-700 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
                  >
                    {addingProduct ? (
                      <>
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                        <span>Adding...</span>
                      </>
                    ) : (
                      <span>+ Add to Bill</span>
                    )}
                  </button>
                </div>
              </form>
            </section>

            {/* STEP 3: ITEMS TABLE */}
            <section className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-xs">
              <div className="flex items-center justify-between gap-3 border-b border-slate-200/80 bg-slate-50/50 px-4 py-3.5 sm:px-5">
                <div className="flex items-center gap-3">
                  {/* <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-sm font-black text-white">
                    3
                  </span> */}
                  <div>
                    <h2 className="text-sm font-bold text-slate-900 sm:text-base">Invoice Items</h2>
                    <p className="text-xs text-slate-400">
                      Row click on Edit / Delete Show.
                    </p>
                  </div>
                </div>
                <span className="shrink-0 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-0.5 text-xs font-bold text-indigo-700">
                  {cart.length} item{cart.length !== 1 ? "s" : ""}
                </span>
              </div>

              {cart.length === 0 ? (
                <div className="py-14 text-center">
                  <div className="text-3xl">🧾</div>
                  <p className="mt-2 text-sm font-semibold text-slate-600">
                    Abhi koi item nahi hai
                  </p>
                  <p className="text-xs text-slate-400">
                    Upar se product add karo ya saved product search karo.
                  </p>
                </div>
              ) : (
                <>
                  {/* TABLET / DESKTOP TABLE */}
                  <div className="hidden overflow-x-auto md:block">
                    <table className="w-full min-w-[560px] border-collapse text-left text-sm">
                      <thead>
                        <tr className="border-b border-slate-200 bg-slate-100/70 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                          <th className="w-10 px-3 py-3 text-center">#</th>
                          <th className="px-3 py-3">Product</th>
                          <th className="px-3 py-3 text-center">Qty</th>
                          <th className="px-3 py-3 text-right">Total</th>
                          <th className="px-3 py-3 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-medium">
                        {cart.map((item, index) => {
                          const taxable = item.price * item.qty;
                          const tax = (taxable * item.taxRate) / 100;
                          return (
                            <tr
                              key={item.productId}
                              onClick={() => openEdit(item)}
                              className="cursor-pointer transition-colors hover:bg-indigo-50/50"
                              title="Click to edit"
                            >
                              <td className="px-3 py-3 text-center font-mono text-xs text-slate-400">
                                {index + 1}
                              </td>
                              <td className="max-w-[220px] px-3 py-3">
                                <p className="truncate font-bold text-slate-800">{item.name}</p>
                                <p className="mt-0.5 text-[11px] font-semibold text-slate-500">
                                  {money(item.price)}
                                  <span className="mx-1 text-slate-300">|</span>
                                  <span className="text-amber-600">GST {item.taxRate}%</span>
                                </p>
                                <p className="truncate font-mono text-[10px] text-slate-400">
                                  {item.hsn ? `HSN: ${item.hsn} · ` : ""}SKU: {item.sku}
                                </p>
                              </td>
                              <td className="px-3 py-3 text-center">{renderQty(item)}</td>
                              <td className="whitespace-nowrap px-3 py-3 text-right">
                                <p className="font-black text-slate-900">{money(taxable + tax)}</p>
                                <p className="text-[10px] text-slate-400">incl. tax {money(tax)}</p>
                              </td>
                              <td className="px-3 py-3">{renderActions(item)}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                      <tfoot>
                        <tr className="border-t-2 border-slate-200 bg-slate-50">
                          <td colSpan={3} className="px-3 py-3 text-right text-xs font-bold uppercase tracking-wider text-slate-500">
                            Grand Total ({totalItems} Pcs)
                          </td>
                          <td className="whitespace-nowrap px-3 py-3 text-right text-base font-black text-indigo-700">
                            {money(grandTotal)}
                          </td>
                          <td />
                        </tr>
                      </tfoot>
                    </table>
                  </div>

                  {/* MOBILE CARDS */}
                  <div className="space-y-3 p-3 md:hidden">
                    {cart.map((item, index) => {
                      const taxable = item.price * item.qty;
                      const tax = (taxable * item.taxRate) / 100;
                      return (
                        <div
                          key={item.productId}
                          onClick={() => openEdit(item)}
                          className="cursor-pointer rounded-xl border border-slate-200 bg-white p-3 shadow-xs transition active:bg-indigo-50/50"
                        >
                          <div className="min-w-0">
                            <p className="text-[10px] font-bold text-slate-400">#{index + 1}</p>
                            <p className="truncate text-sm font-bold text-slate-900">{item.name}</p>
                            <p className="mt-0.5 text-[11px] font-semibold text-slate-500">
                              {money(item.price)} <span className="text-slate-300">|</span>{" "}
                              <span className="text-amber-600">GST {item.taxRate}%</span>
                            </p>
                            <p className="truncate font-mono text-[10px] text-slate-400">
                              {item.hsn ? `HSN: ${item.hsn} · ` : ""}SKU: {item.sku}
                            </p>
                          </div>

                          <div className="mt-3 flex items-center justify-between gap-2 border-t border-slate-100 pt-3">
                            {renderQty(item)}
                            <div className="text-right">
                              <p className="text-base font-black text-slate-900">{money(taxable + tax)}</p>
                              <p className="text-[10px] text-slate-400">incl. tax {money(tax)}</p>
                            </div>
                          </div>

                          <div className="mt-3 border-t border-slate-100 pt-3">{renderActions(item)}</div>
                        </div>
                      );
                    })}

                    <div className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                        Grand Total ({totalItems} Pcs)
                      </span>
                      <span className="text-base font-black text-indigo-700">{money(grandTotal)}</span>
                    </div>
                  </div>
                </>
              )}
            </section>
          </main>

          {/* RIGHT: SUMMARY */}
          <aside className="w-full lg:sticky lg:top-6 lg:self-start">
            <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-xs">
              <div className="flex items-center justify-between border-b border-slate-200/80 px-5 py-4">
                <div>
                  <h2 className="text-base font-extrabold text-slate-900">Bill Summary</h2>
                  <p className="text-xs text-slate-400">Payment details & breakdown.</p>
                </div>
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-base">
                  💳
                </span>
              </div>

              <div className="space-y-4 p-4 sm:p-5">
                <div className="rounded-xl border border-slate-200/80 bg-slate-50/70 p-3">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Billed To
                  </p>
                  <p className="mt-0.5 truncate text-sm font-bold text-slate-800">
                    {selectedCustomer.name || "Walk-in Customer"}
                  </p>
                  {selectedCustomer.phone && (
                    <p className="mt-0.5 font-mono text-xs text-slate-500">
                      Phone: {selectedCustomer.phone}
                    </p>
                  )}
                  {selectedCustomer.gstin && (
                    <p className="mt-0.5 font-mono text-xs font-bold uppercase text-indigo-700">
                      GSTIN: {selectedCustomer.gstin}
                    </p>
                  )}
                </div>

                <div className="space-y-2.5 text-xs sm:text-sm">
                  <div className="flex items-center justify-between font-medium text-slate-500">
                    <span>Total Quantity</span>
                    <span className="font-bold text-slate-800">{totalItems} Pcs</span>
                  </div>
                  <div className="flex items-center justify-between font-medium text-slate-500">
                    <span>Taxable Base</span>
                    <span className="font-semibold text-slate-800">{money(subtotal)}</span>
                  </div>
                  <div className="flex items-center justify-between font-medium text-slate-500">
                    <span>CGST</span>
                    <span className="font-semibold text-amber-600">{money(cgstTotal)}</span>
                  </div>
                  <div className="flex items-center justify-between font-medium text-slate-500">
                    <span>SGST</span>
                    <span className="font-semibold text-amber-600">{money(sgstTotal)}</span>
                  </div>
                </div>

                <div className="rounded-xl bg-[#0e1726] p-4 text-white shadow-inner">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Total Amount Due
                      </p>
                      <p className="mt-1 text-2xl font-black text-white sm:text-3xl">
                        ₹{grandTotal.toFixed(2)}
                      </p>
                    </div>
                    <span className="rounded-full border border-emerald-500/30 bg-emerald-500/20 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                      INR
                    </span>
                  </div>
                </div>

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
                          className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border py-2.5 transition-all ${active
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

                <button
                  type="button"
                  onClick={checkout}
                  disabled={cart.length === 0 || generating}
                  className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3.5 text-sm font-bold text-white shadow-sm transition-all hover:bg-indigo-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
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
                  Mobile par PDF download hogi, Desktop par preview open hoga.
                </p>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* EDIT ITEM MODAL */}
      {editItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-3 backdrop-blur-sm sm:p-4">
          <div className="fixed inset-0 cursor-pointer" onClick={() => setEditItem(null)} />

          <div className="relative z-10 flex max-h-[92vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-2xl sm:rounded-3xl">
            <div className="relative bg-gradient-to-r from-slate-900 to-[#101B3D] p-5 text-white sm:p-6">
              <button
                type="button"
                onClick={() => setEditItem(null)}
                className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-xl bg-white/10 text-slate-300 transition hover:bg-white/20 hover:text-white cursor-pointer"
                title="Close (Esc)"
              >
                ✕
              </button>
              <div className="flex items-center gap-3 pr-10">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-amber-400/30 bg-amber-500/20 text-lg">
                  ✏️
                </div>
                <div className="min-w-0">
                  <h3 className="text-base font-bold sm:text-lg">Edit Item</h3>
                  <p className="truncate text-xs text-slate-300">
                    Changes product me bhi save honge.
                  </p>
                </div>
              </div>
            </div>

            <form onSubmit={saveEdit} noValidate className="space-y-4 overflow-y-auto p-5 sm:p-6">
              <TextInput
                label="Product Name"
                placeholder="Enter your Product Name."
                value={editItem.name}
                onChange={(e) => handleEditChange("name", e.target.value)}
                required
                error={editErrors.name}
              />

              <div className="grid grid-cols-2 gap-3">
                {/* <TextInput
                  label="SKU / Model"
                  value={editItem.sku}
                  onChange={(e) => handleEditChange("sku", e.target.value)}
                  mono
                  error={editErrors.sku}
                /> */}
                <TextInput
                  label="SKU/HSN Code"
                  placeholder="e.g. 8490"
                  value={editItem.hsn}
                  onChange={(e) => handleEditChange("hsn", e.target.value)}
                  mono
                  error={editErrors.hsn}
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <TextInput
                  label="Price (₹)"
                  type="number"
                  placeholder="0.00"
                  min="0"
                  inputMode="decimal"
                  value={editItem.price}
                  onChange={(e) => handleEditChange("price", e.target.value)}
                  mono
                  required
                  error={editErrors.price}
                />
                <GstSelect
                  value={editItem.taxRate}
                  onChange={(e) => handleEditChange("taxRate", e.target.value)}
                  error={editErrors.taxRate}
                />
                <TextInput
                  label="Qty"
                  type="number"
                  placeholder="1"
                  min="1"
                  inputMode="numeric"
                  value={editItem.qty}
                  onChange={(e) => handleEditChange("qty", e.target.value)}
                  mono
                  error={editErrors.qty}
                />
              </div>

              <div className="flex flex-col-reverse gap-2.5 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
                <button
                  type="button"
                  onClick={() => {
                    const target = cart.find((i) => i.productId === editItem.productId);
                    if (target) deleteItem(target);
                    setEditItem(null);
                  }}
                  className="rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-bold text-red-600 transition hover:bg-red-100 cursor-pointer"
                >
                  Delete from Bill
                </button>

                <div className="flex gap-2.5">
                  <button
                    type="button"
                    onClick={() => setEditItem(null)}
                    className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-100 cursor-pointer sm:flex-none"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={savingEdit}
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white shadow-xs transition hover:bg-indigo-700 active:scale-95 disabled:opacity-50 cursor-pointer sm:flex-none"
                  >
                    {savingEdit ? (
                      <>
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <span>Save Changes</span>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

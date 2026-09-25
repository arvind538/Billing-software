"use client";

import { useEffect, useMemo, useState } from "react";
import api from "@/lib/api";
import { toast } from "react-toastify";

const initialForm = {
  name: "",
  sku: "",
  price: "",
  stock: "",
  taxRate: "18", // 18% GST (9% CGST + 9% SGST)
  category: "Electronics",
};

/* =========================================================
   ICON COMPONENT
========================================================= */
function Icon({ name, size = 18 }) {
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
    package: (
      <>
        <path d="m21 8-9 5-9-5 9-5 9 5Z" />
        <path d="M3 8v8l9 5 9-5V8" />
        <path d="M12 13v8" />
      </>
    ),
    search: (
      <>
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-4-4" />
      </>
    ),
    plus: (
      <>
        <path d="M12 5v14" />
        <path d="M5 12h14" />
      </>
    ),
    edit: (
      <>
        <path d="M12 20h9" />
        <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4Z" />
      </>
    ),
    trash: (
      <>
        <path d="M3 6h18" />
        <path d="M8 6V4h8v2" />
        <path d="M19 6l-1 15H6L5 6" />
        <path d="M10 11v6" />
        <path d="M14 11v6" />
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
    warning: (
      <>
        <path d="M10.3 3.6 2.5 17a2 2 0 0 0 1.7 3h15.6a2 2 0 0 0 1.7-3L13.7 3.6a2 2 0 0 0-3.4 0Z" />
        <path d="M12 9v4" />
        <path d="M12 17h.01" />
      </>
    ),
    chart: (
      <>
        <path d="M3 3v18h18" />
        <path d="m7 16 4-5 3 3 5-7" />
      </>
    ),
    tag: (
      <>
        <path d="m20.6 13.2-7.4 7.4a2 2 0 0 1-2.8 0L3.4 13.6a2 2 0 0 1-.6-1.4V5a2 2 0 0 1 2-2h7.2a2 2 0 0 1 1.4.6l7.2 7.2a2 2 0 0 1 0 2.4Z" />
        <circle cx="7.5" cy="7.5" r="1" />
      </>
    ),
    close: (
      <>
        <path d="m6 6 12 12" />
        <path d="M18 6 6 18" />
      </>
    ),
    check: (
      <>
        <path d="m5 12 4 4L19 6" />
      </>
    ),
    rupee: (
      <>
        <path d="M6 5h12" />
        <path d="M6 9h12" />
        <path d="M8 5c3 0 5 2 5 4s-2 4-5 4h-.5L14 19" />
      </>
    ),
  };

  return <svg {...common}>{icons[name]}</svg>;
}

/* =========================================================
   INPUT COMPONENT
========================================================= */
function FormInput({
  label,
  name,
  value,
  onChange,
  placeholder,
  type = "text",
  icon,
  required = false,
  min,
  max,
  step,
}) {
  return (
    <div className="w-full">
      <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-slate-600 sm:text-xs">
        {label}
        {required && <span className="text-red-500"> *</span>}
      </label>

      <div className="relative">
        {icon && (
          <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
            <Icon name={icon} size={15} />
          </span>
        )}

        <input
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          type={type}
          min={min}
          max={max}
          step={step}
          required={required}
          className={`w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 text-xs sm:text-sm font-semibold text-slate-800 outline-none transition-all placeholder:text-slate-400 placeholder:font-normal hover:border-slate-300 focus:border-indigo-600 focus:bg-white focus:ring-4 focus:ring-indigo-600/10 ${icon ? "pl-9 sm:pl-10" : "px-3.5"
            } pr-3.5`}
        />
      </div>
    </div>
  );
}

/* =========================================================
   KPI STAT CARD
========================================================= */
function KpiCard({ title, value, subtitle, icon, accent, danger = false }) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-4 sm:p-5 shadow-xs transition-all duration-300 hover:-translate-y-0.5 hover:border-indigo-300 hover:shadow-md">
      <div
        className="absolute -right-6 -top-6 h-20 w-20 rounded-full opacity-10 transition duration-300 group-hover:scale-125 pointer-events-none"
        style={{ background: accent }}
      />
      <div className="relative flex items-center justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            {title}
          </p>
          <p
            className="mt-1 text-xl font-extrabold sm:text-2xl"
            style={{ color: danger ? "#B42318" : "#0F172A" }}
          >
            {value}
          </p>
          <p className="mt-0.5 text-xs text-slate-400 font-medium">{subtitle}</p>
        </div>

        <div
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110"
          style={{ background: `${accent}15`, color: accent }}
        >
          <Icon name={icon} size={20} />
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   MAIN COMPONENT
========================================================= */
export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchProducts = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      const res = await api.get("/products");
      setProducts(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      toast.error(err.response?.data?.message || "Products load nahi ho paye.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      if (editingId) {
        await api.put(`/products/${editingId}`, form);
        toast.success("Electronic product updated successfully.");
      } else {
        await api.post("/products", form);
        toast.success("Electronic product added successfully.");
      }
      setForm(initialForm);
      setEditingId(null);
      await fetchProducts();
    } catch (err) {
      toast.error(err.response?.data?.message || "Product save failed.");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (product) => {
    setForm({
      name: product.name || "",
      sku: product.sku || "",
      price: product.price ?? "",
      stock: product.stock ?? "",
      taxRate: product.taxRate ?? "18",
      category: product.category || "Electronics",
    });
    setEditingId(product._id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const cancelEdit = () => {
    setForm(initialForm);
    setEditingId(null);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this electronic product?"))
      return;
    try {
      await api.delete(`/products/${id}`);
      toast.success("Product deleted successfully.");
      await fetchProducts();
    } catch (err) {
      toast.error(err.response?.data?.message || "Product delete failed.");
    }
  };

  const filteredProducts = useMemo(() => {
    const value = search.toLowerCase().trim();
    if (!value) return products;
    return products.filter(
      (product) =>
        product.name?.toLowerCase().includes(value) ||
        product.sku?.toLowerCase().includes(value) ||
        product.category?.toLowerCase().includes(value)
    );
  }, [products, search]);

  const totalProducts = products.length;
  const totalStock = products.reduce((sum, p) => sum + Number(p.stock || 0), 0);
  const lowStockProducts = products.filter(
    (p) => Number(p.stock || 0) <= 3
  ).length;
  const categories = new Set(
    products.map((p) => p.category).filter(Boolean)
  ).size;

  return (
    <div className="min-h-screen bg-slate-50/70 p-3 sm:p-5 lg:p-6 xl:p-8">
      <div className="mx-auto max-w-[1650px] space-y-4 sm:space-y-6">

        {/* HEADER BAR */}
        <header className="flex flex-col gap-3 rounded-2xl border border-slate-200/90 bg-white p-4 shadow-xs transition-all sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500 ring-4 ring-emerald-50" />
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Balothia Refrejoreon Stock
              </span>
            </div>
            <h1 className="mt-1 text-xl font-extrabold tracking-tight text-slate-900 sm:text-2xl lg:text-3xl">
              Electronic Inventory
            </h1>
            <p className="mt-0.5 text-xs text-slate-500 sm:text-sm">
              Manage appliances (AC, Refrigerator, Coolers, Fans), HSN and tax slab.
            </p>
          </div>

          <button
            type="button"
            onClick={() => fetchProducts(true)}
            disabled={refreshing}
            className="inline-flex w-fit items-center gap-2 rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-2.5 text-xs sm:text-sm font-bold text-slate-700 shadow-2xs transition-all hover:bg-slate-100 active:scale-95 disabled:opacity-60 cursor-pointer"
          >
            <span className={refreshing ? "animate-spin" : ""}>
              <Icon name="refresh" size={16} />
            </span>
            <span>{refreshing ? "Syncing..." : "Sync Stock"}</span>
          </button>
        </header>

        {/* STATS OVERVIEW */}
        <section className="grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <KpiCard
            title="Appliance SKUs"
            value={totalProducts}
            subtitle="Active items"
            icon="package"
            accent="#0F172A"
          />
          <KpiCard
            title="Stock On-Hand"
            value={totalStock}
            subtitle="Units in warehouse"
            icon="chart"
            accent="#2563EB"
          />
          <KpiCard
            title="Categories"
            value={categories}
            subtitle="Product segments"
            icon="tag"
            accent="#10B981"
          />
          <KpiCard
            title="Low Stock"
            value={lowStockProducts}
            subtitle={lowStockProducts > 0 ? "Re-order needed" : "Inventory healthy"}
            icon="warning"
            accent="#EF4444"
            danger={lowStockProducts > 0}
          />
        </section>

        {/* PRODUCT ONBOARDING / UPDATE FORM */}
        <section
          className={`overflow-hidden rounded-2xl border bg-white shadow-xs transition-all ${editingId ? "border-indigo-300 ring-2 ring-indigo-50" : "border-slate-200/90"
            }`}
        >
          <div
            className={`flex flex-wrap items-center justify-between gap-3 border-b px-4 py-3.5 sm:px-6 ${editingId ? "border-indigo-100 bg-indigo-50/40" : "border-slate-100 bg-slate-50/40"
              }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`flex h-9 w-9 items-center justify-center rounded-xl ${editingId ? "bg-indigo-600 text-white" : "bg-indigo-50 text-indigo-700"
                  }`}
              >
                <Icon name={editingId ? "edit" : "plus"} size={17} />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900 sm:text-base">
                  {editingId ? "Update Product Details" : "Register Electronic Appliance"}
                </h2>
                <p className="text-[11px] text-slate-400 sm:text-xs">
                  Provide appliance pricing, category, and initial warehouse quantity.
                </p>
              </div>
            </div>

            {editingId && (
              <button
                type="button"
                onClick={cancelEdit}
                className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-red-50/60 px-3 py-1.5 text-xs font-bold text-red-600 transition-colors hover:bg-red-500 hover:text-white cursor-pointer active:scale-95"
              >
                <Icon name="close" size={13} />
                <span>Cancel Edit</span>
              </button>
            )}
          </div>

          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-2 sm:gap-4 sm:p-6 lg:grid-cols-3 xl:grid-cols-6"
          >
            <div className="sm:col-span-2 xl:col-span-2">
              <FormInput
                label="Product Name"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="e.g. Split AC 1.5 Ton 5 Star"
                icon="package"
                required
              />
            </div>

            <div className="sm:col-span-1 xl:col-span-1">
              <FormInput
                label="HSN / SKU"
                name="sku"
                value={form.sku}
                onChange={handleChange}
                placeholder="8415 / 8418"
                required
              />
            </div>

            <div className="sm:col-span-1 xl:col-span-1">
              <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-slate-600 sm:text-xs">
                Category
              </label>
              <select
                name="category"
                value={form.category}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2.5 text-xs sm:text-sm font-semibold text-slate-800 outline-none transition-all hover:border-slate-300 focus:border-indigo-600 focus:bg-white focus:ring-4 focus:ring-indigo-600/10 cursor-pointer"
              >
                <option value="Electronics">Electronics</option>
                <option value="Air Conditioner">Air Conditioner (AC)</option>
                <option value="Refrigerator">Refrigerator (Fridge)</option>
                <option value="Air Cooler">Air Cooler</option>
                <option value="Stand Fan">Ceiling / Stand Fan</option>
                <option value="Water Purifier">Water Purifier</option>
                <option value="Other Electronics">Other Appliances</option>
              </select>
            </div>

            <div className="sm:col-span-1 xl:col-span-1">
              <FormInput
                label="Price (₹)"
                name="price"
                value={form.price}
                onChange={handleChange}
                placeholder="35000.00"
                type="number"
                min="0"
                step="0.01"
                icon="rupee"
                required
              />
            </div>

            <div className="sm:col-span-1 xl:col-span-1">
              <FormInput
                label="Stock Qty"
                name="stock"
                value={form.stock}
                onChange={handleChange}
                placeholder="10"
                type="number"
                min="0"
                icon="chart"
                required
              />
            </div>

            <div className="sm:col-span-1 xl:col-span-1">
              <FormInput
                label="GST Tax (%)"
                name="taxRate"
                value={form.taxRate}
                onChange={handleChange}
                placeholder="18"
                type="number"
                min="0"
                max="100"
                step="1"
              />
            </div>

            <div className="flex items-end sm:col-span-2 lg:col-span-2 xl:col-span-5 pt-1">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-slate-900 px-6 py-2.5 text-xs sm:text-sm font-bold text-white shadow-xs transition-all hover:bg-indigo-600 active:scale-95 disabled:opacity-60 cursor-pointer"
              >
                {saving ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Icon name={editingId ? "check" : "plus"} size={16} />
                    <span>{editingId ? "Update Product" : "Save Product"}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </section>

        {/* SEARCH & INVENTORY CONTROLS */}
        <section className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900 sm:text-base">
              Inventory Catalog
            </h2>
            <p className="text-xs text-slate-400">
              Showing active appliances registered in database.
            </p>
          </div>

          <div className="relative w-full sm:w-80">
            <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
              <Icon name="search" size={16} />
            </span>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, SKU or category..."
              className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-4 text-xs sm:text-sm font-medium text-slate-800 outline-none transition-all placeholder:text-slate-400 hover:border-slate-300 focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/10"
            />
          </div>
        </section>

        {/* 1. DESKTOP VIEW: FULL TABLE (Hidden on Small Screens) */}
        <div className="hidden overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-xs md:block">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[950px] border-collapse text-left text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/75 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="px-4 py-3.5 text-center w-12">#</th>
                  <th className="px-4 py-3.5">Product Name</th>
                  <th className="px-4 py-3.5">HSN/SKU</th>
                  <th className="px-4 py-3.5">Category</th>
                  <th className="px-4 py-3.5 text-right">Rate (₹)</th>
                  <th className="px-4 py-3.5 text-center">Stock</th>
                  <th className="px-4 py-3.5 text-center">Tax Slab</th>
                  <th className="px-4 py-3.5 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {loading ? (
                  <tr>
                    <td colSpan="8" className="py-16 text-center text-slate-400">
                      <div className="flex flex-col items-center justify-center">
                        <span className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
                        <span className="mt-2 text-xs font-semibold">Loading appliances...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="py-16 text-center text-slate-400">
                      <div className="text-3xl">📦</div>
                      <p className="mt-2 text-sm font-bold text-slate-700">No products found</p>
                      <p className="mt-0.5 text-xs text-slate-400">Try modifying search or add an item.</p>
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((product, index) => {
                    const stock = Number(product.stock || 0);
                    const lowStock = stock <= 3;

                    return (
                      <tr
                        key={product._id}
                        className="transition-colors hover:bg-slate-50/70"
                      >
                        <td className="px-4 py-3.5 text-center text-xs font-mono text-slate-400">
                          {index + 1}
                        </td>
                        <td className="px-4 py-3.5 font-bold text-slate-900 max-w-[280px] truncate">
                          {product.name}
                        </td>
                        <td className="px-4 py-3.5">
                          <span className="rounded-md bg-slate-100 px-2 py-0.5 font-mono text-[11px] text-slate-700">
                            {product.sku || "—"}
                          </span>
                        </td>
                        <td className="px-4 py-3.5">
                          <span className="rounded-full bg-indigo-50 border border-indigo-100/60 px-2.5 py-0.5 text-[11px] font-bold text-indigo-700">
                            {product.category || "Electronics"}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-right font-extrabold text-slate-900">
                          ₹{Number(product.price || 0).toFixed(2)}
                        </td>
                        <td className="px-4 py-3.5 text-center">
                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold ${lowStock
                              ? "bg-red-50 text-red-600 border border-red-200/60"
                              : "bg-emerald-50 text-emerald-600 border border-emerald-200/60"
                              }`}
                          >
                            {stock} {lowStock ? "(Low)" : "Units"}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-center">
                          <span className="rounded-full bg-amber-50 border border-amber-200/60 px-2 py-0.5 text-[11px] font-bold text-amber-700">
                            {product.taxRate || 18}%
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleEdit(product)}
                              className="rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-bold text-slate-700 transition hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-600 cursor-pointer"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(product._id)}
                              className="rounded-lg border border-red-200 px-2.5 py-1 text-xs font-bold text-red-600 transition hover:bg-red-50 cursor-pointer"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* 2. MOBILE VIEW: RESPONSIVE CARDS (Active on screens < 768px) */}
        <div className="space-y-3 md:hidden">
          {loading ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-slate-400">
              <span className="mx-auto block h-6 w-6 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
              <p className="mt-2 text-xs font-semibold">Loading items...</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-400">
              <div className="text-3xl">📦</div>
              <p className="mt-2 text-sm font-bold text-slate-700">No items available</p>
            </div>
          ) : (
            filteredProducts.map((product) => {
              const stock = Number(product.stock || 0);
              const lowStock = stock <= 3;

              return (
                <div
                  key={product._id}
                  className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-xs transition-all space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="rounded-full bg-indigo-50 border border-indigo-100 px-2 py-0.5 text-[10px] font-bold text-indigo-700">
                        {product.category || "Electronics"}
                      </span>
                      <h3 className="mt-1.5 font-bold text-slate-900 text-sm">
                        {product.name}
                      </h3>
                      <p className="text-[11px] font-mono text-slate-400">
                        HSN/SKU: {product.sku || "—"}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-base font-black text-indigo-600">
                        ₹{Number(product.price || 0).toFixed(2)}
                      </p>
                      <span className="rounded-full bg-amber-50 px-2 py-0.2 text-[10px] font-bold text-amber-700">
                        {product.taxRate || 18}% GST
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t border-slate-100 pt-2.5 text-xs">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold ${lowStock
                        ? "bg-red-50 text-red-600 border border-red-200/50"
                        : "bg-emerald-50 text-emerald-600 border border-emerald-200/50"
                        }`}
                    >
                      {stock} units {lowStock ? "(Low Stock)" : ""}
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleEdit(product)}
                        className="rounded-lg border border-slate-200 px-3 py-1 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(product._id)}
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

      </div>
    </div>
  );
}
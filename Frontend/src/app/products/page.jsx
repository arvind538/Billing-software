
"use client";

import { useEffect, useMemo, useState } from "react";
import api from "@/lib/api";
import { toast } from "react-toastify";

const initialForm = {
  name: "",
  sku: "",
  price: "",
  stock: "",
  taxRate: "",
  category: "",
};

/* =========================================================
   ICON COMPONENT
========================================================= */

function Icon({ name, size = 20 }) {
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
    <div>
      <label
        className="mb-1.5 block text-xs font-bold"
        style={{ color: "#344054" }}
      >
        {label}
        {required && (
          <span style={{ color: "#F04438" }}> *</span>
        )}
      </label>

      <div className="relative">
        {icon && (
          <span
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2"
            style={{ color: "#98A2B3" }}
          >
            <Icon name={icon} size={16} />
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
          className={`w-full rounded-xl border bg-white py-2.5 ${icon ? "pl-9" : "px-3"
            } pr-3 text-sm outline-none transition placeholder:text-slate-400`}
          style={{
            borderColor: "#D0D5DD",
            color: "#101828",
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = "#7F56D9";
            e.currentTarget.style.boxShadow =
              "0 0 0 3px rgba(127,86,217,0.10)";
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = "#D0D5DD";
            e.currentTarget.style.boxShadow = "none";
          }}
        />
      </div>
    </div>
  );
}

/* =========================================================
   KPI CARD
========================================================= */

function KpiCard({
  title,
  value,
  subtitle,
  icon,
  accent,
  danger = false,
}) {
  return (
    <div
      className="group relative overflow-hidden rounded-2xl border bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg"
      style={{ borderColor: "#EAECF0" }}
    >
      <div
        className="absolute -right-8 -top-8 h-24 w-24 rounded-full opacity-10 transition duration-300 group-hover:scale-125"
        style={{ background: accent }}
      />

      <div className="relative">
        <div
          className="flex h-11 w-11 items-center justify-center rounded-xl"
          style={{
            background: `${accent}12`,
            color: accent,
          }}
        >
          <Icon name={icon} size={21} />
        </div>

        <p
          className="mt-4 text-[11px] font-bold uppercase tracking-wider"
          style={{ color: "#98A2B3" }}
        >
          {title}
        </p>

        <p
          className="mt-1 text-2xl font-bold"
          style={{
            color: danger ? "#B42318" : "#101828",
          }}
        >
          {value}
        </p>

        <p
          className="mt-1 text-xs"
          style={{ color: "#98A2B3" }}
        >
          {subtitle}
        </p>
      </div>
    </div>
  );
}

/* =========================================================
   MAIN PAGE
========================================================= */

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(initialForm);

  const [editingId, setEditingId] = useState(null);

  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  /* =======================================================
     FETCH PRODUCTS
  ======================================================= */

  const fetchProducts = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const res = await api.get("/products");

      setProducts(
        Array.isArray(res.data)
          ? res.data
          : []
      );
    } catch (err) {
      console.error(
        "Products loading error:",
        err.response?.data || err.message
      );

      toast.error(
        err.response?.data?.message ||
        "Products load nahi ho paye."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  /* =======================================================
     INPUT
  ======================================================= */

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  /* =======================================================
     SUBMIT
  ======================================================= */

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);

      if (editingId) {
        await api.put(
          `/products/${editingId}`,
          form
        );

        toast.success("Product updated successfully.");
      } else {
        await api.post(
          "/products",
          form
        );

        toast.success("Product added successfully.");
      }

      setForm(initialForm);
      setEditingId(null);

      await fetchProducts();
    } catch (err) {
      console.error(
        "Product save error:",
        err.response?.data || err.message
      );

      toast.error(
        err.response?.data?.message ||
        "Product save failed."
      );
    } finally {
      setSaving(false);
    }
  };

  /* =======================================================
     EDIT
  ======================================================= */

  const handleEdit = (product) => {
    setForm({
      name: product.name || "",
      sku: product.sku || "",
      price: product.price ?? "",
      stock: product.stock ?? "",
      taxRate: product.taxRate ?? "",
      category: product.category || "",
    });

    setEditingId(product._id);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  /* =======================================================
     CANCEL
  ======================================================= */

  const cancelEdit = () => {
    setForm(initialForm);
    setEditingId(null);
  };

  /* =======================================================
     DELETE
  ======================================================= */

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this product?"
    );

    if (!confirmed) return;

    try {
      await api.delete(`/products/${id}`);

      toast.success("Product deleted successfully.");

      await fetchProducts();
    } catch (err) {
      console.error(
        "Product delete error:",
        err.response?.data || err.message
      );

      toast.error(
        err.response?.data?.message ||
        "Product delete failed."
      );
    }
  };

  /* =======================================================
     SEARCH
  ======================================================= */

  const filteredProducts = useMemo(() => {
    const value = search
      .toLowerCase()
      .trim();

    if (!value) return products;

    return products.filter((product) => {
      return (
        product.name
          ?.toLowerCase()
          .includes(value) ||
        product.sku
          ?.toLowerCase()
          .includes(value) ||
        product.category
          ?.toLowerCase()
          .includes(value)
      );
    });
  }, [products, search]);

  /* =======================================================
     SUMMARY
  ======================================================= */

  const totalProducts = products.length;

  const totalStock = products.reduce(
    (sum, product) =>
      sum + Number(product.stock || 0),
    0
  );

  const lowStockProducts = products.filter(
    (product) =>
      Number(product.stock || 0) <=
      Number(product.lowStockAlert || 0)
  ).length;

  const categories = new Set(
    products
      .map((product) => product.category)
      .filter(Boolean)
  ).size;

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div
      className="min-h-screen"
      style={{
        background:
          "linear-gradient(180deg,#F8FAFC 0%,#F9FAFB 50%,#FFFFFF 100%)",
      }}
    >
      <div className="mx-auto max-w-[1700px] px-4 py-5 sm:px-6 sm:py-7 lg:px-8 xl:px-10">

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="mb-7 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">

          <div>
            <div className="mb-2 flex items-center gap-2">
              <span
                className="h-2 w-2 rounded-full"
                style={{ background: "#12B76A" }}
              />

              <span
                className="text-[11px] font-bold uppercase tracking-[0.18em]"
                style={{ color: "#667085" }}
              >
                Inventory Management
              </span>
            </div>

            <div className="flex items-center gap-3">

              <div
                className="flex h-12 w-12 items-center justify-center rounded-2xl text-white shadow-lg"
                style={{
                  background:
                    "linear-gradient(135deg,#7F56D9,#4F46E5)",
                }}
              >
                <Icon name="package" size={24} />
              </div>

              <div>
                <h1
                  className="text-2xl font-bold tracking-tight sm:text-3xl"
                  style={{ color: "#101828" }}
                >
                  Products
                </h1>

                <p
                  className="mt-0.5 text-sm"
                  style={{ color: "#667085" }}
                >
                  Manage your products, pricing, stock and taxes.
                </p>
              </div>

            </div>
          </div>

          <button
            type="button"
            onClick={() => fetchProducts(true)}
            disabled={refreshing}
            className="inline-flex w-fit items-center gap-2 rounded-xl border bg-white px-4 py-2.5 text-sm font-semibold shadow-sm transition hover:bg-gray-50 disabled:opacity-60"
            style={{
              borderColor: "#EAECF0",
              color: "#344054",
            }}
          >
            <span
              className={
                refreshing ? "animate-spin" : ""
              }
            >
              <Icon name="refresh" size={17} />
            </span>

            {refreshing
              ? "Refreshing..."
              : "Refresh"}
          </button>

        </div>

        {/* =================================================
            KPI CARDS
        ================================================= */}

        <div className="mb-7 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

          <KpiCard
            title="Total Products"
            value={totalProducts}
            subtitle="Products in inventory"
            icon="package"
            accent="#155EEF"
          />

          <KpiCard
            title="Total Stock"
            value={totalStock}
            subtitle="Units currently available"
            icon="chart"
            accent="#7F56D9"
          />

          <KpiCard
            title="Categories"
            value={categories}
            subtitle="Unique product categories"
            icon="tag"
            accent="#039855"
          />

          <KpiCard
            title="Low Stock"
            value={lowStockProducts}
            subtitle={
              lowStockProducts > 0
                ? "Products need attention"
                : "Inventory looks healthy"
            }
            icon="warning"
            accent="#F04438"
            danger={lowStockProducts > 0}
          />

        </div>

        {/* =================================================
            FORM CARD
        ================================================= */}

        <div
          className="mb-7 overflow-hidden rounded-2xl border bg-white shadow-sm"
          style={{
            borderColor: editingId
              ? "#C7D7FE"
              : "#EAECF0",
          }}
        >

          {/* FORM HEADER */}

          <div
            className="flex flex-col gap-3 border-b px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
            style={{
              borderColor: "#EAECF0",
              background: editingId
                ? "#F5F8FF"
                : "#FCFCFD",
            }}
          >

            <div className="flex items-center gap-3">

              <div
                className="flex h-10 w-10 items-center justify-center rounded-xl"
                style={{
                  background: editingId
                    ? "#EEF4FF"
                    : "#F4F3FF",
                  color: editingId
                    ? "#155EEF"
                    : "#6941C6",
                }}
              >
                <Icon
                  name={editingId ? "edit" : "plus"}
                  size={18}
                />
              </div>

              <div>

                <h2
                  className="text-sm font-bold"
                  style={{ color: "#101828" }}
                >
                  {editingId
                    ? "Update Product"
                    : "Add New Product"}
                </h2>

                <p
                  className="mt-0.5 text-xs"
                  style={{ color: "#98A2B3" }}
                >
                  {editingId
                    ? "Modify product information and save changes."
                    : "Add a new item to your inventory."}
                </p>

              </div>

            </div>

            {editingId && (
              <button
                type="button"
                onClick={cancelEdit}
                className="inline-flex w-fit items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold transition hover:bg-red-50"
                style={{
                  color: "#B42318",
                }}
              >
                <Icon name="close" size={14} />
                Cancel Edit
              </button>
            )}

          </div>

          {/* FORM */}

          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6"
          >

            <div className="xl:col-span-2">
              <FormInput
                label="Product Name"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Premium Basmati Rice"
                icon="package"
                required
              />
            </div>

            <FormInput
              label="SKU"
              name="sku"
              value={form.sku}
              onChange={handleChange}
              placeholder="SKU-001"
              required
            />

            <FormInput
              label="Category"
              name="category"
              value={form.category}
              onChange={handleChange}
              placeholder="Grocery"
              icon="tag"
            />

            <FormInput
              label="Price"
              name="price"
              value={form.price}
              onChange={handleChange}
              placeholder="0.00"
              type="number"
              min="0"
              step="0.01"
              icon="rupee"
              required
            />

            <FormInput
              label="Stock"
              name="stock"
              value={form.stock}
              onChange={handleChange}
              placeholder="0"
              type="number"
              min="0"
              icon="chart"
              required
            />

            <FormInput
              label="Tax Rate"
              name="taxRate"
              value={form.taxRate}
              onChange={handleChange}
              placeholder="18"
              type="number"
              min="0"
              max="100"
              step="0.01"
              required={false}
            />

            {/* SUBMIT */}

            <div className="flex items-end sm:col-span-2 lg:col-span-3 xl:col-span-6">

              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center justify-center gap-2 rounded-xl px-6 py-2.5 text-sm font-bold text-white shadow-sm transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
                style={{
                  background:
                    "linear-gradient(135deg,#7F56D9,#4F46E5)",
                }}
              >

                {saving ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Icon
                      name={
                        editingId
                          ? "check"
                          : "plus"
                      }
                      size={17}
                    />

                    {editingId
                      ? "Update Product"
                      : "Add Product"}
                  </>
                )}

              </button>

            </div>

          </form>
        </div>

        {/* =================================================
            SEARCH + TABLE HEADER
        ================================================= */}

        <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">

          <div>

            <h2
              className="text-lg font-bold"
              style={{ color: "#101828" }}
            >
              Product Inventory
            </h2>

            <p
              className="mt-0.5 text-xs"
              style={{ color: "#98A2B3" }}
            >
              View and manage all products.
            </p>

          </div>

          <div className="flex w-full flex-col gap-2 sm:flex-row lg:w-auto">

            <div className="relative w-full sm:w-80">

              <span
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2"
                style={{ color: "#98A2B3" }}
              >
                <Icon name="search" size={17} />
              </span>

              <input
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                placeholder="Search product, SKU or category..."
                className="w-full rounded-xl border bg-white py-2.5 pl-10 pr-4 text-sm outline-none transition focus:ring-2"
                style={{
                  borderColor: "#D0D5DD",
                  color: "#101828",
                }}
              />

            </div>

            <div
              className="flex items-center justify-center rounded-xl border bg-white px-4 py-2.5 text-xs font-semibold"
              style={{
                borderColor: "#EAECF0",
                color: "#667085",
              }}
            >
              {filteredProducts.length} Results
            </div>

          </div>

        </div>

        {/* =================================================
            DESKTOP TABLE
        ================================================= */}

        <div
          className="hidden overflow-hidden rounded-2xl border bg-white shadow-sm md:block"
          style={{ borderColor: "#EAECF0" }}
        >

          <div className="overflow-x-auto">

            <table className="w-full min-w-[1050px] border-collapse text-sm">

              <thead>

                <tr
                  className="border-b"
                  style={{
                    borderColor: "#EAECF0",
                    background: "#F9FAFB",
                  }}
                >

                  <th className="w-14 px-4 py-3 text-center text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    #
                  </th>

                  <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    Product
                  </th>

                  <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    SKU
                  </th>

                  <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    Category
                  </th>

                  <th className="px-4 py-3 text-right text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    Price
                  </th>

                  <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    Stock
                  </th>

                  <th className="px-4 py-3 text-center text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    Tax
                  </th>

                  <th className="px-4 py-3 text-center text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    Actions
                  </th>

                </tr>

              </thead>

              <tbody>

                {loading ? (
                  <tr>
                    <td
                      colSpan="8"
                      className="py-16 text-center"
                    >
                      <div
                        className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-t-transparent"
                        style={{
                          borderColor: "#D0D5DD",
                          borderTopColor: "#7F56D9",
                        }}
                      />

                      <p
                        className="mt-3 text-sm"
                        style={{ color: "#98A2B3" }}
                      >
                        Loading products...
                      </p>
                    </td>
                  </tr>
                ) : filteredProducts.length === 0 ? (
                  <tr>
                    <td
                      colSpan="8"
                      className="py-16 text-center"
                    >
                      <div
                        className="mx-auto flex h-12 w-12 items-center justify-center rounded-full"
                        style={{
                          background: "#F4F3FF",
                          color: "#6941C6",
                        }}
                      >
                        <Icon
                          name="package"
                          size={22}
                        />
                      </div>

                      <p
                        className="mt-3 text-sm font-bold"
                        style={{ color: "#344054" }}
                      >
                        No products found
                      </p>

                      <p
                        className="mt-1 text-xs"
                        style={{ color: "#98A2B3" }}
                      >
                        Add a product or try another search.
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map(
                    (product, index) => {
                      const stock =
                        Number(
                          product.stock || 0
                        );

                      const alert =
                        Number(
                          product.lowStockAlert || 0
                        );

                      const lowStock =
                        stock <= alert;

                      const stockPercent =
                        alert > 0
                          ? Math.min(
                            100,
                            Math.max(
                              8,
                              (stock /
                                (alert * 3)) *
                              100
                            )
                          )
                          : 100;

                      return (
                        <tr
                          key={product._id}
                          className="group border-b transition hover:bg-slate-50 last:border-b-0"
                          style={{
                            borderColor: "#F2F4F7",
                          }}
                        >

                          {/* NUMBER */}

                          <td className="px-4 py-4 text-center text-xs font-medium text-slate-400">
                            {index + 1}
                          </td>

                          {/* PRODUCT */}

                          <td className="px-4 py-4">

                            <div className="flex items-center gap-3">

                              <div
                                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                                style={{
                                  background:
                                    lowStock
                                      ? "#FEF3F2"
                                      : "#F4F3FF",
                                  color:
                                    lowStock
                                      ? "#B42318"
                                      : "#6941C6",
                                }}
                              >
                                <Icon
                                  name="package"
                                  size={18}
                                />
                              </div>

                              <div className="min-w-0">

                                <p
                                  className="truncate font-semibold"
                                  style={{
                                    color: "#101828",
                                  }}
                                >
                                  {product.name}
                                </p>

                                <p
                                  className="mt-0.5 text-[11px]"
                                  style={{
                                    color: "#98A2B3",
                                  }}
                                >
                                  Product
                                </p>

                              </div>

                            </div>

                          </td>

                          {/* SKU */}

                          <td className="px-4 py-4">

                            <span
                              className="rounded-lg px-2.5 py-1 font-mono text-xs font-medium"
                              style={{
                                background: "#F2F4F7",
                                color: "#475467",
                              }}
                            >
                              {product.sku || "—"}
                            </span>

                          </td>

                          {/* CATEGORY */}

                          <td className="px-4 py-4">

                            {product.category ? (
                              <span
                                className="rounded-full px-2.5 py-1 text-xs font-semibold"
                                style={{
                                  background: "#EEF4FF",
                                  color: "#3538CD",
                                }}
                              >
                                {product.category}
                              </span>
                            ) : (
                              <span
                                style={{
                                  color: "#98A2B3",
                                }}
                              >
                                —
                              </span>
                            )}

                          </td>

                          {/* PRICE */}

                          <td className="px-4 py-4 text-right">

                            <span
                              className="font-bold"
                              style={{
                                color: "#101828",
                              }}
                            >
                              ₹
                              {Number(
                                product.price || 0
                              ).toLocaleString(
                                "en-IN",
                                {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                }
                              )}
                            </span>

                          </td>

                          {/* STOCK */}

                          <td className="px-4 py-4">

                            <div className="w-44">

                              <div className="mb-1.5 flex items-center justify-between">

                                <span
                                  className="text-xs font-bold"
                                  style={{
                                    color: lowStock
                                      ? "#B42318"
                                      : "#344054",
                                  }}
                                >
                                  {stock}{" "}
                                  {product.unit ||
                                    "units"}
                                </span>

                                {lowStock && (
                                  <span
                                    className="flex items-center gap-1 text-[10px] font-bold uppercase"
                                    style={{
                                      color: "#B42318",
                                    }}
                                  >
                                    <Icon
                                      name="warning"
                                      size={11}
                                    />
                                    Low
                                  </span>
                                )}

                              </div>

                              <div
                                className="h-1.5 overflow-hidden rounded-full"
                                style={{
                                  background:
                                    "#EAECF0",
                                }}
                              >
                                <div
                                  className="h-full rounded-full transition-all"
                                  style={{
                                    width: `${stockPercent}%`,
                                    background:
                                      lowStock
                                        ? "#F04438"
                                        : "#12B76A",
                                  }}
                                />
                              </div>

                            </div>

                          </td>

                          {/* TAX */}

                          <td className="px-4 py-4 text-center">

                            <span
                              className="rounded-full px-2.5 py-1 text-xs font-bold"
                              style={{
                                background: "#FFFAEB",
                                color: "#B54708",
                              }}
                            >
                              {product.taxRate || 0}%
                            </span>

                          </td>

                          {/* ACTIONS */}

                          <td className="px-4 py-4">

                            <div className="flex items-center justify-center gap-2">

                              <button
                                type="button"
                                onClick={() =>
                                  handleEdit(
                                    product
                                  )
                                }
                                className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-bold transition hover:bg-indigo-50"
                                style={{
                                  borderColor:
                                    "#D0D5DD",
                                  color: "#475467",
                                }}
                              >
                                <Icon
                                  name="edit"
                                  size={13}
                                />
                                Edit
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  handleDelete(
                                    product._id
                                  )
                                }
                                className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-bold transition hover:bg-red-50"
                                style={{
                                  borderColor:
                                    "#FECDCA",
                                  color: "#B42318",
                                }}
                              >
                                <Icon
                                  name="trash"
                                  size={13}
                                />
                                Delete
                              </button>

                            </div>

                          </td>

                        </tr>
                      );
                    }
                  )
                )}

              </tbody>

            </table>

          </div>

        </div>

        {/* =================================================
            MOBILE PRODUCT CARDS
        ================================================= */}

        <div className="space-y-3 md:hidden">

          {loading ? (
            <div
              className="rounded-2xl border bg-white p-12 text-center"
              style={{ borderColor: "#EAECF0" }}
            >
              <div
                className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-t-transparent"
                style={{
                  borderColor: "#D0D5DD",
                  borderTopColor: "#7F56D9",
                }}
              />

              <p
                className="mt-3 text-sm"
                style={{ color: "#98A2B3" }}
              >
                Loading products...
              </p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div
              className="rounded-2xl border bg-white p-12 text-center"
              style={{ borderColor: "#EAECF0" }}
            >
              <div
                className="mx-auto flex h-12 w-12 items-center justify-center rounded-full"
                style={{
                  background: "#F4F3FF",
                  color: "#6941C6",
                }}
              >
                <Icon
                  name="package"
                  size={22}
                />
              </div>

              <p
                className="mt-3 text-sm font-bold"
                style={{ color: "#344054" }}
              >
                No products found
              </p>
            </div>
          ) : (
            filteredProducts.map(
              (product, index) => {
                const stock =
                  Number(
                    product.stock || 0
                  );

                const alert =
                  Number(
                    product.lowStockAlert || 0
                  );

                const lowStock =
                  stock <= alert;

                const stockPercent =
                  alert > 0
                    ? Math.min(
                      100,
                      Math.max(
                        8,
                        (stock /
                          (alert * 3)) *
                        100
                      )
                    )
                    : 100;

                return (
                  <div
                    key={product._id}
                    className="rounded-2xl border bg-white p-4 shadow-sm"
                    style={{
                      borderColor: lowStock
                        ? "#FECDCA"
                        : "#EAECF0",
                    }}
                  >

                    {/* TOP */}

                    <div className="flex items-start gap-3">

                      <div
                        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
                        style={{
                          background: lowStock
                            ? "#FEF3F2"
                            : "#F4F3FF",
                          color: lowStock
                            ? "#B42318"
                            : "#6941C6",
                        }}
                      >
                        <Icon
                          name="package"
                          size={20}
                        />
                      </div>

                      <div className="min-w-0 flex-1">

                        <div className="flex items-start justify-between gap-2">

                          <div className="min-w-0">

                            <h3
                              className="truncate text-sm font-bold"
                              style={{
                                color: "#101828",
                              }}
                            >
                              {product.name}
                            </h3>

                            <p
                              className="mt-1 text-xs"
                              style={{
                                color: "#98A2B3",
                              }}
                            >
                              {product.sku ||
                                "No SKU"}
                            </p>

                          </div>

                          <span
                            className="shrink-0 text-base font-bold"
                            style={{
                              color: "#101828",
                            }}
                          >
                            ₹
                            {Number(
                              product.price || 0
                            ).toLocaleString(
                              "en-IN",
                              {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              }
                            )}
                          </span>

                        </div>

                      </div>

                    </div>

                    {/* CATEGORY */}

                    <div className="mt-4 flex items-center gap-2">

                      {product.category && (
                        <span
                          className="rounded-full px-2.5 py-1 text-[11px] font-semibold"
                          style={{
                            background: "#EEF4FF",
                            color: "#3538CD",
                          }}
                        >
                          {product.category}
                        </span>
                      )}

                      <span
                        className="rounded-full px-2.5 py-1 text-[11px] font-semibold"
                        style={{
                          background: "#FFFAEB",
                          color: "#B54708",
                        }}
                      >
                        Tax {product.taxRate || 0}%
                      </span>

                    </div>

                    {/* STOCK */}

                    <div className="mt-4">

                      <div className="mb-1.5 flex items-center justify-between">

                        <span
                          className="text-xs font-semibold"
                          style={{
                            color: "#667085",
                          }}
                        >
                          Stock Available
                        </span>

                        <span
                          className="text-xs font-bold"
                          style={{
                            color: lowStock
                              ? "#B42318"
                              : "#027A48",
                          }}
                        >
                          {stock}{" "}
                          {product.unit ||
                            "units"}
                        </span>

                      </div>

                      <div
                        className="h-2 overflow-hidden rounded-full"
                        style={{
                          background:
                            "#EAECF0",
                        }}
                      >
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${stockPercent}%`,
                            background:
                              lowStock
                                ? "#F04438"
                                : "#12B76A",
                          }}
                        />
                      </div>

                      {lowStock && (
                        <div
                          className="mt-2 flex items-center gap-1.5 text-[11px] font-bold"
                          style={{
                            color: "#B42318",
                          }}
                        >
                          <Icon
                            name="warning"
                            size={13}
                          />
                          Low stock — restock required
                        </div>
                      )}

                    </div>

                    {/* ACTIONS */}

                    <div
                      className="mt-4 flex gap-2 border-t pt-3"
                      style={{
                        borderColor: "#F2F4F7",
                      }}
                    >

                      <button
                        type="button"
                        onClick={() =>
                          handleEdit(
                            product
                          )
                        }
                        className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border py-2.5 text-xs font-bold transition hover:bg-indigo-50"
                        style={{
                          borderColor:
                            "#D0D5DD",
                          color: "#475467",
                        }}
                      >
                        <Icon
                          name="edit"
                          size={14}
                        />
                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          handleDelete(
                            product._id
                          )
                        }
                        className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border py-2.5 text-xs font-bold transition hover:bg-red-50"
                        style={{
                          borderColor:
                            "#FECDCA",
                          color: "#B42318",
                        }}
                      >
                        <Icon
                          name="trash"
                          size={14}
                        />
                        Delete
                      </button>

                    </div>

                  </div>
                );
              }
            )
          )}

        </div>

        {/* =================================================
            FOOTER
        ================================================= */}

        <div
          className="mt-4 flex flex-col gap-1 text-[11px] sm:flex-row sm:items-center sm:justify-between"
          style={{ color: "#98A2B3" }}
        >
          <span>
            Inventory management dashboard
          </span>

          <span>
            {products.length} total records
          </span>
        </div>

      </div>
    </div>
  );
}


// "use client";

// import { useEffect, useMemo, useState } from "react";
// import api from "@/lib/api";
// import { toast } from "react-toastify";

// const initialForm = {
//   name: "",
//   sku: "",
//   price: "",
//   stock: "",
//   taxRate: "",
//   category: "",
// };

// export default function ProductsPage() {
//   const [products, setProducts] = useState([]);
//   const [form, setForm] = useState(initialForm);
//   const [editingId, setEditingId] = useState(null);
//   const [search, setSearch] = useState("");
//   const [loading, setLoading] = useState(true);
//   const [saving, setSaving] = useState(false);

//   // ========================================
//   // FETCH PRODUCTS
//   // ========================================

//   const fetchProducts = async () => {
//     try {
//       setLoading(true);

//       const res = await api.get("/products");

//       setProducts(
//         Array.isArray(res.data) ? res.data : []
//       );
//     } catch (err) {
//       toast.error(
//         "Products loading error:",
//         err.response?.data || err.message
//       );

//       alert(
//         err.response?.data?.message ||
//         "Products not loaded."
//       );
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchProducts();
//   }, []);

//   // ========================================
//   // HANDLE INPUT
//   // ========================================

//   const handleChange = (e) => {
//     const { name, value } = e.target;

//     setForm((prev) => ({
//       ...prev,
//       [name]: value,
//     }));
//   };

//   // ========================================
//   // ADD / UPDATE
//   // ========================================

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     try {
//       setSaving(true);

//       if (editingId) {
//         await api.put(
//           `/products/${editingId}`,
//           form
//         );
//       } else {
//         await api.post("/products", form);
//       }

//       setForm(initialForm);
//       setEditingId(null);

//       await fetchProducts();
//     } catch (err) {
//       toast.error(
//         "Product save error:",
//         err.response?.data || err.message
//       );

//       alert(
//         err.response?.data?.message ||
//         "Product save failed!"
//       );
//     } finally {
//       setSaving(false);
//     }
//   };

//   // ========================================
//   // EDIT
//   // ========================================

//   const handleEdit = (product) => {
//     setForm({
//       name: product.name || "",
//       sku: product.sku || "",
//       price: product.price ?? "",
//       stock: product.stock ?? "",
//       taxRate: product.taxRate ?? "",
//       category: product.category || "",
//     });

//     setEditingId(product._id);

//     window.scrollTo({
//       top: 0,
//       behavior: "smooth",
//     });
//   };

//   // ========================================
//   // CANCEL EDIT
//   // ========================================

//   const cancelEdit = () => {
//     setForm(initialForm);
//     setEditingId(null);
//   };

//   // ========================================
//   // DELETE
//   // ========================================

//   const handleDelete = async (id) => {
//     if (
//       !window.confirm(
//         "Are you sure you want to delete this product?"
//       )
//     ) {
//       return;
//     }

//     try {
//       await api.delete(`/products/${id}`);

//       await fetchProducts();
//     } catch (err) {
//       alert(
//         err.response?.data?.message ||
//         "Product delete failed!"
//       );
//     }
//   };

//   // ========================================
//   // SEARCH
//   // ========================================

//   const filteredProducts = useMemo(() => {
//     const value = search
//       .toLowerCase()
//       .trim();

//     if (!value) return products;

//     return products.filter((product) => {
//       return (
//         product.name
//           ?.toLowerCase()
//           .includes(value) ||
//         product.sku
//           ?.toLowerCase()
//           .includes(value) ||
//         product.category
//           ?.toLowerCase()
//           .includes(value)
//       );
//     });
//   }, [products, search]);

//   // ========================================
//   // SUMMARY
//   // ========================================

//   const totalProducts = products.length;

//   const totalStock = products.reduce(
//     (sum, product) =>
//       sum + Number(product.stock || 0),
//     0
//   );

//   const lowStockProducts = products.filter(
//     (product) =>
//       Number(product.stock || 0) <=
//       Number(product.lowStockAlert || 0)
//   ).length;

//   return (
//     <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">

//       <div className="mx-auto max-w-7xl">

//         {/* =====================================
//             HEADER
//         ====================================== */}

//         <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

//           <div>
//             <div className="flex items-center gap-3">

//               <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-600 text-xl shadow-sm">
//                 📦
//               </div>

//               <div>
//                 <h1 className="text-2xl font-bold tracking-tight text-slate-900">
//                   Products
//                 </h1>

//                 <p className="mt-0.5 text-sm text-slate-500">
//                   Manage products, prices, stock and tax
//                 </p>
//               </div>

//             </div>
//           </div>

//           {/* SUMMARY CARDS */}

//           <div className="grid grid-cols-3 gap-2 sm:gap-3">

//             <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
//               <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
//                 Products
//               </p>

//               <p className="mt-1 text-xl font-bold text-slate-900">
//                 {totalProducts}
//               </p>
//             </div>

//             <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
//               <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
//                 Stock
//               </p>

//               <p className="mt-1 text-xl font-bold text-indigo-600">
//                 {totalStock}
//               </p>
//             </div>

//             <div className="rounded-xl border border-red-100 bg-white px-4 py-3 shadow-sm">
//               <p className="text-[10px] font-semibold uppercase tracking-wider text-red-400">
//                 Low Stock
//               </p>

//               <p className="mt-1 text-xl font-bold text-red-600">
//                 {lowStockProducts}
//               </p>
//             </div>

//           </div>

//         </div>

//         {/* =====================================
//             ADD / UPDATE PRODUCT FORM
//         ====================================== */}

//         <div className="mb-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

//           {/* FORM HEADER */}

//           <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-5 py-4">

//             <div>
//               <h2 className="font-bold text-slate-900">
//                 {editingId
//                   ? "Update Product"
//                   : "Add New Product"}
//               </h2>

//               <p className="mt-0.5 text-xs text-slate-400">
//                 Enter product information below
//               </p>
//             </div>

//             {editingId && (
//               <button
//                 type="button"
//                 onClick={cancelEdit}
//                 className="rounded-lg px-3 py-2 text-xs font-semibold text-red-500 transition hover:bg-red-50"
//               >
//                 Cancel Edit
//               </button>
//             )}

//           </div>

//           <form
//             onSubmit={handleSubmit}
//             className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6"
//           >

//             {/* PRODUCT NAME */}

//             <div className="xl:col-span-2">

//               <label className="mb-1.5 block text-xs font-semibold text-slate-600">
//                 Product Name
//               </label>

//               <div className="relative">

//                 <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm">
//                   📦
//                 </span>

//                 <input
//                   name="name"
//                   value={form.name}
//                   onChange={handleChange}
//                   placeholder="e.g. Premium Rice"
//                   className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm text-slate-800 placeholder:text-slate-400 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
//                   required
//                 />

//               </div>

//             </div>

//             {/* SKU */}

//             <div>

//               <label className="mb-1.5 block text-xs font-semibold text-slate-600">
//                 SKU
//               </label>

//               <div className="relative">

//                 <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm">
//                   #️⃣
//                 </span>

//                 <input
//                   name="sku"
//                   value={form.sku}
//                   onChange={handleChange}
//                   placeholder="SKU-001"
//                   className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm text-slate-800 placeholder:text-slate-400 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
//                   required
//                 />

//               </div>

//             </div>

//             {/* CATEGORY */}

//             <div>

//               <label className="mb-1.5 block text-xs font-semibold text-slate-600">
//                 Category
//               </label>

//               <div className="relative">

//                 <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm">
//                   🏷️
//                 </span>

//                 <input
//                   name="category"
//                   value={form.category}
//                   onChange={handleChange}
//                   placeholder="Grocery"
//                   className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm text-slate-800 placeholder:text-slate-400 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
//                 />

//               </div>

//             </div>

//             {/* PRICE */}

//             <div>

//               <label className="mb-1.5 block text-xs font-semibold text-slate-600">
//                 Price
//               </label>

//               <div className="relative">

//                 <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">
//                   ₹
//                 </span>

//                 <input
//                   name="price"
//                   type="number"
//                   min="0"
//                   step="0.01"
//                   value={form.price}
//                   onChange={handleChange}
//                   placeholder="0.00"
//                   className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-8 pr-3 text-sm text-slate-800 placeholder:text-slate-400 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
//                   required
//                 />

//               </div>

//             </div>

//             {/* STOCK */}

//             <div>

//               <label className="mb-1.5 block text-xs font-semibold text-slate-600">
//                 Stock
//               </label>

//               <div className="relative">

//                 <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm">
//                   📊
//                 </span>

//                 <input
//                   name="stock"
//                   type="number"
//                   min="0"
//                   value={form.stock}
//                   onChange={handleChange}
//                   placeholder="0"
//                   className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm text-slate-800 placeholder:text-slate-400 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
//                   required
//                 />

//               </div>

//             </div>

//             {/* TAX */}

//             <div>

//               <label className="mb-1.5 block text-xs font-semibold text-slate-600">
//                 Tax Rate
//               </label>

//               <div className="relative">

//                 <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm">
//                   %
//                 </span>

//                 <input
//                   name="taxRate"
//                   type="number"
//                   min="0"
//                   max="100"
//                   step="0.01"
//                   value={form.taxRate}
//                   onChange={handleChange}
//                   placeholder="18"
//                   className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-8 pr-3 text-sm text-slate-800 placeholder:text-slate-400 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
//                 />

//               </div>

//             </div>

//             {/* BUTTON */}

//             <div className="flex items-end sm:col-span-2 lg:col-span-3 xl:col-span-6">

//               <button
//                 type="submit"
//                 disabled={saving}
//                 className="rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
//               >
//                 {saving
//                   ? "Saving..."
//                   : editingId
//                     ? "✓ Update Product"
//                     : "+ Add Product"}
//               </button>

//             </div>

//           </form>
//         </div>

//         {/* =====================================
//             SEARCH
//         ====================================== */}

//         <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

//           <div className="relative w-full sm:max-w-md">

//             <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">
//               🔍
//             </span>

//             <input
//               value={search}
//               onChange={(e) =>
//                 setSearch(e.target.value)
//               }
//               placeholder="Search product, SKU or category..."
//               className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
//             />

//           </div>

//           <div className="text-sm text-slate-500">
//             Showing{" "}
//             <span className="font-semibold text-slate-900">
//               {filteredProducts.length}
//             </span>{" "}
//             products
//           </div>

//         </div>

//         {/* =====================================
//             EXCEL STYLE TABLE
//         ====================================== */}

//         <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

//           {/* TABLE HEADER */}

//           <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">

//             <div>
//               <h2 className="font-bold text-slate-900">
//                 Product Inventory
//               </h2>

//               <p className="mt-0.5 text-xs text-slate-400">
//                 Excel-style product management table
//               </p>
//             </div>

//             <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-600">
//               {products.length} Records
//             </span>

//           </div>

//           <div className="overflow-x-auto">

//             <table className="w-full min-w-[1000px] border-collapse text-sm">

//               <thead>

//                 <tr className="border-b border-slate-300 bg-slate-100">

//                   <th className="border-r border-slate-200 px-4 py-3 text-center font-bold text-slate-600">
//                     #
//                   </th>

//                   <th className="border-r border-slate-200 px-4 py-3 text-left font-bold text-slate-600">
//                     Product Name
//                   </th>

//                   <th className="border-r border-slate-200 px-4 py-3 text-left font-bold text-slate-600">
//                     SKU
//                   </th>

//                   <th className="border-r border-slate-200 px-4 py-3 text-left font-bold text-slate-600">
//                     Category
//                   </th>

//                   <th className="border-r border-slate-200 px-4 py-3 text-right font-bold text-slate-600">
//                     Price
//                   </th>

//                   <th className="border-r border-slate-200 px-4 py-3 text-center font-bold text-slate-600">
//                     Stock
//                   </th>

//                   <th className="border-r border-slate-200 px-4 py-3 text-center font-bold text-slate-600">
//                     Tax
//                   </th>

//                   <th className="px-4 py-3 text-center font-bold text-slate-600">
//                     Actions
//                   </th>

//                 </tr>

//               </thead>

//               <tbody>

//                 {loading ? (

//                   <tr>

//                     <td
//                       colSpan="8"
//                       className="py-14 text-center"
//                     >

//                       <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-indigo-600" />

//                       <p className="mt-3 text-sm text-slate-400">
//                         Loading products...
//                       </p>

//                     </td>

//                   </tr>

//                 ) : filteredProducts.length === 0 ? (

//                   <tr>

//                     <td
//                       colSpan="8"
//                       className="py-14 text-center"
//                     >

//                       <div className="text-4xl">
//                         📦
//                       </div>

//                       <p className="mt-2 font-semibold text-slate-600">
//                         No products found
//                       </p>

//                       <p className="mt-1 text-xs text-slate-400">
//                         Add a product or change your search.
//                       </p>

//                     </td>

//                   </tr>

//                 ) : (

//                   filteredProducts.map(
//                     (product, index) => {

//                       const stock =
//                         Number(
//                           product.stock || 0
//                         );

//                       const lowStock =
//                         stock <=
//                         Number(
//                           product.lowStockAlert ||
//                           0
//                         );

//                       return (
//                         <tr
//                           key={product._id}
//                           className="border-b border-slate-200 transition hover:bg-indigo-50/40"
//                         >

//                           {/* NUMBER */}

//                           <td className="border-r border-slate-100 px-4 py-3 text-center text-slate-400">
//                             {index + 1}
//                           </td>

//                           {/* PRODUCT */}

//                           <td className="border-r border-slate-100 px-4 py-3">

//                             <div className="flex items-center gap-3">

//                               <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-sm">
//                                 📦
//                               </div>

//                               <div>
//                                 <p className="font-semibold text-slate-800">
//                                   {product.name}
//                                 </p>

//                                 <p className="text-[11px] text-slate-400">
//                                   Product
//                                 </p>
//                               </div>

//                             </div>

//                           </td>

//                           {/* SKU */}

//                           <td className="border-r border-slate-100 px-4 py-3">

//                             <span className="rounded-md bg-slate-100 px-2 py-1 font-mono text-xs font-medium text-slate-600">
//                               {product.sku}
//                             </span>

//                           </td>

//                           {/* CATEGORY */}

//                           <td className="border-r border-slate-100 px-4 py-3">

//                             {product.category ? (
//                               <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-600">
//                                 {product.category}
//                               </span>
//                             ) : (
//                               <span className="text-slate-400">
//                                 —
//                               </span>
//                             )}

//                           </td>

//                           {/* PRICE */}

//                           <td className="border-r border-slate-100 px-4 py-3 text-right">

//                             <span className="font-bold text-slate-800">
//                               ₹
//                               {Number(
//                                 product.price || 0
//                               ).toFixed(2)}
//                             </span>

//                           </td>

//                           {/* STOCK */}

//                           <td className="border-r border-slate-100 px-4 py-3 text-center">

//                             {lowStock ? (

//                               <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-1 text-xs font-bold text-red-600">
//                                 ⚠ {stock}
//                               </span>

//                             ) : (

//                               <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-600">
//                                 ✓ {stock}
//                               </span>

//                             )}

//                           </td>

//                           {/* TAX */}

//                           <td className="border-r border-slate-100 px-4 py-3 text-center">

//                             <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-600">
//                               {product.taxRate || 0}%
//                             </span>

//                           </td>

//                           {/* ACTION */}

//                           <td className="px-4 py-3">

//                             <div className="flex items-center justify-center gap-2">

//                               <button
//                                 type="button"
//                                 onClick={() =>
//                                   handleEdit(
//                                     product
//                                   )
//                                 }
//                                 className="rounded-lg bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-600 transition hover:bg-indigo-600 hover:text-white"
//                               >
//                                 Edit
//                               </button>

//                               <button
//                                 type="button"
//                                 onClick={() =>
//                                   handleDelete(
//                                     product._id
//                                   )
//                                 }
//                                 className="rounded-lg bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-600 hover:text-white"
//                               >
//                                 Delete
//                               </button>

//                             </div>

//                           </td>

//                         </tr>
//                       );
//                     }
//                   )

//                 )}

//               </tbody>

//             </table>

//           </div>

//         </div>

//         {/* =====================================
//             FOOTER
//         ====================================== */}

//         <div className="mt-3 flex flex-col gap-1 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between">

//           <span>
//             Product inventory management
//           </span>

//           <span>
//             {products.length} total records
//           </span>

//         </div>

//       </div>
//     </div>
//   );
// }
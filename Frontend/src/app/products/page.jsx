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

// ========================================
// DUMMY DATA (fallback jab tak backend/API
// ready nahi hota — UI preview ke liye)
// ========================================

const DUMMY_PRODUCTS = [
  { _id: "dummy-1", name: "Premium Basmati Rice (5kg)", sku: "SKU-1001", category: "Grocery", price: 649, stock: 42, taxRate: 5, lowStockAlert: 10 },
  { _id: "dummy-2", name: "Sunflower Cooking Oil (1L)", sku: "SKU-1002", category: "Grocery", price: 189, stock: 8, taxRate: 5, lowStockAlert: 10 },
  { _id: "dummy-3", name: "Wireless Mouse - Black", sku: "SKU-2001", category: "Electronics", price: 799, stock: 25, taxRate: 18, lowStockAlert: 5 },
  { _id: "dummy-4", name: "Bluetooth Headphones", sku: "SKU-2002", category: "Electronics", price: 2499, stock: 3, taxRate: 18, lowStockAlert: 5 },
  { _id: "dummy-5", name: "Cotton T-Shirt (Medium)", sku: "SKU-3001", category: "Apparel", price: 449, stock: 60, taxRate: 12, lowStockAlert: 15 },
  { _id: "dummy-6", name: "Notebook - A5 Ruled", sku: "SKU-4001", category: "Stationery", price: 65, stock: 120, taxRate: 12, lowStockAlert: 20 },
  { _id: "dummy-7", name: "Steel Water Bottle (1L)", sku: "SKU-5001", category: "Home & Kitchen", price: 349, stock: 4, taxRate: 18, lowStockAlert: 6 },
];

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // ========================================
  // FETCH PRODUCTS
  // ========================================

  const fetchProducts = async () => {
    try {
      setLoading(true);

      const res = await api.get("/products");

      const data = Array.isArray(res.data) ? res.data : [];

      // agar backend abhi khaali ya set up nahi hai,
      // dummy data dikha do taaki UI preview ho sake
      setProducts(data.length > 0 ? data : DUMMY_PRODUCTS);
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
        "Products load nahi hue — dummy data dikha rahe hain."
      );

      // API fail hone par dummy data fallback
      setProducts(DUMMY_PRODUCTS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // ========================================
  // HANDLE INPUT
  // ========================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ========================================
  // ADD / UPDATE
  // ========================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);

      if (editingId) {
        await api.put(`/products/${editingId}`, form);
      } else {
        await api.post("/products", form);
      }

      setForm(initialForm);
      setEditingId(null);

      await fetchProducts();
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
        "Product save nahi hua (backend connect check karo)."
      );

      // backend na hone par bhi local list mein add/update kar do
      setProducts((prev) => {
        if (editingId) {
          return prev.map((p) =>
            p._id === editingId ? { ...p, ...form } : p
          );
        }
        return [
          { _id: `local-${Date.now()}`, ...form },
          ...prev,
        ];
      });

      setForm(initialForm);
      setEditingId(null);
    } finally {
      setSaving(false);
    }
  };

  // ========================================
  // EDIT
  // ========================================

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

  // ========================================
  // CANCEL EDIT
  // ========================================

  const cancelEdit = () => {
    setForm(initialForm);
    setEditingId(null);
  };

  // ========================================
  // DELETE
  // ========================================

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) {
      return;
    }

    try {
      await api.delete(`/products/${id}`);

      await fetchProducts();
    } catch (err) {
      // backend na hone par bhi local list se remove kar do
      setProducts((prev) => prev.filter((p) => p._id !== id));
    }
  };

  // ========================================
  // SEARCH
  // ========================================

  const filteredProducts = useMemo(() => {
    const value = search.toLowerCase().trim();

    if (!value) return products;

    return products.filter((product) => {
      return (
        product.name?.toLowerCase().includes(value) ||
        product.sku?.toLowerCase().includes(value) ||
        product.category?.toLowerCase().includes(value)
      );
    });
  }, [products, search]);

  // ========================================
  // SUMMARY
  // ========================================

  const totalProducts = products.length;

  const totalStock = products.reduce(
    (sum, product) => sum + Number(product.stock || 0),
    0
  );

  const lowStockProducts = products.filter(
    (product) =>
      Number(product.stock || 0) <= Number(product.lowStockAlert || 0)
  ).length;

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">
        {/* HEADER */}
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-600 text-xl shadow-sm">
                📦
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">Products</h1>
                <p className="mt-0.5 text-sm text-slate-500">Manage products, prices, stock and tax</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Products</p>
              <p className="mt-1 text-xl font-bold text-slate-900">{totalProducts}</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Stock</p>
              <p className="mt-1 text-xl font-bold text-indigo-600">{totalStock}</p>
            </div>
            <div className="rounded-xl border border-red-100 bg-white px-4 py-3 shadow-sm">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-red-400">Low Stock</p>
              <p className="mt-1 text-xl font-bold text-red-600">{lowStockProducts}</p>
            </div>
          </div>
        </div>

        {/* ADD / UPDATE PRODUCT FORM */}
        <div className="mb-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-5 py-4">
            <div>
              <h2 className="font-bold text-slate-900">{editingId ? "Update Product" : "Add New Product"}</h2>
              <p className="mt-0.5 text-xs text-slate-400">Enter product information below</p>
            </div>
            {editingId && (
              <button
                type="button"
                onClick={cancelEdit}
                className="rounded-lg px-3 py-2 text-xs font-semibold text-red-500 transition hover:bg-red-50"
              >
                Cancel Edit
              </button>
            )}
          </div>

          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6"
          >
            <div className="xl:col-span-2">
              <label className="mb-1.5 block text-xs font-semibold text-slate-600">Product Name</label>
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm">📦</span>
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="e.g. Premium Rice"
                  className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm text-slate-800 placeholder:text-slate-400 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  required
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-600">SKU</label>
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm">#️⃣</span>
                <input
                  name="sku"
                  value={form.sku}
                  onChange={handleChange}
                  placeholder="SKU-001"
                  className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm text-slate-800 placeholder:text-slate-400 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  required
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-600">Category</label>
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm">🏷️</span>
                <input
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  placeholder="Grocery"
                  className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm text-slate-800 placeholder:text-slate-400 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-600">Price</label>
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">₹</span>
                <input
                  name="price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.price}
                  onChange={handleChange}
                  placeholder="0.00"
                  className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-8 pr-3 text-sm text-slate-800 placeholder:text-slate-400 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  required
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-600">Stock</label>
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm">📊</span>
                <input
                  name="stock"
                  type="number"
                  min="0"
                  value={form.stock}
                  onChange={handleChange}
                  placeholder="0"
                  className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm text-slate-800 placeholder:text-slate-400 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  required
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-600">Tax Rate</label>
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm">%</span>
                <input
                  name="taxRate"
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  value={form.taxRate}
                  onChange={handleChange}
                  placeholder="18"
                  className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-8 pr-3 text-sm text-slate-800 placeholder:text-slate-400 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />
              </div>
            </div>

            <div className="flex items-end sm:col-span-2 lg:col-span-3 xl:col-span-6">
              <button
                type="submit"
                disabled={saving}
                className="rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving ? "Saving..." : editingId ? "✓ Update Product" : "+ Add Product"}
              </button>
            </div>
          </form>
        </div>

        {/* SEARCH */}
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-md">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">🔍</span>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search product, SKU or category..."
              className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            />
          </div>
          <div className="text-sm text-slate-500">
            Showing <span className="font-semibold text-slate-900">{filteredProducts.length}</span> products
          </div>
        </div>

        {/* TABLE */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
            <div>
              <h2 className="font-bold text-slate-900">Product Inventory</h2>
              <p className="mt-0.5 text-xs text-slate-400">Excel-style product management table</p>
            </div>
            <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-600">
              {products.length} Records
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[1000px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-300 bg-slate-100">
                  <th className="border-r border-slate-200 px-4 py-3 text-center font-bold text-slate-600">#</th>
                  <th className="border-r border-slate-200 px-4 py-3 text-left font-bold text-slate-600">Product Name</th>
                  <th className="border-r border-slate-200 px-4 py-3 text-left font-bold text-slate-600">SKU</th>
                  <th className="border-r border-slate-200 px-4 py-3 text-left font-bold text-slate-600">Category</th>
                  <th className="border-r border-slate-200 px-4 py-3 text-right font-bold text-slate-600">Price</th>
                  <th className="border-r border-slate-200 px-4 py-3 text-center font-bold text-slate-600">Stock</th>
                  <th className="border-r border-slate-200 px-4 py-3 text-center font-bold text-slate-600">Tax</th>
                  <th className="px-4 py-3 text-center font-bold text-slate-600">Actions</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="8" className="py-14 text-center">
                      <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-indigo-600" />
                      <p className="mt-3 text-sm text-slate-400">Loading products...</p>
                    </td>
                  </tr>
                ) : filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="py-14 text-center">
                      <div className="text-4xl">📦</div>
                      <p className="mt-2 font-semibold text-slate-600">No products found</p>
                      <p className="mt-1 text-xs text-slate-400">Add a product or change your search.</p>
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((product, index) => {
                    const stock = Number(product.stock || 0);
                    const lowStock = stock <= Number(product.lowStockAlert || 0);

                    return (
                      <tr key={product._id} className="border-b border-slate-200 transition hover:bg-indigo-50/40">
                        <td className="border-r border-slate-100 px-4 py-3 text-center text-slate-400">{index + 1}</td>
                        <td className="border-r border-slate-100 px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-sm">📦</div>
                            <div>
                              <p className="font-semibold text-slate-800">{product.name}</p>
                              <p className="text-[11px] text-slate-400">Product</p>
                            </div>
                          </div>
                        </td>
                        <td className="border-r border-slate-100 px-4 py-3">
                          <span className="rounded-md bg-slate-100 px-2 py-1 font-mono text-xs font-medium text-slate-600">
                            {product.sku}
                          </span>
                        </td>
                        <td className="border-r border-slate-100 px-4 py-3">
                          {product.category ? (
                            <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-600">
                              {product.category}
                            </span>
                          ) : (
                            <span className="text-slate-400">—</span>
                          )}
                        </td>
                        <td className="border-r border-slate-100 px-4 py-3 text-right">
                          <span className="font-bold text-slate-800">₹{Number(product.price || 0).toFixed(2)}</span>
                        </td>
                        <td className="border-r border-slate-100 px-4 py-3 text-center">
                          {lowStock ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-1 text-xs font-bold text-red-600">
                              ⚠ {stock}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-600">
                              ✓ {stock}
                            </span>
                          )}
                        </td>
                        <td className="border-r border-slate-100 px-4 py-3 text-center">
                          <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-600">
                            {product.taxRate || 0}%
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleEdit(product)}
                              className="rounded-lg bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-600 transition hover:bg-indigo-600 hover:text-white"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(product._id)}
                              className="rounded-lg bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-600 hover:text-white"
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

        <div className="mt-3 flex flex-col gap-1 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between">
          <span>Product inventory management</span>
          <span>{products.length} total records</span>
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
//           "Products not loaded."
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
//           "Product save failed!"
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
//           "Product delete failed!"
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
//                   ? "✓ Update Product"
//                   : "+ Add Product"}
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
//                             0
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
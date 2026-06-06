import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { fetchVendorProducts, fetchVendorOrders, createProduct, updateProduct, deleteProduct } from "../services/api";

const EMPTY_FORM = { name: "", description: "", price: "", stock: "", category: "", sku: "" };

export default function VendorDashboardPage() {
  const navigate = useNavigate();
  const { user, vendor, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeSection, setActiveSection] = useState("products");
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState("");
  const [formLoading, setFormLoading] = useState(false);

  const vendorId = vendor?._id;

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      if (vendorId) {
        const [prods, ords] = await Promise.all([
          fetchVendorProducts(vendorId),
          fetchVendorOrders(),
        ]);
        setProducts(Array.isArray(prods) ? prods : []);
        setOrders(Array.isArray(ords?.data) ? ords.data : []);
      }
      setLoading(false);
    };
    load();
  }, [vendorId]);

  const stats = {
    totalProducts: products.length,
    totalOrders: orders.length,
    revenue: orders.reduce((s, o) => s + (o.items?.reduce((si, i) => si + i.totalPrice, 0) || 0), 0),
  };

  const openAdd = () => { setForm(EMPTY_FORM); setEditingId(null); setFormError(""); setShowForm(true); };
  const openEdit = (p) => {
    setForm({ name: p.name, description: p.description, price: p.price, stock: p.stock, category: p.category?._id || p.category || "", sku: p.sku || "" });
    setEditingId(p._id); setFormError(""); setShowForm(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.price || !form.description) { setFormError("Name, description and price are required."); return; }
    setFormLoading(true);
    setFormError("");
    try {
      const payload = { ...form, price: Number(form.price), stock: Number(form.stock) || 0 };
      const data = editingId ? await updateProduct(editingId, payload) : await createProduct(payload);
      if (!data.success) { setFormError(data.message || "Failed to save product."); return; }
      const refreshed = await fetchVendorProducts(vendorId);
      setProducts(Array.isArray(refreshed) ? refreshed : []);
      setShowForm(false);
    } catch {
      setFormError("Server error.");
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Remove this product?")) return;
    const data = await deleteProduct(id);
    if (data.success) setProducts((prev) => prev.filter((p) => p._id !== id));
  };

  const navItems = [{ key: "products", label: "📦 Products" }, { key: "orders", label: "🛒 Orders" }, { key: "analytics", label: "📊 Analytics" }];

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <aside className={`bg-gray-900 text-white flex flex-col transition-all duration-200 ${sidebarOpen ? "w-56" : "w-14"}`}>
        <div className="flex items-center justify-between px-4 py-5 border-b border-gray-700">
          {sidebarOpen && <span className="font-bold text-lg text-blue-400">DOKAN</span>}
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-gray-400 hover:text-white text-xl">{sidebarOpen ? "◀" : "▶"}</button>
        </div>
        {sidebarOpen && (
          <div className="px-4 py-3 border-b border-gray-700">
            <p className="text-xs text-gray-400">Vendor</p>
            <p className="font-semibold text-sm truncate">{vendor?.storeName || user?.name}</p>
          </div>
        )}
        <nav className="flex-1 py-4">
          {navItems.map((item) => (
            <button key={item.key} onClick={() => setActiveSection(item.key)}
              className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition ${activeSection === item.key ? "bg-blue-600 text-white" : "text-gray-300 hover:bg-gray-800"}`}>
              <span>{item.label.split(" ")[0]}</span>
              {sidebarOpen && <span>{item.label.split(" ").slice(1).join(" ")}</span>}
            </button>
          ))}
        </nav>
        <div className="px-4 py-4 border-t border-gray-700 space-y-2">
          <button onClick={() => navigate("/")} className="w-full flex items-center gap-3 text-sm text-gray-400 hover:text-white transition">
            <span>🏠</span>{sidebarOpen && <span>Back to Store</span>}
          </button>
          <button onClick={() => { logout(); navigate("/login"); }} className="w-full flex items-center gap-3 text-sm text-red-400 hover:text-red-300 transition">
            <span>🚪</span>{sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 p-6 overflow-auto">
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          {[{ label: "Total Products", value: stats.totalProducts, color: "text-blue-600" },
            { label: "Total Orders", value: stats.totalOrders, color: "text-purple-600" },
            { label: "Total Revenue", value: `Rs. ${stats.revenue.toLocaleString()}`, color: "text-green-600" }].map((s) => (
            <div key={s.label} className="bg-white rounded-xl shadow-sm p-5">
              <p className="text-sm text-gray-500 mb-1">{s.label}</p>
              <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Products Section */}
        {activeSection === "products" && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">My Products</h2>
              <button onClick={openAdd} className="bg-blue-600 text-white text-sm px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition">+ Add Product</button>
            </div>

            {/* Add/Edit Form */}
            {showForm && (
              <form onSubmit={handleFormSubmit} className="bg-gray-50 rounded-xl p-5 mb-6 border border-gray-200">
                <h3 className="font-semibold text-gray-800 mb-4">{editingId ? "Edit Product" : "Add New Product"}</h3>
                {formError && <p className="text-red-500 text-sm mb-3">{formError}</p>}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[{ key: "name", label: "Product Name", col: 2 },
                    { key: "description", label: "Description", col: 2 },
                    { key: "price", label: "Price (Rs.)" },
                    { key: "stock", label: "Stock" },
                    { key: "sku", label: "SKU" },
                    { key: "category", label: "Category ID" },
                  ].map(({ key, label, col }) => (
                    <div key={key} className={col === 2 ? "sm:col-span-2" : ""}>
                      <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
                      <input type={["price","stock"].includes(key) ? "number" : "text"} value={form[key]}
                        onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500" />
                    </div>
                  ))}
                </div>
                <div className="flex gap-3 mt-4">
                  <button type="submit" disabled={formLoading}
                    className="bg-blue-600 text-white text-sm px-5 py-2 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-60">
                    {formLoading ? "Saving..." : editingId ? "Update" : "Create"}
                  </button>
                  <button type="button" onClick={() => setShowForm(false)} className="text-sm px-5 py-2 rounded-lg border border-gray-200 hover:bg-gray-100">Cancel</button>
                </div>
              </form>
            )}

            {loading ? <p className="text-gray-400 text-sm">Loading products...</p> : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 text-left text-gray-500 text-xs uppercase tracking-wide">
                      <th className="py-3 pr-4">Product</th><th className="py-3 pr-4">Price</th>
                      <th className="py-3 pr-4">Stock</th><th className="py-3 pr-4">Status</th><th className="py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {products.map((p) => (
                      <tr key={p._id} className="hover:bg-gray-50">
                        <td className="py-3 pr-4 font-medium text-gray-900">{p.name}</td>
                        <td className="py-3 pr-4 text-gray-600">Rs. {p.price?.toLocaleString()}</td>
                        <td className="py-3 pr-4"><span className={p.stock === 0 ? "text-red-500 font-semibold" : "text-gray-600"}>{p.stock === 0 ? "Out of Stock" : p.stock}</span></td>
                        <td className="py-3 pr-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${p.status === "active" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>{p.status}</span>
                        </td>
                        <td className="py-3">
                          <div className="flex gap-2">
                            <button onClick={() => openEdit(p)} className="text-xs text-blue-600 hover:underline font-medium">Edit</button>
                            <button onClick={() => handleDelete(p._id)} className="text-xs text-red-500 hover:underline font-medium">Remove</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {products.length === 0 && <tr><td colSpan={5} className="py-8 text-center text-gray-400">No products yet. Add your first product.</td></tr>}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Orders Section */}
        {activeSection === "orders" && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">My Orders</h2>
            {loading ? <p className="text-gray-400 text-sm">Loading...</p> : orders.length === 0 ? (
              <p className="text-gray-400 text-center py-8">No orders yet.</p>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <div key={order._id} className="flex items-center justify-between border border-gray-100 rounded-xl p-4">
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">{order.orderNumber}</p>
                      <p className="text-xs text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900 text-sm">Rs. {order.total?.toLocaleString()}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        order.status === "delivered" ? "bg-green-100 text-green-700" :
                        order.status === "shipped" ? "bg-blue-100 text-blue-700" :
                        order.status === "processing" ? "bg-purple-100 text-purple-700" :
                        "bg-yellow-100 text-yellow-700"}`}>{order.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Analytics Section */}
        {activeSection === "analytics" && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Analytics</h2>
            <div className="border border-gray-100 rounded-xl p-4">
              <h3 className="font-semibold text-gray-700 mb-3 text-sm">Products by Stock</h3>
              {products.map((p) => (
                <div key={p._id} className="flex items-center gap-3 mb-3">
                  <span className="text-xs text-gray-600 w-40 truncate">{p.name}</span>
                  <div className="flex-1 bg-gray-100 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${Math.min((p.stock / 100) * 100, 100)}%` }} />
                  </div>
                  <span className="text-xs text-gray-500 w-12 text-right">{p.stock} units</span>
                </div>
              ))}
              {products.length === 0 && <p className="text-gray-400 text-sm text-center py-4">No data yet.</p>}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

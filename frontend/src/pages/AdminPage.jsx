import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import VendorApplicationReview from "../components/VendorApplicationReview";
import { adminUpdateOrderStatus, adminMarkCODPaid } from "../services/api";

const API = "http://localhost:3001/api";

const ORDER_STATUSES = [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
];

const AdminPage = () => {
  const navigate = useNavigate();
  const { token, logout } = useAuth();
  const [activeTab, setActiveTab] = useState("vendors");

  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [userSearch, setUserSearch] = useState("");
  const [userRole, setUserRole] = useState("");

  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(false);

  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [orderStatusUpdating, setOrderStatusUpdating] = useState(null);

  const [actionMsg, setActionMsg] = useState("");

  const showMsg = (msg) => {
    setActionMsg(msg);
    setTimeout(() => setActionMsg(""), 3000);
  };

  const fetchUsers = useCallback(async () => {
    setUsersLoading(true);
    try {
      const params = new URLSearchParams();
      if (userSearch) params.set("search", userSearch);
      if (userRole) params.set("role", userRole);
      const res = await fetch(`${API}/admin/users?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setUsers(data.data);
    } catch {
      setUsers([]);
    } finally {
      setUsersLoading(false);
    }
  }, [token, userSearch, userRole]);

  const fetchProducts = useCallback(async () => {
    setProductsLoading(true);
    try {
      const res = await fetch(`${API}/admin/products`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setProducts(data.data);
    } catch {
      setProducts([]);
    } finally {
      setProductsLoading(false);
    }
  }, [token]);

  const fetchOrders = useCallback(async () => {
    setOrdersLoading(true);
    try {
      const res = await fetch(`${API}/admin/orders`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setOrders(data.data);
    } catch {
      setOrders([]);
    } finally {
      setOrdersLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (activeTab === "users") fetchUsers();
    if (activeTab === "products") fetchProducts();
    if (activeTab === "orders") fetchOrders();
  }, [activeTab, fetchUsers, fetchProducts, fetchOrders]);

  const handleBanUser = async (id, isBanned) => {
    const endpoint = isBanned ? "unban" : "ban";
    const res = await fetch(`${API}/admin/users/${id}/${endpoint}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ reason: "Banned by admin." }),
    });
    const data = await res.json();
    if (data.success) {
      showMsg(`User ${isBanned ? "unbanned" : "banned"}.`);
      fetchUsers();
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm("Remove this product from the platform?")) return;
    const res = await fetch(`${API}/admin/products/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (data.success) {
      showMsg("Product removed.");
      fetchProducts();
    }
  };

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    setOrderStatusUpdating(orderId);
    try {
      const data = await adminUpdateOrderStatus(orderId, newStatus);
      if (data.success) {
        showMsg(`Order status updated to "${newStatus}".`);
        setOrders((prev) =>
          prev.map((o) =>
            o._id === orderId
              ? {
                  ...o,
                  status: newStatus,
                  paymentStatus:
                    newStatus === "delivered" &&
                    o.paymentMethod === "cash_on_delivery"
                      ? "paid"
                      : o.paymentStatus,
                }
              : o,
          ),
        );
      } else {
        showMsg(data.message || "Failed to update status.");
      }
    } catch {
      showMsg("Server error.");
    } finally {
      setOrderStatusUpdating(null);
    }
  };

  const handleMarkCODPaid = async (orderId) => {
    setOrderStatusUpdating(orderId);
    try {
      const data = await adminMarkCODPaid(orderId);
      if (data.success) {
        showMsg("Order marked as paid.");
        setOrders((prev) =>
          prev.map((o) =>
            o._id === orderId ? { ...o, paymentStatus: "paid" } : o,
          ),
        );
      } else {
        showMsg(data.message || "Failed.");
      }
    } catch {
      showMsg("Server error.");
    } finally {
      setOrderStatusUpdating(null);
    }
  };

  const tabs = [
    { key: "vendors", label: "Vendor Applications" },
    { key: "users", label: "Users" },
    { key: "products", label: "Products" },
    { key: "orders", label: "Orders" },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold text-gray-800">Admin Panel</h1>
          <button
            onClick={() => navigate("/dashboard")}
            className="text-sm text-blue-600 hover:underline"
          >
            ← Dashboard
          </button>
        </div>
        <button
          onClick={() => {
            logout();
            navigate("/login");
          }}
          className="text-sm text-red-500 hover:underline"
        >
          Logout
        </button>
      </header>

      <div className="p-8">
        {actionMsg && (
          <div className="mb-4 bg-blue-50 border border-blue-100 text-blue-700 text-sm px-4 py-2 rounded-lg">
            {actionMsg}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-white rounded-xl p-1 shadow-sm w-fit">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-5 py-2 rounded-lg text-sm font-semibold transition ${activeTab === tab.key ? "bg-blue-600 text-white shadow" : "text-gray-500 hover:text-gray-800"}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Vendor Applications Tab */}
        {activeTab === "vendors" && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-6">
              Vendor Applications
            </h2>
            <VendorApplicationReview token={token} />
          </div>
        )}

        {/* Users Tab */}
        {activeTab === "users" && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-gray-800">All Users</h2>
              <div className="flex gap-3">
                <input
                  type="text"
                  placeholder="Search name or email..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && fetchUsers()}
                  className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-blue-400 w-52"
                />
                <select
                  value={userRole}
                  onChange={(e) => setUserRole(e.target.value)}
                  className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-blue-400"
                >
                  <option value="">All Roles</option>
                  <option value="customer">Customer</option>
                  <option value="vendor">Vendor</option>
                  <option value="admin">Admin</option>
                </select>
                <button
                  onClick={fetchUsers}
                  className="bg-blue-600 text-white text-sm px-4 py-1.5 rounded-lg hover:bg-blue-700 transition"
                >
                  Search
                </button>
              </div>
            </div>
            {usersLoading ? (
              <p className="text-gray-400 text-sm text-center py-8">
                Loading users...
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 text-left text-xs text-gray-500 uppercase tracking-wide">
                      <th className="py-3 pr-4">Name</th>
                      <th className="py-3 pr-4">Email</th>
                      <th className="py-3 pr-4">Role</th>
                      <th className="py-3 pr-4">Status</th>
                      <th className="py-3 pr-4">Joined</th>
                      <th className="py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {users.map((u) => (
                      <tr key={u._id} className="hover:bg-gray-50">
                        <td className="py-3 pr-4 font-medium text-gray-900">
                          {u.name}
                        </td>
                        <td className="py-3 pr-4 text-gray-500">{u.email}</td>
                        <td className="py-3 pr-4">
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full font-semibold ${u.role === "admin" ? "bg-red-100 text-red-700" : u.role === "vendor" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-600"}`}
                          >
                            {u.role}
                          </span>
                        </td>
                        <td className="py-3 pr-4">
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full font-semibold ${u.isBanned ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}
                          >
                            {u.isBanned ? "Banned" : "Active"}
                          </span>
                        </td>
                        <td className="py-3 pr-4 text-gray-400 text-xs">
                          {new Date(u.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-3">
                          {u.role !== "admin" && (
                            <button
                              onClick={() => handleBanUser(u._id, u.isBanned)}
                              className={`text-xs font-medium hover:underline ${u.isBanned ? "text-green-600" : "text-red-500"}`}
                            >
                              {u.isBanned ? "Unban" : "Ban"}
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                    {users.length === 0 && (
                      <tr>
                        <td
                          colSpan={6}
                          className="py-8 text-center text-gray-400"
                        >
                          No users found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Products Tab */}
        {activeTab === "products" && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-6">
              All Products
            </h2>
            {productsLoading ? (
              <p className="text-gray-400 text-sm text-center py-8">
                Loading products...
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 text-left text-xs text-gray-500 uppercase tracking-wide">
                      <th className="py-3 pr-4">Product</th>
                      <th className="py-3 pr-4">Vendor</th>
                      <th className="py-3 pr-4">Category</th>
                      <th className="py-3 pr-4">Price</th>
                      <th className="py-3 pr-4">Stock</th>
                      <th className="py-3 pr-4">Status</th>
                      <th className="py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {products.map((p) => (
                      <tr key={p._id} className="hover:bg-gray-50">
                        <td className="py-3 pr-4">
                          <div className="flex items-center gap-2">
                            {p.thumbnail && (
                              <img
                                src={p.thumbnail}
                                alt={p.name}
                                className="w-8 h-8 rounded-lg object-cover border border-gray-100 flex-shrink-0"
                              />
                            )}
                            <span className="font-medium text-gray-900 truncate max-w-[160px]">
                              {p.name}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 pr-4 text-gray-500">
                          {p.vendor?.storeName || "—"}
                        </td>
                        <td className="py-3 pr-4 text-gray-500">
                          {p.category?.name || "—"}
                        </td>
                        <td className="py-3 pr-4 text-gray-700 font-medium">
                          Rs. {p.price?.toLocaleString()}
                        </td>
                        <td className="py-3 pr-4">
                          <span
                            className={
                              p.stock === 0
                                ? "text-red-500 font-semibold"
                                : "text-gray-600"
                            }
                          >
                            {p.stock === 0 ? "Out" : p.stock}
                          </span>
                        </td>
                        <td className="py-3 pr-4">
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full font-semibold ${p.status === "active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}
                          >
                            {p.status}
                          </span>
                        </td>
                        <td className="py-3">
                          <button
                            onClick={() => handleDeleteProduct(p._id)}
                            className="text-xs text-red-500 hover:underline font-medium"
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                    {products.length === 0 && (
                      <tr>
                        <td
                          colSpan={7}
                          className="py-8 text-center text-gray-400"
                        >
                          No products found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === "orders" && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-6">All Orders</h2>
            {ordersLoading ? (
              <p className="text-gray-400 text-sm text-center py-8">
                Loading orders...
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 text-left text-xs text-gray-500 uppercase tracking-wide">
                      <th className="py-3 pr-4">Order #</th>
                      <th className="py-3 pr-4">Customer</th>
                      <th className="py-3 pr-4">Total</th>
                      <th className="py-3 pr-4">Payment</th>
                      <th className="py-3 pr-4">Pay Status</th>
                      <th className="py-3 pr-4">Order Status</th>
                      <th className="py-3 pr-4">Date</th>
                      <th className="py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {orders.map((o) => (
                      <tr key={o._id} className="hover:bg-gray-50">
                        <td className="py-3 pr-4 font-mono text-xs text-gray-700">
                          {o.orderNumber}
                        </td>
                        <td className="py-3 pr-4">
                          <p className="font-medium text-gray-900">
                            {o.customer?.name || "—"}
                          </p>
                          <p className="text-xs text-gray-400">
                            {o.customer?.email}
                          </p>
                        </td>
                        <td className="py-3 pr-4 font-semibold text-gray-900">
                          Rs. {o.total?.toLocaleString()}
                        </td>
                        <td className="py-3 pr-4 text-gray-500 capitalize text-xs">
                          {o.paymentMethod?.replace(/_/g, " ")}
                        </td>
                        <td className="py-3 pr-4">
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                              o.paymentStatus === "paid"
                                ? "bg-green-100 text-green-700"
                                : o.paymentStatus === "failed"
                                  ? "bg-red-100 text-red-700"
                                  : "bg-yellow-100 text-yellow-700"
                            }`}
                          >
                            {o.paymentStatus}
                          </span>
                        </td>
                        <td className="py-3 pr-4">
                          {/* Status dropdown */}
                          <select
                            value={o.status}
                            disabled={
                              orderStatusUpdating === o._id ||
                              o.status === "cancelled"
                            }
                            onChange={(e) =>
                              handleUpdateOrderStatus(o._id, e.target.value)
                            }
                            className="text-xs border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:border-blue-400 disabled:opacity-50 bg-white"
                          >
                            {ORDER_STATUSES.map((s) => (
                              <option key={s} value={s}>
                                {s.charAt(0).toUpperCase() + s.slice(1)}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="py-3 pr-4 text-xs text-gray-400">
                          {new Date(o.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-3">
                          {/* Mark COD as paid */}
                          {o.paymentMethod === "cash_on_delivery" &&
                            o.paymentStatus !== "paid" &&
                            o.status !== "cancelled" && (
                              <button
                                onClick={() => handleMarkCODPaid(o._id)}
                                disabled={orderStatusUpdating === o._id}
                                className="text-xs text-green-600 hover:underline font-medium disabled:opacity-50 whitespace-nowrap"
                              >
                                Mark Paid
                              </button>
                            )}
                        </td>
                      </tr>
                    ))}
                    {orders.length === 0 && (
                      <tr>
                        <td
                          colSpan={8}
                          className="py-8 text-center text-gray-400"
                        >
                          No orders found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPage;

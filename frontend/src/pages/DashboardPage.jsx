import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const API = "http://localhost:3001/api";

const DashboardPage = () => {
  const navigate = useNavigate();
  const { token, logout } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch(`${API}/admin/stats`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (!data.success) {
          setError(data.message || "Failed to load stats.");
          return;
        }
        setStats(data.data);
      } catch {
        setError("Could not connect to server.");
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [token]);

  if (loading)
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center text-gray-400">
        Loading dashboard...
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Top bar */}
      <header className="bg-white shadow px-8 py-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/admin")}
            className="text-sm text-blue-600 hover:underline font-medium"
          >
            Admin Panel →
          </button>
          <button
            onClick={() => {
              logout();
              navigate("/login");
            }}
            className="text-sm text-red-500 hover:underline"
          >
            Logout
          </button>
        </div>
      </header>

<<<<<<< HEAD
        {/* Total Users Card */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-gray-500 text-sm font-semibold mb-2">Total Users</h2>
          <p className="text-3xl font-bold text-green-600">{stats.totalUsers}</p>
        </div>

        {/* Total Orders Card */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-gray-500 text-sm font-semibold mb-2">Total Orders</h2>
          <p className="text-3xl font-bold text-purple-600">{stats.totalOrders}</p>
        </div>

        {/* Total Revenue Card */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-gray-500 text-sm font-semibold mb-2">Total Revenue</h2>
          <p className="text-3xl font-bold text-orange-600">Rs. {stats.totalRevenue}</p>
        </div>
      </div>

      {/* Recent Activity Section */}
      <div className="mt-8 bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Recent Activity</h2>
        <div className="space-y-4">
          <div className="border-l-4 border-blue-500 pl-4 py-2">
            <p className="text-gray-700">New product added: iPhone 15</p>
            <span className="text-gray-400 text-sm">2 hours ago</span>
=======
      <div className="p-8">
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {error}
>>>>>>> f10bf1e45e98e9f6ab149e83ee85fad2752cdc36
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            {
              label: "Total Products",
              value: stats?.totalProducts ?? 0,
              color: "text-blue-600",
              icon: "📦",
            },
            {
              label: "Total Users",
              value: stats?.totalUsers ?? 0,
              color: "text-green-600",
              icon: "👥",
            },
            {
              label: "Total Orders",
              value: stats?.totalOrders ?? 0,
              color: "text-purple-600",
              icon: "🛒",
            },
            {
              label: "Total Revenue",
              value: `Rs. ${(stats?.totalRevenue ?? 0).toLocaleString()}`,
              color: "text-orange-600",
              icon: "💰",
            },
          ].map((card) => (
            <div key={card.label} className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-gray-500 text-sm font-semibold">
                  {card.label}
                </h2>
                <span className="text-2xl">{card.icon}</span>
              </div>
              <p className={`text-3xl font-bold ${card.color}`}>{card.value}</p>
            </div>
          ))}
        </div>

        {/* Secondary stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-gray-500 text-sm font-semibold">
                Active Vendors
              </h2>
              <span className="text-2xl">🏪</span>
            </div>
            <p className="text-3xl font-bold text-teal-600">
              {stats?.totalVendors ?? 0}
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-gray-500 text-sm font-semibold">
                Pending Vendor Applications
              </h2>
              <span className="text-2xl">⏳</span>
            </div>
            <p className="text-3xl font-bold text-yellow-500">
              {stats?.pendingVendors ?? 0}
            </p>
            {stats?.pendingVendors > 0 && (
              <button
                onClick={() => navigate("/admin")}
                className="mt-2 text-xs text-blue-600 hover:underline"
              >
                Review applications →
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Orders */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4">
              Recent Orders
            </h2>
            {!stats?.recentOrders?.length ? (
              <p className="text-gray-400 text-sm text-center py-6">
                No orders yet.
              </p>
            ) : (
              <div className="space-y-3">
                {stats.recentOrders.map((order) => (
                  <div
                    key={order._id}
                    className="flex items-center justify-between border-b border-gray-50 pb-3"
                  >
                    <div>
                      <p className="text-sm font-semibold text-gray-800">
                        {order.orderNumber}
                      </p>
                      <p className="text-xs text-gray-400">
                        {order.customer?.name || "Customer"}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-gray-800">
                        Rs. {order.total?.toLocaleString()}
                      </p>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          order.status === "delivered"
                            ? "bg-green-100 text-green-700"
                            : order.status === "shipped"
                              ? "bg-blue-100 text-blue-700"
                              : order.status === "pending"
                                ? "bg-yellow-100 text-yellow-700"
                                : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {order.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Users */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4">
              Recent Users
            </h2>
            {!stats?.recentUsers?.length ? (
              <p className="text-gray-400 text-sm text-center py-6">
                No users yet.
              </p>
            ) : (
              <div className="space-y-3">
                {stats.recentUsers.map((u) => (
                  <div
                    key={u._id}
                    className="flex items-center justify-between border-b border-gray-50 pb-3"
                  >
                    <div>
                      <p className="text-sm font-semibold text-gray-800">
                        {u.name}
                      </p>
                      <p className="text-xs text-gray-400">{u.email}</p>
                    </div>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        u.role === "admin"
                          ? "bg-red-100 text-red-700"
                          : u.role === "vendor"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {u.role}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;

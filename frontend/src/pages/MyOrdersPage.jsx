import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchMyOrders } from "../services/api";

const STATUS_STYLES = {
  pending: "bg-yellow-100 text-yellow-700",
  confirmed: "bg-blue-100 text-blue-700",
  processing: "bg-purple-100 text-purple-700",
  shipped: "bg-indigo-100 text-indigo-700",
  delivered: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
  refunded: "bg-gray-100 text-gray-600",
};

const PAYMENT_STYLES = {
  pending: "bg-yellow-50 text-yellow-600",
  paid: "bg-green-50 text-green-700",
  failed: "bg-red-50 text-red-600",
  refunded: "bg-gray-50 text-gray-500",
};

export default function MyOrdersPage() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchMyOrders();
        if (data.success) setOrders(data.data);
        else setError(data.message || "Failed to load orders.");
      } catch {
        setError("Could not connect to server.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate("/")}
            className="text-2xl font-bold text-blue-600"
          >
            DOKAN
          </button>
          <button
            onClick={() => navigate("/")}
            className="text-sm text-blue-600 hover:underline"
          >
            ← Continue Shopping
          </button>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">My Orders</h1>

        {loading && (
          <div className="text-center py-20 text-gray-400">
            Loading your orders...
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-6">
            {error}
          </div>
        )}

        {!loading && !error && orders.length === 0 && (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">📦</div>
            <p className="text-gray-500 text-lg font-medium">No orders yet</p>
            <p className="text-gray-400 text-sm mt-1 mb-6">
              Start shopping to see your orders here.
            </p>
            <button
              onClick={() => navigate("/")}
              className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-blue-700 transition text-sm"
            >
              Shop Now
            </button>
          </div>
        )}

        {!loading && orders.length > 0 && (
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order._id}
                className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md transition cursor-pointer"
                onClick={() => navigate(`/orders/${order._id}`)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="font-mono text-sm font-semibold text-gray-800">
                      {order.orderNumber}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {new Date(order.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span
                      className={`text-xs px-2.5 py-1 rounded-full font-semibold ${STATUS_STYLES[order.status] || "bg-gray-100 text-gray-600"}`}
                    >
                      {order.status.charAt(0).toUpperCase() +
                        order.status.slice(1)}
                    </span>
                    <span
                      className={`text-xs px-2.5 py-1 rounded-full font-semibold ${PAYMENT_STYLES[order.paymentStatus] || "bg-gray-100 text-gray-500"}`}
                    >
                      {order.paymentStatus === "paid"
                        ? "✓ Paid"
                        : order.paymentStatus.charAt(0).toUpperCase() +
                          order.paymentStatus.slice(1)}
                    </span>
                  </div>
                </div>

                {/* Items preview */}
                <div className="flex items-center gap-3 mb-4 overflow-hidden">
                  {order.items.slice(0, 3).map((item, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2 flex-shrink-0"
                    >
                      {item.productImage && (
                        <img
                          src={item.productImage}
                          alt={item.productName}
                          className="w-8 h-8 rounded object-cover"
                        />
                      )}
                      <div>
                        <p className="text-xs font-medium text-gray-800 max-w-[120px] truncate">
                          {item.productName}
                        </p>
                        <p className="text-xs text-gray-400">
                          × {item.quantity}
                        </p>
                      </div>
                    </div>
                  ))}
                  {order.items.length > 3 && (
                    <span className="text-xs text-gray-400 flex-shrink-0">
                      +{order.items.length - 3} more
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between border-t border-gray-50 pt-4">
                  <div className="text-sm text-gray-500 capitalize">
                    {order.paymentMethod.replace(/_/g, " ")}
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-bold text-gray-900">
                      Rs. {order.total?.toLocaleString()}
                    </span>
                    <span className="text-xs text-blue-600 font-medium hover:underline">
                      View Details →
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

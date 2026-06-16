import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchOrderById } from "../services/api";

const STATUS_STYLES = {
  pending: "bg-yellow-100 text-yellow-700",
  confirmed: "bg-blue-100 text-blue-700",
  processing: "bg-purple-100 text-purple-700",
  shipped: "bg-indigo-100 text-indigo-700",
  delivered: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
  refunded: "bg-gray-100 text-gray-600",
};

// Timeline steps for order progress
const STATUS_STEPS = [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
];

export default function OrderDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchOrderById(id);
        if (data.success) setOrder(data.data);
        else setError(data.message || "Order not found.");
      } catch {
        setError("Could not load order.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  if (loading)
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-400">
        Loading order...
      </div>
    );

  if (error || !order)
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center text-gray-400">
        <div className="text-5xl mb-4">❌</div>
        <p className="text-lg font-medium mb-4">
          {error || "Order not found."}
        </p>
        <button
          onClick={() => navigate("/orders")}
          className="text-blue-600 hover:underline text-sm"
        >
          ← Back to My Orders
        </button>
      </div>
    );

  const currentStepIdx =
    order.status === "cancelled" ? -1 : STATUS_STEPS.indexOf(order.status);

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
            onClick={() => navigate("/orders")}
            className="text-sm text-blue-600 hover:underline"
          >
            ← My Orders
          </button>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-10">
        {/* Title row */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Order Details</h1>
            <p className="font-mono text-sm text-gray-500 mt-1">
              {order.orderNumber}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">
              Placed on{" "}
              {new Date(order.createdAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`text-sm px-3 py-1.5 rounded-full font-semibold ${STATUS_STYLES[order.status] || "bg-gray-100 text-gray-600"}`}
            >
              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
            </span>
          </div>
        </div>

        {/* Progress Timeline */}
        {order.status !== "cancelled" && (
          <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
            <h2 className="font-semibold text-gray-900 mb-6">Order Progress</h2>
            <div className="flex items-center">
              {STATUS_STEPS.map((step, i) => {
                const isCompleted = i <= currentStepIdx;
                const isCurrent = i === currentStepIdx;
                return (
                  <React.Fragment key={step}>
                    <div className="flex flex-col items-center flex-shrink-0">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition ${
                          isCompleted
                            ? "bg-blue-600 text-white"
                            : "bg-gray-100 text-gray-400"
                        }`}
                      >
                        {isCompleted ? "✓" : i + 1}
                      </div>
                      <span
                        className={`text-xs mt-2 capitalize font-medium ${isCurrent ? "text-blue-600" : isCompleted ? "text-gray-700" : "text-gray-400"}`}
                      >
                        {step}
                      </span>
                    </div>
                    {i < STATUS_STEPS.length - 1 && (
                      <div
                        className={`flex-1 h-1 mx-2 rounded ${i < currentStepIdx ? "bg-blue-600" : "bg-gray-100"}`}
                      />
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>
        )}

        {order.status === "cancelled" && (
          <div className="bg-red-50 border border-red-100 rounded-2xl p-4 mb-6">
            <p className="text-red-700 font-semibold text-sm">
              ❌ This order was cancelled.
            </p>
            {order.cancelReason && (
              <p className="text-red-500 text-xs mt-1">{order.cancelReason}</p>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left col */}
          <div className="lg:col-span-2 space-y-6">
            {/* Items */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h2 className="font-semibold text-gray-900 mb-4">
                Items Ordered
              </h2>
              <div className="space-y-4">
                {order.items.map((item, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-4 border-b border-gray-50 pb-4 last:border-b-0 last:pb-0"
                  >
                    <div className="w-14 h-14 rounded-xl bg-gray-50 border border-gray-100 flex-shrink-0 overflow-hidden">
                      {item.productImage ? (
                        <img
                          src={item.productImage}
                          alt={item.productName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="w-full h-full flex items-center justify-center text-xl">
                          📦
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 text-sm">
                        {item.productName}
                      </p>
                      {item.sku && (
                        <p className="text-xs text-gray-400">SKU: {item.sku}</p>
                      )}
                      {item.vendor?.storeName && (
                        <p className="text-xs text-gray-400">
                          Sold by: {item.vendor.storeName}
                        </p>
                      )}
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-semibold text-gray-900">
                        Rs. {item.totalPrice?.toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-400">
                        Rs. {item.unitPrice?.toLocaleString()} × {item.quantity}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Shipping Address */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h2 className="font-semibold text-gray-900 mb-4">
                Shipping Address
              </h2>
              <div className="text-sm text-gray-600 space-y-1">
                <p className="font-semibold text-gray-900">
                  {order.shippingAddress.fullName}
                </p>
                <p>{order.shippingAddress.phone}</p>
                <p>{order.shippingAddress.street}</p>
                <p>
                  {order.shippingAddress.city}, {order.shippingAddress.state}{" "}
                  {order.shippingAddress.postalCode}
                </p>
                <p>{order.shippingAddress.country}</p>
              </div>
            </div>

            {/* Status History */}
            {order.statusHistory && order.statusHistory.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 p-6">
                <h2 className="font-semibold text-gray-900 mb-4">
                  Order History
                </h2>
                <div className="space-y-3">
                  {[...order.statusHistory].reverse().map((h, i) => (
                    <div key={i} className="flex gap-3 items-start">
                      <div className="w-2 h-2 rounded-full bg-blue-400 mt-1.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-gray-800 capitalize">
                          {h.status}
                        </p>
                        {h.note && (
                          <p className="text-xs text-gray-500">{h.note}</p>
                        )}
                        <p className="text-xs text-gray-400 mt-0.5">
                          {new Date(h.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right col — Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-gray-100 p-5 sticky top-6">
              <h2 className="font-semibold text-gray-900 mb-4">
                Order Summary
              </h2>
              <div className="space-y-2 text-sm mb-4">
                <div className="flex justify-between text-gray-500">
                  <span>Subtotal</span>
                  <span>Rs. {order.subtotal?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-500">
                  <span>Delivery</span>
                  <span>Rs. {order.shippingCharge?.toLocaleString()}</span>
                </div>
                {order.discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span>− Rs. {order.discount?.toLocaleString()}</span>
                  </div>
                )}
              </div>
              <div className="border-t border-gray-100 pt-4 flex justify-between font-bold text-gray-900">
                <span>Total</span>
                <span>Rs. {order.total?.toLocaleString()}</span>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-100 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Payment</span>
                  <span className="font-medium capitalize">
                    {order.paymentMethod.replace(/_/g, " ")}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Payment Status</span>
                  <span
                    className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                      order.paymentStatus === "paid"
                        ? "bg-green-100 text-green-700"
                        : order.paymentStatus === "failed"
                          ? "bg-red-100 text-red-700"
                          : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {order.paymentStatus === "paid"
                      ? "✓ Paid"
                      : order.paymentStatus}
                  </span>
                </div>
                {order.paidAt && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Paid At</span>
                    <span className="text-gray-700 text-xs">
                      {new Date(order.paidAt).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

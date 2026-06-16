import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { verifyEsewa, cancelFailedOrder } from "../services/api";

export default function EsewaCallbackPage({ type }) {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("verifying");
  const [orderCancelled, setOrderCancelled] = useState(false);

  useEffect(() => {
    const handle = async () => {
      const paymentId = searchParams.get("paymentId");
      const orderId = searchParams.get("orderId");

      // User cancelled or payment failed — cancel the order immediately
      if (type === "failure") {
        if (orderId) {
          try {
            await cancelFailedOrder(orderId);
            setOrderCancelled(true);
          } catch {
            /* silent */
          }
        }
        setStatus("failed");
        return;
      }

      // Success — verify with backend
      const encodedData = searchParams.get("data");
      if (!encodedData || !paymentId) {
        // Missing data — cancel order
        if (orderId) {
          try {
            await cancelFailedOrder(orderId);
            setOrderCancelled(true);
          } catch {
            /* silent */
          }
        }
        setStatus("failed");
        return;
      }

      try {
        const res = await verifyEsewa(encodedData, paymentId);
        if (res.success) {
          setStatus("success");
        } else {
          // Verification failed — cancel order
          if (orderId) {
            try {
              await cancelFailedOrder(orderId);
              setOrderCancelled(true);
            } catch {
              /* silent */
            }
          }
          setStatus("failed");
        }
      } catch {
        if (orderId) {
          try {
            await cancelFailedOrder(orderId);
            setOrderCancelled(true);
          } catch {
            /* silent */
          }
        }
        setStatus("failed");
      }
    };
    handle();
  }, [type, searchParams]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-lg p-10 max-w-md w-full text-center">
        {status === "verifying" && (
          <>
            <div className="text-5xl mb-4 animate-pulse">🟢</div>
            <h1 className="text-xl font-bold text-gray-900 mb-2">
              Verifying eSewa Payment...
            </h1>
            <p className="text-gray-400 text-sm">
              Please wait while we confirm your payment.
            </p>
          </>
        )}

        {status === "success" && (
          <>
            <div className="text-6xl mb-4">✅</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Payment Successful!
            </h1>
            <p className="text-gray-500 mb-6">
              Your eSewa payment was verified. Your order is confirmed.
            </p>
            <button
              onClick={() => navigate("/orders")}
              className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition mb-3"
            >
              View My Orders
            </button>
            <button
              onClick={() => navigate("/")}
              className="w-full border border-gray-200 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-50 transition text-sm"
            >
              Continue Shopping
            </button>
          </>
        )}

        {status === "failed" && (
          <>
            <div className="text-6xl mb-4">❌</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Payment Failed
            </h1>
            <p className="text-gray-500 mb-2">
              Your eSewa payment was not completed.
            </p>
            {orderCancelled && (
              <p className="text-sm text-orange-600 bg-orange-50 rounded-lg px-3 py-2 mb-4">
                Your order has been cancelled and stock has been restored.
              </p>
            )}
            <p className="text-gray-400 text-xs mb-6">
              Please try placing your order again.
            </p>
            <button
              onClick={() => navigate("/cart")}
              className="w-full bg-red-500 text-white py-3 rounded-xl font-semibold hover:bg-red-600 transition mb-3"
            >
              Back to Cart
            </button>
            <button
              onClick={() => navigate("/orders")}
              className="w-full border border-gray-200 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-50 transition text-sm"
            >
              View My Orders
            </button>
          </>
        )}
      </div>
    </div>
  );
}

import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { verifyKhalti } from "../services/api";

export default function KhaltiCallbackPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("verifying");

  useEffect(() => {
    const verify = async () => {
      const pidx = searchParams.get("pidx");
      const paymentId = searchParams.get("paymentId");

      if (!pidx || !paymentId) {
        setStatus("failed");
        return;
      }

      try {
        const res = await verifyKhalti(pidx, paymentId);
        if (res.success) setStatus("success");
        else setStatus("failed");
      } catch {
        setStatus("failed");
      }
    };
    verify();
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-lg p-10 max-w-md w-full text-center">
        {status === "verifying" && (
          <>
            <div className="text-5xl mb-4 animate-pulse">🟣</div>
            <h1 className="text-xl font-bold text-gray-900 mb-2">
              Verifying Khalti Payment...
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
              Your Khalti payment was verified. Your order is confirmed.
            </p>
            <button
              onClick={() => navigate("/")}
              className="w-full bg-purple-600 text-white py-3 rounded-xl font-semibold hover:bg-purple-700 transition"
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
            <p className="text-gray-500 mb-6">
              Your Khalti payment could not be verified. Please try again.
            </p>
            <button
              onClick={() => navigate("/cart")}
              className="w-full bg-red-500 text-white py-3 rounded-xl font-semibold hover:bg-red-600 transition"
            >
              Back to Cart
            </button>
          </>
        )}
      </div>
    </div>
  );
}

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { placeOrder } from "../services/api";

export default function OrderConfirmationPage() {
  const navigate = useNavigate();
  const { items, subtotal, clearCart } = useCart();
  const { user } = useAuth();

  const [form, setForm] = useState({
    fullName: user?.name || "", phone: "", street: "", city: "", state: "", postalCode: "", country: "Nepal",
  });
  const [paymentMethod, setPaymentMethod] = useState("cash_on_delivery");
  const [submitted, setSubmitted] = useState(false);
  const [orderNumber, setOrderNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");

  const delivery = items.length > 0 ? 99 : 0;
  const total = subtotal + delivery;

  const validate = () => {
    const e = {};
    if (!form.fullName.trim()) e.fullName = "Required";
    if (!form.phone.trim()) e.phone = "Required";
    if (!form.street.trim()) e.street = "Required";
    if (!form.city.trim()) e.city = "Required";
    if (!form.state.trim()) e.state = "Required";
    if (!form.postalCode.trim()) e.postalCode = "Required";
    return e;
  };

  const handleSubmit = async () => {
    const e = validate();
    if (Object.keys(e).length > 0) { setErrors(e); return; }
    setLoading(true);
    setApiError("");
    try {
      const data = await placeOrder({ shippingAddress: form, paymentMethod });
      if (!data.success) { setApiError(data.message || "Order failed. Please try again."); return; }
      setOrderNumber(data.data.orderNumber);
      setSubmitted(true);
    } catch (err) {
      setApiError("Server error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-lg p-10 max-w-md w-full text-center">
          <div className="text-6xl mb-4">✅</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Order Placed!</h1>
          <p className="text-gray-500 mb-2">Thank you, {user?.name}.</p>
          <p className="text-sm font-mono bg-gray-100 rounded-lg px-4 py-2 inline-block mb-6">{orderNumber}</p>
          <button onClick={() => navigate("/")} className="block w-full bg-blue-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-blue-700 transition">
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">Order Confirmation</h1>
        {apiError && <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">{apiError}</div>}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h2 className="font-semibold text-gray-900 mb-4">Shipping Address</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { key: "fullName", label: "Full Name", col: 2 },
                  { key: "phone", label: "Phone Number", col: 2 },
                  { key: "street", label: "Street Address", col: 2 },
                  { key: "city", label: "City" },
                  { key: "state", label: "State / Province" },
                  { key: "postalCode", label: "Postal Code" },
                  { key: "country", label: "Country" },
                ].map(({ key, label, col }) => (
                  <div key={key} className={col === 2 ? "sm:col-span-2" : ""}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                    <input type="text" value={form[key]}
                      onChange={(e) => { setForm({ ...form, [key]: e.target.value }); setErrors({ ...errors, [key]: "" }); }}
                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-500 text-sm ${errors[key] ? "border-red-400" : "border-gray-200"}`} />
                    {errors[key] && <p className="text-red-500 text-xs mt-1">{errors[key]}</p>}
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h2 className="font-semibold text-gray-900 mb-4">Payment Method</h2>
              <div className="space-y-3">
                {[{ value: "cash_on_delivery", label: "💵 Cash on Delivery" }, { value: "esewa", label: "🟢 eSewa" }, { value: "khalti", label: "🟣 Khalti" }].map((opt) => (
                  <label key={opt.value} className="flex items-center gap-3 cursor-pointer">
                    <input type="radio" name="payment" value={opt.value} checked={paymentMethod === opt.value} onChange={() => setPaymentMethod(opt.value)} className="accent-blue-600" />
                    <span className="text-sm font-medium text-gray-700">{opt.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-gray-100 p-5 sticky top-6">
              <h2 className="font-semibold text-gray-900 mb-4">Order Summary</h2>
              {items.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-4">Cart is empty</p>
              ) : (
                <div className="space-y-2 mb-4">
                  {items.map((item) => {
                    const name = (item.product?.name || item.name || "Product");
                    return (
                      <div key={item._id} className="flex justify-between text-sm">
                        <span className="text-gray-600 truncate pr-2">{name} × {item.quantity}</span>
                        <span className="text-gray-900 font-medium flex-shrink-0">Rs. {(item.price * item.quantity).toLocaleString()}</span>
                      </div>
                    );
                  })}
                </div>
              )}
              <div className="border-t border-gray-100 pt-4 space-y-2 text-sm">
                <div className="flex justify-between text-gray-500"><span>Subtotal</span><span>Rs. {subtotal.toLocaleString()}</span></div>
                <div className="flex justify-between text-gray-500"><span>Delivery</span><span>Rs. {delivery}</span></div>
                <div className="flex justify-between font-bold text-gray-900 text-base pt-2 border-t border-gray-100"><span>Total</span><span>Rs. {total.toLocaleString()}</span></div>
              </div>
              <div className="mt-6 space-y-3">
                <button onClick={handleSubmit} disabled={loading || items.length === 0}
                  className="w-full bg-blue-600 text-white text-sm font-semibold py-3 rounded-xl hover:bg-blue-700 transition disabled:opacity-60">
                  {loading ? "Placing Order..." : "Confirm Order"}
                </button>
                <button onClick={() => navigate("/cart")}
                  className="w-full bg-white text-gray-700 text-sm font-semibold py-3 rounded-xl border border-gray-200 hover:bg-gray-50 transition">
                  ← Back to Cart
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import React from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";

// Extract raw ObjectId string whether product is populated or not
const getProductId = (item) => {
  if (!item.product) return "";
  if (typeof item.product === "string") return item.product;
  if (item.product._id) return item.product._id.toString();
  return item.product.toString();
};

export default function CartPage() {
  const { items, updateQty, removeItem, subtotal, itemCount, loading } =
    useCart();
  const navigate = useNavigate();
  const delivery = items.length > 0 ? 99 : 0;
  const total = subtotal + delivery;

  if (loading)
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-400">
        Loading cart...
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-gray-900">
            Your Cart{" "}
            <span className="text-base font-normal text-gray-400">
              {itemCount} item{itemCount !== 1 ? "s" : ""}
            </span>
          </h1>
          <button
            onClick={() => navigate("/")}
            className="text-sm text-blue-600 hover:underline"
          >
            ← Continue Shopping
          </button>
        </div>

        {items.length === 0 ? (
          <div className="text-center py-24 text-gray-400">
            <div className="text-5xl mb-4">🛒</div>
            <p className="text-lg font-medium">Your cart is empty</p>
            <button
              onClick={() => navigate("/")}
              className="mt-6 bg-gray-900 text-white px-6 py-2 rounded-xl text-sm font-medium hover:bg-gray-800"
            >
              Shop Now
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 flex flex-col gap-4">
              {items.map((item) => {
                const productId = getProductId(item);
                const product =
                  typeof item.product === "object" ? item.product : {};
                const name = product.name || "Product";
                const thumb = product.thumbnail;

                return (
                  <div
                    key={item._id || productId}
                    className="bg-white rounded-2xl border border-gray-100 p-4 flex gap-4 items-start"
                  >
                    <div className="w-20 h-20 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {thumb ? (
                        <img
                          src={thumb}
                          alt={name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-3xl">📦</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 text-sm truncate mb-3">
                        {name}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                          <button
                            onClick={() =>
                              updateQty(productId, item.quantity - 1)
                            }
                            className="w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-gray-50 text-lg"
                          >
                            −
                          </button>
                          <span className="w-8 h-8 flex items-center justify-center text-sm font-medium border-x border-gray-200">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              updateQty(productId, item.quantity + 1)
                            }
                            className="w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-gray-50 text-lg"
                          >
                            +
                          </button>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-semibold text-gray-900 text-sm">
                            Rs. {(item.price * item.quantity).toLocaleString()}
                          </span>
                          <button
                            onClick={() => removeItem(productId)}
                            className="text-xs text-red-400 hover:text-red-600"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl border border-gray-100 p-5 sticky top-6">
                <h2 className="font-semibold text-gray-900 mb-4">
                  Order summary
                </h2>
                <div className="space-y-2.5 text-sm">
                  <div className="flex justify-between text-gray-500">
                    <span>Subtotal</span>
                    <span>Rs. {subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-gray-500">
                    <span>Delivery</span>
                    <span>Rs. {delivery}</span>
                  </div>
                </div>
                <div className="border-t border-gray-100 my-4" />
                <div className="flex justify-between font-semibold text-gray-900">
                  <span>Total</span>
                  <span>Rs. {total.toLocaleString()}</span>
                </div>
                <button
                  onClick={() => navigate("/order-confirmation")}
                  className="mt-4 w-full bg-gray-900 text-white text-sm font-medium py-3 rounded-xl hover:bg-gray-800 transition"
                >
                  Proceed to checkout →
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

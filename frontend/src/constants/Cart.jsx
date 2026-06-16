import { useCart } from "../context/CartContext";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { Trash2, Plus, Minus, ShoppingCart } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Cart() {
  const navigate = useNavigate();
  const { items, removeItem, updateQty, subtotal, itemCount } = useCart();

  const shipping = subtotal > 5000 ? 0 : 250;
  const tax = Math.round(subtotal * 0.1);
  const totalAmount = subtotal + shipping + tax;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <div className="flex-1 max-w-7xl mx-auto w-full px-4 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Shopping Cart{" "}
            <span className="text-lg font-normal text-gray-400">
              ({itemCount} {itemCount === 1 ? "item" : "items"})
            </span>
          </h1>
        </div>

        {items.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <ShoppingCart size={48} className="mx-auto text-gray-300 mb-4" />
            <h2 className="text-2xl font-semibold text-gray-600 mb-2">
              Your cart is empty
            </h2>
            <p className="text-gray-500 mb-6">Add some items to get started</p>
            <button
              onClick={() => navigate("/")}
              className="bg-primary text-white px-6 py-2 rounded-lg hover:opacity-90 transition"
            >
              Continue Shopping
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              {items.map((item) => {
                const product = item.product || {};
                const name = product.name || "Product";
                const thumb = product.thumbnail;
                const productId = (product._id || "").toString();
                return (
                  <div
                    key={item._id || productId}
                    className="bg-white rounded-lg shadow p-4 flex gap-4 hover:shadow-md transition"
                  >
                    <div className="w-24 h-24 rounded-lg bg-gray-100 flex-shrink-0 overflow-hidden">
                      {thumb ? (
                        <img
                          src={thumb}
                          alt={name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="w-full h-full flex items-center justify-center text-3xl">
                          📦
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 text-sm truncate mb-1">
                        {name}
                      </h3>
                      <p className="text-sm font-bold text-primary mb-3">
                        Rs. {item.price?.toLocaleString()}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center border border-gray-200 rounded-lg">
                          <button
                            onClick={() =>
                              updateQty(productId, item.quantity - 1)
                            }
                            className="w-8 h-8 flex items-center justify-center hover:bg-gray-50 text-gray-600"
                          >
                            <Minus size={16} />
                          </button>
                          <span className="w-8 h-8 flex items-center justify-center font-semibold border-x border-gray-200">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              updateQty(productId, item.quantity + 1)
                            }
                            className="w-8 h-8 flex items-center justify-center hover:bg-gray-50 text-gray-600"
                          >
                            <Plus size={16} />
                          </button>
                        </div>
                        <button
                          onClick={() => removeItem(productId)}
                          className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded transition"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="font-semibold text-gray-900">
                        Rs. {(item.price * item.quantity).toLocaleString()}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow p-6 sticky top-4">
                <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
                <div className="space-y-3 mb-4 pb-4 border-b border-gray-200">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium">
                      Rs. {subtotal.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">
                      Shipping{" "}
                      {shipping === 0 && (
                        <span className="text-green-600">(Free)</span>
                      )}
                    </span>
                    <span className="font-medium">
                      {shipping === 0 ? "Free" : `Rs. ${shipping}`}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Tax (10%)</span>
                    <span className="font-medium">
                      Rs. {tax.toLocaleString()}
                    </span>
                  </div>
                </div>
                <div className="flex justify-between text-lg font-bold mb-6">
                  <span>Total</span>
                  <span className="text-primary">
                    Rs. {totalAmount.toLocaleString()}
                  </span>
                </div>
                <button
                  onClick={() => navigate("/order-confirmation")}
                  className="w-full bg-primary text-white font-semibold py-3 rounded-lg hover:opacity-90 transition mb-3"
                >
                  Proceed to Checkout
                </button>
                <button
                  onClick={() => navigate("/")}
                  className="w-full border border-primary text-primary font-semibold py-3 rounded-lg hover:bg-primary hover:text-white transition"
                >
                  Continue Shopping
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}

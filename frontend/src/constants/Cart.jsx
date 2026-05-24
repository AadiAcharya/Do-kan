import { useState } from "react";

const initialItems = [
  {
    id: 1,
    name: "Nike Air Max 270",
    meta: "Size: UK 9  ·  Colour: Black / White",
    emoji: "👟",
    price: 4299,
    qty: 1,
    sale: true,
  },
  {
    id: 2,
    name: "Oversized Cotton Tee",
    meta: "Size: L  ·  Colour: Washed Olive",
    emoji: "👕",
    price: 599,
    qty: 2,
    sale: false,
  },
  {
    id: 3,
    name: "Urban Daypack 20L",
    meta: "Colour: Charcoal  ·  One size",
    emoji: "🎒",
    price: 2499,
    qty: 1,
    sale: false,
  },
];

export default function Cart() {
  const [items, setItems] = useState(initialItems);
  const [promo, setPromo] = useState("");

  const updateQty = (id, delta) => {
    setItems((prev) =>
      prev
        .map((item) =>
          item.id === id ? { ...item, qty: item.qty + delta } : item
        )
        .filter((item) => item.qty > 0)
    );
  };

  const removeItem = (id) => setItems((prev) => prev.filter((i) => i.id !== id));

  const subtotal = items.reduce((sum, i) => sum + i.price * i.qty, 0);
  const discount = items.some((i) => i.sale) ? 500 : 0;
  const delivery = 99;
  const total = subtotal - discount + delivery;

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900">
            Your Cart{" "}
            <span className="text-base font-normal text-gray-400">
              {items.length} item{items.length !== 1 ? "s" : ""}
            </span>
          </h1>
        </div>

        {items.length === 0 ? (
          <div className="text-center py-24 text-gray-400">
            <div className="text-5xl mb-4">🛒</div>
            <p className="text-lg font-medium">Your cart is empty</p>
            <p className="text-sm mt-1">Add some items to get started</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Items */}
            <div className="lg:col-span-2 flex flex-col gap-4">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl border border-gray-100 p-4 flex gap-4 items-start"
                >
                  {/* Thumbnail */}
                  <div className="w-20 h-20 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center text-3xl flex-shrink-0">
                    {item.emoji}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium text-gray-900 text-sm truncate">
                        {item.name}
                      </p>
                      {item.sale && (
                        <span className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full font-medium flex-shrink-0">
                          Sale
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 mb-3">{item.meta}</p>

                    <div className="flex items-center justify-between">
                      {/* Qty control */}
                      <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                        <button
                          onClick={() => updateQty(item.id, -1)}
                          className="w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors text-lg"
                        >
                          −
                        </button>
                        <span className="w-8 h-8 flex items-center justify-center text-sm font-medium border-x border-gray-200">
                          {item.qty}
                        </span>
                        <button
                          onClick={() => updateQty(item.id, 1)}
                          className="w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors text-lg"
                        >
                          +
                        </button>
                      </div>

                      {/* Price + remove */}
                      <div className="flex items-center gap-3">
                        <span className="font-semibold text-gray-900 text-sm">
                          Rs. {(item.price * item.qty).toLocaleString()}
                        </span>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-xs text-red-400 hover:text-red-600 transition-colors"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              <p className="text-xs text-gray-400 flex items-center gap-1.5 mt-1">
                <span>🔒</span> Free returns within 30 days on all orders.
              </p>
            </div>

            {/* Summary */}
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
                  {discount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount (Sale)</span>
                      <span>− Rs. {discount.toLocaleString()}</span>
                    </div>
                  )}
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

                {/* Promo */}
                <div className="flex gap-2 mt-4">
                  <input
                    type="text"
                    value={promo}
                    onChange={(e) => setPromo(e.target.value)}
                    placeholder="Promo code"
                    className="flex-1 text-sm px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 outline-none focus:border-gray-400 transition-colors"
                  />
                  <button className="text-sm px-3 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-gray-600">
                    Apply
                  </button>
                </div>

                <button className="mt-4 w-full bg-gray-900 text-white text-sm font-medium py-3 rounded-xl hover:bg-gray-800 transition-colors">
                  Proceed to checkout →
                </button>

                <p className="text-xs text-gray-400 text-center mt-3">
                  🔒 Secure checkout
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
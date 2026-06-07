import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchProductById } from "../services/api";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addItem, itemCount } = useCart();
  const { isLoggedIn } = useAuth();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [cartMsg, setCartMsg] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const data = await fetchProductById(id);
      if (!data) setNotFound(true);
      else setProduct(data);
      setLoading(false);
    };
    load();
  }, [id]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-400">Loading product...</div>
  );

  if (notFound || !product) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-gray-400">
      <p className="text-lg font-medium mb-4">Product not found.</p>
      <button onClick={() => navigate("/")} className="text-blue-600 hover:underline text-sm">← Back to Home</button>
    </div>
  );

  const images = product.images?.length > 0 ? product.images : [product.thumbnail].filter(Boolean);
  const discount = product.compareAtPrice
    ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100) : 0;

  const handleAddToCart = async () => {
    if (!isLoggedIn) { navigate("/login"); return; }
    const result = await addItem(product._id, quantity);
    if (result?.error) { setCartMsg(result.error); return; }
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <button onClick={() => navigate("/")} className="text-2xl font-bold text-blue-600">DOKAN</button>
          <button onClick={() => navigate("/cart")} className="relative text-sm font-medium hover:text-blue-600">
            🛒 Cart
            {itemCount > 0 && <span className="absolute -top-2 -right-3 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">{itemCount}</span>}
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <nav className="text-sm text-gray-400 mb-6">
          <span className="hover:text-blue-600 cursor-pointer" onClick={() => navigate("/")}>Home</span>
          {product.category && <> / <span className="text-gray-500">{product.category.name}</span></>}
          / <span className="text-gray-700">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Gallery */}
          <div>
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden mb-4 relative">
              {images.length > 0 ? (
                <img src={images[selectedImage]} alt={product.name} className="w-full h-96 object-contain p-4" />
              ) : (
                <div className="w-full h-96 flex items-center justify-center text-6xl">📦</div>
              )}
              {product.stock === 0 && (
                <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center rounded-2xl">
                  <span className="bg-white text-gray-800 font-bold px-4 py-2 rounded-lg">Out of Stock</span>
                </div>
              )}
            </div>
            {images.length > 1 && (
              <div className="flex gap-3">
                {images.map((img, i) => (
                  <button key={i} onClick={() => setSelectedImage(i)}
                    className={`w-16 h-16 rounded-lg border-2 overflow-hidden flex-shrink-0 ${selectedImage === i ? "border-blue-500" : "border-gray-200"}`}>
                    <img src={img} alt={`view ${i + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{product.name}</h1>
            {product.sku && <p className="text-xs text-gray-400 mb-3">SKU: {product.sku}</p>}

            <div className="flex items-center gap-3 mb-6">
              <span className="text-3xl font-bold text-gray-900">Rs. {product.price?.toLocaleString()}</span>
              {product.compareAtPrice && <span className="text-lg text-gray-400 line-through">Rs. {product.compareAtPrice?.toLocaleString()}</span>}
              {discount > 0 && <span className="bg-green-100 text-green-700 text-sm font-semibold px-2 py-1 rounded-full">{discount}% OFF</span>}
            </div>

            <p className="text-sm text-gray-600 leading-relaxed mb-6">{product.description}</p>

            <div className="flex items-center gap-4 mb-6">
              <p className="text-sm font-medium text-gray-700">Quantity</p>
              <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                <button onClick={() => setQuantity((q) => Math.max(1, q - 1))} className="w-9 h-9 flex items-center justify-center text-gray-500 hover:bg-gray-50 text-lg">−</button>
                <span className="w-9 h-9 flex items-center justify-center text-sm font-medium border-x border-gray-200">{quantity}</span>
                <button onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))} className="w-9 h-9 flex items-center justify-center text-gray-500 hover:bg-gray-50 text-lg">+</button>
              </div>
              <span className="text-sm text-gray-400">{product.stock} in stock</span>
            </div>

            {cartMsg && <p className="text-red-500 text-sm mb-3">{cartMsg}</p>}

            <div className="flex gap-3 mb-6">
              <button onClick={handleAddToCart} disabled={product.stock === 0}
                className={`flex-1 py-3 rounded-xl font-semibold text-sm transition disabled:opacity-50 ${added ? "bg-green-600 text-white" : "bg-gray-900 text-white hover:bg-gray-800"}`}>
                {product.stock === 0 ? "Out of Stock" : added ? "✓ Added!" : "Add to Cart"}
              </button>
              <button onClick={() => { handleAddToCart().then(() => navigate("/cart")); }}
                disabled={product.stock === 0}
                className="flex-1 py-3 rounded-xl font-semibold text-sm bg-blue-600 text-white hover:bg-blue-700 transition disabled:opacity-50">
                Buy Now
              </button>
            </div>

            {/* Seller */}
            {product.vendor && (
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                <p className="text-sm font-medium text-gray-700 mb-1">Sold by</p>
                <p className="font-semibold text-gray-900">{product.vendor.storeName}</p>
                {product.vendor.rating > 0 && <p className="text-sm text-yellow-500">★ {product.vendor.rating} seller rating</p>}
              </div>
            )}

            {/* Specs */}
            <div className="mt-6 border-t border-gray-100 pt-4 space-y-1 text-sm text-gray-500">
              {product.category && <p><span className="font-medium text-gray-700">Category:</span> {product.category.name}</p>}
              {product.sku && <p><span className="font-medium text-gray-700">SKU:</span> {product.sku}</p>}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

import React, { useEffect, useState } from "react";
import { ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ProductCard from "./ProductCard";
import { fetchProducts } from "../services/api";

const FlashDealsGadgets = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true);
      const data = await fetchProducts({ limit: 5 });
      setProducts(data);
      setLoading(false);
    };
    loadProducts();
  }, []);

  return (
    <section className="max-w-7xl mx-auto px-4 py-8">
      <div className="bg-primary-200 rounded-lg p-4 mb-6 flex justify-between items-center">
        <p className="font-bold text-sm">Flash Deals and Gadgets</p>
        <ChevronRight size={20} className="text-primary-600" />
      </div>

      {loading ? (
        <div className="grid grid-cols-5 gap-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="bg-gray-200 h-48 rounded animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-5 gap-4">
          {products.map((product) => (
            <ProductCard
              key={product._id}
              product={product}
              onClick={() => navigate(`/product/${product._id}`)}
            />
          ))}
        </div>
      )}
    </section>
  );
};

export default FlashDealsGadgets;

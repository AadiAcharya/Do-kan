import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ProductCard from "./ProductCard";
import { fetchProducts } from "../services/api";

const BiggestSale = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true);
      const data = await fetchProducts({ limit: 4 });
      setProducts(data);
      setLoading(false);
    };
    loadProducts();
  }, []);

  return (
    <section className="max-w-7xl mx-auto px-4 py-8">
      <h2 className="text-3xl font-bold mb-2">
        <span className="text-black">11.11</span>
        <span className="text-secondary ml-2">Biggest sale</span>
      </h2>

      <div className="bg-primary-200 rounded-lg p-4 mb-6">
        <p className="font-bold text-sm">Flash Sale</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-gray-200 h-48 rounded animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-4 gap-4">
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

export default BiggestSale;

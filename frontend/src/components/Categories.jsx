import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ProductCard from "./ProductCard";
import { fetchProducts } from "../services/api";

const Categories = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true);
      const data = await fetchProducts({ limit: 12 });
      setProducts(data);
      setLoading(false);
    };
    loadProducts();
  }, []);

  return (
    <section className="max-w-7xl mx-auto px-4 py-8">
      <div className="bg-primary-200 rounded-lg p-4 mb-6">
        <p className="font-bold text-sm">Categories</p>
      </div>

      {loading ? (
        <>
          <div className="grid grid-cols-6 gap-4 mb-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-gray-200 h-48 rounded animate-pulse" />
            ))}
          </div>
          <div className="grid grid-cols-6 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-gray-200 h-48 rounded animate-pulse" />
            ))}
          </div>
        </>
      ) : (
        <>
          <div className="grid grid-cols-6 gap-4 mb-8">
            {products.slice(0, 6).map((product) => (
              <ProductCard
                key={product._id}
                product={product}
                onClick={() => navigate(`/product/${product._id}`)}
              />
            ))}
          </div>

          <div className="grid grid-cols-6 gap-4">
            {products.slice(6, 12).map((product) => (
              <ProductCard
                key={product._id}
                product={product}
                onClick={() => navigate(`/product/${product._id}`)}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
};

export default Categories;

import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Banner from "../components/Banner";
import BiggestSale from "../components/BiggestSale";
import FlashSale from "../components/FlashSale";
import Categories from "../components/Categories";
import GrabDealByBrands from "../components/GrabDealByBrands";
import FlashDealsGadgets from "../components/FlashDealsGadgets";
import Footer from "../components/Footer";
import ProductCard from "../components/ProductCard";
import { fetchProducts } from "../services/api";

function HomePage() {
  const [searchParams] = useSearchParams();
  const search = searchParams.get("search") || "";
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!search.trim()) {
      setProducts([]);
      return;
    }

    const loadProducts = async () => {
      setLoading(true);
      try {
        const data = await fetchProducts({ search: search.trim() });
        setProducts(data);
      } catch (err) {
        console.error("Error loading searched products:", err);
      } finally {
        setLoading(false);
      }
    };

    const debounceTimeout = setTimeout(loadProducts, 300);
    return () => clearTimeout(debounceTimeout);
  }, [search]);

  return (
    <div className="bg-gray-50 min-h-screen flex flex-col justify-between">
      <div>
        <Header />
        
        {search.trim() ? (
          <div className="max-w-7xl mx-auto px-4 py-8 min-h-[50vh]">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">
              Search Results for <span className="text-blue-600">"{search}"</span>
            </h2>

            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="bg-gray-200 h-64 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : products.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {products.map((product) => (
                  <ProductCard
                    key={product._id}
                    product={product}
                    onClick={() => navigate(`/product/${product._id}`)}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500 font-medium">
                No products found matching your search.
              </div>
            )}
          </div>
        ) : (
          <>
            <Banner />
            <BiggestSale />
            <FlashSale />
            <Categories />
            <GrabDealByBrands />
            <FlashDealsGadgets />
          </>
        )}
      </div>
      <Footer />
    </div>
  );
}

export default HomePage;

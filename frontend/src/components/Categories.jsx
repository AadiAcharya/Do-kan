import React from "react";
import ProductCard from "./ProductCard";

const Categories = () => {
  return (
    <section className="max-w-7xl mx-auto px-4 py-8">
      <div className="bg-primary-200 rounded-lg p-4 mb-6">
        <p className="font-bold text-sm">Categories</p>
      </div>

      <div className="grid grid-cols-6 gap-4 mb-8">
        {[1, 2, 3, 4, 5, 6].map((item) => (
          <ProductCard key={item} />
        ))}
      </div>

      <div className="grid grid-cols-6 gap-4">
        {[1, 2, 3, 4, 5, 6].map((item) => (
          <ProductCard key={item} />
        ))}
      </div>
    </section>
  );
};

export default Categories;

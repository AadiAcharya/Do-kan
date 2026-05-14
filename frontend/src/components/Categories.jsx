import React from "react";

const ProductCard = () => {
  return (
    <div className="bg-orange-100 rounded-lg p-4 text-center hover:shadow-lg transition">
      <div className="bg-gray-300 h-24 rounded mb-3 flex items-center justify-center">
        <span className="text-gray-400 text-xs">Image</span>
      </div>
      <p className="font-semibold text-xs mb-1">Product</p>
      <p className="text-gray-600 text-xs">$19.99</p>
    </div>
  );
};

const Categories = () => {
  return (
    <section className="max-w-7xl mx-auto px-4 py-8">
      <div className="bg-orange-200 rounded-lg p-4 mb-6">
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

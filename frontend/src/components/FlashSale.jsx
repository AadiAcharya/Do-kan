import React from "react";

const ProductCard = () => {
  return (
    <div className="bg-orange-100 rounded-lg p-4 text-center hover:shadow-lg transition">
      <div className="bg-gray-300 h-32 rounded mb-3 flex items-center justify-center">
        <span className="text-gray-400">Product Image</span>
      </div>
      <p className="font-semibold text-sm mb-1">Product Name</p>
      <p className="text-gray-600 text-xs mb-2">Category</p>
      <div className="flex justify-between items-center">
        <span className="font-bold text-sm">$19.99</span>
        <span className="text-orange-500 text-xs line-through">$29.99</span>
      </div>
    </div>
  );
};

const FlashSale = () => {
  return (
    <section className="max-w-7xl mx-auto px-4 py-8">
      <div className="bg-orange-200 rounded-lg p-4 mb-6">
        <p className="font-bold text-sm">Flash Sale</p>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((item) => (
          <ProductCard key={item} />
        ))}
      </div>
    </section>
  );
};

export default FlashSale;

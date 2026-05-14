import React from "react";
import { ChevronRight } from "lucide-react";

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

const FlashDealsGadgets = () => {
  return (
    <section className="max-w-7xl mx-auto px-4 py-8">
      <div className="bg-orange-200 rounded-lg p-4 mb-6 flex justify-between items-center">
        <p className="font-bold text-sm">Flash Deals and Gadgets</p>
        <ChevronRight size={20} className="text-orange-600" />
      </div>

      <div className="grid grid-cols-5 gap-4">
        {[1, 2, 3, 4, 5].map((item) => (
          <ProductCard key={item} />
        ))}
      </div>
    </section>
  );
};

export default FlashDealsGadgets;

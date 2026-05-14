import React from "react";
import ProductCard from "./ProductCard";

const FlashSale = () => {
  return (
    <section className="max-w-7xl mx-auto px-4 py-8">
      <div className="bg-primary-200 rounded-lg p-4 mb-6">
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

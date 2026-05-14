import React from "react";
import ProductCard from "./ProductCard";

const BiggestSale = () => {
  return (
    <section className="max-w-7xl mx-auto px-4 py-8">
      <h2 className="text-3xl font-bold mb-2">
        <span className="text-black">11.11</span>
        <span className="text-purple-600 ml-2">Biggest sale</span>
      </h2>

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

export default BiggestSale;

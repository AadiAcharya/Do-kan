import React from "react";
import ProductCard from "./ProductCard";

const GrabDealByBrands = () => {
  return (
    <section className="max-w-7xl mx-auto px-4 py-8">
      <div className="bg-primary-200 rounded-lg p-4 mb-6">
        <p className="font-bold text-sm">
          Grab Deal By Brands (Electronics Items)
        </p>
      </div>

      <div className="grid grid-cols-5 gap-4 mb-8">
        {[1, 2, 3, 4, 5].map((item) => (
          <ProductCard key={item} />
        ))}
      </div>

      <div className="grid grid-cols-5 gap-4">
        {[1, 2, 3, 4, 5].map((item) => (
          <ProductCard key={item} />
        ))}
      </div>
    </section>
  );
};

export default GrabDealByBrands;

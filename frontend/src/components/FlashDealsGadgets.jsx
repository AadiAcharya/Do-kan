import React from "react";
import { ChevronRight } from "lucide-react";
import ProductCard from "./ProductCard";

const FlashDealsGadgets = () => {
  return (
    <section className="max-w-7xl mx-auto px-4 py-8">
      <div className="bg-primary-200 rounded-lg p-4 mb-6 flex justify-between items-center">
        <p className="font-bold text-sm">Flash Deals and Gadgets</p>
        <ChevronRight size={20} className="text-primary-600" />
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

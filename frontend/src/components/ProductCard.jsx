import React from "react";

const DUMMY_IMAGE = "https://via.placeholder.com/300x300?text=Product";

const ProductCard = () => {
  return (
    <div className="bg-primary-100 rounded-lg p-4 text-center hover:shadow-lg transition">
      <div className="bg-gray-300 h-32 rounded mb-3 flex items-center justify-center overflow-hidden">
        <img
          src={DUMMY_IMAGE}
          alt="Product"
          className="w-full h-full object-cover"
        />
      </div>
      <p className="font-semibold text-sm mb-1">Product Name</p>
      <p className="text-gray-600 text-xs mb-2">Category</p>
      <div className="flex justify-between items-center">
        <span className="font-bold text-sm">$19.99</span>
        <span className="text-primary-500 text-xs line-through">$29.99</span>
      </div>
    </div>
  );
};

export default ProductCard;

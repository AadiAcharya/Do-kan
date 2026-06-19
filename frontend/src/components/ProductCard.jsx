import React, { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import StarRating from "./StarRating";

const ProductCard = ({ product, onClick }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const images =
    product?.images && product.images.length > 0
      ? product.images
      : [
          product?.thumbnail ||
            "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=300&fit=crop",
        ];

  const goToPrevImage = (e) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const goToNextImage = (e) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const goToImage = (index, e) => {
    e.stopPropagation();
    setCurrentImageIndex(index);
  };

  const currentImage = images[currentImageIndex];
  const outOfStock = product?.stock === 0;

  return (
    <div
      className="bg-white rounded-lg shadow hover:shadow-lg transition cursor-pointer overflow-hidden"
      onClick={onClick}
    >
      {/* Image Gallery */}
      <div className="relative bg-gray-100 h-40 overflow-hidden group">
        <img
          src={currentImage}
          alt={product?.name}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.src =
              "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=300&fit=crop";
          }}
        />

        {/* Out of Stock Overlay */}
        {outOfStock && (
          <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
            <span className="text-white font-bold text-lg">Out of Stock</span>
          </div>
        )}

        {/* Navigation Arrows */}
        {images.length > 1 && !outOfStock && (
          <>
            <button
              onClick={goToPrevImage}
              className="absolute left-1 top-1/2 -translate-y-1/2 bg-white bg-opacity-75 hover:bg-opacity-100 rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={goToNextImage}
              className="absolute right-1 top-1/2 -translate-y-1/2 bg-white bg-opacity-75 hover:bg-opacity-100 rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
            >
              <ChevronRight size={16} />
            </button>
          </>
        )}

        {/* Image Counter */}
        {images.length > 1 && (
          <div className="absolute top-2 right-2 bg-black bg-opacity-60 text-white px-2 py-1 rounded text-xs font-semibold">
            {currentImageIndex + 1}/{images.length}
          </div>
        )}
      </div>

      {/* Thumbnail Dots */}
      {images.length > 1 && (
        <div className="flex justify-center gap-1 py-2 bg-gray-50">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={(e) => goToImage(index, e)}
              className={`h-2 rounded-full transition ${
                index === currentImageIndex
                  ? "bg-primary w-4"
                  : "bg-gray-300 hover:bg-gray-400 w-2"
              }`}
              title={`Image ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Product Info */}
      <div className="p-3">
        <p className="font-semibold text-sm mb-1 line-clamp-2">
          {product?.name || "Product Name"}
        </p>
        {(product?.rating > 0 || product?.reviewCount > 0) && (
          <div className="flex items-center gap-1 mb-1">
            <StarRating rating={product.rating || 0} size="sm" />
            <span className="text-xs text-gray-400">({product.reviewCount || 0})</span>
          </div>
        )}
        <p className="text-gray-500 text-xs mb-2">
          {product?.category?.name || "Category"}
        </p>

        {/* Stock Status */}
        {product?.stock !== undefined && (
          <p
            className={`text-xs font-medium mb-2 ${
              outOfStock
                ? "text-red-600"
                : product?.stock < 10
                  ? "text-orange-600"
                  : "text-green-600"
            }`}
          >
            {outOfStock ? "Out of Stock" : `${product.stock} in stock`}
          </p>
        )}

        {/* Pricing */}
        <div className="flex justify-between items-center">
          <span className="font-bold text-sm text-primary">
            Rs. {product?.price || "0"}
          </span>
          {product?.compareAtPrice && (
            <span className="text-gray-500 text-xs line-through">
              Rs. {product.compareAtPrice}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;

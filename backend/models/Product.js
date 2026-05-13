const mongoose = require("mongoose");

const variantSchema = new mongoose.Schema({
  name: { type: String, required: true }, // e.g. "Red / XL"
  attributes: {
    color: String,
    size: String,
    material: String,
    // extendable with any key-value
  },
  sku: { type: String, required: true },
  price: { type: Number, required: true },
  compareAtPrice: Number, // original price before discount
  stock: { type: Number, required: true, default: 0 },
  images: [String], // Cloudinary URLs specific to this variant
  isActive: { type: Boolean, default: true },
});

const productSchema = new mongoose.Schema(
  {
    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vendor",
      required: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },

    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    description: { type: String, required: true },
    shortDescription: String,

    // Pricing (base / simple product)
    price: { type: Number, required: true },
    compareAtPrice: Number,
    costPrice: Number, // for vendor's reference only

    // SKU for simple products (no variants)
    sku: { type: String },

    // Images
    images: [String], // Cloudinary URLs
    thumbnail: String, // primary image

    // Variants (optional — empty array = simple product)
    variants: [variantSchema],
    hasVariants: { type: Boolean, default: false },

    // Stock (used when hasVariants = false)
    stock: { type: Number, default: 0 },
    lowStockThreshold: { type: Number, default: 5 },

    // Shipping
    weight: Number, // kg
    dimensions: {
      length: Number,
      width: Number,
      height: Number,
    },
    isFreeShipping: { type: Boolean, default: false },

    // Status
    status: {
      type: String,
      enum: ["draft", "pending_approval", "active", "rejected", "archived"],
      default: "pending_approval",
    },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    approvedAt: Date,
    rejectionReason: String,

    // Analytics
    rating: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },
    soldCount: { type: Number, default: 0 },
    viewCount: { type: Number, default: 0 },

    // SEO
    metaTitle: String,
    metaDescription: String,
    tags: [String],

    // Discounts
    discountType: { type: String, enum: ["percentage", "flat"] },
    discountValue: Number,
    discountStartDate: Date,
    discountEndDate: Date,

    isFeatured: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

productSchema.index({ vendor: 1 });
productSchema.index({ category: 1 });
productSchema.index({ slug: 1 });
productSchema.index({ status: 1 });
productSchema.index({ price: 1 });
productSchema.index({ rating: -1 });
productSchema.index({ soldCount: -1 });
productSchema.index({ name: "text", description: "text", tags: "text" }); // full-text search

module.exports = mongoose.model("Product", productSchema);
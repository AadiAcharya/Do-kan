// Category.js
const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    description: String,
    image: String, // Cloudinary URL

    // Subcategory support
    parent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      default: null, // null = top-level category
    },

    isActive: { type: Boolean, default: true },
    displayOrder: { type: Number, default: 0 }, // for custom sorting in UI
  },
  { timestamps: true },
);

categorySchema.index({ slug: 1 });
categorySchema.index({ parent: 1 });

module.exports = mongoose.model("Category", categorySchema);

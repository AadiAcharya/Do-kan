const mongoose = require("mongoose");

const cartItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  vendor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Vendor",
    required: true,
  },
  variant: {
    variantId: mongoose.Schema.Types.ObjectId,
    name: String,
    color: String,
    size: String,
    material: String,
  },
  quantity: { type: Number, required: true, min: 1, default: 1 },
  price: { type: Number, required: true },
  addedAt: { type: Date, default: Date.now },
});

// NOTE: Removed the bad index { cart: 1, product: 1 } — 'cart' does not
// exist on cart items. Uniqueness per product is enforced in the controller.

const cartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    items: [cartItemSchema],
    couponCode: String,
    couponDiscount: { type: Number, default: 0 },
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  },
  { timestamps: true },
);

cartSchema.virtual("total").get(function () {
  return this.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
});

cartSchema.index({ user: 1 });

module.exports = mongoose.model("Cart", cartSchema);

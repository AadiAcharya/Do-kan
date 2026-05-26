const mongoose = require("mongoose");

// Embedded snapshot of each line item at time of purchase
const orderItemSchema = new mongoose.Schema({
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

  // Snapshot (in case product changes later)
  productName: { type: String, required: true },
  productImage: String,
  sku: String,
  variant: {
    name: String,
    color: String,
    size: String,
    material: String,
  },

  quantity: { type: Number, required: true, min: 1 },
  unitPrice: { type: Number, required: true },
  totalPrice: { type: Number, required: true },

  // Per-item fulfillment
  status: {
    type: String,
    enum: [
      "pending",
      "confirmed",
      "processing",
      "shipped",
      "delivered",
      "cancelled",
      "returned",
    ],
    default: "pending",
  },
  trackingNumber: String,
  shippedAt: Date,
  deliveredAt: Date,

  // Commission
  commissionRate: Number,
  commissionAmount: Number,
  vendorEarning: Number,

  review: { type: mongoose.Schema.Types.ObjectId, ref: "Review" },
});

const orderSchema = new mongoose.Schema(
  {
    orderNumber: { type: String, required: true, unique: true }, // e.g. "DOK-20260001"
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    items: [orderItemSchema],

    // Address snapshot at time of order
    shippingAddress: {
      fullName: { type: String, required: true },
      phone: { type: String, required: true },
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      postalCode: { type: String, required: true },
      country: { type: String, required: true },
    },

    // Pricing
    subtotal: { type: Number, required: true },
    shippingCharge: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    couponCode: String,
    couponDiscount: { type: Number, default: 0 },
    total: { type: Number, required: true },

    // Payment
    paymentMethod: {
      type: String,
      enum: ["stripe", "khalti", "esewa", "cash_on_delivery"],
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded", "partially_refunded"],
      default: "pending",
    },
    payment: { type: mongoose.Schema.Types.ObjectId, ref: "Payment" },
    paidAt: Date,

    // Overall order status
    status: {
      type: String,
      enum: [
        "pending",
        "confirmed",
        "processing",
        "partially_shipped",
        "shipped",
        "delivered",
        "cancelled",
        "refund_requested",
        "refunded",
      ],
      default: "pending",
    },
    cancelledAt: Date,
    cancelReason: String,
    cancelledBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    notes: String, // customer note
    invoiceUrl: String,

    // Status history for tracking
    statusHistory: [
      {
        status: String,
        timestamp: { type: Date, default: Date.now },
        note: String,
        updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      },
    ],
  },
  { timestamps: true }
);

// Auto-generate order number
orderSchema.pre("save", async function (next) {
  if (!this.orderNumber) {
    const count = await mongoose.model("Order").countDocuments();
    this.orderNumber = `DOK-${new Date().getFullYear()}${String(count + 1).padStart(5, "0")}`;
  }
  next();
});

orderSchema.index({ customer: 1 });
orderSchema.index({ orderNumber: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ createdAt: -1 });
orderSchema.index({ "items.vendor": 1 });

module.exports = mongoose.model("Order", orderSchema);
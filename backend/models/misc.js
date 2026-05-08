const mongoose = require("mongoose");

// ─────────────── REVIEW ───────────────
const reviewSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    order: { type: mongoose.Schema.Types.ObjectId, ref: "Order" },
    rating: { type: Number, required: true, min: 1, max: 5 },
    title: String,
    comment: String,
    images: [String],
    isVerifiedPurchase: { type: Boolean, default: false },
    isApproved: { type: Boolean, default: true },
    helpfulVotes: { type: Number, default: 0 },
    vendorReply: String,
    vendorRepliedAt: Date,
  },
  { timestamps: true }
);

reviewSchema.index({ product: 1, user: 1 }, { unique: true }); // one review per user per product
reviewSchema.index({ product: 1, rating: -1 });

const Review = mongoose.model("Review", reviewSchema);


// ─────────────── PAYMENT ───────────────
const paymentSchema = new mongoose.Schema(
  {
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    method: {
      type: String,
      enum: ["stripe", "khalti", "esewa", "cash_on_delivery"],
      required: true,
    },
    status: {
      type: String,
      enum: ["initiated", "pending", "success", "failed", "refunded"],
      default: "initiated",
    },
    amount: { type: Number, required: true },
    currency: { type: String, default: "NPR" },

    // Gateway-specific
    transactionId: String,       // from payment gateway
    gatewayOrderId: String,      // our reference sent to gateway
    gatewayResponse: mongoose.Schema.Types.Mixed, // raw webhook/response

    paidAt: Date,
    refundedAmount: Number,
    refundedAt: Date,
    refundReason: String,
  },
  { timestamps: true }
);

paymentSchema.index({ order: 1 });
paymentSchema.index({ user: 1 });
paymentSchema.index({ transactionId: 1 });
paymentSchema.index({ status: 1 });

const Payment = mongoose.model("Payment", paymentSchema);


// ─────────────── COUPON ───────────────
const couponSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, uppercase: true },
    description: String,
    discountType: {
      type: String,
      enum: ["percentage", "flat"],
      required: true,
    },
    discountValue: { type: Number, required: true },
    minimumOrderAmount: { type: Number, default: 0 },
    maximumDiscountAmount: Number, // cap for percentage coupons

    applicableTo: {
      type: String,
      enum: ["all", "category", "product", "vendor"],
      default: "all",
    },
    categories: [{ type: mongoose.Schema.Types.ObjectId, ref: "Category" }],
    products: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
    vendors: [{ type: mongoose.Schema.Types.ObjectId, ref: "Vendor" }],

    usageLimit: Number,        // total allowed uses
    usageLimitPerUser: { type: Number, default: 1 },
    usedCount: { type: Number, default: 0 },

    startDate: Date,
    endDate: Date,

    isActive: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

couponSchema.index({ code: 1 });
couponSchema.index({ isActive: 1, endDate: 1 });

const Coupon = mongoose.model("Coupon", couponSchema);


// ─────────────── WISHLIST ───────────────
const wishlistSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    products: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        addedAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

wishlistSchema.index({ user: 1 });

const Wishlist = mongoose.model("Wishlist", wishlistSchema);


// ─────────────── NOTIFICATION ───────────────
const notificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: [
        "order_placed",
        "order_confirmed",
        "order_shipped",
        "order_delivered",
        "order_cancelled",
        "payment_success",
        "payment_failed",
        "review_reply",
        "vendor_approved",
        "vendor_rejected",
        "product_approved",
        "product_rejected",
        "refund_processed",
        "coupon_available",
        "system",
      ],
      required: true,
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    data: mongoose.Schema.Types.Mixed, // e.g. { orderId, productId }
    isRead: { type: Boolean, default: false },
    readAt: Date,
  },
  { timestamps: true }
);

notificationSchema.index({ user: 1, isRead: 1 });
notificationSchema.index({ createdAt: -1 });

const Notification = mongoose.model("Notification", notificationSchema);


// ─────────────── AUDIT LOG ───────────────
const auditLogSchema = new mongoose.Schema(
  {
    performedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    action: { type: String, required: true }, // e.g. "VENDOR_APPROVED", "PRODUCT_DELETED"
    entity: { type: String, required: true },  // e.g. "Vendor", "Product"
    entityId: mongoose.Schema.Types.ObjectId,
    changes: mongoose.Schema.Types.Mixed,      // before/after snapshot
    ipAddress: String,
    userAgent: String,
    note: String,
  },
  { timestamps: true }
);

auditLogSchema.index({ performedBy: 1 });
auditLogSchema.index({ entity: 1, entityId: 1 });
auditLogSchema.index({ createdAt: -1 });

const AuditLog = mongoose.model("AuditLog", auditLogSchema);


// ─────────────── REFUND ───────────────
const refundSchema = new mongoose.Schema(
  {
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    payment: { type: mongoose.Schema.Types.ObjectId, ref: "Payment" },
    items: [
      {
        orderItem: mongoose.Schema.Types.ObjectId,
        quantity: Number,
        reason: String,
      },
    ],
    amount: { type: Number, required: true },
    reason: { type: String, required: true },
    evidence: [String], // uploaded image URLs

    status: {
      type: String,
      enum: ["requested", "under_review", "approved", "rejected", "processed"],
      default: "requested",
    },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    reviewedAt: Date,
    rejectionReason: String,
    processedAt: Date,
    gatewayRefundId: String,
  },
  { timestamps: true }
);

refundSchema.index({ order: 1 });
refundSchema.index({ user: 1 });
refundSchema.index({ status: 1 });

const Refund = mongoose.model("Refund", refundSchema);


module.exports = { Review, Payment, Coupon, Wishlist, Notification, AuditLog, Refund };
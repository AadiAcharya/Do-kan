const mongoose = require("mongoose");

const bankDetailsSchema = new mongoose.Schema({
  bankName: String,
  accountHolderName: String,
  accountNumber: String,
  ifscCode: String,
  branchName: String,
});

const kycSchema = new mongoose.Schema({
  documentType: {
    type: String,
    enum: ["citizenship", "passport", "driving_license", "pan_card"],
  },
  documentNumber: String,
  frontImage: String, // Cloudinary URL
  backImage: String,
  selfie: String,
  submittedAt: Date,
  verifiedAt: Date,
  rejectionReason: String,
});

const vendorSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    // Store Info
    storeName: { type: String, required: true, trim: true },
    storeSlug: { type: String, required: true, unique: true, lowercase: true },
    storeLogo: String,
    storeBanner: String,
    storeDescription: String,
    storeAddress: String,
    storePhone: String,
    storeEmail: String,

    // KYC
    kyc: kycSchema,
    kycStatus: {
      type: String,
      enum: ["pending", "submitted", "approved", "rejected"],
      default: "pending",
    },

    // Approval
    approvalStatus: {
      type: String,
      enum: ["pending", "approved", "rejected", "suspended"],
      default: "pending",
    },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    approvedAt: Date,
    rejectionReason: String,

    // Commission
    commissionRate: { type: Number, default: 10 }, // percentage
    commissionType: {
      type: String,
      enum: ["percentage", "flat"],
      default: "percentage",
    },

    // Bank / Payment
    bankDetails: bankDetailsSchema,
    khaltiId: String,
    esewaId: String,

    // Analytics Snapshot
    totalSales: { type: Number, default: 0 },
    totalOrders: { type: Number, default: 0 },
    totalEarnings: { type: Number, default: 0 },
    pendingPayout: { type: Number, default: 0 },
    rating: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },

    // Social
    website: String,
    facebook: String,
    instagram: String,

    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

vendorSchema.index({ storeSlug: 1 });
vendorSchema.index({ approvalStatus: 1 });
vendorSchema.index({ user: 1 });

module.exports = mongoose.model("Vendor", vendorSchema);
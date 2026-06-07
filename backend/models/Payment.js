const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    method: {
      type: String,
      enum: ["esewa", "khalti", "cash_on_delivery"],
      required: true,
    },
    amount: { type: Number, required: true },

    status: {
      type: String,
      enum: ["initiated", "pending", "completed", "failed", "refunded"],
      default: "initiated",
    },

    // eSewa fields
    esewaRefId: String,
    esewaTransactionId: String,
    esewaRawResponse: mongoose.Schema.Types.Mixed,

    // Khalti fields
    khaltiPidx: String,
    khaltiTransactionId: String,
    khaltiRawResponse: mongoose.Schema.Types.Mixed,

    verifiedAt: Date,
  },
  { timestamps: true },
);

module.exports = mongoose.model("Payment", paymentSchema);

const axios = require("axios");
const crypto = require("crypto");
const Order = require("../models/Order");
const Payment = require("../models/Payment");

// ─── ENV CONFIG ────────────────────────────────────────────────────────────────
// eSewa sandbox
const ESEWA_SECRET_KEY = process.env.ESEWA_SECRET_KEY || "8gBm/:&EnhH.1/q"; // sandbox key
const ESEWA_PRODUCT_CODE = process.env.ESEWA_PRODUCT_CODE || "EPAYTEST"; // sandbox merchant code
const ESEWA_GATEWAY_URL =
  process.env.ESEWA_GATEWAY_URL ||
  "https://rc-epay.esewa.com.np/api/epay/main/v2/form";
const ESEWA_VERIFY_URL =
  process.env.ESEWA_VERIFY_URL ||
  "https://rc-epay.esewa.com.np/api/epay/transaction/status/";

// Khalti sandbox
const KHALTI_SECRET_KEY =
  process.env.KHALTI_SECRET_KEY ||
  "test_secret_key_dc74e0fd57cb46cd93832aee0a390234"; // sandbox key
const KHALTI_GATEWAY_URL =
  process.env.KHALTI_GATEWAY_URL ||
  "https://a.khalti.com/api/v2/epayment/initiate/";
const KHALTI_LOOKUP_URL =
  process.env.KHALTI_LOOKUP_URL ||
  "https://a.khalti.com/api/v2/epayment/lookup/";

const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";

// ─── HELPERS ───────────────────────────────────────────────────────────────────

// Generate HMAC-SHA256 signature for eSewa v2
function generateEsewaSignature(message) {
  return crypto
    .createHmac("sha256", ESEWA_SECRET_KEY)
    .update(message)
    .digest("base64");
}

// Mark order as paid and update payment record
async function markOrderPaid(orderId, paymentId) {
  await Order.findByIdAndUpdate(orderId, {
    paymentStatus: "paid",
    status: "confirmed",
    paidAt: new Date(),
    payment: paymentId,
    $push: {
      statusHistory: {
        status: "confirmed",
        note: "Payment verified successfully.",
      },
    },
  });
  await Payment.findByIdAndUpdate(paymentId, {
    status: "completed",
    verifiedAt: new Date(),
  });
}

// ─── eSEWA ─────────────────────────────────────────────────────────────────────

/**
 * POST /api/payment/esewa/initiate
 * Returns the form data the frontend uses to POST to eSewa's gateway
 */
exports.initiateEsewa = async (req, res) => {
  try {
    const { orderId } = req.body;
    if (!orderId)
      return res
        .status(400)
        .json({ success: false, message: "orderId is required." });

    const order = await Order.findById(orderId);
    if (!order)
      return res
        .status(404)
        .json({ success: false, message: "Order not found." });
    if (order.customer.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ success: false, message: "Not authorised." });
    }
    if (order.paymentStatus === "paid") {
      return res
        .status(400)
        .json({ success: false, message: "Order already paid." });
    }

    // Create a Payment record
    const payment = await Payment.create({
      order: order._id,
      user: req.user._id,
      method: "esewa",
      amount: order.total,
      status: "initiated",
    });

    const transactionUuid = `DOK-${order._id}-${Date.now()}`;
    const amount = order.total;
    const taxAmount = 0;
    const totalAmount = amount;
    const successUrl = `${FRONTEND_URL}/payment/esewa/success?paymentId=${payment._id}&orderId=${order._id}`;
    const failureUrl = `${FRONTEND_URL}/payment/esewa/failure?paymentId=${payment._id}&orderId=${order._id}`;

    // Signature message: total_amount,transaction_uuid,product_code
    const message = `total_amount=${totalAmount},transaction_uuid=${transactionUuid},product_code=${ESEWA_PRODUCT_CODE}`;
    const signature = generateEsewaSignature(message);

    res.status(200).json({
      success: true,
      gatewayUrl: ESEWA_GATEWAY_URL,
      formData: {
        amount: String(amount),
        tax_amount: String(taxAmount),
        total_amount: String(totalAmount),
        transaction_uuid: transactionUuid,
        product_code: ESEWA_PRODUCT_CODE,
        product_service_charge: "0",
        product_delivery_charge: "0",
        success_url: successUrl,
        failure_url: failureUrl,
        signed_field_names: "total_amount,transaction_uuid,product_code",
        signature,
      },
      paymentId: payment._id,
    });
  } catch (err) {
    console.error("eSewa initiate error:", err);
    res
      .status(500)
      .json({ success: false, message: "Failed to initiate eSewa payment." });
  }
};

/**
 * POST /api/payment/esewa/verify
 * Called by frontend after eSewa redirects back with encoded data
 */
exports.verifyEsewa = async (req, res) => {
  try {
    const { encodedData, paymentId } = req.body;
    if (!encodedData || !paymentId) {
      return res.status(400).json({
        success: false,
        message: "encodedData and paymentId are required.",
      });
    }

    // Decode base64 response from eSewa
    const decoded = JSON.parse(
      Buffer.from(encodedData, "base64").toString("utf-8"),
    );
    const {
      transaction_uuid,
      transaction_code,
      total_amount,
      status,
      signed_field_names,
      signature,
    } = decoded;

    if (status !== "COMPLETE") {
      await Payment.findByIdAndUpdate(paymentId, { status: "failed" });
      return res
        .status(400)
        .json({ success: false, message: "eSewa payment not completed." });
    }

    // Verify signature
    const fields = signed_field_names.split(",");
    const message = fields.map((f) => `${f}=${decoded[f]}`).join(",");
    const expected = generateEsewaSignature(message);
    if (expected !== signature) {
      await Payment.findByIdAndUpdate(paymentId, { status: "failed" });
      return res
        .status(400)
        .json({ success: false, message: "Invalid eSewa signature." });
    }

    const payment = await Payment.findByIdAndUpdate(
      paymentId,
      {
        esewaRefId: transaction_uuid,
        esewaTransactionId: transaction_code,
        esewaRawResponse: decoded,
      },
      { new: true },
    );

    if (!payment)
      return res
        .status(404)
        .json({ success: false, message: "Payment record not found." });

    await markOrderPaid(payment.order, payment._id);

    res.status(200).json({
      success: true,
      message: "eSewa payment verified.",
      orderId: payment.order,
    });
  } catch (err) {
    console.error("eSewa verify error:", err);
    res
      .status(500)
      .json({ success: false, message: "Failed to verify eSewa payment." });
  }
};

// ─── KHALTI ────────────────────────────────────────────────────────────────────

/**
 * POST /api/payment/khalti/initiate
 * Calls Khalti API to get a payment URL, returns it to frontend
 */
exports.initiateKhalti = async (req, res) => {
  try {
    const { orderId } = req.body;
    if (!orderId)
      return res
        .status(400)
        .json({ success: false, message: "orderId is required." });

    const order = await Order.findById(orderId).populate(
      "customer",
      "name email phone",
    );
    if (!order)
      return res
        .status(404)
        .json({ success: false, message: "Order not found." });
    if (order.customer._id.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ success: false, message: "Not authorised." });
    }
    if (order.paymentStatus === "paid") {
      return res
        .status(400)
        .json({ success: false, message: "Order already paid." });
    }

    const payment = await Payment.create({
      order: order._id,
      user: req.user._id,
      method: "khalti",
      amount: order.total,
      status: "initiated",
    });

    const payload = {
      return_url: `${FRONTEND_URL}/payment/khalti/verify?paymentId=${payment._id}&orderId=${order._id}`,
      website_url: FRONTEND_URL,
      amount: order.total * 100, // Khalti uses paisa (1 NPR = 100 paisa)
      purchase_order_id: order.orderNumber,
      purchase_order_name: `DOKAN Order ${order.orderNumber}`,
      customer_info: {
        name: order.customer.name || req.user.name,
        email: order.customer.email || req.user.email,
        phone: order.shippingAddress?.phone || "9800000000",
      },
      amount_breakdown: [
        { label: "Subtotal", amount: order.subtotal * 100 },
        { label: "Delivery", amount: order.shippingCharge * 100 },
      ],
      product_details: [
        {
          identity: order.orderNumber,
          name: `DOKAN Order ${order.orderNumber}`,
          total_price: order.total * 100,
          quantity: 1,
          unit_price: order.total * 100,
        },
      ],
    };

    const response = await axios.post(KHALTI_GATEWAY_URL, payload, {
      headers: { Authorization: `Key ${KHALTI_SECRET_KEY}` },
    });

    const { pidx, payment_url } = response.data;

    await Payment.findByIdAndUpdate(payment._id, {
      khaltiPidx: pidx,
      status: "pending",
    });

    res.status(200).json({
      success: true,
      paymentUrl: payment_url,
      pidx,
      paymentId: payment._id,
    });
  } catch (err) {
    console.error("Khalti initiate error:", err.response?.data || err.message);
    res
      .status(500)
      .json({ success: false, message: "Failed to initiate Khalti payment." });
  }
};

/**
 * POST /api/payment/khalti/verify
 * Called after Khalti redirects back — verifies via Khalti lookup API
 */
exports.verifyKhalti = async (req, res) => {
  try {
    const { pidx, paymentId } = req.body;
    if (!pidx || !paymentId) {
      return res
        .status(400)
        .json({ success: false, message: "pidx and paymentId are required." });
    }

    const lookupRes = await axios.post(
      KHALTI_LOOKUP_URL,
      { pidx },
      { headers: { Authorization: `Key ${KHALTI_SECRET_KEY}` } },
    );

    const { status, transaction_id, total_amount } = lookupRes.data;

    if (status !== "Completed") {
      await Payment.findByIdAndUpdate(paymentId, {
        status: "failed",
        khaltiRawResponse: lookupRes.data,
      });
      return res
        .status(400)
        .json({ success: false, message: `Khalti payment status: ${status}` });
    }

    const payment = await Payment.findByIdAndUpdate(
      paymentId,
      {
        khaltiTransactionId: transaction_id,
        khaltiRawResponse: lookupRes.data,
      },
      { new: true },
    );

    if (!payment)
      return res
        .status(404)
        .json({ success: false, message: "Payment record not found." });

    await markOrderPaid(payment.order, payment._id);

    res.status(200).json({
      success: true,
      message: "Khalti payment verified.",
      orderId: payment.order,
    });
  } catch (err) {
    console.error("Khalti verify error:", err.response?.data || err.message);
    res
      .status(500)
      .json({ success: false, message: "Failed to verify Khalti payment." });
  }
};

const Order = require("../models/Order");
const Cart = require("../models/Cart");
const Product = require("../models/Product");
const User = require("../models/User");
const {
  sendOrderConfirmationEmail,
  sendOrderStatusEmail,
} = require("../utils/emailService");

// ─── CREATE ORDER ─────────────────────────────────────────────────────────────
exports.createOrder = async (req, res) => {
  try {
    const { shippingAddress, paymentMethod } = req.body;
    if (!shippingAddress || !paymentMethod) {
      return res
        .status(400)
        .json({
          success: false,
          message: "shippingAddress and paymentMethod are required.",
        });
    }

    const cart = await Cart.findOne({ user: req.user._id }).populate(
      "items.product",
      "name thumbnail price stock vendor sku isActive status",
    );

    if (!cart || cart.items.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "Cart is empty." });
    }

    for (const item of cart.items) {
      if (
        !item.product ||
        !item.product.isActive ||
        item.product.status !== "active"
      ) {
        return res
          .status(400)
          .json({
            success: false,
            message: "A product in your cart is no longer available.",
          });
      }
      if (item.product.stock < item.quantity) {
        return res
          .status(400)
          .json({
            success: false,
            message: `Only ${item.product.stock} units of "${item.product.name}" are available.`,
          });
      }
    }

    const orderItems = cart.items.map((i) => ({
      product: i.product._id,
      vendor: i.vendor,
      productName: i.product.name,
      productImage: i.product.thumbnail || "",
      sku: i.product.sku || "",
      quantity: i.quantity,
      unitPrice: i.price,
      totalPrice: i.price * i.quantity,
    }));

    const subtotal = orderItems.reduce((s, i) => s + i.totalPrice, 0);
    const shippingCharge = 99;
    const total = subtotal + shippingCharge;

    const count = await Order.countDocuments();
    const orderNumber = `DOK-${new Date().getFullYear()}${String(count + 1).padStart(5, "0")}`;

    const order = new Order({
      orderNumber,
      customer: req.user._id,
      items: orderItems,
      shippingAddress,
      subtotal,
      shippingCharge,
      total,
      paymentMethod,
      paymentStatus: "pending",
      status: "pending",
      statusHistory: [{ status: "pending", note: "Order placed by customer." }],
    });
    await order.save();

    for (const item of cart.items) {
      await Product.findByIdAndUpdate(item.product._id, {
        $inc: { stock: -item.quantity },
      });
    }

    cart.items = [];
    await cart.save();

    // Send order confirmation email — fire and forget, never blocks the response
    sendOrderConfirmationEmail({
      name: req.user.name,
      email: req.user.email,
      order,
    }).catch(() => {});

    res
      .status(201)
      .json({
        success: true,
        message: "Order placed successfully.",
        data: order,
      });
  } catch (err) {
    console.error("Create order error:", err);
    res
      .status(500)
      .json({
        success: false,
        message: "Error placing order.",
        error: err.message,
      });
  }
};

// ─── GET MY ORDERS (customer) ─────────────────────────────────────────────────
exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ customer: req.user._id })
      .select("-statusHistory")
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: orders });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error fetching orders." });
  }
};

// ─── GET SINGLE ORDER ─────────────────────────────────────────────────────────
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("items.product", "name thumbnail")
      .populate("items.vendor", "storeName");
    if (!order)
      return res
        .status(404)
        .json({ success: false, message: "Order not found." });
    if (
      order.customer.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res
        .status(403)
        .json({ success: false, message: "Not authorised." });
    }
    res.status(200).json({ success: true, data: order });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error fetching order." });
  }
};

// ─── GET VENDOR ORDERS ────────────────────────────────────────────────────────
exports.getVendorOrders = async (req, res) => {
  try {
    const vendor = req.vendor;
    const orders = await Order.find({ "items.vendor": vendor._id })
      .select(
        "orderNumber createdAt status total items shippingAddress paymentMethod paymentStatus",
      )
      .sort({ createdAt: -1 });

    const filtered = orders.map((o) => ({
      ...o.toObject(),
      items: o.items.filter(
        (i) => i.vendor.toString() === vendor._id.toString(),
      ),
    }));

    res.status(200).json({ success: true, data: filtered });
  } catch (err) {
    res
      .status(500)
      .json({ success: false, message: "Error fetching vendor orders." });
  }
};

// ─── UPDATE ORDER STATUS (admin + vendor) ─────────────────────────────────────
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status, note } = req.body;

    const validStatuses = [
      "pending",
      "confirmed",
      "processing",
      "shipped",
      "delivered",
      "cancelled",
    ];
    if (!status || !validStatuses.includes(status)) {
      return res
        .status(400)
        .json({
          success: false,
          message: `Invalid status. Must be one of: ${validStatuses.join(", ")}`,
        });
    }

    const order = await Order.findById(req.params.id).populate(
      "customer",
      "name email",
    );
    if (!order)
      return res
        .status(404)
        .json({ success: false, message: "Order not found." });

    if (req.user.role === "vendor") {
      const isVendorOrder = order.items.some(
        (i) => i.vendor.toString() === req.vendor._id.toString(),
      );
      if (!isVendorOrder) {
        return res
          .status(403)
          .json({
            success: false,
            message: "Not authorised to update this order.",
          });
      }
    }

    const prevStatus = order.status;
    order.status = status;

    if (status === "delivered") {
      order.items.forEach((item) => {
        item.status = "delivered";
        item.deliveredAt = new Date();
      });
      if (
        order.paymentMethod === "cash_on_delivery" &&
        order.paymentStatus !== "paid"
      ) {
        order.paymentStatus = "paid";
        order.paidAt = new Date();
      }
    }

    if (status === "shipped") {
      order.items.forEach((item) => {
        item.status = "shipped";
        item.shippedAt = new Date();
      });
    }

    if (status === "cancelled") {
      order.cancelledAt = new Date();
      order.cancelledBy = req.user._id;
      for (const item of order.items) {
        await Product.findByIdAndUpdate(item.product, {
          $inc: { stock: item.quantity },
        });
      }
    }

    order.statusHistory.push({
      status,
      note: note || `Status changed from ${prevStatus} to ${status}.`,
      updatedBy: req.user._id,
      timestamp: new Date(),
    });

    await order.save();

    // Notify customer by email — fire and forget
    sendOrderStatusEmail({
      name: order.customer.name,
      email: order.customer.email,
      orderNumber: order.orderNumber,
      status,
      orderId: order._id,
    }).catch(() => {});

    res
      .status(200)
      .json({ success: true, message: "Order status updated.", data: order });
  } catch (err) {
    console.error("Update order status error:", err);
    res
      .status(500)
      .json({
        success: false,
        message: "Error updating order status.",
        error: err.message,
      });
  }
};

// ─── MARK COD AS PAID (admin) ─────────────────────────────────────────────────
exports.markCODPaid = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order)
      return res
        .status(404)
        .json({ success: false, message: "Order not found." });

    if (order.paymentMethod !== "cash_on_delivery") {
      return res
        .status(400)
        .json({
          success: false,
          message: "This endpoint is only for COD orders.",
        });
    }
    if (order.paymentStatus === "paid") {
      return res
        .status(400)
        .json({ success: false, message: "Order is already marked as paid." });
    }

    order.paymentStatus = "paid";
    order.paidAt = new Date();
    order.statusHistory.push({
      status: order.status,
      note: "COD payment collected and marked as paid.",
      updatedBy: req.user._id,
      timestamp: new Date(),
    });

    await order.save();
    res
      .status(200)
      .json({ success: true, message: "Order marked as paid.", data: order });
  } catch (err) {
    res
      .status(500)
      .json({
        success: false,
        message: "Error marking order as paid.",
        error: err.message,
      });
  }
};

// ─── CANCEL ORDER ON PAYMENT FAILURE ──────────────────────────────────────────
exports.cancelFailedOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order)
      return res
        .status(404)
        .json({ success: false, message: "Order not found." });

    if (order.paymentStatus === "paid") {
      return res
        .status(400)
        .json({ success: false, message: "Cannot cancel a paid order." });
    }
    if (order.status === "cancelled") {
      return res
        .status(400)
        .json({ success: false, message: "Order is already cancelled." });
    }
    if (
      order.customer.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res
        .status(403)
        .json({ success: false, message: "Not authorised." });
    }

    order.status = "cancelled";
    order.paymentStatus = "failed";
    order.cancelledAt = new Date();
    order.cancelledBy = req.user._id;
    order.cancelReason = "Payment failed — order cancelled automatically.";
    order.statusHistory.push({
      status: "cancelled",
      note: "Order cancelled due to payment failure.",
      updatedBy: req.user._id,
      timestamp: new Date(),
    });

    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: item.quantity },
      });
    }

    await order.save();
    res
      .status(200)
      .json({
        success: true,
        message: "Order cancelled and stock restored.",
        data: order,
      });
  } catch (err) {
    res
      .status(500)
      .json({
        success: false,
        message: "Error cancelling order.",
        error: err.message,
      });
  }
};

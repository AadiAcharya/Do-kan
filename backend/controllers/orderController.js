const Order = require("../models/Order");
const Cart = require("../models/Cart");
const Product = require("../models/Product");

// POST /api/orders — place order from cart
exports.createOrder = async (req, res) => {
  try {
    const { shippingAddress, paymentMethod } = req.body;
    if (!shippingAddress || !paymentMethod) {
      return res.status(400).json({ success: false, message: "shippingAddress and paymentMethod are required." });
    }

    const cart = await Cart.findOne({ user: req.user._id })
      .populate("items.product", "name thumbnail price stock vendor sku isActive status")
      .populate("items.vendor", "_id");

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ success: false, message: "Cart is empty." });
    }

    // Validate stock for every item
    for (const item of cart.items) {
      if (!item.product.isActive || item.product.status !== "active") {
        return res.status(400).json({ success: false, message: `Product "${item.product.name}" is no longer available.` });
      }
      if (item.product.stock < item.quantity) {
        return res.status(400).json({ success: false, message: `Only ${item.product.stock} units of "${item.product.name}" are available.` });
      }
    }

    // Build order items
    const orderItems = cart.items.map((i) => ({
      product: i.product._id,
      vendor: i.vendor._id,
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

    const order = await Order.create({
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

    // Deduct stock
    for (const item of cart.items) {
      await Product.findByIdAndUpdate(item.product._id, { $inc: { stock: -item.quantity } });
    }

    // Clear cart
    cart.items = [];
    await cart.save();

    res.status(201).json({ success: true, message: "Order placed successfully.", data: order });
  } catch (err) {
    console.error("Create order error:", err);
    res.status(500).json({ success: false, message: "Error placing order.", error: err.message });
  }
};

// GET /api/orders — get current user's orders
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

// GET /api/orders/:id
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("items.product", "name thumbnail")
      .populate("items.vendor", "storeName");
    if (!order) return res.status(404).json({ success: false, message: "Order not found." });
    // Only the owner or admin can view
    if (order.customer.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Not authorised." });
    }
    res.status(200).json({ success: true, data: order });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error fetching order." });
  }
};

// GET /api/orders/vendor — vendor sees their items across all orders
exports.getVendorOrders = async (req, res) => {
  try {
    const vendor = req.vendor;
    const orders = await Order.find({ "items.vendor": vendor._id })
      .select("orderNumber createdAt status total items shippingAddress paymentMethod")
      .sort({ createdAt: -1 });

    // Filter items to only this vendor's
    const filtered = orders.map((o) => ({
      ...o.toObject(),
      items: o.items.filter((i) => i.vendor.toString() === vendor._id.toString()),
    }));

    res.status(200).json({ success: true, data: filtered });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error fetching vendor orders." });
  }
};

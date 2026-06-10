const Order = require("../models/Order");
const Cart = require("../models/Cart");
const Product = require("../models/Product");

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

    // Generate orderNumber directly in controller
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

exports.getVendorOrders = async (req, res) => {
  try {
    const vendor = req.vendor;
    const orders = await Order.find({ "items.vendor": vendor._id })
      .select(
        "orderNumber createdAt status total items shippingAddress paymentMethod",
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

const Cart = require("../models/Cart");
const Product = require("../models/Product");

exports.getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id })
      .populate("items.product", "name thumbnail price stock isActive status")
      .populate("items.vendor", "storeName storeSlug");
    if (!cart)
      return res
        .status(200)
        .json({ success: true, data: { items: [], total: 0 } });
    res.status(200).json({ success: true, data: cart });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error fetching cart." });
  }
};

exports.addToCart = async (req, res) => {
  try {
    const { productId, quantity = 1, variant } = req.body;
    if (!productId)
      return res
        .status(400)
        .json({ success: false, message: "productId is required." });

    const product = await Product.findById(productId).populate("vendor", "_id");
    if (!product || !product.isActive || product.status !== "active") {
      return res
        .status(404)
        .json({ success: false, message: "Product not found or unavailable." });
    }
    if (product.stock < quantity) {
      return res
        .status(400)
        .json({
          success: false,
          message: `Only ${product.stock} units available.`,
        });
    }

    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      cart = await Cart.create({ user: req.user._id, items: [] });
    }

    const existingIdx = cart.items.findIndex(
      (i) => i.product.toString() === productId.toString(),
    );
    if (existingIdx > -1) {
      cart.items[existingIdx].quantity = Math.min(
        cart.items[existingIdx].quantity + quantity,
        product.stock,
      );
    } else {
      cart.items.push({
        product: product._id,
        vendor: product.vendor._id,
        quantity,
        price: product.price,
        variant: variant || undefined,
      });
    }

    await cart.save();
    await cart.populate("items.product", "name thumbnail price stock");
    res
      .status(200)
      .json({ success: true, message: "Item added to cart.", data: cart });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Error adding to cart." });
  }
};

exports.updateCartItem = async (req, res) => {
  try {
    const { quantity } = req.body;
    if (!quantity || quantity < 1) {
      return res
        .status(400)
        .json({ success: false, message: "Quantity must be at least 1." });
    }
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart)
      return res
        .status(404)
        .json({ success: false, message: "Cart not found." });

    const item = cart.items.find(
      (i) => i.product.toString() === req.params.productId,
    );
    if (!item)
      return res
        .status(404)
        .json({ success: false, message: "Item not in cart." });

    const product = await Product.findById(req.params.productId).select(
      "stock",
    );
    if (quantity > product.stock) {
      return res
        .status(400)
        .json({
          success: false,
          message: `Only ${product.stock} units available.`,
        });
    }
    item.quantity = quantity;
    await cart.save();
    await cart.populate("items.product", "name thumbnail price stock");
    res.status(200).json({ success: true, data: cart });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error updating cart." });
  }
};

exports.removeFromCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart)
      return res
        .status(404)
        .json({ success: false, message: "Cart not found." });
    cart.items = cart.items.filter(
      (i) => i.product.toString() !== req.params.productId,
    );
    await cart.save();
    await cart.populate("items.product", "name thumbnail price stock");
    res
      .status(200)
      .json({ success: true, message: "Item removed.", data: cart });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error removing item." });
  }
};

exports.clearCart = async (req, res) => {
  try {
    await Cart.findOneAndUpdate({ user: req.user._id }, { items: [] });
    res.status(200).json({ success: true, message: "Cart cleared." });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error clearing cart." });
  }
};

const Product = require("../models/Product");

exports.getProducts = async (req, res) => {
  try {
    const { page = 1, limit = 12, search, category, minPrice, maxPrice, sortBy = "createdAt", order = "desc", vendorId } = req.query;
    const filter = { status: "active", isActive: true };
    if (category) filter.category = category;
    if (vendorId) filter.vendor = vendorId;
    if (minPrice !== undefined || maxPrice !== undefined) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }
    const sortOptions = {};
    sortOptions[["price","name","createdAt","stock"].includes(sortBy) ? sortBy : "createdAt"] = order === "asc" ? 1 : -1;
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const [products, total] = await Promise.all([
      Product.find(filter).select("-__v")
        .populate("category", "name slug")
        .populate("vendor", "storeName storeSlug")
        .sort(sortOptions).skip((pageNum - 1) * limitNum).limit(limitNum),
      Product.countDocuments(filter),
    ]);
    res.status(200).json({
      success: true, data: products,
      pagination: { total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum) },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error fetching products." });
  }
};

exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).select("-__v")
      .populate("category", "name slug")
      .populate("vendor", "storeName storeSlug storeLogo rating");
    if (!product || product.status !== "active" || !product.isActive) {
      return res.status(404).json({ success: false, message: "Product not found." });
    }
    res.status(200).json({ success: true, data: product });
  } catch (err) {
    if (err.name === "CastError") return res.status(400).json({ success: false, message: "Invalid product ID." });
    res.status(500).json({ success: false, message: "Error fetching product." });
  }
};

exports.createProduct = async (req, res) => {
  try {
    const { name, description, price, images, thumbnail, category, stock, sku } = req.body;
    if (!name || !description || !price || !category) {
      return res.status(400).json({ success: false, message: "name, description, price, and category are required." });
    }
    const slug = name.toLowerCase().replace(/\s+/g, "-").replace(/[^\w-]+/g, "") + "-" + Date.now();
    const product = await Product.create({
      name, slug, description, price: Number(price),
      images: images || [], thumbnail: thumbnail || (images && images[0]) || "",
      category, vendor: req.vendor._id,
      stock: stock || 0, sku: sku || `SKU-${Date.now()}`, status: "active",
    });
    res.status(201).json({ success: true, data: product });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error creating product.", error: err.message });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const updates = { ...req.body };
    delete updates._id; delete updates.vendor; delete updates.createdAt;
    const product = await Product.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
    if (!product) return res.status(404).json({ success: false, message: "Product not found." });
    res.status(200).json({ success: true, data: product });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error updating product." });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: "Product not found." });
    product.isActive = false; product.status = "archived";
    await product.save();
    res.status(200).json({ success: true, message: "Product deleted." });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error deleting product." });
  }
};

exports.updateStock = async (req, res) => {
  try {
    const { stock } = req.body;
    if (stock === undefined || stock < 0) return res.status(400).json({ success: false, message: "Valid stock value required." });
    const product = await Product.findByIdAndUpdate(req.params.id, { stock: Number(stock) }, { new: true });
    if (!product) return res.status(404).json({ success: false, message: "Product not found." });
    res.status(200).json({ success: true, data: product });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error updating stock." });
  }
};

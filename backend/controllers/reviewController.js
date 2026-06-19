const { Review } = require("../models/misc");
const Product = require("../models/Product");
const Vendor = require("../models/Vendor");
const Order = require("../models/Order");

async function recalculateProductRating(productId) {
  const stats = await Review.aggregate([
    { $match: { product: productId, isApproved: true } },
    { $group: { _id: null, avg: { $avg: "$rating" }, count: { $sum: 1 } } },
  ]);
  const rating = stats[0] ? Math.round(stats[0].avg * 10) / 10 : 0;
  const reviewCount = stats[0]?.count || 0;
  await Product.findByIdAndUpdate(productId, { rating, reviewCount });
  return { rating, reviewCount };
}

async function recalculateVendorRating(vendorId) {
  const products = await Product.find({ vendor: vendorId }).select("_id");
  const productIds = products.map((p) => p._id);
  if (!productIds.length) return;

  const stats = await Review.aggregate([
    { $match: { product: { $in: productIds }, isApproved: true } },
    { $group: { _id: null, avg: { $avg: "$rating" }, count: { $sum: 1 } } },
  ]);
  const rating = stats[0] ? Math.round(stats[0].avg * 10) / 10 : 0;
  const reviewCount = stats[0]?.count || 0;
  await Vendor.findByIdAndUpdate(vendorId, { rating, reviewCount });
}

/**
 * GET /api/reviews/product/:productId
 */
exports.getProductReviews = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);

    const filter = { product: req.params.productId, isApproved: true };
    const [reviews, total] = await Promise.all([
      Review.find(filter)
        .populate("user", "name avatar")
        .sort({ createdAt: -1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum),
      Review.countDocuments(filter),
    ]);

    const distribution = await Review.aggregate([
      { $match: filter },
      { $group: { _id: "$rating", count: { $sum: 1 } } },
    ]);

    res.status(200).json({
      success: true,
      data: reviews,
      distribution,
      pagination: { total, page: pageNum, totalPages: Math.ceil(total / limitNum) },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error fetching reviews." });
  }
};

/**
 * GET /api/reviews/product/:productId/mine
 */
exports.getMyReview = async (req, res) => {
  try {
    const review = await Review.findOne({
      product: req.params.productId,
      user: req.user._id,
    });
    res.status(200).json({ success: true, data: review });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error fetching review." });
  }
};

/**
 * POST /api/reviews
 */
exports.createReview = async (req, res) => {
  try {
    const { productId, rating, title, comment } = req.body;
    if (!productId || !rating) {
      return res.status(400).json({ success: false, message: "Product and rating are required." });
    }
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, message: "Rating must be between 1 and 5." });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found." });
    }

    const existing = await Review.findOne({ product: productId, user: req.user._id });
    if (existing) {
      return res.status(409).json({ success: false, message: "You have already reviewed this product." });
    }

    const paidOrder = await Order.findOne({
      customer: req.user._id,
      paymentStatus: "paid",
      "items.product": productId,
    });

    const review = await Review.create({
      product: productId,
      user: req.user._id,
      order: paidOrder?._id,
      rating,
      title: title || "",
      comment: comment || "",
      isVerifiedPurchase: !!paidOrder,
    });

    if (paidOrder) {
      const item = paidOrder.items.find((i) => i.product.toString() === productId);
      if (item) {
        item.review = review._id;
        await paidOrder.save();
      }
    }

    await recalculateProductRating(productId);
    await recalculateVendorRating(product.vendor);

    const populated = await Review.findById(review._id).populate("user", "name avatar");
    res.status(201).json({ success: true, message: "Review submitted.", data: populated });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ success: false, message: "You have already reviewed this product." });
    }
    console.error("Create review error:", err);
    res.status(500).json({ success: false, message: "Error submitting review." });
  }
};

/**
 * PUT /api/reviews/:id
 */
exports.updateReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ success: false, message: "Review not found." });
    }
    if (review.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Not authorised." });
    }

    const { rating, title, comment } = req.body;
    if (rating !== undefined) {
      if (rating < 1 || rating > 5) {
        return res.status(400).json({ success: false, message: "Rating must be between 1 and 5." });
      }
      review.rating = rating;
    }
    if (title !== undefined) review.title = title;
    if (comment !== undefined) review.comment = comment;
    await review.save();

    const product = await Product.findById(review.product);
    await recalculateProductRating(review.product);
    if (product) await recalculateVendorRating(product.vendor);

    const populated = await Review.findById(review._id).populate("user", "name avatar");
    res.status(200).json({ success: true, message: "Review updated.", data: populated });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error updating review." });
  }
};

/**
 * DELETE /api/reviews/:id
 */
exports.deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ success: false, message: "Review not found." });
    }
    if (review.user.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Not authorised." });
    }

    const productId = review.product;
    const product = await Product.findById(productId);
    await review.deleteOne();

    await recalculateProductRating(productId);
    if (product) await recalculateVendorRating(product.vendor);

    res.status(200).json({ success: true, message: "Review deleted." });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error deleting review." });
  }
};

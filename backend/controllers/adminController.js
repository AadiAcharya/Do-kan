const User = require("../models/User");
const Vendor = require("../models/Vendor");
const Product = require("../models/Product");
const Order = require("../models/Order");
const {
  sendVendorApprovedEmail,
  sendVendorRejectedEmail,
} = require("../utils/emailService");

/**
 * GET /api/admin/stats
 */
exports.getStats = async (req, res) => {
  try {
    const [
      totalUsers,
      totalProducts,
      totalOrders,
      totalVendors,
      revenueResult,
      pendingVendors,
    ] = await Promise.all([
      User.countDocuments({ isActive: true }),
      Product.countDocuments({ isActive: true, status: "active" }),
      Order.countDocuments(),
      Vendor.countDocuments({ approvalStatus: "approved" }),
      Order.aggregate([
        { $match: { paymentStatus: "paid" } },
        { $group: { _id: null, total: { $sum: "$total" } } },
      ]),
      Vendor.countDocuments({ approvalStatus: "pending" }),
    ]);

    const totalRevenue = revenueResult[0]?.total || 0;

    // Recent orders (last 5)
    const recentOrders = await Order.find()
      .select("orderNumber total status createdAt customer")
      .populate("customer", "name email")
      .sort({ createdAt: -1 })
      .limit(5);

    // Recent users (last 5)
    const recentUsers = await User.find()
      .select("name email role createdAt")
      .sort({ createdAt: -1 })
      .limit(5);

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalProducts,
        totalOrders,
        totalVendors,
        totalRevenue,
        pendingVendors,
        recentOrders,
        recentUsers,
      },
    });
  } catch (err) {
    console.error("Admin stats error:", err);
    res.status(500).json({ success: false, message: "Error fetching stats." });
  }
};

/**
 * GET /api/admin/users
 */
exports.getUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20, role, search } = req.query;
    const filter = {};
    if (role) filter.role = role;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const [users, total] = await Promise.all([
      User.find(filter)
        .select(
          "-password -refreshToken -twoFactorSecret -emailVerificationToken -passwordResetToken",
        )
        .sort({ createdAt: -1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum),
      User.countDocuments(filter),
    ]);
    res.status(200).json({
      success: true,
      data: users,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error fetching users." });
  }
};

/**
 * PUT /api/admin/users/:id/ban
 */
exports.banUser = async (req, res) => {
  try {
    const { reason } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      {
        isBanned: true,
        bannedReason: reason || "Banned by admin.",
        bannedAt: new Date(),
      },
      { new: true },
    ).select("-password");
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found." });
    res
      .status(200)
      .json({ success: true, message: "User banned.", data: user });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error banning user." });
  }
};

/**
 * PUT /api/admin/users/:id/unban
 */
exports.unbanUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isBanned: false, bannedReason: "", bannedAt: null },
      { new: true },
    ).select("-password");
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found." });
    res
      .status(200)
      .json({ success: true, message: "User unbanned.", data: user });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error unbanning user." });
  }
};

/**
 * GET /api/admin/vendors
 */
exports.getVendors = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = {};
    if (status) filter.approvalStatus = status;
    const vendors = await Vendor.find(filter)
      .populate("user", "name email phone createdAt")
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: vendors });
  } catch (err) {
    res
      .status(500)
      .json({ success: false, message: "Error fetching vendors." });
  }
};

/**
 * PUT /api/admin/vendors/:id/approve
 */
exports.approveVendor = async (req, res) => {
  try {
    const vendor = await Vendor.findByIdAndUpdate(
      req.params.id,
      {
        approvalStatus: "approved",
        approvedBy: req.user._id,
        approvedAt: new Date(),
      },
      { new: true },
    ).populate("user", "name email");
    if (!vendor)
      return res
        .status(404)
        .json({ success: false, message: "Vendor not found." });

    // Promote the user's role to vendor
    await User.findByIdAndUpdate(vendor.user._id, { role: "vendor" });

    // Send approval email — fire and forget, never blocks the response
    sendVendorApprovedEmail({
      name: vendor.user.name,
      email: vendor.user.email,
      storeName: vendor.storeName,
    }).catch(() => {});

    res
      .status(200)
      .json({ success: true, message: "Vendor approved.", data: vendor });
  } catch (err) {
    res
      .status(500)
      .json({ success: false, message: "Error approving vendor." });
  }
};

/**
 * PUT /api/admin/vendors/:id/reject
 */
exports.rejectVendor = async (req, res) => {
  try {
    const { reason } = req.body;
    if (!reason)
      return res
        .status(400)
        .json({ success: false, message: "Rejection reason is required." });
    const vendor = await Vendor.findByIdAndUpdate(
      req.params.id,
      { approvalStatus: "rejected", rejectionReason: reason },
      { new: true },
    ).populate("user", "name email");
    if (!vendor)
      return res
        .status(404)
        .json({ success: false, message: "Vendor not found." });

    // Send rejection email — fire and forget, never blocks the response
    sendVendorRejectedEmail({
      name: vendor.user.name,
      email: vendor.user.email,
      storeName: vendor.storeName,
      reason,
    }).catch(() => {});

    res
      .status(200)
      .json({ success: true, message: "Vendor rejected.", data: vendor });
  } catch (err) {
    res
      .status(500)
      .json({ success: false, message: "Error rejecting vendor." });
  }
};

/**
 * GET /api/admin/products
 */
exports.getProducts = async (req, res) => {
  try {
    const { page = 1, limit = 20, search, status } = req.query;
    const filter = {};
    if (status) filter.status = status;
    else filter.isActive = true;
    if (search) filter.$or = [{ name: { $regex: search, $options: "i" } }];

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const [products, total] = await Promise.all([
      Product.find(filter)
        .populate("vendor", "storeName")
        .populate("category", "name")
        .sort({ createdAt: -1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum),
      Product.countDocuments(filter),
    ]);
    res.status(200).json({
      success: true,
      data: products,
      pagination: {
        total,
        page: pageNum,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (err) {
    res
      .status(500)
      .json({ success: false, message: "Error fetching products." });
  }
};

/**
 * DELETE /api/admin/products/:id
 */
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product)
      return res
        .status(404)
        .json({ success: false, message: "Product not found." });
    product.isActive = false;
    product.status = "archived";
    await product.save();
    res.status(200).json({ success: true, message: "Product removed." });
  } catch (err) {
    res
      .status(500)
      .json({ success: false, message: "Error deleting product." });
  }
};

/**
 * GET /api/admin/orders
 */
exports.getOrders = async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const filter = {};
    if (status) filter.status = status;
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const [orders, total] = await Promise.all([
      Order.find(filter)
        .populate("customer", "name email")
        .select("-statusHistory")
        .sort({ createdAt: -1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum),
      Order.countDocuments(filter),
    ]);
    res.status(200).json({
      success: true,
      data: orders,
      pagination: {
        total,
        page: pageNum,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error fetching orders." });
  }
};

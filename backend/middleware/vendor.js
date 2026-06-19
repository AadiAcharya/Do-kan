const Vendor = require("../models/Vendor");

// Attach vendor document to req — use after protect
exports.attachVendor = async (req, res, next) => {
  try {
    const vendor = await Vendor.findOne({ user: req.user._id });
    if (!vendor) return res.status(403).json({ success: false, message: "Vendor profile not found." });
    if (vendor.approvalStatus !== "approved") {
      return res.status(403).json({ success: false, message: "Your vendor account is pending approval." });
    }
    req.vendor = vendor;
    next();
  } catch (err) {
    res.status(500).json({ success: false, message: "Vendor check failed." });
  }
};

// Attach vendor only when user is a vendor (skip for admin)
exports.optionalAttachVendor = async (req, res, next) => {
  if (req.user.role !== "vendor") return next();
  return exports.attachVendor(req, res, next);
};

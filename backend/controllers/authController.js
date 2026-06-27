const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Vendor = require("../models/Vendor");
const { sendWelcomeEmail } = require("../utils/emailService");

const JWT_SECRET = process.env.JWT_SECRET || "dokan_dev_secret_key";
const JWT_EXPIRES = process.env.JWT_EXPIRES || "7d";

const signToken = (id) =>
  jwt.sign({ id }, JWT_SECRET, { expiresIn: JWT_EXPIRES });

/**
 * POST /api/auth/register
 */
exports.register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Name, email and password are required.",
        });
    }
    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists) {
      return res
        .status(409)
        .json({ success: false, message: "Email already registered." });
    }
    // Only allow customer or vendor self-registration; admin must be set manually
    const allowedRoles = ["customer", "vendor"];
    const userRole = allowedRoles.includes(role) ? role : "customer";

    const user = await User.create({ name, email, password, role: userRole });

    // If registering as vendor, create a pending Vendor document
    if (userRole === "vendor") {
      const { storeName, storeDescription, storeAddress } = req.body;
      const slug =
        (storeName || name)
          .toLowerCase()
          .replace(/\s+/g, "-")
          .replace(/[^\w-]+/g, "") +
        "-" +
        Date.now();
      await Vendor.create({
        user: user._id,
        storeName: storeName || `${name}'s Store`,
        storeSlug: slug,
        storeDescription: storeDescription || "",
        storeAddress: storeAddress || "",
        approvalStatus: "pending",
      });
    }

    // Send welcome email — fire and forget, never blocks the response
    sendWelcomeEmail({
      name: user.name,
      email: user.email,
      role: userRole,
    }).catch(() => {});

    const token = signToken(user._id);
    res.status(201).json({
      success: true,
      message: "Registration successful.",
      token,
      user: user.toJSON(),
    });
  } catch (err) {
    console.error("Register error:", err);
    res
      .status(500)
      .json({
        success: false,
        message: "Registration failed.",
        error: err.message,
      });
  }
};

/**
 * POST /api/auth/login
 */
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "Email and password are required." });
    }
    const user = await User.findOne({ email: email.toLowerCase() }).select(
      "+password",
    );
    if (!user || !user.password) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid email or password." });
    }
    const match = await user.comparePassword(password);
    if (!match) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid email or password." });
    }
    if (!user.isActive || user.isBanned) {
      return res
        .status(403)
        .json({ success: false, message: "Account is inactive or banned." });
    }
    user.lastLoginAt = new Date();
    await user.save({ validateBeforeSave: false });

    // Attach vendor info if applicable
    let vendorData = null;
    if (user.role === "vendor") {
      vendorData = await Vendor.findOne({ user: user._id }).select(
        "_id storeName storeSlug approvalStatus",
      );
    }

    const token = signToken(user._id);
    res.status(200).json({
      success: true,
      message: "Login successful.",
      token,
      user: user.toJSON(),
      vendor: vendorData,
    });
  } catch (err) {
    console.error("Login error:", err);
    res
      .status(500)
      .json({ success: false, message: "Login failed.", error: err.message });
  }
};

/**
 * GET /api/auth/me  (protected)
 */
exports.getMe = async (req, res) => {
  try {
    let vendorData = null;
    if (req.user.role === "vendor") {
      vendorData = await Vendor.findOne({ user: req.user._id }).select(
        "_id storeName storeSlug approvalStatus totalSales totalOrders",
      );
    }
    res.status(200).json({ success: true, user: req.user, vendor: vendorData });
  } catch (err) {
    res.status(500).json({ success: false, message: "Could not fetch user." });
  }
};

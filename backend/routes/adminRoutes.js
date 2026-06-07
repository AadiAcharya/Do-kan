const express = require("express");
const router = express.Router();
const {
  getStats,
  getUsers,
  banUser,
  unbanUser,
  getVendors,
  approveVendor,
  rejectVendor,
  getProducts,
  deleteProduct,
  getOrders,
} = require("../controllers/adminController");
const { protect, restrictTo } = require("../middleware/auth");

router.use(protect, restrictTo("admin")); // all admin routes require admin role

router.get("/stats", getStats);
router.get("/users", getUsers);
router.put("/users/:id/ban", banUser);
router.put("/users/:id/unban", unbanUser);
router.get("/vendors", getVendors);
router.put("/vendors/:id/approve", approveVendor);
router.put("/vendors/:id/reject", rejectVendor);
router.get("/products", getProducts);
router.delete("/products/:id", deleteProduct);
router.get("/orders", getOrders);

module.exports = router;

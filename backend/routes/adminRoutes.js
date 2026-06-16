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
const {
  updateOrderStatus,
  markCODPaid,
} = require("../controllers/orderController");
const { protect, restrictTo } = require("../middleware/auth");

router.use(protect, restrictTo("admin"));

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

// Order management from admin panel
router.put("/orders/:id/status", updateOrderStatus);
router.put("/orders/:id/mark-paid", markCODPaid);

module.exports = router;

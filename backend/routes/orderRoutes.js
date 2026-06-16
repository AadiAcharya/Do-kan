const express = require("express");
const router  = express.Router();
const {
  createOrder,
  getMyOrders,
  getOrderById,
  getVendorOrders,
  updateOrderStatus,
  markCODPaid,
  cancelFailedOrder,
} = require("../controllers/orderController");
const { protect, restrictTo } = require("../middleware/auth");
const { attachVendor } = require("../middleware/vendor");

router.use(protect);

// Customer routes
router.post("/",    createOrder);
router.get("/",     getMyOrders);

// Vendor route — must come before /:id to avoid conflict
router.get("/vendor", restrictTo("vendor"), attachVendor, getVendorOrders);

// Single order
router.get("/:id",  getOrderById);

// Order status update — admin or vendor
router.put("/:id/status",       restrictTo("admin", "vendor"), updateOrderStatus);

// COD mark as paid — admin only
router.put("/:id/mark-paid",    restrictTo("admin"), markCODPaid);

// Cancel failed payment order — customer or admin
router.put("/:id/cancel-failed", cancelFailedOrder);

module.exports = router;

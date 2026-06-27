const express = require("express");
const router = express.Router();
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

router.post("/", createOrder);
router.get("/", getMyOrders);
router.get("/vendor", restrictTo("vendor"), attachVendor, getVendorOrders);
router.get("/:id", getOrderById);

router.put("/:id/status", restrictTo("admin", "vendor"), updateOrderStatus);
router.put("/:id/mark-paid", restrictTo("admin"), markCODPaid);
router.put("/:id/cancel-failed", cancelFailedOrder);

module.exports = router;

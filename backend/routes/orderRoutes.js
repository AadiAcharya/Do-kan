const express = require("express");
const router = express.Router();
const { createOrder, getMyOrders, getOrderById, getVendorOrders, getVendorRevenue } = require("../controllers/orderController");
const { protect, restrictTo } = require("../middleware/auth");
const { attachVendor } = require("../middleware/vendor");

router.use(protect);

router.post("/", createOrder);
router.get("/", getMyOrders);
router.get("/vendor/revenue", restrictTo("vendor"), attachVendor, getVendorRevenue);
router.get("/vendor", restrictTo("vendor"), attachVendor, getVendorOrders);
router.get("/:id", getOrderById);

module.exports = router;

const express = require("express");
const router = express.Router();
const { createOrder, getMyOrders, getOrderById, getVendorOrders } = require("../controllers/orderController");
const { protect, restrictTo } = require("../middleware/auth");

router.use(protect);

router.post("/", createOrder);
router.get("/", getMyOrders);
router.get("/vendor", restrictTo("vendor"), getVendorOrders);
router.get("/:id", getOrderById);

module.exports = router;

const express = require("express");
const router = express.Router();
const {
  getProducts, getProductById, createProduct,
  updateProduct, deleteProduct, updateStock,
} = require("../controllers/productController");
const { protect, restrictTo } = require("../middleware/auth");
const { attachVendor } = require("../middleware/vendor");

// Public
router.get("/", getProducts);
router.get("/:id", getProductById);

// Vendor-protected
router.post("/", protect, restrictTo("vendor", "admin"), attachVendor, createProduct);
router.put("/:id/stock", protect, restrictTo("vendor", "admin"), updateStock);
router.put("/:id", protect, restrictTo("vendor", "admin"), updateProduct);
router.delete("/:id", protect, restrictTo("vendor", "admin"), deleteProduct);

module.exports = router;

const express = require("express");
const router = express.Router();
const { getCategories, getCategoryById, createCategory } = require("../controllers/categoryController");
const { protect, restrictTo } = require("../middleware/auth");

router.get("/", getCategories);
router.get("/:id", getCategoryById);
router.post("/", protect, restrictTo("admin"), createCategory);

module.exports = router;

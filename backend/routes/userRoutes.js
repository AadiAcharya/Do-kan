const express = require("express");
const router = express.Router();
const {
  updateProfile,
  changePassword,
  addAddress,
  updateAddress,
  deleteAddress,
} = require("../controllers/userController");
const { protect } = require("../middleware/auth");

router.use(protect);

router.put("/profile", updateProfile);
router.put("/password", changePassword);
router.post("/addresses", addAddress);
router.put("/addresses/:addressId", updateAddress);
router.delete("/addresses/:addressId", deleteAddress);

module.exports = router;

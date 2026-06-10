const express = require("express");
const router = express.Router();
const {
  initiateEsewa,
  verifyEsewa,
  initiateKhalti,
  verifyKhalti,
} = require("../controllers/paymentController");
const { protect } = require("../middleware/auth");

router.use(protect);

router.post("/esewa/initiate", initiateEsewa);
router.post("/esewa/verify", verifyEsewa);
router.post("/khalti/initiate", initiateKhalti);
router.post("/khalti/verify", verifyKhalti);

module.exports = router;

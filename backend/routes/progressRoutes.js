const express = require("express");
const {
  addProgress,
  getMyProgress,
  getProgressSummary,
  getProgressByUser
} = require("../controllers/progressController");
const { protectUser } = require("../middleware/authMiddleware");
const protectAdmin = require("../middleware/adminMiddleware");

const router = express.Router();

router.get("/", protectUser, getMyProgress);
router.post("/", protectUser, addProgress);
router.get("/summary", protectUser, getProgressSummary);
router.get("/user/:userId", protectAdmin, getProgressByUser);

module.exports = router;

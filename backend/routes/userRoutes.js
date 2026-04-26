const express = require("express");
const {
  getUserProfile,
  updateUserProfile,
  getDashboard,
  getBMIReport,
  getPersonalPlans
} = require("../controllers/userController");
const { protectUser } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/profile", protectUser, getUserProfile);
router.put("/profile", protectUser, updateUserProfile);
router.get("/dashboard", protectUser, getDashboard);
router.get("/bmi-report", protectUser, getBMIReport);
router.get("/plans", protectUser, getPersonalPlans);

module.exports = router;

const express = require("express");
const {
  registerUser,
  loginUser,
  loginAdmin,
  getMyProfile,
  getAdminProfile
} = require("../controllers/authController");
const { protectUser, protectAdmin } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/admin-login", loginAdmin);
router.get("/me", protectUser, getMyProfile);
router.get("/admin/me", protectAdmin, getAdminProfile);

module.exports = router;

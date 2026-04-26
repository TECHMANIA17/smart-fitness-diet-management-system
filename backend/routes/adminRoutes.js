const express = require("express");
const {
  getAdminDashboard,
  manageUsers,
  deleteUser,
  viewUserProgress
} = require("../controllers/adminController");
const protectAdmin = require("../middleware/adminMiddleware");

const router = express.Router();

router.get("/dashboard", protectAdmin, getAdminDashboard);
router.get("/users", protectAdmin, manageUsers);
router.delete("/users/:id", protectAdmin, deleteUser);
router.get("/progress", protectAdmin, viewUserProgress);
router.get("/progress/:id", protectAdmin, viewUserProgress);

module.exports = router;

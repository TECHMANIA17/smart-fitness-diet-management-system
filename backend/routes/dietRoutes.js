const express = require("express");
const {
  getDietPlans,
  createDietPlan,
  updateDietPlan,
  deleteDietPlan
} = require("../controllers/dietController");
const protectAdmin = require("../middleware/adminMiddleware");

const router = express.Router();

router.get("/", getDietPlans);
router.post("/", protectAdmin, createDietPlan);
router.put("/:id", protectAdmin, updateDietPlan);
router.delete("/:id", protectAdmin, deleteDietPlan);

module.exports = router;

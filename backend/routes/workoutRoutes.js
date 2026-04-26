const express = require("express");
const {
  getWorkoutPlans,
  getExerciseCatalog,
  getExerciseImage,
  generateWorkoutPlan,
  getSavedWorkoutPlans,
  getWorkoutHistory,
  regenerateWorkoutPlan,
  getAdminWorkoutOverview,
  createExercise,
  updateExercise,
  deleteExercise,
  createWorkoutPlan,
  updateWorkoutPlan,
  deleteWorkoutPlan
} = require("../controllers/workoutController");
const protectAdmin = require("../middleware/adminMiddleware");
const { protectUser } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/exercise-image/:workoutType/:slug.svg", getExerciseImage);
router.get("/exercises", getExerciseCatalog);
router.post("/exercises", protectAdmin, createExercise);
router.put("/exercises/:id", protectAdmin, updateExercise);
router.delete("/exercises/:id", protectAdmin, deleteExercise);
router.post("/generate", protectUser, generateWorkoutPlan);
router.get("/saved", protectUser, getSavedWorkoutPlans);
router.get("/history", protectUser, getWorkoutHistory);
router.post("/regenerate/:id", protectUser, regenerateWorkoutPlan);
router.get("/admin/overview", protectAdmin, getAdminWorkoutOverview);
router.get("/", getWorkoutPlans);
router.post("/", protectAdmin, createWorkoutPlan);
router.put("/:id", protectAdmin, updateWorkoutPlan);
router.delete("/:id", protectAdmin, deleteWorkoutPlan);

module.exports = router;

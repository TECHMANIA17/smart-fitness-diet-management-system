const User = require("../models/User");
const BmiRecord = require("../models/BmiRecord");
const DietPlan = require("../models/DietPlan");
const WorkoutPlan = require("../models/WorkoutPlan");
const Progress = require("../models/Progress");
const Tip = require("../models/Tip");
const {
  createHealthSnapshot,
  pickRecommendedPlan,
  goalsMatch
} = require("../utils/calculations");
const { sanitizeEquipment, sanitizeInjuries } = require("../services/workoutPlanner");

const saveBmiRecord = async (user) => {
  const snapshot = createHealthSnapshot(user);

  await BmiRecord.create({
    user: user._id,
    heightCm: user.heightCm,
    weightKg: user.weightKg,
    bmi: snapshot.bmi,
    bmiCategory: snapshot.bmiCategory,
    idealWeightMin: snapshot.idealWeightRange.minWeight,
    idealWeightMax: snapshot.idealWeightRange.maxWeight,
    recommendedCalories: snapshot.recommendedCalories,
    waterIntakeLiters: snapshot.waterIntakeLiters
  });

  return snapshot;
};

const getUserProfile = async (req, res) =>
  res.json({
    success: true,
    profile: req.user
  });

const updateUserProfile = async (req, res) => {
  try {
    const fields = [
      "name",
      "age",
      "gender",
      "heightCm",
      "weightKg",
      "activityLevel",
      "fitnessLevel",
      "fitnessGoal",
      "preferredWorkoutType",
      "workoutDaysPerWeek",
      "workoutMinutesPerDay",
      "injuries",
      "equipmentAvailability"
    ];

    fields.forEach((field) => {
      if (req.body[field] !== undefined) {
        if (["age", "heightCm", "weightKg", "workoutDaysPerWeek", "workoutMinutesPerDay"].includes(field)) {
          req.user[field] = Number(req.body[field]);
          return;
        }

        if (field === "injuries") {
          req.user[field] = sanitizeInjuries(req.body[field]);
          return;
        }

        if (field === "equipmentAvailability") {
          req.user[field] = sanitizeEquipment(req.body[field]);
          return;
        }

        req.user[field] = req.body[field];
      }
    });

    await req.user.save();
    const snapshot = await saveBmiRecord(req.user);

    return res.json({
      success: true,
      message: "Profile updated successfully",
      profile: req.user,
      snapshot
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getDashboard = async (req, res) => {
  try {
    const [assignedDiets, defaultDiets, workouts, recentProgress, tips] = await Promise.all([
      DietPlan.find({ user: req.user._id }).sort({ createdAt: -1 }),
      DietPlan.find({ user: null }).sort({ createdAt: -1 }),
      WorkoutPlan.find({ user: req.user._id }).sort({ createdAt: -1 }),
      Progress.find({ user: req.user._id }).sort({ date: -1 }).limit(6),
      Tip.find({ $or: [{ user: null }, { user: req.user._id }] }).populate("user", "name email").sort({ createdAt: -1 }).limit(6)
    ]);
    const diets = [...assignedDiets, ...defaultDiets];

    const snapshot = createHealthSnapshot(req.user);
    const recommendedDiet = pickRecommendedPlan(
      diets,
      req.user.fitnessGoal,
      req.user.fitnessLevel
    );
    const recommendedWorkout = pickRecommendedPlan(
      workouts,
      req.user.fitnessGoal,
      req.user.fitnessLevel
    );

    return res.json({
      success: true,
      user: req.user,
      snapshot,
      recommendedDiet,
      recommendedWorkout,
      recentProgress,
      tips
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getBMIReport = async (req, res) => {
  try {
    const snapshot = createHealthSnapshot(req.user);
    const records = await BmiRecord.find({ user: req.user._id }).sort({ recordedAt: -1 }).limit(10);

    return res.json({ success: true, snapshot, records });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getPersonalPlans = async (req, res) => {
  try {
    const [assignedDiets, defaultDiets, assignedWorkouts, defaultWorkouts] = await Promise.all([
      DietPlan.find({ user: req.user._id }).sort({ createdAt: -1 }),
      DietPlan.find({ user: null }).sort({ createdAt: -1 }),
      WorkoutPlan.find({ user: req.user._id }).sort({ createdAt: -1 }),
      WorkoutPlan.find({ user: null }).sort({ createdAt: -1 })
    ]);
    const dietPool = [...assignedDiets, ...defaultDiets];
    const workoutPool = [...assignedWorkouts, ...defaultWorkouts];
    const diets = dietPool.filter((plan) => goalsMatch(plan.goal, req.user.fitnessGoal));
    const workouts = workoutPool.filter((plan) => goalsMatch(plan.goal, req.user.fitnessGoal));

    return res.json({
      success: true,
      dietPlans: diets,
      workoutPlans: workouts
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getUserProfile,
  updateUserProfile,
  getDashboard,
  getBMIReport,
  getPersonalPlans
};

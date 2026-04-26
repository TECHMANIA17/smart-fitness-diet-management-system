const mongoose = require("mongoose");
const Exercise = require("../models/Exercise");
const WorkoutPlan = require("../models/WorkoutPlan");
const User = require("../models/User");
const {
  buildAssessment,
  buildWorkoutPlanDocument,
  canonicalGoal
} = require("../services/workoutPlanner");
const seedExerciseLibrary = require("../utils/seedExerciseLibrary");

const getWorkoutPlans = async (req, res) => {
  try {
    const query = {};

    if (req.query.goal) {
      query.goal = canonicalGoal(req.query.goal);
    }

    if (req.query.workoutType) {
      query.workoutType = String(req.query.workoutType).toLowerCase();
    }

    const plans = await WorkoutPlan.find(query)
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    return res.json({ success: true, plans });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getExerciseCatalog = async (req, res) => {
  try {
    await seedExerciseLibrary();
    const query = { isActive: true };

    if (req.query.workoutType) query.workoutType = req.query.workoutType;
    if (req.query.level) query.level = req.query.level;

    const exercises = await Exercise.find(query).sort({ workoutType: 1, level: 1, name: 1 });
    const overview = {
      totalExercises: exercises.length,
      workoutTypes: ["gym", "yoga", "calisthenics"].map((workoutType) => ({
        workoutType,
        count: exercises.filter((exercise) => exercise.workoutType === workoutType).length
      })),
      levels: ["beginner", "moderate", "advanced"].map((level) => ({
        level,
        count: exercises.filter((exercise) => exercise.level === level).length
      }))
    };

    return res.json({ success: true, exercises, overview });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getExerciseImage = async (req, res) => {
  const workoutType = String(req.params.workoutType || "gym").toLowerCase();
  const slug = String(req.params.slug || "exercise");
  const label = slug
    .replace(/-/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());

  const palettes = {
    gym: { start: "#115e59", end: "#f97316", accent: "#cffafe" },
    yoga: { start: "#166534", end: "#f59e0b", accent: "#dcfce7" },
    calisthenics: { start: "#1d4ed8", end: "#0f766e", accent: "#dbeafe" }
  };

  const palette = palettes[workoutType] || palettes.gym;

  res.setHeader("Content-Type", "image/svg+xml");
  return res.send(`
    <svg xmlns="http://www.w3.org/2000/svg" width="640" height="420" viewBox="0 0 640 420" fill="none">
      <rect width="640" height="420" rx="28" fill="${palette.accent}"/>
      <rect x="24" y="24" width="592" height="372" rx="24" fill="url(#bg)"/>
      <circle cx="112" cy="96" r="42" fill="rgba(255,255,255,0.16)"/>
      <circle cx="540" cy="88" r="28" fill="rgba(255,255,255,0.12)"/>
      <rect x="72" y="132" width="220" height="14" rx="7" fill="rgba(255,255,255,0.28)"/>
      <rect x="72" y="156" width="320" height="10" rx="5" fill="rgba(255,255,255,0.2)"/>
      <rect x="72" y="218" width="164" height="120" rx="20" fill="rgba(255,255,255,0.18)"/>
      <rect x="260" y="218" width="308" height="24" rx="12" fill="rgba(255,255,255,0.22)"/>
      <rect x="260" y="258" width="260" height="16" rx="8" fill="rgba(255,255,255,0.18)"/>
      <rect x="260" y="288" width="220" height="16" rx="8" fill="rgba(255,255,255,0.18)"/>
      <text x="72" y="110" fill="white" font-size="18" font-family="Segoe UI, Arial, sans-serif" font-weight="700">${workoutType.toUpperCase()}</text>
      <text x="72" y="198" fill="white" font-size="34" font-family="Segoe UI, Arial, sans-serif" font-weight="800">${label}</text>
      <text x="72" y="372" fill="rgba(255,255,255,0.72)" font-size="16" font-family="Segoe UI, Arial, sans-serif">Smart Fitness exercise placeholder</text>
      <defs>
        <linearGradient id="bg" x1="24" y1="24" x2="616" y2="396" gradientUnits="userSpaceOnUse">
          <stop stop-color="${palette.start}"/>
          <stop offset="1" stop-color="${palette.end}"/>
        </linearGradient>
      </defs>
    </svg>
  `);
};

const generateWorkoutPlan = async (req, res) => {
  try {
    await seedExerciseLibrary();
    const assessment = buildAssessment(req.user, req.body);
    const exercises = await Exercise.find({ workoutType: assessment.workoutTypePreference, isActive: true }).sort({ name: 1 });

    if (!exercises.length) {
      return res.status(400).json({ success: false, message: "No exercise library found for the selected workout type." });
    }

    const planPayload = buildWorkoutPlanDocument(assessment, exercises);
    const plan = await WorkoutPlan.create({
      ...planPayload,
      user: req.user._id,
      planSource: "generated"
    });

    return res.status(201).json({ success: true, message: "Workout plan generated.", plan });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

const getSavedWorkoutPlans = async (req, res) => {
  try {
    const plans = await WorkoutPlan.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(8);

    return res.json({ success: true, plans });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getWorkoutHistory = async (req, res) => {
  try {
    const plans = await WorkoutPlan.find({ user: req.user._id }).sort({ createdAt: -1 });
    return res.json({ success: true, plans });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const regenerateWorkoutPlan = async (req, res) => {
  try {
    await seedExerciseLibrary();
    const previousPlan = await WorkoutPlan.findOne({ _id: req.params.id, user: req.user._id });

    if (!previousPlan) {
      return res.status(404).json({ success: false, message: "Workout plan not found." });
    }

    const exercises = await Exercise.find({ workoutType: previousPlan.workoutType, isActive: true }).sort({ name: 1 });
    const previousExerciseSlugs = (previousPlan.exercises || [])
      .map((exercise) => String(exercise.name || "").toLowerCase().replace(/[^a-z0-9]+/g, "-"))
      .filter(Boolean)
      .map((slug) => `${previousPlan.workoutType}-${slug}`);

    const planPayload = buildWorkoutPlanDocument(previousPlan.assessment, exercises, {
      excludeExerciseSlugs: previousExerciseSlugs
    });

    const plan = await WorkoutPlan.create({
      ...planPayload,
      user: req.user._id,
      planSource: "generated",
      regeneratedFrom: previousPlan._id
    });

    return res.status(201).json({ success: true, message: "Workout plan regenerated.", plan });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

const getAdminWorkoutOverview = async (req, res) => {
  try {
    await seedExerciseLibrary();
    const [exercises, recentPlans, totalPlans] = await Promise.all([
      Exercise.find({ isActive: true }).sort({ workoutType: 1, level: 1, name: 1 }),
      WorkoutPlan.find().populate("user", "name email").sort({ createdAt: -1 }).limit(12),
      WorkoutPlan.countDocuments()
    ]);

    const stats = {
      totalExercises: exercises.length,
      totalPlans,
      byWorkoutType: ["gym", "yoga", "calisthenics"].map((workoutType) => ({
        workoutType,
        count: exercises.filter((exercise) => exercise.workoutType === workoutType).length
      })),
      byLevel: ["beginner", "moderate", "advanced"].map((level) => ({
        level,
        count: exercises.filter((exercise) => exercise.level === level).length
      }))
    };

    return res.json({ success: true, stats, exercises, plans: recentPlans });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const buildManualWorkoutPlan = async (payload) => {
  const {
    user,
    title,
    goal,
    fitnessLevel,
    workoutType,
    duration,
    weeklySchedule,
    notes,
    exerciseIds = [],
    workoutDaysPerWeek,
    workoutMinutesPerDay
  } = payload;

  const exercises = await Exercise.find({ _id: { $in: exerciseIds } }).sort({ name: 1 });

  if (!exercises.length) {
    throw new Error("Select at least one exercise.");
  }

  const normalizedType = String(workoutType || payload.workoutCategory || "gym").toLowerCase();
  const normalizedLevel = String(fitnessLevel || "beginner").toLowerCase();
  const dayCount = Math.max(1, Math.min(7, Number(workoutDaysPerWeek || 3)));
  const itemsPerDay = Math.max(1, Math.ceil(exercises.length / dayCount));

  const summarizedExercises = exercises.map((exercise) => ({
    exerciseId: exercise._id,
    name: exercise.name,
    workoutType: exercise.workoutType,
    level: exercise.level,
    category: exercise.category,
    bodyPart: exercise.bodyPart,
    equipment: exercise.equipment,
    sets: exercise.sets,
    reps: exercise.reps,
    duration: exercise.duration,
    restSeconds: exercise.restSeconds,
    instructions: exercise.instructions,
    caloriesBurnEstimate: exercise.caloriesBurnEstimate || 0,
    image: exercise.image
  }));

  const weeklyPlan = Array.from({ length: dayCount }, (_, index) => {
    const exerciseSlice = summarizedExercises.slice(index * itemsPerDay, (index + 1) * itemsPerDay);
    return {
      dayNumber: index + 1,
      title: `Day ${index + 1}`,
      focus: exerciseSlice.map((item) => formatFocus(item.bodyPart)).slice(0, 2).join(" and ") || "custom focus",
      difficulty: normalizedLevel,
      estimatedCalories: exerciseSlice.reduce((total, item) => total + (item.caloriesBurnEstimate || 0), 0),
      exercises: exerciseSlice
    };
  }).filter((day) => day.exercises.length);

  return {
    user,
    title,
    goal: canonicalGoal(goal),
    normalizedGoal: canonicalGoal(goal),
    fitnessLevel: normalizedLevel,
    workoutType: normalizedType,
    workoutCategory: normalizedType,
    duration: duration || `${workoutMinutesPerDay || 45} minutes/day`,
    weeklySchedule: weeklySchedule || `${weeklyPlan.length} admin-managed workout days`,
    notes: notes || "Custom plan created by admin from the exercise library.",
    assessment: {
      fitnessGoal: canonicalGoal(goal),
      fitnessLevel: normalizedLevel,
      workoutTypePreference: normalizedType,
      workoutDaysPerWeek: weeklyPlan.length,
      workoutMinutesPerDay: Number(workoutMinutesPerDay || 45),
      injuries: [],
      equipmentAvailability: []
    },
    exercises: summarizedExercises,
    weeklyPlan,
    totalEstimatedCalories: weeklyPlan.reduce((total, day) => total + day.estimatedCalories, 0),
    planSource: "manual",
    isDefault: false
  };
};

const resolveUserReference = async (payload = {}) => {
  const directUser = String(payload.user || "").trim();
  const userIdentifier = String(payload.userIdentifier || "").trim().toLowerCase();
  const lookupValue = directUser || userIdentifier;

  if (!lookupValue) {
    throw new Error("Select a user or provide a user email/ID.");
  }

  if (mongoose.Types.ObjectId.isValid(lookupValue)) {
    const userById = await User.findById(lookupValue).select("_id");
    if (userById) return userById._id;
  }

  const userByEmail = await User.findOne({ email: lookupValue }).select("_id");
  if (userByEmail) return userByEmail._id;

  throw new Error("User not found for the provided email or ID.");
};

const formatFocus = (value = "") =>
  String(value)
    .replaceAll("_", " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());

const createExercise = async (req, res) => {
  try {
    const exercise = await Exercise.create(req.body);
    return res.status(201).json({ success: true, message: "Exercise added.", exercise });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

const updateExercise = async (req, res) => {
  try {
    const exercise = await Exercise.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!exercise) {
      return res.status(404).json({ success: false, message: "Exercise not found." });
    }

    return res.json({ success: true, message: "Exercise updated.", exercise });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

const deleteExercise = async (req, res) => {
  try {
    await Exercise.findByIdAndDelete(req.params.id);
    return res.json({ success: true, message: "Exercise deleted." });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

const createWorkoutPlan = async (req, res) => {
  try {
    const resolvedUser = await resolveUserReference(req.body);
    const planPayload = req.body.exerciseIds
      ? await buildManualWorkoutPlan(req.body)
      : {
          ...req.body,
          planSource: "manual",
          workoutType: req.body.workoutType || req.body.workoutCategory
        };

    delete planPayload.userIdentifier;
    planPayload.user = resolvedUser;

    const plan = await WorkoutPlan.create(planPayload);
    return res.status(201).json({ success: true, message: "Workout plan added", plan });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

const updateWorkoutPlan = async (req, res) => {
  try {
    const resolvedUser = await resolveUserReference(req.body);
    const updatePayload = req.body.exerciseIds
      ? await buildManualWorkoutPlan(req.body)
      : {
          ...req.body,
          workoutType: req.body.workoutType || req.body.workoutCategory
        };

    delete updatePayload.userIdentifier;
    updatePayload.user = resolvedUser;

    const plan = await WorkoutPlan.findByIdAndUpdate(
      req.params.id,
      updatePayload,
      { new: true, runValidators: true }
    );
    return res.json({ success: true, message: "Workout plan updated", plan });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

const deleteWorkoutPlan = async (req, res) => {
  try {
    await WorkoutPlan.findByIdAndDelete(req.params.id);
    return res.json({ success: true, message: "Workout plan deleted" });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

module.exports = {
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
};

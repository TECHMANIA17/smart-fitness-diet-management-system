require("dotenv").config();

const bcrypt = require("bcryptjs");
const connectDB = require("./config/db");
const Admin = require("./models/Admin");
const User = require("./models/User");
const DietPlan = require("./models/DietPlan");
const WorkoutPlan = require("./models/WorkoutPlan");
const Tip = require("./models/Tip");
const Progress = require("./models/Progress");
const BmiRecord = require("./models/BmiRecord");
const Exercise = require("./models/Exercise");
const { EXERCISE_LIBRARY } = require("./data/exerciseLibrary");
const { createHealthSnapshot } = require("./utils/calculations");
const { buildAssessment, buildWorkoutPlanDocument } = require("./services/workoutPlanner");

const seed = async () => {
  await connectDB();

  await Promise.all([
    Admin.deleteMany({}),
    User.deleteMany({}),
    DietPlan.deleteMany({}),
    WorkoutPlan.deleteMany({}),
    Tip.deleteMany({}),
    Progress.deleteMany({}),
    BmiRecord.deleteMany({}),
    Exercise.deleteMany({})
  ]);

  const admin = await Admin.create({
    name: "System Admin",
    email: "admin@smartfitness.com",
    password: await bcrypt.hash("Admin@123", 10)
  });

  const user = await User.create({
    name: "Rahul Sharma",
    email: "rahul@example.com",
    password: await bcrypt.hash("User@123", 10),
    age: 24,
    gender: "male",
    heightCm: 175,
    weightKg: 78,
    activityLevel: "moderate",
    fitnessLevel: "beginner",
    fitnessGoal: "weight_loss",
    preferredWorkoutType: "gym",
    workoutDaysPerWeek: 4,
    workoutMinutesPerDay: 45,
    injuries: ["knee"],
    equipmentAvailability: ["machine", "dumbbell", "treadmill", "mat", "bench", "bike"]
  });

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

  await DietPlan.insertMany([
    {
      title: "Fat Loss Balanced Plan",
      goal: "lose_weight",
      fitnessLevel: "all",
      cuisine: "indian",
      calorieRange: "1600-1900 kcal",
      meals: {
        breakfast: "Oats with banana and boiled eggs",
        lunch: "Brown rice, grilled paneer, salad",
        dinner: "Soup, roti, mixed vegetables",
        snacks: "Fruit, nuts, green tea"
      },
      hydrationTip: "Drink one glass of water before every meal.",
      notes: "Keep sugar intake low and avoid late-night snacking."
    },
    {
      title: "Maharashtrian Lean Plate",
      goal: "maintain_fitness",
      fitnessLevel: "all",
      cuisine: "maharashtrian",
      calorieRange: "1800-2100 kcal",
      meals: {
        breakfast: "Kanda poha with sprouts",
        lunch: "Jowar bhakri, matki usal, cucumber",
        dinner: "Chapati with amti and dudhi bhaji",
        snacks: "Bhadang with buttermilk"
      },
      hydrationTip: "Use lemon water or taak between meals for hydration.",
      notes: "Keeps regional flavors while supporting a balanced plan."
    }
  ]);

  const exerciseDocs = await Exercise.insertMany(EXERCISE_LIBRARY);
  const assessment = buildAssessment(user, user.toObject());
  const planPayload = buildWorkoutPlanDocument(
    assessment,
    exerciseDocs.filter((exercise) => exercise.workoutType === assessment.workoutTypePreference)
  );

  await WorkoutPlan.create({
    ...planPayload,
    user: user._id,
    planSource: "generated"
  });

  await Tip.insertMany([
    {
      title: "Stay Hydrated",
      category: "hydration",
      content: "Carry a water bottle and sip water regularly through the day.",
      targetAudience: "all"
    },
    {
      title: "Train With Progression",
      category: "workout",
      content: "Increase reps, duration, or difficulty gradually instead of doing every session at maximum effort.",
      targetAudience: "all"
    }
  ]);

  await Progress.create({
    user: user._id,
    date: new Date("2026-04-15"),
    currentWeight: 77.2,
    caloriesTaken: 1780,
    waterTaken: 3.1,
    stepsWalked: 11000,
    workoutDone: "Generated gym fat-loss routine",
    note: "Improved stamina",
    bmi: 25.21
  });

  console.log(`Seeded ${exerciseDocs.length} exercises.`);
  console.log("Sample data inserted successfully.");
  console.log(`Admin login: ${admin.email} / Admin@123`);
  console.log(`User login: ${user.email} / User@123`);
  process.exit(0);
};

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});

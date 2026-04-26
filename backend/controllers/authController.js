const bcrypt = require("bcryptjs");
const User = require("../models/User");
const Admin = require("../models/Admin");
const BmiRecord = require("../models/BmiRecord");
const generateToken = require("../utils/generateToken");
const { createHealthSnapshot } = require("../utils/calculations");
const { sanitizeEquipment, sanitizeInjuries } = require("../services/workoutPlanner");

const sanitizeUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  age: user.age,
  gender: user.gender,
  heightCm: user.heightCm,
  weightKg: user.weightKg,
  activityLevel: user.activityLevel,
  fitnessLevel: user.fitnessLevel,
  fitnessGoal: user.fitnessGoal,
  dietPreference: user.dietPreference,
  preferredWorkoutType: user.preferredWorkoutType,
  workoutDaysPerWeek: user.workoutDaysPerWeek,
  workoutMinutesPerDay: user.workoutMinutesPerDay,
  injuries: user.injuries,
  equipmentAvailability: user.equipmentAvailability
});

const registerUser = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      age,
      gender,
      heightCm,
      weightKg,
      activityLevel,
      fitnessLevel,
      fitnessGoal,
      dietPreference,
      preferredWorkoutType,
      workoutDaysPerWeek,
      workoutMinutesPerDay,
      injuries,
      equipmentAvailability
    } = req.body;

    if (
      !name ||
      !email ||
      !password ||
      !age ||
      !gender ||
      !heightCm ||
      !weightKg ||
      !activityLevel ||
      !fitnessLevel ||
      !fitnessGoal ||
      !dietPreference
    ) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });

    if (existingUser) {
      return res.status(400).json({ success: false, message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      age,
      gender,
      heightCm,
      weightKg,
      activityLevel,
      fitnessLevel,
      fitnessGoal,
      dietPreference,
      preferredWorkoutType,
      workoutDaysPerWeek,
      workoutMinutesPerDay,
      injuries: sanitizeInjuries(injuries),
      equipmentAvailability: sanitizeEquipment(equipmentAvailability)
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

    const token = generateToken({ id: user._id, role: "user" });

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      token,
      user: sanitizeUser(user)
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: String(email).toLowerCase() });

    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    const token = generateToken({ id: user._id, role: "user" });

    return res.json({
      success: true,
      message: "Login successful",
      token,
      user: sanitizeUser(user)
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const admin = await Admin.findOne({ email: String(email).toLowerCase() });

    if (!admin) {
      return res.status(401).json({ success: false, message: "Invalid admin credentials" });
    }

    const isMatch = await bcrypt.compare(password, admin.password);

    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid admin credentials" });
    }

    const token = generateToken({ id: admin._id, role: "admin" });

    return res.json({
      success: true,
      message: "Admin login successful",
      token,
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getMyProfile = async (req, res) =>
  res.json({
    success: true,
    user: req.user
  });

const getAdminProfile = async (req, res) =>
  res.json({
    success: true,
    admin: req.admin
  });

module.exports = {
  registerUser,
  loginUser,
  loginAdmin,
  getMyProfile,
  getAdminProfile
};

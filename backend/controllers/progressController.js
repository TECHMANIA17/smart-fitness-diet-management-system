const Progress = require("../models/Progress");
const User = require("../models/User");
const { calculateBMI } = require("../utils/calculations");

const addProgress = async (req, res) => {
  try {
    const {
      date,
      currentWeight,
      caloriesTaken,
      waterTaken,
      stepsWalked,
      workoutDone,
      note
    } = req.body;

    const bmi = calculateBMI(req.user.heightCm, currentWeight);

    const progress = await Progress.create({
      user: req.user._id,
      date,
      currentWeight,
      caloriesTaken,
      waterTaken,
      stepsWalked,
      workoutDone,
      note,
      bmi
    });

    req.user.weightKg = currentWeight;
    await req.user.save();

    return res.status(201).json({
      success: true,
      message: "Progress saved successfully",
      progress
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

const getMyProgress = async (req, res) => {
  try {
    const sortField = req.query.sort === "oldest" ? 1 : -1;
    const filter = { user: req.user._id };

    if (req.query.date) {
      filter.date = new Date(req.query.date);
    }

    const history = await Progress.find(filter).sort({ date: sortField });

    return res.json({ success: true, history });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getProgressSummary = async (req, res) => {
  try {
    const history = await Progress.find({ user: req.user._id }).sort({ date: 1 }).limit(12);
    return res.json({ success: true, history });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getProgressByUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select("name email fitnessGoal");
    const history = await Progress.find({ user: req.params.userId }).sort({ date: -1 });

    return res.json({ success: true, user, history });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  addProgress,
  getMyProgress,
  getProgressSummary,
  getProgressByUser
};

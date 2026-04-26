const User = require("../models/User");
const DietPlan = require("../models/DietPlan");
const WorkoutPlan = require("../models/WorkoutPlan");
const Tip = require("../models/Tip");
const Progress = require("../models/Progress");

const getAdminDashboard = async (req, res) => {
  try {
    const [userCount, dietCount, workoutCount, tipCount, progressCount, recentUsers] =
      await Promise.all([
        User.countDocuments(),
        DietPlan.countDocuments(),
        WorkoutPlan.countDocuments(),
        Tip.countDocuments(),
        Progress.countDocuments(),
        User.find().sort({ createdAt: -1 }).limit(5).select("-password")
      ]);

    return res.json({
      success: true,
      stats: {
        userCount,
        dietCount,
        workoutCount,
        tipCount,
        progressCount
      },
      recentUsers
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const manageUsers = async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 }).select("-password");
    return res.json({ success: true, users });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    await Progress.deleteMany({ user: req.params.id });

    return res.json({ success: true, message: "User deleted successfully" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const viewUserProgress = async (req, res) => {
  try {
    const filter = req.params.id ? { user: req.params.id } : {};
    const records = await Progress.find(filter)
      .populate("user", "name email fitnessGoal")
      .sort({ date: -1 });

    return res.json({ success: true, records });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getAdminDashboard,
  manageUsers,
  deleteUser,
  viewUserProgress
};

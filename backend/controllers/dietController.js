const mongoose = require("mongoose");
const DietPlan = require("../models/DietPlan");
const User = require("../models/User");

const MEAL_SLOTS = ["breakfast", "lunch", "dinner", "snacks"];

const normalizeMeal = (meal = {}, fallbackCategory = "pure_veg") => {
  if (typeof meal === "string") {
    return {
      name: meal,
      quantity: "1 serving",
      calories: 0,
      category: fallbackCategory
    };
  }

  return {
    name: meal.name || "",
    quantity: meal.quantity || "1 serving",
    calories: Number(meal.calories) || 0,
    category: meal.category || fallbackCategory
  };
};

const normalizeDietPayload = (payload = {}) => {
  const dietCategory = payload.dietCategory || "pure_veg";
  const meals = MEAL_SLOTS.reduce((accumulator, slot) => {
    accumulator[slot] = normalizeMeal(payload.meals?.[slot], dietCategory);
    return accumulator;
  }, {});

  return {
    ...payload,
    dietCategory,
    meals
  };
};

const resolveUserReference = async (payload = {}) => {
  const directUser = String(payload.user || "").trim();
  const userIdentifier = String(payload.userIdentifier || "").trim().toLowerCase();
  const lookupValue = directUser || userIdentifier;

  if (!lookupValue) {
    return null;
  }

  if (mongoose.Types.ObjectId.isValid(lookupValue)) {
    const userById = await User.findById(lookupValue).select("_id");
    if (userById) return userById._id;
  }

  const userByEmail = await User.findOne({ email: lookupValue }).select("_id");
  if (userByEmail) return userByEmail._id;

  throw new Error("User not found for the provided email or ID.");
};

const getDietPlans = async (req, res) => {
  try {
    const query = {};

    if (req.query.goal) {
      query.goal = req.query.goal;
    }

    if (req.query.dietCategory) {
      query.dietCategory = req.query.dietCategory;
    }

    if (req.query.user) {
      query.user = req.query.user;
    }

    const plans = await DietPlan.find(query)
      .populate("user", "name email")
      .sort({ createdAt: -1 });
    return res.json({ success: true, plans });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const createDietPlan = async (req, res) => {
  try {
    const resolvedUser = await resolveUserReference(req.body);
    const payload = normalizeDietPayload(req.body);
    delete payload.userIdentifier;
    payload.user = resolvedUser;
    payload.isDefault = !resolvedUser;

    const plan = await DietPlan.create(payload);
    return res.status(201).json({ success: true, message: "Diet plan added", plan });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

const updateDietPlan = async (req, res) => {
  try {
    const resolvedUser = await resolveUserReference(req.body);
    const payload = normalizeDietPayload(req.body);
    delete payload.userIdentifier;
    payload.user = resolvedUser;
    payload.isDefault = !resolvedUser;

    const plan = await DietPlan.findByIdAndUpdate(req.params.id, payload, {
      new: true,
      runValidators: true
    });
    return res.json({ success: true, message: "Diet plan updated", plan });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

const deleteDietPlan = async (req, res) => {
  try {
    await DietPlan.findByIdAndDelete(req.params.id);
    return res.json({ success: true, message: "Diet plan deleted" });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

module.exports = {
  getDietPlans,
  createDietPlan,
  updateDietPlan,
  deleteDietPlan
};

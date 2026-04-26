const mongoose = require("mongoose");

const dietPlanSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    goal: {
      type: String,
      enum: ["lose_weight", "gain_weight", "build_muscle", "maintain_fitness"],
      required: true
    },
    fitnessLevel: {
      type: String,
      enum: ["all", "beginner", "intermediate", "advanced"],
      default: "all"
    },
    dietCategory: {
      type: String,
      enum: ["pure_veg", "mix_veg", "non_veg"],
      default: "pure_veg"
    },
    cuisine: {
      type: String,
      enum: ["indian", "maharashtrian"],
      default: "indian"
    },
    calorieRange: {
      type: String,
      required: true
    },
    meals: {
      breakfast: {
        type: mongoose.Schema.Types.Mixed,
        required: true
      },
      lunch: {
        type: mongoose.Schema.Types.Mixed,
        required: true
      },
      dinner: {
        type: mongoose.Schema.Types.Mixed,
        required: true
      },
      snacks: {
        type: mongoose.Schema.Types.Mixed,
        required: true
      }
    },
    hydrationTip: String,
    notes: String,
    isDefault: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("DietPlan", dietPlanSchema);

const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    password: {
      type: String,
      required: true
    },
    age: {
      type: Number,
      required: true,
      min: 10,
      max: 100
    },
    gender: {
      type: String,
      enum: ["male", "female", "other"],
      required: true
    },
    heightCm: {
      type: Number,
      required: true,
      min: 100,
      max: 250
    },
    weightKg: {
      type: Number,
      required: true,
      min: 20,
      max: 300
    },
    activityLevel: {
      type: String,
      enum: ["sedentary", "light", "moderate", "active", "very_active"],
      required: true
    },
    fitnessLevel: {
      type: String,
      enum: ["beginner", "intermediate", "advanced"],
      required: true
    },
    fitnessGoal: {
      type: String,
      enum: [
        "lose_weight",
        "gain_weight",
        "build_muscle",
        "maintain_fitness",
        "weight_loss",
        "muscle_gain",
        "flexibility",
        "endurance",
        "maintenance"
      ],
      required: true
    },
    dietPreference: {
      type: String,
      enum: ["pure_veg", "mix_veg", "non_veg"],
      default: "pure_veg"
    },
    preferredWorkoutType: {
      type: String,
      enum: ["gym", "yoga", "calisthenics"],
      default: "gym"
    },
    workoutDaysPerWeek: {
      type: Number,
      min: 1,
      max: 7,
      default: 4
    },
    workoutMinutesPerDay: {
      type: Number,
      min: 10,
      max: 180,
      default: 45
    },
    injuries: {
      type: [String],
      default: []
    },
    equipmentAvailability: {
      type: [String],
      default: []
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);

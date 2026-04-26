const mongoose = require("mongoose");

const bmiRecordSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    heightCm: {
      type: Number,
      required: true
    },
    weightKg: {
      type: Number,
      required: true
    },
    bmi: {
      type: Number,
      required: true
    },
    bmiCategory: {
      type: String,
      required: true
    },
    idealWeightMin: {
      type: Number,
      required: true
    },
    idealWeightMax: {
      type: Number,
      required: true
    },
    recommendedCalories: {
      type: Number,
      required: true
    },
    waterIntakeLiters: {
      type: Number,
      required: true
    },
    recordedAt: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("BmiRecord", bmiRecordSchema);

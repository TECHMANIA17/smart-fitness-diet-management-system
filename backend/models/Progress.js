const mongoose = require("mongoose");

const progressSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    date: {
      type: Date,
      required: true
    },
    currentWeight: {
      type: Number,
      required: true
    },
    caloriesTaken: {
      type: Number,
      required: true
    },
    waterTaken: {
      type: Number,
      required: true
    },
    stepsWalked: {
      type: Number,
      required: true
    },
    workoutDone: {
      type: String,
      required: true
    },
    note: {
      type: String,
      trim: true
    },
    bmi: {
      type: Number,
      required: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Progress", progressSchema);

const mongoose = require("mongoose");

const exerciseSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true },
    workoutType: { type: String, enum: ["gym", "yoga", "calisthenics"], required: true },
    level: { type: String, enum: ["beginner", "moderate", "advanced"], required: true },
    category: { type: String, required: true, trim: true },
    bodyPart: { type: String, required: true, trim: true },
    goalTags: { type: [String], default: [] },
    equipment: { type: String, required: true, trim: true },
    sets: { type: Number, min: 1 },
    reps: String,
    duration: String,
    restSeconds: { type: Number, required: true, min: 0 },
    instructions: { type: String, required: true, trim: true },
    caloriesBurnEstimate: { type: Number, min: 0 },
    image: { type: String, required: true, trim: true },
    contraindications: { type: [String], default: [] },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

exerciseSchema.index({ workoutType: 1, level: 1 });

module.exports = mongoose.model("Exercise", exerciseSchema);

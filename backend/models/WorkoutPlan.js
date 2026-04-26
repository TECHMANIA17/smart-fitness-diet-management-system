const mongoose = require("mongoose");

const workoutExerciseSchema = new mongoose.Schema(
  {
    exerciseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Exercise"
    },
    name: String,
    workoutType: String,
    level: String,
    category: String,
    bodyPart: String,
    equipment: String,
    sets: Number,
    reps: String,
    duration: String,
    restSeconds: Number,
    instructions: String,
    caloriesBurnEstimate: Number,
    image: String
  },
  { _id: false }
);

const workoutDaySchema = new mongoose.Schema(
  {
    dayNumber: Number,
    title: String,
    focus: String,
    difficulty: String,
    estimatedCalories: Number,
    exercises: [workoutExerciseSchema]
  },
  { _id: false }
);

const assessmentSchema = new mongoose.Schema(
  {
    age: Number,
    gender: String,
    heightCm: Number,
    weightKg: Number,
    bmi: Number,
    fitnessGoal: String,
    fitnessLevel: String,
    activityLevel: String,
    workoutTypePreference: String,
    workoutDaysPerWeek: Number,
    workoutMinutesPerDay: Number,
    injuries: [String],
    equipmentAvailability: [String]
  },
  { _id: false }
);

const workoutPlanSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    summary: String,
    goal: {
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
    normalizedGoal: String,
    fitnessLevel: {
      type: String,
      enum: ["all", "beginner", "intermediate", "moderate", "advanced"],
      default: "beginner"
    },
    workoutType: {
      type: String,
      enum: ["gym", "yoga", "calisthenics"],
      default: "gym"
    },
    workoutCategory: {
      type: String,
      enum: ["gym", "yoga", "calisthenics"],
      default: "gym"
    },
    duration: String,
    exercises: [workoutExerciseSchema],
    weeklySchedule: String,
    notes: String,
    assessment: assessmentSchema,
    weeklyPlan: [workoutDaySchema],
    totalEstimatedCalories: {
      type: Number,
      default: 0
    },
    planSource: {
      type: String,
      enum: ["generated", "manual"],
      default: "generated"
    },
    regeneratedFrom: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "WorkoutPlan"
    },
    isDefault: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("WorkoutPlan", workoutPlanSchema);

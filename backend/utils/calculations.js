const {
  calculateBMI,
  getBMICategory,
  getIdealWeightRange
} = require("./bmiCalculator");
const {
  ACTIVITY_MULTIPLIERS,
  GOAL_ADJUSTMENTS,
  getRecommendedCalories
} = require("./calorieCalculator");
const { getWaterIntake } = require("./waterCalculator");

const GOAL_ALIASES = {
  lose_weight: "weight_loss",
  gain_weight: "muscle_gain",
  build_muscle: "muscle_gain",
  maintain_fitness: "maintenance",
  weight_loss: "weight_loss",
  muscle_gain: "muscle_gain",
  flexibility: "flexibility",
  endurance: "endurance",
  maintenance: "maintenance"
};

const createHealthSnapshot = (profile) => {
  const bmi = calculateBMI(profile.heightCm, profile.weightKg);
  const bmiCategory = getBMICategory(bmi);
  const idealWeightRange = getIdealWeightRange(profile.heightCm);
  const recommendedCalories = getRecommendedCalories(profile);
  const waterIntakeLiters = getWaterIntake(profile.weightKg);

  return {
    bmi,
    bmiCategory,
    idealWeightRange,
    recommendedCalories,
    waterIntakeLiters
  };
};

const normalizeGoal = (goal) => GOAL_ALIASES[String(goal || "").toLowerCase()] || String(goal || "");

const goalsMatch = (leftGoal, rightGoal) => normalizeGoal(leftGoal) === normalizeGoal(rightGoal);

const pickRecommendedPlan = (plans, goal, fitnessLevel) =>
  plans.find((plan) => {
    const goalMatch = !plan.goal || goalsMatch(plan.goal, goal);
    const levelMatch =
      !plan.fitnessLevel ||
      plan.fitnessLevel === "all" ||
      plan.fitnessLevel === fitnessLevel;
    return goalMatch && levelMatch;
  }) || plans[0] || null;

module.exports = {
  ACTIVITY_MULTIPLIERS,
  GOAL_ADJUSTMENTS,
  calculateBMI,
  getBMICategory,
  getIdealWeightRange,
  getWaterIntake,
  getRecommendedCalories,
  createHealthSnapshot,
  normalizeGoal,
  goalsMatch,
  pickRecommendedPlan
};

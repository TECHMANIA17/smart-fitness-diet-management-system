const ACTIVITY_MULTIPLIERS = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9
};

const GOAL_ADJUSTMENTS = {
  lose_weight: -400,
  gain_weight: 350,
  build_muscle: 250,
  maintain_fitness: 0
};

const getBMR = ({ gender, weightKg, heightCm, age }) => {
  const weight = Number(weightKg) || 0;
  const height = Number(heightCm) || 0;
  const years = Number(age) || 0;

  if (gender === "female") {
    return 10 * weight + 6.25 * height - 5 * years - 161;
  }

  return 10 * weight + 6.25 * height - 5 * years + 5;
};

const getRecommendedCalories = (profile) => {
  const bmr = getBMR(profile);
  const multiplier = ACTIVITY_MULTIPLIERS[profile.activityLevel] || 1.2;
  const adjustment = GOAL_ADJUSTMENTS[profile.fitnessGoal] || 0;

  return Math.max(1200, Math.round(bmr * multiplier + adjustment));
};

module.exports = {
  ACTIVITY_MULTIPLIERS,
  GOAL_ADJUSTMENTS,
  getBMR,
  getRecommendedCalories
};

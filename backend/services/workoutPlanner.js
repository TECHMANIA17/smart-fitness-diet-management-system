const { calculateBMI } = require("../utils/bmiCalculator");

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

const LEVEL_ALIASES = {
  beginner: "beginner",
  intermediate: "moderate",
  moderate: "moderate",
  advanced: "advanced"
};

const FOCUS_TEMPLATES = {
  gym: ["upper body strength", "lower body strength", "cardio conditioning", "push and pull", "glutes and core", "full body circuit"],
  yoga: ["mobility and breath", "lower body flexibility", "balance and focus", "spine and posture", "core stability flow", "recovery and release"],
  calisthenics: ["push strength", "legs and core", "pull and posture", "conditioning circuit", "balance and control", "full body endurance"]
};

const FOCUS_RULES = {
  "upper body strength": { bodyParts: ["chest", "back", "shoulders", "upper_body", "triceps"], categories: ["strength"] },
  "lower body strength": { bodyParts: ["legs", "glutes", "posterior_chain"], categories: ["strength", "power"] },
  "cardio conditioning": { bodyParts: ["full_body"], categories: ["cardio", "conditioning"] },
  "push and pull": { bodyParts: ["chest", "back", "shoulders", "upper_body"], categories: ["strength"] },
  "glutes and core": { bodyParts: ["glutes", "core", "posterior_chain"], categories: ["strength", "stability"] },
  "full body circuit": { bodyParts: ["full_body"], categories: ["cardio", "conditioning", "strength", "power"] },
  "mobility and breath": { categories: ["mobility", "recovery"] },
  "lower body flexibility": { bodyParts: ["legs", "hips", "hamstrings"], categories: ["flexibility", "mobility"] },
  "balance and focus": { categories: ["balance", "strength"] },
  "spine and posture": { bodyParts: ["spine", "back"], categories: ["mobility", "flexibility"] },
  "core stability flow": { bodyParts: ["core", "full_body"], categories: ["strength", "stability"] },
  "recovery and release": { categories: ["recovery", "flexibility"] },
  "push strength": { bodyParts: ["chest", "shoulders", "triceps"], categories: ["strength", "power"] },
  "legs and core": { bodyParts: ["legs", "core", "glutes"], categories: ["strength", "stability"] },
  "pull and posture": { bodyParts: ["back", "upper_body"], categories: ["strength", "stability"] },
  "conditioning circuit": { bodyParts: ["full_body"], categories: ["conditioning", "cardio"] },
  "balance and control": { categories: ["balance", "stability"] },
  "full body endurance": { bodyParts: ["full_body"], categories: ["conditioning", "cardio", "strength"] }
};

const INJURY_BLOCKS = {
  knee: ["legs", "glutes"],
  shoulder: ["shoulders", "chest", "upper_body", "back", "triceps"],
  lower_back: ["posterior_chain", "back", "spine"],
  wrist: ["shoulders", "chest", "upper_body", "core"],
  neck: ["shoulders", "upper_body", "spine"],
  ankle: ["legs"],
  elbow: ["back", "triceps", "upper_body"],
  hip: ["hips", "legs", "glutes"],
  hamstring: ["hamstrings", "legs"]
};

const canonicalGoal = (goal) => GOAL_ALIASES[String(goal || "").toLowerCase()] || "maintenance";
const canonicalLevel = (level) => LEVEL_ALIASES[String(level || "").toLowerCase()] || "beginner";

const sanitizeList = (value) =>
  Array.isArray(value)
    ? value.map((item) => String(item).trim().toLowerCase()).filter(Boolean)
    : String(value || "")
        .split(/[,\n]/)
        .map((item) => item.trim().toLowerCase())
        .filter(Boolean);

const buildAssessment = (profile = {}, input = {}) => {
  const heightCm = Number(input.heightCm || profile.heightCm || 0);
  const weightKg = Number(input.weightKg || profile.weightKg || 0);

  return {
    age: Number(input.age || profile.age || 0),
    gender: String(input.gender || profile.gender || "other").toLowerCase(),
    heightCm,
    weightKg,
    bmi: Number(input.bmi || calculateBMI(heightCm, weightKg)),
    fitnessGoal: canonicalGoal(input.fitnessGoal || profile.fitnessGoal),
    fitnessLevel: String(input.fitnessLevel || profile.fitnessLevel || "beginner").toLowerCase(),
    activityLevel: String(input.activityLevel || profile.activityLevel || "moderate").toLowerCase(),
    workoutTypePreference: String(
      input.workoutTypePreference || input.preferredWorkoutType || profile.preferredWorkoutType || "gym"
    ).toLowerCase(),
    workoutDaysPerWeek: Math.max(3, Math.min(6, Number(input.workoutDaysPerWeek || profile.workoutDaysPerWeek || 4))),
    workoutMinutesPerDay: Math.max(20, Math.min(90, Number(input.workoutMinutesPerDay || profile.workoutMinutesPerDay || 45))),
    injuries: sanitizeList(input.injuries || profile.injuries),
    equipmentAvailability: sanitizeList(input.equipmentAvailability || profile.equipmentAvailability)
  };
};

const matchesEquipment = (exercise, equipmentAvailability) => {
  if (!equipmentAvailability.length) return true;
  if (exercise.equipment === "none") return true;
  return equipmentAvailability.includes(exercise.equipment.toLowerCase());
};

const isUnsafeForInjury = (exercise, injuries) =>
  injuries.some((injury) => {
    if ((exercise.contraindications || []).includes(injury)) return true;
    return (INJURY_BLOCKS[injury] || []).includes(exercise.bodyPart);
  });

const matchesFocus = (exercise, focus) => {
  const rule = FOCUS_RULES[focus];
  if (!rule) return true;
  return (rule.bodyParts || []).includes(exercise.bodyPart) || (rule.categories || []).includes(exercise.category);
};

const scoreExercise = (exercise, goal) => {
  let score = 0;
  if ((exercise.goalTags || []).includes(goal)) score += 4;
  if (goal === "weight_loss" && ["cardio", "conditioning", "power"].includes(exercise.category)) score += 2;
  if (goal === "muscle_gain" && ["strength", "power"].includes(exercise.category)) score += 2;
  if (goal === "flexibility" && ["flexibility", "mobility", "recovery"].includes(exercise.category)) score += 2;
  if (goal === "endurance" && ["conditioning", "cardio", "stability"].includes(exercise.category)) score += 2;
  return score;
};

const summarizeExercise = (exercise) => ({
  exerciseId: exercise._id,
  name: exercise.name,
  workoutType: exercise.workoutType,
  level: exercise.level,
  category: exercise.category,
  bodyPart: exercise.bodyPart,
  equipment: exercise.equipment,
  sets: exercise.sets,
  reps: exercise.reps,
  duration: exercise.duration,
  restSeconds: exercise.restSeconds,
  instructions: exercise.instructions,
  caloriesBurnEstimate: exercise.caloriesBurnEstimate || 0,
  image: exercise.image
});

const buildWorkoutPlanDocument = (assessment, exerciseDocuments, options = {}) => {
  const usedSlugs = new Set(options.excludeExerciseSlugs || []);
  const desiredCount =
    assessment.workoutMinutesPerDay <= 30 ? 4 : assessment.workoutMinutesPerDay <= 45 ? 5 : assessment.workoutMinutesPerDay <= 60 ? 6 : 7;
  const focusSequence = FOCUS_TEMPLATES[assessment.workoutTypePreference] || FOCUS_TEMPLATES.gym;
  const weeklyPlan = [];

  for (let index = 0; index < assessment.workoutDaysPerWeek; index += 1) {
    const focus = focusSequence[index % focusSequence.length];
    const pool = exerciseDocuments
      .filter((exercise) => exercise.workoutType === assessment.workoutTypePreference)
      .filter((exercise) => exercise.level === canonicalLevel(assessment.fitnessLevel))
      .filter((exercise) => matchesEquipment(exercise, assessment.equipmentAvailability))
      .filter((exercise) => !isUnsafeForInjury(exercise, assessment.injuries))
      .filter((exercise) => matchesFocus(exercise, focus))
      .sort((left, right) => scoreExercise(right, assessment.fitnessGoal) - scoreExercise(left, assessment.fitnessGoal));

    const prioritizedPool = [
      ...pool.filter((exercise) => !usedSlugs.has(exercise.slug)),
      ...pool.filter((exercise) => usedSlugs.has(exercise.slug))
    ];
    const chosenExercises = prioritizedPool.slice(0, desiredCount);

    chosenExercises.forEach((exercise) => usedSlugs.add(exercise.slug));

    weeklyPlan.push({
      dayNumber: index + 1,
      title: `Day ${index + 1}`,
      focus,
      difficulty: canonicalLevel(assessment.fitnessLevel),
      estimatedCalories: chosenExercises.reduce((total, exercise) => total + (exercise.caloriesBurnEstimate || 0), 0),
      exercises: chosenExercises.map(summarizeExercise)
    });
  }

  const flattenedExercises = weeklyPlan.flatMap((day) => day.exercises);

  return {
    title: `${assessment.workoutTypePreference[0].toUpperCase()}${assessment.workoutTypePreference.slice(1)} ${assessment.fitnessGoal.replaceAll("_", " ")} Plan`,
    summary: `${assessment.workoutDaysPerWeek} training days per week with ${assessment.workoutMinutesPerDay} minutes each session.`,
    goal: assessment.fitnessGoal,
    normalizedGoal: assessment.fitnessGoal,
    fitnessLevel: assessment.fitnessLevel,
    workoutType: assessment.workoutTypePreference,
    workoutCategory: assessment.workoutTypePreference,
    duration: `${assessment.workoutMinutesPerDay} minutes/day`,
    weeklySchedule: `${assessment.workoutDaysPerWeek} structured workout days`,
    notes: assessment.injuries.length
      ? `Adjusted to reduce strain around: ${assessment.injuries.join(", ")}.`
      : "Balanced for steady progression and recovery.",
    assessment,
    weeklyPlan,
    exercises: flattenedExercises,
    totalEstimatedCalories: weeklyPlan.reduce((total, day) => total + day.estimatedCalories, 0)
  };
};

module.exports = {
  buildAssessment,
  buildWorkoutPlanDocument,
  canonicalGoal,
  canonicalLevel,
  sanitizeEquipment: sanitizeList,
  sanitizeInjuries: sanitizeList
};

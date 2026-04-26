const Exercise = require("../models/Exercise");
const { EXERCISE_LIBRARY } = require("../data/exerciseLibrary");

const seedExerciseLibrary = async () => {
  const existingCount = await Exercise.countDocuments();

  if (existingCount > 0) {
    return { inserted: 0, total: existingCount };
  }

  await Exercise.insertMany(EXERCISE_LIBRARY);
  return { inserted: EXERCISE_LIBRARY.length, total: EXERCISE_LIBRARY.length };
};

module.exports = seedExerciseLibrary;

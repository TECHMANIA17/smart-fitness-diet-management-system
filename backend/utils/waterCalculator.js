const getWaterIntake = (weightKg) => {
  if (!weightKg) {
    return 0;
  }

  return Number(((Number(weightKg) * 35) / 1000).toFixed(1));
};

module.exports = { getWaterIntake };

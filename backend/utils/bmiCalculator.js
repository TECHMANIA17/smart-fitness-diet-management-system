const calculateBMI = (heightCm, weightKg) => {
  const heightM = Number(heightCm) / 100;

  if (!heightM || !weightKg) {
    return 0;
  }

  return Number((Number(weightKg) / (heightM * heightM)).toFixed(2));
};

const getBMICategory = (bmi) => {
  if (bmi < 18.5) return "Underweight";
  if (bmi < 25) return "Normal";
  if (bmi < 30) return "Overweight";
  return "Obese";
};

const getIdealWeightRange = (heightCm) => {
  const heightM = Number(heightCm) / 100;

  return {
    minWeight: Number((18.5 * heightM * heightM).toFixed(1)),
    maxWeight: Number((24.9 * heightM * heightM).toFixed(1))
  };
};

module.exports = {
  calculateBMI,
  getBMICategory,
  getIdealWeightRange
};

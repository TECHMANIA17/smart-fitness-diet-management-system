window.ValidationUtils = {
  isEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  },

  isStrongPassword(value) {
    return typeof value === "string" && value.length >= 6;
  },

  isPositiveNumber(value) {
    return !Number.isNaN(Number(value)) && Number(value) > 0;
  },

  requireFields(fields) {
    return fields.every((field) => String(field ?? "").trim() !== "");
  }
};


const mongoose = require("mongoose");

const tipSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true
    },
    category: {
      type: String,
      enum: ["diet", "workout", "hydration", "motivation", "general"],
      default: "general"
    },
    content: {
      type: String,
      required: true
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null
    },
    targetAudience: {
      type: String,
      default: "all"
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Tip", tipSchema);

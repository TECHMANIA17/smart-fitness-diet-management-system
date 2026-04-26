const Tip = require("../models/Tip");
const User = require("../models/User");
const mongoose = require("mongoose");

const resolveUserReference = async (payload = {}) => {
  const lookupValue = String(payload.user || payload.userIdentifier || "").trim().toLowerCase();

  if (!lookupValue) return null;

  if (mongoose.Types.ObjectId.isValid(lookupValue)) {
    const userById = await User.findById(lookupValue).select("_id");
    if (userById) return userById._id;
  }

  const userByEmail = await User.findOne({ email: lookupValue }).select("_id");
  if (userByEmail) return userByEmail._id;

  throw new Error("User not found for the provided email or ID.");
};

const buildTipPayload = async (body = {}) => {
  const payload = { ...body };
  payload.user = await resolveUserReference(payload);
  delete payload.userIdentifier;

  if (payload.user) {
    payload.targetAudience = payload.targetAudience || "specific user";
  } else {
    payload.targetAudience = payload.targetAudience || "all";
  }

  return payload;
};

const getTips = async (req, res) => {
  try {
    const query = req.user ? { $or: [{ user: null }, { user: req.user._id }] } : {};
    const tips = await Tip.find(query).populate("user", "name email").sort({ createdAt: -1 });
    return res.json({ success: true, tips });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const createTip = async (req, res) => {
  try {
    const tip = await Tip.create(await buildTipPayload(req.body));
    return res.status(201).json({ success: true, message: "Tip added", tip });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

const updateTip = async (req, res) => {
  try {
    const tip = await Tip.findByIdAndUpdate(req.params.id, await buildTipPayload(req.body), {
      new: true,
      runValidators: true
    });
    return res.json({ success: true, message: "Tip updated", tip });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

const deleteTip = async (req, res) => {
  try {
    await Tip.findByIdAndDelete(req.params.id);
    return res.json({ success: true, message: "Tip deleted" });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

module.exports = {
  getTips,
  createTip,
  updateTip,
  deleteTip
};

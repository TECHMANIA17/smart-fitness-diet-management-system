const express = require("express");
const { getTips, createTip, updateTip, deleteTip } = require("../controllers/tipController");
const protectAdmin = require("../middleware/adminMiddleware");
const { protectUser } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", protectAdmin, getTips);
router.get("/me", protectUser, getTips);
router.post("/", protectAdmin, createTip);
router.put("/:id", protectAdmin, updateTip);
router.delete("/:id", protectAdmin, deleteTip);

module.exports = router;

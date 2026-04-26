require("dotenv").config();

const express = require("express");
const path = require("path");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const connectDB = require("./config/db");
const seedDefaultAdmin = require("./utils/seedAdmin");
const seedExerciseLibrary = require("./utils/seedExerciseLibrary");

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const adminRoutes = require("./routes/adminRoutes");
const dietRoutes = require("./routes/dietRoutes");
const workoutRoutes = require("./routes/workoutRoutes");
const progressRoutes = require("./routes/progressRoutes");
const tipRoutes = require("./routes/tipRoutes");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(express.static(path.join(__dirname, "../frontend")));

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/diets", dietRoutes);
app.use("/api/workouts", workoutRoutes);
app.use("/api/progress", progressRoutes);
app.use("/api/tips", tipRoutes);

app.get("/api/health", (req, res) => {
  res.json({ success: true, message: "Smart Fitness API is running" });
});

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/index.html"));
});

app.get("/index.html", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/index.html"));
});

const pageRoutes = {
  "/about.html": "../frontend/about.html",
  "/login.html": "../frontend/login.html",
  "/register.html": "../frontend/register.html",
  "/user/dashboard.html": "../frontend/user/dashboard.html",
  "/user/profile.html": "../frontend/user/profile.html",
  "/user/bmi.html": "../frontend/user/bmi.html",
  "/user/diet-plan.html": "../frontend/user/diet-plan.html",
  "/user/workout-plan.html": "../frontend/user/workout-plan.html",
  "/user/workout-history.html": "../frontend/user/workout-history.html",
  "/user/progress.html": "../frontend/user/progress.html",
  "/user/history.html": "../frontend/user/history.html",
  "/user/tips.html": "../frontend/user/tips.html",
  "/admin/admin-login.html": "../frontend/admin/admin-login.html",
  "/admin/admin-dashboard.html": "../frontend/admin/admin-dashboard.html",
  "/admin/manage-users.html": "../frontend/admin/manage-users.html",
  "/admin/manage-diet.html": "../frontend/admin/manage-diet.html",
  "/admin/manage-workouts.html": "../frontend/admin/manage-workouts.html",
  "/admin/manage-tips.html": "../frontend/admin/manage-tips.html",
  "/admin/view-progress.html": "../frontend/admin/view-progress.html"
};

Object.entries(pageRoutes).forEach(([routePath, filePath]) => {
  app.get(routePath, (req, res) => {
    res.sendFile(path.join(__dirname, filePath));
  });
});

app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

const startServer = async () => {
  try {
    await connectDB();
    await seedDefaultAdmin();
    const exerciseSeedResult = await seedExerciseLibrary();

    if (exerciseSeedResult.inserted) {
      console.log(`Exercise library seeded with ${exerciseSeedResult.inserted} exercises.`);
    }

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    process.exit(1);
  }
};

if (require.main === module) {
  startServer();
}

module.exports = app;

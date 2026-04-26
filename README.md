# Smart Fitness and Diet Management System

Smart Fitness and Diet Management System is a complete dynamic mini-project web application for gyms, fitness trainers, diet consultants, and health centers. It helps users track BMI, calories, hydration, diet plans, workout plans, and progress history using HTML, CSS, JavaScript, Node.js, Express.js, MongoDB Atlas, and Netlify.

## Features

### User Module
- User registration and login
- Profile management
- Automatic BMI and BMI category calculation
- Ideal weight range calculation
- Daily calorie recommendation
- Water intake recommendation
- Personalized diet plan and workout plan
- Dashboard with key health data
- Progress tracker
- History page with sorting

### Admin Module
- Admin login
- Admin dashboard
- Manage users
- Add, edit, delete diet plans
- Add, edit, delete workout plans
- Add, edit, delete tips
- View user progress

## Folder Structure

```text
smart-fitness-diet-management-system/
|-- about.html
|-- admin-dashboard.html
|-- admin-login.html
|-- bmi.html
|-- dashboard.html
|-- diet-plan.html
|-- history.html
|-- index.html
|-- login.html
|-- manage-diet.html
|-- manage-tips.html
|-- manage-users.html
|-- manage-workouts.html
|-- profile.html
|-- progress.html
|-- register.html
|-- tips.html
|-- view-progress.html
|-- workout-plan.html
|-- css/
|   |-- style.css
|-- js/
|   |-- script.js
|   |-- validation.js
|-- config/
|   |-- db.js
|-- controllers/
|   |-- adminController.js
|   |-- authController.js
|   |-- dietController.js
|   |-- progressController.js
|   |-- tipController.js
|   |-- userController.js
|   |-- workoutController.js
|-- docs/
|   |-- ABSTRACT.md
|   |-- MODULES.md
|   |-- MONGODB-SETUP.md
|   |-- NETLIFY-DEPLOYMENT.md
|   |-- VIVA-QA.md
|-- middleware/
|   |-- adminMiddleware.js
|   |-- authMiddleware.js
|-- models/
|   |-- Admin.js
|   |-- BmiRecord.js
|   |-- DietPlan.js
|   |-- Progress.js
|   |-- Tip.js
|   |-- User.js
|   |-- WorkoutPlan.js
|-- netlify/
|   |-- functions/
|   |   |-- api.js
|-- routes/
|   |-- adminRoutes.js
|   |-- authRoutes.js
|   |-- dietRoutes.js
|   |-- progressRoutes.js
|   |-- tipRoutes.js
|   |-- userRoutes.js
|   |-- workoutRoutes.js
|-- sample-data/
|   |-- sampleData.json
|-- utils/
|   |-- calculations.js
|   |-- generateToken.js
|   |-- seedAdmin.js
|-- .env.example
|-- netlify.toml
|-- package.json
|-- README.md
|-- seedSampleData.js
|-- server.js
```

## MongoDB Schemas

### `users`
- `name`
- `email`
- `password`
- `age`
- `gender`
- `heightCm`
- `weightKg`
- `activityLevel`
- `fitnessLevel`
- `fitnessGoal`

### `bmi_records`
- `user`
- `heightCm`
- `weightKg`
- `bmi`
- `bmiCategory`
- `idealWeightMin`
- `idealWeightMax`
- `recommendedCalories`
- `waterIntakeLiters`
- `recordedAt`

### `diet_plans`
- `title`
- `goal`
- `fitnessLevel`
- `calorieRange`
- `meals`
- `hydrationTip`
- `notes`

### `workout_plans`
- `title`
- `goal`
- `fitnessLevel`
- `duration`
- `exercises`
- `weeklySchedule`
- `notes`

### `progress`
- `user`
- `date`
- `currentWeight`
- `caloriesTaken`
- `waterTaken`
- `stepsWalked`
- `workoutDone`
- `note`
- `bmi`

### `tips`
- `title`
- `category`
- `content`
- `targetAudience`

### `admin`
- `name`
- `email`
- `password`

## Test Credentials

- Admin: `admin@smartfitness.com` / `Admin@123`
- User: `rahul@example.com` / `User@123`

## Local Setup

1. Clone or download the project.
2. Open the project folder in terminal.
3. Create a `.env` file using `.env.example`.
4. Add your MongoDB Atlas connection string and secure JWT secret.
5. Install dependencies:

```bash
npm install
```

6. Optional: insert sample data:

```bash
npm run seed:sample
```

7. Start the server:

```bash
npm start
```

8. Open `http://localhost:5000`

## MongoDB Atlas Setup

See [docs/MONGODB-SETUP.md](docs/MONGODB-SETUP.md).

## Netlify Deployment

See [docs/NETLIFY-DEPLOYMENT.md](docs/NETLIFY-DEPLOYMENT.md).

## Functional Flow

1. A user registers with profile data.
2. BMI, calories, water intake, and ideal weight are calculated automatically.
3. The dashboard shows personalized recommendations and recent progress.
4. The user records daily progress.
5. The admin manages plans and tips from the admin panel.

## Viva and Abstract

- Abstract: [docs/ABSTRACT.md](docs/ABSTRACT.md)
- Module explanation: [docs/MODULES.md](docs/MODULES.md)
- Viva questions and answers: [docs/VIVA-QA.md](docs/VIVA-QA.md)

## Notes

- Passwords are hashed using bcrypt.
- Protected APIs use JWT authentication.
- Environment variables are used for secrets and MongoDB connection values.
- The app is structured to be beginner-friendly for mini project submission.

## Custom Images And Icons

- Replace `frontend/assets/icons/brand-logo.png` to change the logo shown in the header.
- Replace `frontend/assets/icons/site-favicon.png` to change the browser tab icon.
- Replace files inside `frontend/assets/images/` to use your own illustrations on the user and admin pages.
- Keep the same filenames if you want the current pages and JavaScript mappings to keep working without extra code changes.

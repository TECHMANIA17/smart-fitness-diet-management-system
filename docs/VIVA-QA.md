# Viva Questions and Answers

1. What is the purpose of this project?
   This project helps users track fitness data, calculate health indicators, and receive personalized diet and workout recommendations.

2. Which technologies are used in this project?
   HTML, CSS, JavaScript, Node.js, Express.js, MongoDB Atlas, Mongoose, JWT, bcrypt, Chart.js, and Netlify.

3. What is BMI?
   BMI stands for Body Mass Index. It is calculated by dividing weight in kilograms by height in meters squared.

4. How do you categorize BMI?
   Below 18.5 is Underweight, 18.5 to 24.9 is Normal, 25 to 29.9 is Overweight, and 30 or above is Obese.

5. Why is MongoDB Atlas used?
   MongoDB Atlas provides a cloud-hosted NoSQL database that is easy to connect and suitable for web applications.

6. Why is bcrypt used?
   bcrypt is used to hash passwords securely before storing them in the database.

7. Why is JWT used?
   JWT is used for authentication so protected routes can identify valid users and admins.

8. What are the main collections in the database?
   users, bmi_records, diet_plans, workout_plans, progress, tips, and admin.

9. What is the business functionality in this project?
   The project manages users, recommendations, progress records, and admin-controlled fitness content for fitness businesses.

10. How is calorie recommendation calculated?
    It is calculated from a simple BMR formula and adjusted using the user activity level and goal.

11. What is the role of the admin module?
    The admin module manages users, plans, tips, and views progress submitted by users.

12. Can this project be deployed?
    Yes. The frontend can be deployed to Netlify and the backend can run using Netlify Functions with MongoDB Atlas.

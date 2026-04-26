const bcrypt = require("bcryptjs");
const Admin = require("../models/Admin");

const seedDefaultAdmin = async () => {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    return;
  }

  const existingAdmin = await Admin.findOne({ email: email.toLowerCase() });

  if (existingAdmin) {
    return;
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await Admin.create({
    name: process.env.ADMIN_NAME || "System Admin",
    email: email.toLowerCase(),
    password: hashedPassword
  });

  console.log("Default admin created from environment variables.");
};

module.exports = seedDefaultAdmin;

require("dotenv").config();
const mongoose = require("mongoose");
const AdminUser = require("./src/models/AdminUser");

async function createAdmin() {
  await mongoose.connect(process.env.MONGO_URI);

  const exists = await AdminUser.findOne({ username: "admin" });
  if (exists) {
    console.log("Admin already exists");
    process.exit();
  }

  const admin = new AdminUser({
    username: "admin",
    password: "admin123",
  });

  await admin.save();
  console.log("Admin user created");

  process.exit();
}

createAdmin();


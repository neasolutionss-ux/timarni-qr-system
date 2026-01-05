const express = require("express");
const router = express.Router();
const AdminUser = require("../models/AdminUser");

/**
 * Simple admin login
 * POST /api/auth/login
 */
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res
        .status(400)
        .json({ success: false, message: "Username and password required" });
    }

    const admin = await AdminUser.findOne({ username });

    if (!admin) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }

    const isMatch = await admin.comparePassword(password);

    if (!isMatch) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }

    // ✅ Simple success response
    res.json({
      success: true,
      message: "Login successful",
      username: admin.username,
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;


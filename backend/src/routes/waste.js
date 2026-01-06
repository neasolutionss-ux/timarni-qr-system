const express = require("express");
const router = express.Router();

/**
 * POST: Save waste collection (already working)
 */
router.post("/collect", (req, res) => {
  console.log("Waste collection received:", req.body);

  res.json({
    success: true,
    message: "Waste data received"
  });
});

/**
 * GET: Fetch waste collection records by date (for dashboard)
 * URL: /api/waste?date=YYYY-MM-DD
 */
router.get("/", async (req, res) => {
  try {
    const { date } = req.query;

    // Default to today if date not provided
    const dateKey =
      date || new Date().toISOString().split("T")[0];

    // Access MongoDB directly (no joins, no models)
    const records = await req.app.locals.db
      .collection("wastecollections")
      .find({ dateKey })
      .sort({ createdAt: -1 })
      .toArray();

    res.json(records);
  } catch (err) {
    console.error("Error fetching waste data:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;


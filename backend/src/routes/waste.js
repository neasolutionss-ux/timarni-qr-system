const express = require("express");
const router = express.Router();

/**
 * POST: Save waste collection
 */
router.post("/collect", async (req, res) => {
  try {
    const payload = {
      ...req.body,
      dateKey: new Date().toISOString().split("T")[0],
      createdAt: new Date()
    };

    await req.app.locals.db
      .collection("wastecollections")
      .insertOne(payload);

    res.json({
      success: true,
      message: "Waste data saved"
    });
  } catch (err) {
    console.error("Waste save error:", err);
    res.status(500).json({ message: "Save failed" });
  }
});

/**
 * GET: Fetch all waste records (dashboard)
 */
router.get("/", async (req, res) => {
  try {
    const records = await req.app.locals.db
      .collection("wastecollections")
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    res.json(records);
  } catch (err) {
    console.error("Fetch waste error:", err);
    res.status(500).json({ message: "Fetch failed" });
  }
});

module.exports = router;


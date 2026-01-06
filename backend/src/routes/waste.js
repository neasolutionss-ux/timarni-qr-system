const express = require("express");
const router = express.Router();
const WasteCollection = require("../models/WasteCollection");

/**
 * POST — Save waste collection
 */
router.post("/collect", async (req, res) => {
  try {
    const record = new WasteCollection({
      ...req.body,
      dateKey: new Date().toISOString().split("T")[0]
    });

    await record.save();

    res.json({ success: true });
  } catch (err) {
    console.error("Waste save error:", err);
    res.status(500).json({ message: "Save failed" });
  }
});

/**
 * GET — Fetch waste records
 */
router.get("/", async (req, res) => {
  try {
    const records = await WasteCollection
      .find({})
      .sort({ createdAt: -1 });

    res.json(records);
  } catch (err) {
    console.error("Waste fetch error:", err);
    res.status(500).json({ message: "Fetch failed" });
  }
});

module.exports = router;


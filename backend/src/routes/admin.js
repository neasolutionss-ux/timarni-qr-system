const express = require("express");
const router = express.Router();

const QRCode = require("../models/QRCode");
const Household = require("../models/Household");

/**
 * Activate QR and save household details
 */
router.post("/activate-qr", async (req, res) => {
  try {
    const {
      qrId,
      wardNumber,
      houseNumber,
      address,
      ownerName,
      mobile,
      familyMembers,
      propertyType,
      latitude,
      longitude,
      createdBy,
    } = req.body;

    // 1. Check if QR already active
    const existingQR = await QRCode.findOne({ qrId });
    if (existingQR && existingQR.status === "ACTIVE") {
      return res.status(400).json({ message: "QR already activated" });
    }
// 1b. Check if household already exists for this QR
const existingHousehold = await Household.findOne({ qrId });
if (existingHousehold) {
  return res.status(400).json({
    message: "Household already exists for this QR",
  });
}

    // 2. Activate QR (or create if not exists)
    await QRCode.findOneAndUpdate(
      { qrId },
      { status: "ACTIVE" },
      { upsert: true, new: true }
    );

    // 3. Save household
    await Household.create({
      qrId,
      wardNumber,
      houseNumber,
      address,
      ownerName,
      mobile,
      familyMembers,
      propertyType,
      latitude,
      longitude,
      createdBy,
    });

    res.json({ success: true, message: "QR activated successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;


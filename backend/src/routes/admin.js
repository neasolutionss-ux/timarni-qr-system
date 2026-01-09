const express = require("express");
const router = express.Router();

const QRCode = require("../models/QRCode");
const Household = require("../models/Household");

/**
 * Utility: Extract clean QR ID
 * Handles:
 * - TMN-QR-000001
 * - index.html?qr=TMN-QR-000001
 * - https://timarni-qr.netlify.app/qr/index.html?qr=TMN-QR-000001
 */
function extractQrId(input) {
  if (!input) return input;

  if (input.includes("qr=")) {
    return input.split("qr=").pop().trim();
  }

  return input.trim();
}

/**
 * Activate QR and save household details
 */
router.post("/activate-qr", async (req, res) => {
  try {
    let {
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

    // 🔥 FIX: Always normalize QR ID before any DB operation
    qrId = extractQrId(qrId);

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

/**
 * GET all activated households (Admin Dashboard)
 */
router.get("/households", async (req, res) => {
  try {
    const households = await Household.find().sort({ createdAt: -1 });
    res.json(households);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch households" });
  }
});

/**
 * Update revenue fields for a household
 */
router.put("/households/:id", async (req, res) => {
  try {
    const {
      propertyTaxStatus,
      userChargeStatus,
      userChargeAmount,
      remarks,
    } = req.body;

    const updated = await Household.findByIdAndUpdate(
      req.params.id,
      {
        propertyTaxStatus,
        userChargeStatus,
        userChargeAmount,
        remarks,
      },
      { new: true }
    );

    res.json({ success: true, data: updated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Update failed" });
  }
});

// ===============================
// Citizen Property Tax API (READ ONLY)
// ===============================
router.get("/qr/:qrId", async (req, res) => {
  try {
    const { qrId } = req.params;

    const record = await Household.findOne({ qrId });

    if (!record) {
      return res.status(404).json({
        success: false,
        message: "QR not found",
      });
    }

    return res.json({
      success: true,
      data: {
        qrId: record.qrId,
        ownerName: record.ownerName,
        mobile: record.mobile,
        houseNo: record.houseNumber,
        ward: record.wardNumber,
        propertyType: record.propertyType,
        taxAmount: record.userChargeAmount,
        taxStatus: record.propertyTaxStatus === "Paid" ? "PAID" : "DUE",
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

module.exports = router;


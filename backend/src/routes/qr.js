const express = require("express");
const router = express.Router();
const Household = require("../models/Household");

// PUBLIC QR API — Citizen
router.get("/:qrId", async (req, res) => {
  try {
    const { qrId } = req.params;

    const house = await Household.findOne({ qrId });

    if (!house) {
      return res.status(404).json({
        success: false,
        message: "QR not found",
      });
    }

    res.json({
      success: true,
      data: {
        qrId: house.qrId,
        ownerName: house.ownerName,
        mobile: house.mobile,
        houseNo: house.houseNumber,
        ward: house.wardNumber,
        propertyType: house.propertyType,
        taxAmount: house.userChargeAmount,
        taxStatus: house.propertyTaxStatus.toUpperCase(),
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


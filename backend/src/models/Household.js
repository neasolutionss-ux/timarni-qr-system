const mongoose = require("mongoose");

const HouseholdSchema = new mongoose.Schema(
  {
    qrId: String,
    wardNumber: Number,
    houseNumber: String,
    address: String,
    ownerName: String,
    mobile: String,
    familyMembers: Number,
    propertyType: String,
    latitude: Number,
    longitude: Number,
    createdBy: String,

    // -------- Phase 1: Manual Admin Fields --------
    propertyTaxStatus: {
      type: String,
      enum: ["Paid", "Due", "NA"],
      default: "NA",
    },
    propertyTaxId: {
      type: String,
      default: "",
    },
    userChargeStatus: {
      type: String,
      enum: ["Paid", "Unpaid"],
      default: "Unpaid",
    },
    userChargeAmount: {
      type: Number,
      default: 0,
    },
    remarks: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Household", HouseholdSchema);


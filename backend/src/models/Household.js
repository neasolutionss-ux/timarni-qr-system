const mongoose = require("mongoose");

const householdSchema = new mongoose.Schema(
  {
    qrId: {
      type: String,
      required: true,
    },

    wardNumber: {
      type: Number,
      required: true,
    },

    houseNumber: {
      type: String,
      required: true,
    },

    address: {
      type: String,
      required: true,
    },

    ownerName: {
      type: String,
      required: true,
    },

    mobile: {
      type: String,
      required: true,
    },

    familyMembers: {
      type: Number,
      required: true,
    },

    propertyType: {
      type: String,
      enum: ["Residential", "Commercial"],
      required: true,
    },

    latitude: Number,
    longitude: Number,

    createdBy: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Household", householdSchema);


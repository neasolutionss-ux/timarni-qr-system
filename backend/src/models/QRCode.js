const mongoose = require("mongoose");

const qrCodeSchema = new mongoose.Schema(
  {
    qrId: {
      type: String,
      required: true,
      unique: true,
    },
    status: {
      type: String,
      enum: ["UNUSED", "ACTIVE", "BLOCKED"],
      default: "UNUSED",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("QRCode", qrCodeSchema);


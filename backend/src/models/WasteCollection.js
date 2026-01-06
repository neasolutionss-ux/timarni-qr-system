const mongoose = require("mongoose");

const WasteCollectionSchema = new mongoose.Schema(
  {
    qrId: String,
    vehicleNumber: String,
    segregation: {
      wet: Boolean,
      dry: Boolean,
      dhw: Boolean,
      sanitary: Boolean
    },
    dateKey: String
  },
  { timestamps: true }
);

module.exports = mongoose.model(
  "WasteCollection",
  WasteCollectionSchema
);


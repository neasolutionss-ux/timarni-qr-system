const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const authRoutes = require("./routes/auth");
const adminRoutes = require("./routes/admin");
const wasteRoutes = require("./routes/waste");

const app = express();

/* ---------- MIDDLEWARE ---------- */
app.use(cors());
app.use(express.json());

/* ---------- ROOT HEALTH CHECK ---------- */
app.get("/", (req, res) => {
  res.send("Timarni QR Backend Running — vWASTE-01");
});

/* ---------- ROUTES ---------- */
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/waste", wasteRoutes);

/* ---------- DATABASE ---------- */
mongoose
  .connect(process.env.MONGO_URI)
.then(() => {
  console.log("MongoDB connected");
})
  .catch((err) => {
    console.error("MongoDB connection error:", err);
  });

/* ---------- SERVER ---------- */
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});


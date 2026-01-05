const express = require("express");
const router = express.Router();

router.post("/collect", (req, res) => {
  console.log("Waste collection received:", req.body);

  res.json({
    success: true,
    message: "Waste data received"
  });
});

module.exports = router;


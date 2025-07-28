const express = require("express");
const router = express.Router();
const axios = require("axios");

const PYTHON_BASE = process.env.FORECAST_URL || "http://localhost:5000";

// GET /api/admin/forecast/ingredients
router.get("/forecast/ingredients", async (req, res) => {
  try {
    // forward to Python service
    const { data } = await axios.get(`${PYTHON_BASE}/forecast/ingredients`);
    res.json(data);
  } catch (err) {
    console.error("Error fetching ingredient forecast:", err.message);
    res.status(500).json({ error: "Failed to fetch ingredient forecast" });
  }
});

module.exports = router;

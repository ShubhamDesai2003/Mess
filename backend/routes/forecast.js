const express = require("express");
const router = express.Router();
const axios = require("axios");

const PYTHON_BASE = process.env.FORECAST_URL || "http://localhost:5000";


const aggregateSelections = require("../scripts/aggregateSelections");

const forecastClient = require("../utils/forecastClient");


router.get("/forecast/weekly", async (req, res) => {
  const weeks = req.query.weeks || 1;
  const { data } = await forecastClient.get("/forecast/weekly", { params: { weeks } });
  res.json(data);
});

router.post("/aggregate-weekly", async (req, res) => {
  try {
    await aggregateSelections();
    res.json({ success: true, message: "Weekly data saved" });
  } catch (err) {
    console.error("Aggregation error:", err);
    res.status(500).json({ error: "Failed to aggregate" });
  }
});


// GET /api/admin/forecast/ingredients
router.get("/ingredients", async (req, res) => {
  try {
    // forward to Python service
    console.log("backend forecast");
    
    const { data } = await axios.get(`${PYTHON_BASE}/forecast/ingredients`);
    res.json(data);
  } catch (err) {
    console.error("Error fetching ingredient forecast:", err.message);
    res.status(500).json({ error: "Failed to fetch ingredient forecast" });
  }
});



module.exports = router;

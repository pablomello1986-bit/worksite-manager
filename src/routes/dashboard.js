const express = require("express");
const { getDashboardSummary } = require("../services/projectMetrics");

const router = express.Router();

router.get("/", (_request, response) => {
  response.json(getDashboardSummary());
});

module.exports = router;

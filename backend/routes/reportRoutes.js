const express = require("express");
const {
  createTextReport,
  createUrlReport,
  getMyReports,
  getReportById,
  updateFeedback,
  getAllReports,
  getStats
} = require("../controllers/reportController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/detect-text", protect, createTextReport);
router.post("/detect-url", protect, createUrlReport);
router.get("/my", protect, getMyReports);
router.get("/stats", protect, adminOnly, getStats);
router.get("/all", protect, adminOnly, getAllReports);
router.get("/:id", protect, getReportById);
router.put("/:id/feedback", protect, updateFeedback);

module.exports = router;

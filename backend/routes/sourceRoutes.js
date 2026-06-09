const express = require("express");
const { getSources, createSource, updateSource, deleteSource } = require("../controllers/sourceController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", protect, getSources);
router.post("/", protect, adminOnly, createSource);
router.put("/:id", protect, adminOnly, updateSource);
router.delete("/:id", protect, adminOnly, deleteSource);

module.exports = router;

const Report = require("../models/Report");
const Source = require("../models/Source");
const { analyzeText, extractArticleFromUrl } = require("../utils/analyzer");

const createTextReport = async (req, res) => {
  try {
    const { text, title } = req.body;

    if (!text || text.trim().length < 10) {
      return res.status(400).json({ success: false, message: "Please enter at least 10 characters of news text" });
    }

    const sources = await Source.find({});
    const result = analyzeText({ text, customSources: sources });

    const report = await Report.create({
      user: req.user._id,
      inputType: "text",
      title: title || "Text Analysis Report",
      originalInput: text,
      ...result
    });

    res.status(201).json({ success: true, report });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const createUrlReport = async (req, res) => {
  try {
    const { url } = req.body;

    if (!url || !/^https?:\/\//i.test(url)) {
      return res.status(400).json({ success: false, message: "Please enter a valid URL starting with http:// or https://" });
    }

    const article = await extractArticleFromUrl(url);
    const sources = await Source.find({});
    const result = analyzeText({ text: `${article.title}. ${article.text}`, url, customSources: sources });

    const report = await Report.create({
      user: req.user._id,
      inputType: "url",
      title: article.title || "URL Analysis Report",
      originalInput: url,
      extractedText: article.text,
      sourceDomain: article.domain,
      ...result
    });

    res.status(201).json({ success: true, report });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Could not analyze this URL. Some websites block automatic extraction. Try text analysis instead."
    });
  }
};

const getMyReports = async (req, res) => {
  try {
    const reports = await Report.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, reports });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getReportById = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id).populate("user", "name email role");

    if (!report) {
      return res.status(404).json({ success: false, message: "Report not found" });
    }

    const isOwner = report.user._id.toString() === req.user._id.toString();
    const isAdmin = req.user.role === "admin";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ success: false, message: "You cannot access this report" });
    }

    res.json({ success: true, report });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateFeedback = async (req, res) => {
  try {
    const { feedback } = req.body;

    if (!["helpful", "not_helpful", "none"].includes(feedback)) {
      return res.status(400).json({ success: false, message: "Invalid feedback" });
    }

    const report = await Report.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { userFeedback: feedback },
      { new: true }
    );

    if (!report) {
      return res.status(404).json({ success: false, message: "Report not found" });
    }

    res.json({ success: true, report });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getAllReports = async (req, res) => {
  try {
    const reports = await Report.find({}).populate("user", "name email").sort({ createdAt: -1 });
    res.json({ success: true, reports });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getStats = async (req, res) => {
  try {
    const totalReports = await Report.countDocuments();
    const likelyFake = await Report.countDocuments({ prediction: "Likely Fake" });
    const suspicious = await Report.countDocuments({ prediction: "Suspicious" });
    const needsVerification = await Report.countDocuments({ prediction: "Needs Verification" });
    const likelyReliable = await Report.countDocuments({ prediction: "Likely Reliable" });

    const averageRisk = await Report.aggregate([
      { $group: { _id: null, avgRisk: { $avg: "$riskScore" } } }
    ]);

    res.json({
      success: true,
      stats: {
        totalReports,
        likelyFake,
        suspicious,
        needsVerification,
        likelyReliable,
        averageRisk: averageRisk.length ? Math.round(averageRisk[0].avgRisk) : 0
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createTextReport,
  createUrlReport,
  getMyReports,
  getReportById,
  updateFeedback,
  getAllReports,
  getStats
};

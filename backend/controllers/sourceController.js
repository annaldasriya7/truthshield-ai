const Source = require("../models/Source");

const getSources = async (req, res) => {
  try {
    const sources = await Source.find({}).sort({ credibility: 1, domain: 1 });
    res.json({ success: true, sources });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const createSource = async (req, res) => {
  try {
    const { name, domain, credibility, category, notes } = req.body;

    if (!name || !domain) {
      return res.status(400).json({ success: false, message: "Source name and domain are required" });
    }

    const cleanDomain = domain.replace(/^https?:\/\//, "").replace(/^www\./, "").split("/")[0].toLowerCase();

    const source = await Source.create({
      name,
      domain: cleanDomain,
      credibility: credibility || "Unknown",
      category: category || "News",
      notes: notes || ""
    });

    res.status(201).json({ success: true, source });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: "This source domain already exists" });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateSource = async (req, res) => {
  try {
    const source = await Source.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });

    if (!source) {
      return res.status(404).json({ success: false, message: "Source not found" });
    }

    res.json({ success: true, source });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteSource = async (req, res) => {
  try {
    const source = await Source.findByIdAndDelete(req.params.id);

    if (!source) {
      return res.status(404).json({ success: false, message: "Source not found" });
    }

    res.json({ success: true, message: "Source deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getSources, createSource, updateSource, deleteSource };

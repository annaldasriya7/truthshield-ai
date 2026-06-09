const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    inputType: {
      type: String,
      enum: ["text", "url"],
      required: true
    },
    title: {
      type: String,
      default: "Untitled report"
    },
    originalInput: {
      type: String,
      required: true
    },
    extractedText: {
      type: String,
      default: ""
    },
    sourceDomain: {
      type: String,
      default: "Unknown"
    },
    prediction: {
      type: String,
      enum: ["Likely Reliable", "Needs Verification", "Suspicious", "Likely Fake"],
      required: true
    },
    riskScore: {
      type: Number,
      required: true
    },
    confidence: {
      type: Number,
      required: true
    },
    sourceCredibility: {
      type: String,
      default: "Unknown"
    },
    clickbaitScore: {
      type: Number,
      default: 0
    },
    emotionalScore: {
      type: Number,
      default: 0
    },
    reasons: {
      type: [String],
      default: []
    },
    advice: {
      type: String,
      default: "Verify from trusted sources before sharing."
    },
    userFeedback: {
      type: String,
      enum: ["helpful", "not_helpful", "none"],
      default: "none"
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Report", reportSchema);

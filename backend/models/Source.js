const mongoose = require("mongoose");

const sourceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    domain: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    credibility: {
      type: String,
      enum: ["High", "Medium", "Low", "Very Low", "Unknown"],
      default: "Unknown"
    },
    category: {
      type: String,
      default: "News"
    },
    notes: {
      type: String,
      default: ""
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Source", sourceSchema);

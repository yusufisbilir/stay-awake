/**
 * URL model schema
 * Stores URLs added by users
 */

const mongoose = require("mongoose");

const urlSchema = new mongoose.Schema({
  url: {
    type: String,
    required: [true, "URL is required"],
    unique: true,
    trim: true,
    validate: {
      validator: function (v) {
        // Check URL format
        try {
          const url = new URL(v);
          return url.protocol === "http:" || url.protocol === "https:";
        } catch {
          return false;
        }
      },
      message: "Please enter a valid URL (must start with http:// or https://)",
    },
  },
  domain: {
    type: String,
    required: true,
    index: true,
    lowercase: true, // For case-insensitive search
    trim: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  lastChecked: {
    type: Date,
  },
  currentStatus: {
    type: String,
    enum: ["active", "failed", "pending"],
    default: "pending",
  },
  failCount: {
    type: Number,
    default: 0,
  },
  lastResponseTime: {
    type: Number, // milliseconds
  },
});

module.exports = mongoose.model("Url", urlSchema);

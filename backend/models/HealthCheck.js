/**
 * HealthCheck model schema
 * Stores daily health check records
 * Automatically deleted after 8 days with TTL index
 */

const mongoose = require("mongoose");

const healthCheckSchema = new mongoose.Schema({
  urlId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Url",
    required: true,
    index: true,
  },
  date: {
    type: Date,
    required: true,
    index: true,
  },
  status: {
    type: String,
    enum: ["success", "failed"],
    required: true,
  },
  responseTime: {
    type: Number, // milliseconds
  },
  statusCode: {
    type: Number,
  },
  errorMessage: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Compound index: for sorting by urlId and date
healthCheckSchema.index({ urlId: 1, date: -1 });

// TTL index: automatically delete after 8 days (691200 seconds)
healthCheckSchema.index({ createdAt: 1 }, { expireAfterSeconds: 691200 });

module.exports = mongoose.model("HealthCheck", healthCheckSchema);

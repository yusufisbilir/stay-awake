/**
 * Server Entry Point
 * Starts Express server and configures everything
 */

require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const connectDB = require("./config/db");
const urlRoutes = require("./routes/urls");
const errorHandler = require("./middleware/errorHandler");
const { startCronJob } = require("./services/cronService");

const app = express();

// MongoDB connection
connectDB();

// Middlewares
app.use(helmet()); // Security headers
app.use(cors()); // CORS
app.use(express.json()); // JSON parser
app.use(express.urlencoded({ extended: true })); // URL-encoded parser

// Routes
app.use("/api", urlRoutes);

// Health check endpoint (no rate limit)
app.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "Server is running",
    timestamp: new Date().toISOString(),
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Endpoint not found",
  });
});

// Error handler (must be last)
app.use(errorHandler);

// Start cron job
startCronJob();

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || "development"}`);
});

// Unhandled promise rejection
process.on("unhandledRejection", (err) => {
  console.error("❌ Unhandled Rejection:", err.message);
  process.exit(1);
});

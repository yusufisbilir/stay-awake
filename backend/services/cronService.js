/**
 * Cron Job Service
 * Performs health check on all URLs every day at 03:00
 */

const cron = require("node-cron");
const axios = require("axios");
const Url = require("../models/Url");
const HealthCheck = require("../models/HealthCheck");

/**
 * Performs health check on a single URL
 */
const checkUrl = async (url) => {
  const startTime = Date.now();

  try {
    const response = await axios.get(url.url, {
      timeout: 10000, // 10 seconds timeout
      validateStatus: (status) => status >= 200 && status < 300,
    });

    const responseTime = Date.now() - startTime;

    // Today's date (without time)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Create HealthCheck record
    await HealthCheck.create({
      urlId: url._id,
      date: today,
      status: "success",
      responseTime,
      statusCode: response.status,
    });

    // Update URL status
    await Url.findByIdAndUpdate(url._id, {
      currentStatus: "active",
      lastChecked: new Date(),
      lastResponseTime: responseTime,
      failCount: 0,
    });

    console.log(`✓ ${url.url} - Success (${responseTime}ms)`);
  } catch (error) {
    const responseTime = Date.now() - startTime;

    // Today's date
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Prepare error message
    let errorMessage = "Unknown error";
    let statusCode = null;

    if (error.response) {
      errorMessage = `HTTP ${error.response.status}`;
      statusCode = error.response.status;
    } else if (error.code === "ECONNABORTED") {
      errorMessage = "Timeout (10 seconds)";
    } else if (error.code === "ENOTFOUND") {
      errorMessage = "Domain not found";
    } else if (error.code) {
      errorMessage = error.code;
    } else if (error.message) {
      errorMessage = error.message;
    }

    // Create HealthCheck record
    await HealthCheck.create({
      urlId: url._id,
      date: today,
      status: "failed",
      errorMessage,
      ...(statusCode && { statusCode }),
    });

    // Update URL status
    const updatedUrl = await Url.findByIdAndUpdate(
      url._id,
      {
        currentStatus: "failed",
        lastChecked: new Date(),
        $inc: { failCount: 1 },
      },
      { new: true }
    );

    console.log(
      `✗ ${url.url} - Failed: ${errorMessage} (Fail count: ${updatedUrl.failCount})`
    );
  }
};

/**
 * Performs health check on all URLs
 */
const runHealthChecks = async () => {
  console.log("🏥 Starting health check...");
  const startTime = Date.now();

  try {
    const urls = await Url.find();

    if (urls.length === 0) {
      console.log("⚠️  No URLs to check");
      return;
    }

    console.log(`📊 ${urls.length} URLs to check`);

    for (const url of urls) {
      await checkUrl(url);

      // Wait 2 seconds between each URL
      if (urls.indexOf(url) < urls.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }
    }

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`✅ Health check completed (${duration} seconds)`);
  } catch (error) {
    console.error("❌ Health check error:", error.message);
  }
};

/**
 * Starts the cron job
 * Runs every day at 03:00
 */
const startCronJob = () => {
  // Run every day at 03:00
  cron.schedule(
    "0 3 * * *",
    async () => {
      console.log(`⏰ Cron job triggered: ${new Date().toISOString()}`);
      await runHealthChecks();
    },
    {
      timezone: "Europe/Istanbul", // Turkey time
    }
  );

  console.log("⏰ Cron job started: Will run every day at 03:00");
};

/**
 * Trigger manual health check (for testing)
 */
const triggerManualCheck = async () => {
  console.log("🔧 Manual health check triggered");
  await runHealthChecks();
};

module.exports = {
  startCronJob,
  triggerManualCheck,
};

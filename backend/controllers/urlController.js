/**
 * URL Controller
 * Business logic for URL and domain operations
 */

const Url = require("../models/Url");
const HealthCheck = require("../models/HealthCheck");
const { extractDomain } = require("../utils/domainExtractor");

/**
 * @desc    Add new URL
 * @route   POST /api/urls
 * @access  Public
 */
const createUrl = async (req, res, next) => {
  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({
        success: false,
        message: "URL is required",
      });
    }

    // Extract domain from URL
    const domain = extractDomain(url);

    // Create URL
    const newUrl = await Url.create({
      url: url.trim(),
      domain: domain.toLowerCase(),
    });

    res.status(201).json({
      success: true,
      message: "URL added successfully",
      data: {
        _id: newUrl._id,
        url: newUrl.url,
        domain: newUrl.domain,
        currentStatus: newUrl.currentStatus,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Search URLs by domain (with 7-day history)
 * @route   GET /api/domains/search?q=example.com
 * @access  Public
 */
const searchDomain = async (req, res, next) => {
  try {
    const { q } = req.query;

    if (!q) {
      return res.status(400).json({
        success: false,
        message: "Domain parameter is required",
      });
    }

    // Case-insensitive search
    const searchDomain = q.toLowerCase().trim();

    // Find all URLs for this domain
    const urls = await Url.find({ domain: searchDomain }).sort({
      createdAt: -1,
    });

    if (urls.length === 0) {
      return res.json({
        success: true,
        domain: searchDomain,
        urls: [],
      });
    }

    // Get 7-day history for each URL
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const urlsWithHistory = await Promise.all(
      urls.map(async (url) => {
        // Get health check records for the last 7 days
        const history = await HealthCheck.find({
          urlId: url._id,
          date: { $gte: sevenDaysAgo },
        })
          .sort({ date: 1 })
          .select("date status responseTime -_id")
          .lean();

        return {
          _id: url._id,
          url: url.url,
          currentStatus: url.currentStatus,
          lastChecked: url.lastChecked,
          lastResponseTime: url.lastResponseTime,
          history: history.map((h) => ({
            date: h.date.toISOString().split("T")[0], // Date only
            status: h.status,
            ...(h.responseTime && { responseTime: h.responseTime }),
          })),
        };
      })
    );

    res.json({
      success: true,
      domain: searchDomain,
      urls: urlsWithHistory,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    List all URLs
 * @route   GET /api/urls
 * @access  Public
 */
const getAllUrls = async (req, res, next) => {
  try {
    const urls = await Url.find().sort({ createdAt: -1 });

    res.json({
      success: true,
      count: urls.length,
      data: urls,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete URL
 * @route   DELETE /api/urls/:id
 * @access  Public
 */
const deleteUrl = async (req, res, next) => {
  try {
    const url = await Url.findById(req.params.id);

    if (!url) {
      return res.status(404).json({
        success: false,
        message: "URL not found",
      });
    }

    // Delete URL
    await Url.deleteOne({ _id: req.params.id });

    // Delete related health check records
    await HealthCheck.deleteMany({ urlId: req.params.id });

    res.json({
      success: true,
      message: "URL deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get URL history
 * @route   GET /api/urls/:id/history?days=7
 * @access  Public
 */
const getUrlHistory = async (req, res, next) => {
  try {
    const { days = 7 } = req.query;
    const daysNum = parseInt(days);

    if (isNaN(daysNum) || daysNum < 1 || daysNum > 30) {
      return res.status(400).json({
        success: false,
        message: "days parameter must be between 1-30",
      });
    }

    const url = await Url.findById(req.params.id);

    if (!url) {
      return res.status(404).json({
        success: false,
        message: "URL not found",
      });
    }

    // Go back by requested number of days
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysNum);
    startDate.setHours(0, 0, 0, 0);

    const history = await HealthCheck.find({
      urlId: req.params.id,
      date: { $gte: startDate },
    })
      .sort({ date: 1 })
      .select("-urlId -__v")
      .lean();

    res.json({
      success: true,
      url: url.url,
      domain: url.domain,
      currentStatus: url.currentStatus,
      history: history.map((h) => ({
        date: h.date.toISOString().split("T")[0],
        status: h.status,
        ...(h.responseTime && { responseTime: h.responseTime }),
        ...(h.statusCode && { statusCode: h.statusCode }),
        ...(h.errorMessage && { errorMessage: h.errorMessage }),
      })),
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createUrl,
  searchDomain,
  getAllUrls,
  deleteUrl,
  getUrlHistory,
};

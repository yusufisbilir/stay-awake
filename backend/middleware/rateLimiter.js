/**
 * Rate limiting middlewares
 * Applies IP-based rate limiting
 */

const rateLimit = require("express-rate-limit");

// Rate limiter for POST /api/urls (1 request per minute)
const createUrlLimiter = rateLimit({
  windowMs: 60000, // 1 minute
  max: 1,
  message: {
    success: false,
    message: "You can only add one URL per minute. Please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiter for GET /api/domains/search (30 requests per minute)
const searchDomainLimiter = rateLimit({
  windowMs: 60000, // 1 minute
  max: 30,
  message: {
    success: false,
    message: "Too many searches. Please wait a minute.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// General rate limiter for other endpoints (20 requests per minute)
const generalLimiter = rateLimit({
  windowMs: 60000, // 1 minute
  max: 20,
  message: {
    success: false,
    message: "Too many requests. Please wait a minute.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = {
  createUrlLimiter,
  searchDomainLimiter,
  generalLimiter,
};

/**
 * URL Routes
 * Defines API endpoints
 */

const express = require("express");
const router = express.Router();
const {
  createUrl,
  searchDomain,
  getAllUrls,
  deleteUrl,
  getUrlHistory,
} = require("../controllers/urlController");

const {
  createUrlLimiter,
  searchDomainLimiter,
  generalLimiter,
} = require("../middleware/rateLimiter");

// Add new URL (1 request per minute)
router.post("/urls", createUrlLimiter, createUrl);

// Search domain (30 requests per minute)
router.get("/domains/search", searchDomainLimiter, searchDomain);

// List all URLs (20 requests per minute)
router.get("/urls", generalLimiter, getAllUrls);

// Delete URL (20 requests per minute)
router.delete("/urls/:id", generalLimiter, deleteUrl);

// Get URL history (20 requests per minute)
router.get("/urls/:id/history", generalLimiter, getUrlHistory);

module.exports = router;

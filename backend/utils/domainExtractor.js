/**
 * Utility function to extract domain from URL
 * www. is counted as subdomain and not removed
 */

const extractDomain = (url) => {
  try {
    const urlObj = new URL(url);
    // Get hostname (including subdomain)
    // www. is not removed because it counts as subdomain
    return urlObj.hostname;
  } catch (error) {
    throw new Error("Invalid URL format");
  }
};

module.exports = { extractDomain };

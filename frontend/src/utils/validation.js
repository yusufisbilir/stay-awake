/**
 * Validation Utilities
 * Form validation functions
 */

/**
 * Checks URL format
 */
export const isValidUrl = (url) => {
  try {
    const urlObj = new URL(url);
    return urlObj.protocol === "http:" || urlObj.protocol === "https:";
  } catch {
    return false;
  }
};

/**
 * Checks HTTPS requirement
 */
export const requiresHttps = (url) => {
  try {
    const urlObj = new URL(url);
    return urlObj.protocol === "https:";
  } catch {
    return false;
  }
};

/**
 * Checks domain format
 */
export const isValidDomain = (domain) => {
  const domainRegex =
    /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9][a-z0-9-]{0,61}[a-z0-9]$/i;
  return domainRegex.test(domain);
};

/**
 * Returns URL validation error message
 */
export const validateUrl = (url) => {
  if (!url || url.trim() === "") {
    return "URL is required";
  }

  if (!isValidUrl(url)) {
    return "Please enter a valid URL (must start with http:// or https://)";
  }

  if (!requiresHttps(url)) {
    return "URL must start with https://";
  }

  return null;
};

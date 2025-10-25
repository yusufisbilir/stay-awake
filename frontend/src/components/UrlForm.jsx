/**
 * UrlForm Component
 * URL add modal form - with rate limiting
 */

import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { createUrl } from "../services/api";
import { validateUrl } from "../utils/validation";

const UrlForm = ({ isOpen, onClose, onSuccess }) => {
  const [url, setUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [canSubmit, setCanSubmit] = useState(true);
  const [countdown, setCountdown] = useState(0);

  // Rate limiting check
  useEffect(() => {
    const lastSubmit = localStorage.getItem("lastUrlSubmit");
    if (lastSubmit) {
      const timeDiff = Date.now() - parseInt(lastSubmit);
      const remainingTime = 60000 - timeDiff; // 60 seconds

      if (remainingTime > 0) {
        setCanSubmit(false);
        setCountdown(Math.ceil(remainingTime / 1000));
      }
    }
  }, [isOpen]);

  // Countdown timer
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
        if (countdown - 1 === 0) {
          setCanSubmit(true);
        }
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    const error = validateUrl(url);
    if (error) {
      toast.error(error);
      return;
    }

    if (!canSubmit) {
      toast.warning(`Please wait ${countdown} seconds`);
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await createUrl(url);

      // Save rate limit timestamp
      localStorage.setItem("lastUrlSubmit", Date.now().toString());

      toast.success(`URL added! Domain: ${response.data.domain}`);
      setUrl("");
      setCanSubmit(false);
      setCountdown(60);
      onSuccess();
      onClose();
    } catch (error) {
      toast.error(error.message || "Error occurred while adding URL");

      // If rate limit error, start countdown
      if (error.message.includes("minute")) {
        localStorage.setItem("lastUrlSubmit", Date.now().toString());
        setCanSubmit(false);
        setCountdown(60);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Add New URL</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label
              htmlFor="url"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              URL
            </label>
            <input
              type="text"
              id="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com/api/health"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isSubmitting}
            />
            <p className="text-xs text-gray-500 mt-1">
              URL must start with https://
            </p>
          </div>

          {/* Rate Limit Warning */}
          {!canSubmit && (
            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                You can add one URL per minute. Try again in {countdown}{" "}
                seconds.
              </p>
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !canSubmit || !url.trim()}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Adding..." : "Add"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UrlForm;

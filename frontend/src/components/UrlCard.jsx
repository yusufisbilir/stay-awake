/**
 * UrlCard Component
 * Displays information and uptime chart for a single URL
 */

import { formatDistanceToNow } from "date-fns";
import { tr } from "date-fns/locale";
import { useState } from "react";
import { toast } from "react-toastify";
import { deleteUrl } from "../services/api";
import UptimeChart from "./UptimeChart";

const UrlCard = ({ url, onDelete }) => {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteUrl(url._id);
      toast.success("URL deleted successfully");
      onDelete(url._id);
      setShowDeleteModal(false);
    } catch (error) {
      toast.error(error.message || "Error occurred while deleting URL");
    } finally {
      setIsDeleting(false);
    }
  };

  // Status badge
  const getStatusBadge = () => {
    const badges = {
      active: { text: "✓ Active", class: "bg-green-100 text-green-800" },
      failed: { text: "✗ Down", class: "bg-red-100 text-red-800" },
      pending: { text: "○ Pending", class: "bg-yellow-100 text-yellow-800" },
    };
    const badge = badges[url.currentStatus] || badges.pending;
    return (
      <span
        className={`px-3 py-1 rounded-full text-sm font-medium ${badge.class}`}
      >
        {badge.text}
      </span>
    );
  };

  // Calculate uptime percentage
  const calculateUptime = () => {
    if (!url.history || url.history.length === 0) return null;
    const successCount = url.history.filter(
      (h) => h.status === "success"
    ).length;
    const percentage = ((successCount / url.history.length) * 100).toFixed(1);
    return `${percentage}% (${successCount}/${url.history.length})`;
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
        {/* URL and Status */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 min-w-0">
            <a
              href={url.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 font-medium break-all"
            >
              {url.url}
            </a>
          </div>
          <div className="ml-4 flex items-center gap-2">
            {getStatusBadge()}
            <button
              onClick={() => setShowDeleteModal(true)}
              className="text-red-600 hover:text-red-800 p-1"
              title="Delete URL"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Metadata */}
        <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-4">
          {url.lastChecked && (
            <div>
              <span className="font-medium">Last Check:</span>{" "}
              {formatDistanceToNow(new Date(url.lastChecked), {
                addSuffix: true,
                locale: tr,
              })}
            </div>
          )}
          {url.lastResponseTime && (
            <div>
              <span className="font-medium">Response Time:</span>{" "}
              {url.lastResponseTime}ms
            </div>
          )}
          {calculateUptime() && (
            <div>
              <span className="font-medium">Last 7 Days:</span>{" "}
              {calculateUptime()} uptime
            </div>
          )}
        </div>

        {/* Uptime Chart */}
        {url.history && url.history.length > 0 && (
          <UptimeChart history={url.history} />
        )}
      </div>

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold mb-4">Delete URL</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this URL? This action cannot be
              undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteModal(false)}
                disabled={isDeleting}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default UrlCard;

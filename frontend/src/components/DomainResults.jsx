/**
 * DomainResults Component
 * Displays domain search results
 */

import UrlCard from "./UrlCard";

const DomainResults = ({ domain, urls, onUrlDelete }) => {
  if (!urls || urls.length === 0) {
    return (
      <div className="max-w-4xl mx-auto mt-8 p-8 bg-white rounded-lg shadow-md text-center">
        <svg
          className="w-16 h-16 mx-auto text-gray-400 mb-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <h3 className="text-xl font-semibold text-gray-700 mb-2">
          No Results Found
        </h3>
        <p className="text-gray-500">
          No registered URLs found for{" "}
          <span className="font-medium">{domain}</span>
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto mt-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">
          Found {urls.length} URL{urls.length > 1 ? "s" : ""} for{" "}
          <span className="text-blue-600">{domain}</span>
        </h2>
      </div>

      <div className="space-y-4">
        {urls.map((url) => (
          <UrlCard key={url._id} url={url} onDelete={onUrlDelete} />
        ))}
      </div>
    </div>
  );
};

export default DomainResults;

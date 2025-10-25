/**
 * App Component
 * Main application component
 */

import { useState, useCallback } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import DomainSearch from "./components/DomainSearch";
import UrlForm from "./components/UrlForm";
import DomainResults from "./components/DomainResults";
import { searchDomain } from "./services/api";

function App() {
  const [isUrlFormOpen, setIsUrlFormOpen] = useState(false);
  const [searchResults, setSearchResults] = useState(null);
  const [isSearching, setIsSearching] = useState(false);

  // Domain search function
  const handleSearch = useCallback(async (domain) => {
    setIsSearching(true);
    try {
      const response = await searchDomain(domain);
      setSearchResults(response);
    } catch (error) {
      toast.error(error.message || "Error occurred during search");
      setSearchResults(null);
    } finally {
      setIsSearching(false);
    }
  }, []);

  // After URL is added
  const handleUrlAdded = () => {
    // If there's an active search, search again
    if (searchResults) {
      handleSearch(searchResults.domain);
    }
  };

  // When URL is deleted
  const handleUrlDelete = (deletedId) => {
    if (searchResults) {
      setSearchResults({
        ...searchResults,
        urls: searchResults.urls.filter((url) => url._id !== deletedId),
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold mb-4">LiveAlive 🚀</h1>
          <p className="text-xl mb-8 text-blue-100">
            Keep your Supabase projects alive! Search your domain and view
            uptime status.
          </p>

          {/* Add URL Button */}
          <button
            onClick={() => setIsUrlFormOpen(true)}
            className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors shadow-lg"
          >
            + Add URL
          </button>
        </div>
      </div>

      {/* Search Section */}
      <div className="container mx-auto px-4 -mt-8">
        <div className="bg-white rounded-lg shadow-xl p-8 mb-8">
          <DomainSearch onSearch={handleSearch} isLoading={isSearching} />
        </div>

        {/* Results Section */}
        {searchResults && (
          <DomainResults
            domain={searchResults.domain}
            urls={searchResults.urls}
            onUrlDelete={handleUrlDelete}
          />
        )}
      </div>

      {/* Footer */}
      <footer className="mt-16 py-8 text-center text-gray-600">
        <p className="text-sm">
          Everyday health checks are performed at 03:00 AM
        </p>
      </footer>

      {/* URL Form Modal */}
      <UrlForm
        isOpen={isUrlFormOpen}
        onClose={() => setIsUrlFormOpen(false)}
        onSuccess={handleUrlAdded}
      />

      {/* Toast Container */}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </div>
  );
}

export default App;

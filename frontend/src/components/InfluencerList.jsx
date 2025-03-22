import React, { useState, useEffect } from "react";

const InfluencerList = () => {
  const [influencers, setInfluencers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(true);

  const fetchInfluencers = async (page = 1) => {
    try {
      setLoading(true);
      
      // Try to use pagination parameters - many APIs support this format
      const response = await fetch(`http://127.0.0.1:8000/data?page=${page}&limit=${itemsPerPage}`);

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      
      // Check if we got an array or a paginated response object
      let newInfluencers = [];
      if (Array.isArray(data)) {
        newInfluencers = data;
        // If we received fewer items than requested, we might be at the end
        setHasMore(data.length >= itemsPerPage);
      } else if (data.items && Array.isArray(data.items)) {
        // Handle paginated response format
        newInfluencers = data.items;
        setHasMore(data.hasMore || data.has_more || page < data.total_pages);
      } else {
        throw new Error("Unexpected data format received from API");
      }

      if (page === 1) {
        // First page: replace existing data
        setInfluencers(newInfluencers);
      } else {
        // Subsequent pages: append to existing data
        setInfluencers(prev => [...prev, ...newInfluencers]);
      }
      
      setLoading(false);
    } catch (err) {
      setError(`Failed to fetch influencers: ${err.message}`);
      console.error("Error fetching data:", err);
      setLoading(false);
      setHasMore(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchInfluencers(1);
  }, []);

  const handleNextPage = () => {
    if (hasMore) {
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      fetchInfluencers(nextPage);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
      // Note: We don't refetch for previous pages as we already have that data
    }
  };

  // Calculate current page's data slice for display
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentInfluencers = influencers.slice(indexOfFirstItem, indexOfLastItem);

  // Parse metric values like "1.2K", "3.5M"
  const parseMetric = (value) => {
    if (!value || typeof value !== "string") return "N/A";
    return value;
  };

  // Get the first letter for the avatar
  const getInitial = (channelInfo) => {
    if (!channelInfo) return "I";
    const name = channelInfo.startsWith("@") ? channelInfo.substring(1) : channelInfo;
    return name.charAt(0).toUpperCase();
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-6xl mx-auto mt-8">
      <h2 className="text-2xl font-bold mb-6">Top Influencers</h2>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Rank</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Influencer</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Country</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Followers</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Posts</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Avg. Likes</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Engagement</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {currentInfluencers.map((influencer, index) => (
              <tr key={influencer.rank || index} className="hover:bg-purple-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-purple-600 font-bold">
                  {influencer.rank || (indexOfFirstItem + index + 1)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="h-10 w-10 rounded-full bg-purple-500 flex items-center justify-center text-white font-bold mr-3">
                      {getInitial(influencer.channel_info)}
                    </div>
                    <div className="text-sm font-medium text-gray-900">
                      {influencer.channel_info || "Unknown"}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <span className="mr-2">🌍</span>
                    <span>{influencer.country || "Unknown"}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-blue-600 font-medium">
                  {parseMetric(influencer.followers)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-green-600 font-medium">
                  {parseMetric(influencer.posts)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-red-600 font-medium">
                  {parseMetric(influencer.avg_likes)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-amber-600 font-medium">
                  {influencer.avg_engagement
                    ? (parseFloat(influencer.avg_engagement) || 0).toFixed(2) + "%"
                    : "N/A"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {loading && (
        <div className="flex justify-center py-6">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-600"></div>
        </div>
      )}

      {!loading && currentInfluencers.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No influencers found. Try adjusting your filters or try again later.
        </div>
      )}

      <div className="mt-6 flex justify-between items-center">
        <div className="text-sm text-gray-700">
          Page {currentPage} | Total loaded: {influencers.length} influencers
        </div>
        <div className="flex">
          <button
            onClick={handlePrevPage}
            disabled={currentPage === 1}
            className={`px-4 py-2 mr-2 rounded-md ${
              currentPage === 1
                ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                : "bg-purple-600 text-white hover:bg-purple-700"
            }`}
          >
            Previous
          </button>
          <button
            onClick={handleNextPage}
            disabled={!hasMore || loading}
            className={`px-4 py-2 rounded-md ${
              !hasMore || loading
                ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                : "bg-purple-600 text-white hover:bg-purple-700"
            }`}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default InfluencerList;
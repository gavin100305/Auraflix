import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import Spotlight from "../components/Spotlight";
import Header from "../components/Header";
import RomFooter from "../components/RomFooter";
import Search from "../components/Search";

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

  // Get username from channel info for URL
  const getUsername = (channelInfo) => {
    if (!channelInfo) return "unknown";
    return channelInfo.startsWith("@") ? channelInfo.substring(1) : channelInfo;
  };

  return (
    <div className="bg-black min-h-screen text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Header />
        
        <div className="relative z-10 py-12">
          <Spotlight className="hidden md:block opacity-70" />
          
          <div className="text-center mb-12">
            <motion.h1 
              className="text-4xl md:text-6xl font-bold mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              Discover the Power of Influencers
            </motion.h1>
            
            <motion.p 
              className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              Search, analyze, and leverage the right influencers for your brand.
              Get comprehensive reports and insights to make data-driven decisions.
            </motion.p>
          </div>
          
          <div className="mb-8">
            <Search isEmbedded={true} />
          </div>

          <motion.div 
            className="bg-gray-950 rounded-2xl shadow-xl overflow-hidden border border-gray-800"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <div className="px-6 py-5 border-b border-gray-800 bg-black flex justify-between items-center">
              <h2 className="text-2xl font-bold text-purple-500">Top Influencers</h2>
              <div className="text-sm text-gray-500">
                Page {currentPage} | Total loaded: {influencers.length} influencers
              </div>
            </div>
            
            {error && (
              <div className="bg-red-900/60 border border-red-700 text-red-200 px-6 py-4 m-4 rounded">
                {error}
              </div>
            )}

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-900">
                <thead className="bg-black">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Rank</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Influencer</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Country</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Followers</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Posts</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Avg. Likes</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Engagement</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-900 bg-gray-950">
                  {currentInfluencers.map((influencer, index) => (
                    <motion.tr 
                      key={influencer.rank || index} 
                      className="hover:bg-black/40 transition-colors"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3, delay: 0.1 * index }}
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-purple-500 font-bold">
                        {influencer.rank || (indexOfFirstItem + index + 1)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Link 
                            to={`/analysis/${getUsername(influencer.channel_info)}`}
                            className="flex items-center group"
                          >
                            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-700 to-blue-800 flex items-center justify-center text-white font-bold mr-3 group-hover:shadow-lg group-hover:shadow-purple-600/30 transition-all">
                              {getInitial(influencer.channel_info)}
                            </div>
                            <div className="text-sm font-medium group-hover:text-purple-400 transition-colors">
                              {influencer.channel_info || "Unknown"}
                            </div>
                          </Link>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <span className="mr-2">🌍</span>
                          <span className="text-gray-400">{influencer.country || "Unknown"}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-blue-500 font-medium">
                        {parseMetric(influencer.followers)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-green-500 font-medium">
                        {parseMetric(influencer.posts)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-red-500 font-medium">
                        {parseMetric(influencer.avg_likes)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-amber-500 font-medium">
                        {influencer.avg_engagement
                          ? (parseFloat(influencer.avg_engagement) || 0).toFixed(2) + "%"
                          : "N/A"}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>

            {loading && (
              <div className="flex justify-center py-12">
                <motion.div 
                  className="rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                />
              </div>
            )}

            {!loading && currentInfluencers.length === 0 && (
              <div className="text-center py-16 text-gray-500">
                No influencers found. Try adjusting your filters or try again later.
              </div>
            )}

            <div className="px-6 py-4 border-t border-gray-900 bg-black flex justify-end">
              <div className="flex space-x-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handlePrevPage}
                  disabled={currentPage === 1}
                  className={`px-5 py-2 rounded-lg transition ${
                    currentPage === 1
                      ? "bg-gray-900 text-gray-600 cursor-not-allowed"
                      : "bg-purple-800 text-white hover:bg-purple-700"
                  }`}
                >
                  Previous
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleNextPage}
                  disabled={!hasMore || loading}
                  className={`px-5 py-2 rounded-lg transition ${
                    !hasMore || loading
                      ? "bg-gray-900 text-gray-600 cursor-not-allowed"
                      : "bg-purple-800 text-white hover:bg-purple-700"
                  }`}
                >
                  Next
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
      
      <RomFooter />
    </div>
  );
};

export default InfluencerList;
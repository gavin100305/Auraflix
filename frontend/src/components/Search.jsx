import React, { useState, useEffect } from "react";
import { Search as SearchIcon, User, Heart, Image, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
// Import useNavigate hook from react-router-dom
import { useNavigate } from "react-router-dom";

const Search = ({ isEmbedded = false }) => {
  // Add navigate function
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [influencerData, setInfluencerData] = useState(null);
  const [error, setError] = useState("");
  const [recentSearches, setRecentSearches] = useState([]);
  const [isResultVisible, setIsResultVisible] = useState(false);

  useEffect(() => {
    const savedSearches = localStorage.getItem("recentSearches");
    if (savedSearches) {
      setRecentSearches(JSON.parse(savedSearches));
    }
  }, []);

  useEffect(() => {
    if (influencerData) {
      setTimeout(() => {
        setIsResultVisible(true);
      }, 100);
    } else {
      setIsResultVisible(false);
    }
  }, [influencerData]);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      setError("Please enter a username");
      return;
    }

    setIsLoading(true);
    setError("");
    setIsResultVisible(false);

    try {
      const response = await fetch("http://127.0.0.1:8000/data");
      const data = await response.json();

      const matchedInfluencer = data.find(
        (item) => item.channel_info.toLowerCase() === searchQuery.toLowerCase()
      );

      if (matchedInfluencer) {
        const detailedResponse = await fetch(
          `http://127.0.0.1:8000/data/rank/${matchedInfluencer.rank}`
        );
        const influencerDetails = await detailedResponse.json();
        setInfluencerData(influencerDetails);
        saveSearch(searchQuery);
      } else {
        setError("No influencer found with that username");
        setInfluencerData(null);
      }
    } catch (err) {
      setError("Failed to fetch data. Try again later.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const saveSearch = (username) => {
    const updatedSearches = [
      username,
      ...recentSearches.filter((s) => s !== username),
    ].slice(0, 5);
    setRecentSearches(updatedSearches);
    localStorage.setItem("recentSearches", JSON.stringify(updatedSearches));
  };

  // Add navigation handler function
  const handleNavigateToAnalysis = () => {
    // Navigate to analysis route with influencer data as state
    navigate("/analysis", { state: { influencer: influencerData } });
  };

  const formatNumber = (value) => {
    if (!value) return "N/A";
    if (value.includes("k")) return `${parseFloat(value) * 1_000}`;
    if (value.includes("m")) return `${parseFloat(value) * 1_000_000}`;
    return value;
  };

  const calculateEngagementRate = (avgLikes, followers) => {
    const likes = formatNumber(avgLikes);
    const totalFollowers = formatNumber(followers);
    return totalFollowers > 0 ? ((likes / totalFollowers) * 100).toFixed(2) : "0";
  };

  const formatDisplayNumber = (num) => {
    if (typeof num === 'string') {
      if (num.includes('k') || num.includes('m')) return num;
      num = parseInt(num);
    }
    
    if (isNaN(num)) return 'N/A';
    
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  // For the search form component only - used on landing page
  const SearchForm = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.3 }}
      className="max-w-2xl mx-auto mb-8"
    >
      <form onSubmit={handleSearch} className="relative">
        <div className="relative">
          <input
            type="text"
            placeholder="Enter influencer username..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/10 border border-white/20 rounded-lg px-5 py-4 text-white focus:outline-none focus:ring-2 focus:ring-white/30 pl-12"
          />
          <SearchIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/50" size={20} />
          <motion.button
            type="submit"
            disabled={isLoading}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-white text-black px-6 py-2 rounded-md hover:bg-opacity-90 transition-all disabled:opacity-50 font-medium"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Searching
              </span>
            ) : (
              "Search"
            )}
          </motion.button>
        </div>
      </form>
    </motion.div>
  );

  // If component is embedded on the landing page, only render the search form
  if (isEmbedded) {
    return (
      <>
        <SearchForm />
        
        {error && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl mx-auto p-4 mb-6 bg-red-500/20 border border-red-500/30 text-red-300 rounded-md"
          >
            <p>{error}</p>
          </motion.div>
        )}

        {recentSearches.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="max-w-2xl mx-auto mb-8"
          >
            <p className="text-sm text-white/50 mb-2">Recent searches:</p>
            <div className="flex flex-wrap gap-2">
              {recentSearches.map((search, index) => (
                <motion.button
                  key={index}
                  onClick={() => setSearchQuery(search)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="text-sm bg-white/10 px-4 py-2 rounded-lg hover:bg-white/20 transition-all duration-300 border border-white/10"
                >
                  {search}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {influencerData && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ 
              opacity: isResultVisible ? 1 : 0, 
              y: isResultVisible ? 0 : 30 
            }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl mx-auto border border-white/20 rounded-2xl overflow-hidden bg-black/30 backdrop-blur-sm"
          >
            {/* Influencer data content - same as your original component */}
            {/* Header Section */}
            <div className="bg-gradient-to-r from-purple-900/70 to-indigo-900/70 p-6 border-b border-white/10">
              {/* ... Header content */}
              <div className="flex items-center gap-6">
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3, type: "spring" }}
                  className="w-20 h-20 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center text-white font-bold text-3xl"
                >
                  {influencerData.channel_info.charAt(0).toUpperCase()}
                </motion.div>
                <motion.div
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  <h3 className="text-2xl font-bold">{influencerData.channel_info}</h3>
                  <div className="flex items-center mt-1 text-white/70">
                    <div className="flex items-center gap-1">
                      <span className="text-sm">📍</span>
                      <span>{influencerData.country}</span>
                    </div>
                    <span className="mx-2">•</span>
                    <div className="flex items-center gap-1">
                      <span className="text-sm">✨</span>
                      <span>Rank #{influencerData.rank}</span>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="p-6">
              <motion.h4
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-lg font-semibold text-white/90 mb-4"
              >
                Performance Metrics
              </motion.h4>
              
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {[
                  {
                    title: "Followers",
                    value: formatDisplayNumber(influencerData.followers),
                    icon: <User size={18} className="text-blue-400" />,
                    gradient: "from-blue-900/30 to-blue-800/30"
                  },
                  {
                    title: "Posts",
                    value: formatDisplayNumber(influencerData.posts),
                    icon: <Image size={18} className="text-green-400" />,
                    gradient: "from-green-900/30 to-green-800/30"
                  },
                  {
                    title: "Avg. Likes",
                    value: formatDisplayNumber(influencerData.avg_likes),
                    icon: <Heart size={18} className="text-pink-400" />,
                    gradient: "from-pink-900/30 to-pink-800/30"
                  },
                  {
                    title: "Engagement",
                    value: `${calculateEngagementRate(influencerData.avg_likes, influencerData.followers)}%`,
                    icon: <TrendingUp size={18} className="text-amber-400" />,
                    gradient: "from-amber-900/30 to-amber-800/30"
                  }
                ].map((stat, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 + index * 0.1 }}
                    whileHover={{ scale: 1.05 }}
                    className={`bg-gradient-to-br ${stat.gradient} p-5 rounded-xl border border-white/10 backdrop-blur-sm`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-white/70 font-medium">{stat.title}</p>
                      {stat.icon}
                    </div>
                    <p className="text-2xl font-bold text-white">
                      {stat.value}
                    </p>
                  </motion.div>
                ))}
              </div>
              
              {/* Additional Stats */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 }}
                className="bg-white/5 border border-white/10 p-5 rounded-xl mb-6"
              >
                <h4 className="text-lg font-semibold text-white/90 mb-4">Additional Insights</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="transform transition-all duration-500 hover:translate-x-1">
                    <p className="text-sm text-white/50">Total Likes</p>
                    <p className="text-xl font-bold text-white">{formatDisplayNumber(influencerData.total_likes)}</p>
                  </div>
                  <div className="transform transition-all duration-500 hover:translate-x-1">
                    <p className="text-sm text-white/50">Avg. Comments</p>
                    <p className="text-xl font-bold text-white">{formatDisplayNumber(influencerData.avg_likes ? parseInt(formatNumber(influencerData.avg_likes)) / 20 : 0)}</p>
                  </div>
                </div>
              </motion.div>

              {/* Modified Call to action with navigation */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.1 }}
                className="flex justify-center"
              >
                <motion.button 
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-white text-black px-6 py-3 rounded-md hover:bg-opacity-90 transition-all font-medium flex items-center gap-2"
                  onClick={handleNavigateToAnalysis}
                >
                  View Detailed Analytics
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m9 18 6-6-6-6"/>
                  </svg>
                </motion.button>
              </motion.div>
            </div>
          </motion.div>
        )}
      </>
    );
  }

  // Original full page component if not embedded
  return (
    <div className="min-h-screen flex flex-col bg-black text-white">
      <div className="relative flex-1 flex overflow-hidden bg-black/[0.96] antialiased">
        <div
          className="pointer-events-none absolute inset-0 select-none"
          style={{
            backgroundImage:
              "linear-gradient(to right, #171717 1px, transparent 1px), linear-gradient(to bottom, #171717 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
        
        <div className="relative z-10 w-full max-w-5xl mx-auto px-6 py-20">
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="bg-gradient-to-b from-neutral-50 to-neutral-400 bg-clip-text text-center text-4xl md:text-7xl font-bold text-transparent mb-12"
          >
            Influencer Analytics
          </motion.h1>

          <SearchForm />

          {error && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-2xl mx-auto p-4 mb-6 bg-red-500/20 border border-red-500/30 text-red-300 rounded-md"
            >
              <p>{error}</p>
            </motion.div>
          )}

          {recentSearches.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="max-w-2xl mx-auto mb-8"
            >
              <p className="text-sm text-white/50 mb-2">Recent searches:</p>
              <div className="flex flex-wrap gap-2">
                {recentSearches.map((search, index) => (
                  <motion.button
                    key={index}
                    onClick={() => setSearchQuery(search)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="text-sm bg-white/10 px-4 py-2 rounded-lg hover:bg-white/20 transition-all duration-300 border border-white/10"
                  >
                    {search}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {influencerData && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ 
                opacity: isResultVisible ? 1 : 0, 
                y: isResultVisible ? 0 : 30 
              }}
              transition={{ duration: 0.6 }}
              className="max-w-4xl mx-auto border border-white/20 rounded-2xl overflow-hidden bg-black/30 backdrop-blur-sm"
            >
              {/* Header Section */}
              <div className="bg-gradient-to-r from-purple-900/70 to-indigo-900/70 p-6 border-b border-white/10">
                <div className="flex items-center gap-6">
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.3, type: "spring" }}
                    className="w-20 h-20 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center text-white font-bold text-3xl"
                  >
                    {influencerData.channel_info.charAt(0).toUpperCase()}
                  </motion.div>
                  <motion.div
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.4 }}
                  >
                    <h3 className="text-2xl font-bold">{influencerData.channel_info}</h3>
                    <div className="flex items-center mt-1 text-white/70">
                      <div className="flex items-center gap-1">
                        <span className="text-sm">📍</span>
                        <span>{influencerData.country}</span>
                      </div>
                      <span className="mx-2">•</span>
                      <div className="flex items-center gap-1">
                        <span className="text-sm">✨</span>
                        <span>Rank #{influencerData.rank}</span>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </div>

              {/* Stats Cards */}
              <div className="p-6">
                <motion.h4
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="text-lg font-semibold text-white/90 mb-4"
                >
                  Performance Metrics
                </motion.h4>
                
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                  {[
                    {
                      title: "Followers",
                      value: formatDisplayNumber(influencerData.followers),
                      icon: <User size={18} className="text-blue-400" />,
                      gradient: "from-blue-900/30 to-blue-800/30"
                    },
                    {
                      title: "Posts",
                      value: formatDisplayNumber(influencerData.posts),
                      icon: <Image size={18} className="text-green-400" />,
                      gradient: "from-green-900/30 to-green-800/30"
                    },
                    {
                      title: "Avg. Likes",
                      value: formatDisplayNumber(influencerData.avg_likes),
                      icon: <Heart size={18} className="text-pink-400" />,
                      gradient: "from-pink-900/30 to-pink-800/30"
                    },
                    {
                      title: "Engagement",
                      value: `${calculateEngagementRate(influencerData.avg_likes, influencerData.followers)}%`,
                      icon: <TrendingUp size={18} className="text-amber-400" />,
                      gradient: "from-amber-900/30 to-amber-800/30"
                    }
                  ].map((stat, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6 + index * 0.1 }}
                      whileHover={{ scale: 1.05 }}
                      className={`bg-gradient-to-br ${stat.gradient} p-5 rounded-xl border border-white/10 backdrop-blur-sm`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-white/70 font-medium">{stat.title}</p>
                        {stat.icon}
                      </div>
                      <p className="text-2xl font-bold text-white">
                        {stat.value}
                      </p>
                    </motion.div>
                  ))}
                </div>
                
                {/* Additional Stats */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1 }}
                  className="bg-white/5 border border-white/10 p-5 rounded-xl mb-6"
                >
                  <h4 className="text-lg font-semibold text-white/90 mb-4">Additional Insights</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="transform transition-all duration-500 hover:translate-x-1">
                      <p className="text-sm text-white/50">Total Likes</p>
                      <p className="text-xl font-bold text-white">{formatDisplayNumber(influencerData.total_likes)}</p>
                    </div>
                    <div className="transform transition-all duration-500 hover:translate-x-1">
                      <p className="text-sm text-white/50">Avg. Comments</p>
                      <p className="text-xl font-bold text-white">{formatDisplayNumber(influencerData.avg_likes ? parseInt(formatNumber(influencerData.avg_likes)) / 20 : 0)}</p>
                    </div>
                  </div>
                </motion.div>

                {/* Modified Call to action with navigation */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.1 }}
                  className="flex justify-center"
                >
                  <motion.button 
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-white text-black px-6 py-3 rounded-md hover:bg-opacity-90 transition-all font-medium flex items-center gap-2"
                    onClick={handleNavigateToAnalysis}
                  >
                    View Detailed Analytics
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="m9 18 6-6-6-6"/>
                    </svg>
                  </motion.button>
                </motion.div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Search;
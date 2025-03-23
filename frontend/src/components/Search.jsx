import React, { useState, useEffect } from "react";
import { User, Heart, Image, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import SearchForm from "./SearchForm";
// import TrendGraph from "./TrendGraph";

const Search = ({ isEmbedded = false }) => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [influencerData, setInfluencerData] = useState(null);
  const [error, setError] = useState("");
  const [isResultVisible, setIsResultVisible] = useState(false);
  const [users, setUsers] = useState([]);
  const [graphInfluencer, setGraphInfluencer] = useState(null);
  const [imageUrl, setImageUrl] = useState(null); // State for Wikipedia image URL

  // Fetch users on component mount
  useEffect(() => {
    console.log("Fetching users...");
    const fetchUsers = async () => {
      try {
        const response = await fetch("http://127.0.0.1:8000/users");
        const data = await response.json();
        console.log("User data is", data);
        if (data.users && Array.isArray(data.users)) {
          setUsers(data.users);
        }
      } catch (err) {
        console.error("Failed to fetch users:", err);
      }
    };

    fetchUsers();
  }, []);

  // Fetch Wikipedia image when influencerData changes
  useEffect(() => {
    if (influencerData) {
      fetchWikipediaImage(influencerData.channel_info);
      setTimeout(() => {
        setIsResultVisible(true);
      }, 100);
    } else {
      setIsResultVisible(false);
    }
  }, [influencerData]);

  // Function to fetch Wikipedia image
  const fetchWikipediaImage = async (searchTerm) => {
    try {
      // Step 1: Fetch the Wikipedia page ID for the search term
      const searchResponse = await fetch(
        `https://en.wikipedia.org/w/api.php?action=query&format=json&list=search&srsearch=${searchTerm}&origin=*`
      );
      const searchData = await searchResponse.json();

      if (searchData.query.search.length > 0) {
        const pageId = searchData.query.search[0].pageid;

        // Step 2: Fetch the image URL for the page
        const imageResponse = await fetch(
          `https://en.wikipedia.org/w/api.php?action=query&format=json&prop=pageimages&pageids=${pageId}&pithumbsize=200&origin=*`
        );
        const imageData = await imageResponse.json();

        const thumbnail = imageData.query.pages[pageId].thumbnail;
        if (thumbnail) {
          setImageUrl(thumbnail.source); // Set the image URL
        } else {
          setImageUrl(null); // Reset if no image is found
        }
      }
    } catch (error) {
      console.error("Error fetching Wikipedia image:", error);
    }
  };

  // Handle search
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
      console.log(data);
      const matchedInfluencer = data.find(
        (item) =>
          item.channel_info &&
          item.channel_info.toLowerCase() === searchQuery.toLowerCase()
      );
      if (matchedInfluencer) {
        const detailedResponse = await fetch(
          `http://127.0.0.1:8000/data/rank/${matchedInfluencer.rank}`
        );
        const influencerDetails = await detailedResponse.json();
        setInfluencerData(influencerDetails);
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

  // Handle input change
  const handleInputChange = (value) => {
    setSearchQuery(value);
  };
  
  const handleNavigateToAnalysis = () => {
    const username = influencerData.channel_info; // Get the username from influencerData
    navigate(`/influencers/${username}`, { state: { influencer: influencerData } });
  };

  // Format numbers for display
  const formatNumber = (value) => {
    if (!value) return "N/A";
    if (value.includes("k")) return `${parseFloat(value) * 1_000}`;
    if (value.includes("m")) return `${parseFloat(value) * 1_000_000}`;
    return value;
  };

  // Calculate engagement rate
  const calculateEngagementRate = (avgLikes, followers) => {
    const likes = formatNumber(avgLikes);
    const totalFollowers = formatNumber(followers);
    return totalFollowers > 0
      ? ((likes / totalFollowers) * 100).toFixed(2)
      : "0";
  };

  // Format display numbers
  const formatDisplayNumber = (num) => {
    if (typeof num === "string") {
      if (num.includes("k") || num.includes("m")) return num;
      num = parseInt(num);
    }

    if (isNaN(num)) return "N/A";

    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + "M";
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + "K";
    }
    return num.toString();
  };

  // Update graph influencer
  useEffect(() => {
    setGraphInfluencer(
      users.filter((user) => user.channel_info === searchQuery)[0]
    );
  }, [searchQuery, users]);

  // If component is embedded on the landing page, only render the search form
  if (isEmbedded) {
    return (
      <>
        <SearchForm
          searchQuery={searchQuery}
          handleInputChange={handleInputChange}
          handleSearch={handleSearch}
          users={users}
          isLoading={isLoading}
          setSearchQuery={setSearchQuery}
        />

        {error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl mx-auto p-4 mb-6 bg-red-500/20 border border-red-500/30 text-red-300 rounded-md"
          >
            <p>{error}</p>
          </motion.div>
        )}

        {influencerData && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{
              opacity: isResultVisible ? 1 : 0,
              y: isResultVisible ? 0 : 30,
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
                  {imageUrl ? (
                    <img
                      src={imageUrl}
                      alt={influencerData.channel_info}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    influencerData.channel_info.charAt(0).toUpperCase()
                  )}
                </motion.div>
                <motion.div
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  <h3 className="text-2xl font-bold">
                    {influencerData.channel_info}
                  </h3>
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
                    gradient: "from-blue-900/30 to-blue-800/30",
                  },
                  {
                    title: "Posts",
                    value: formatDisplayNumber(influencerData.posts),
                    icon: <Image size={18} className="text-green-400" />,
                    gradient: "from-green-900/30 to-green-800/30",
                  },
                  {
                    title: "Avg. Likes",
                    value: formatDisplayNumber(influencerData.avg_likes),
                    icon: <Heart size={18} className="text-pink-400" />,
                    gradient: "from-pink-900/30 to-pink-800/30",
                  },
                  {
                    title: "Engagement",
                    value: `${calculateEngagementRate(
                      influencerData.avg_likes,
                      influencerData.followers
                    )}%`,
                    icon: <TrendingUp size={18} className="text-amber-400" />,
                    gradient: "from-amber-900/30 to-amber-800/30",
                  },
                ].map((stat, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.4,
                      delay: 0.3 + index * 0.08,
                      ease: "easeOut",
                    }}
                    whileHover={{
                      scale: 1.03,
                      transition: { duration: 0.2, ease: "easeInOut" },
                    }}
                    whileTap={{ scale: 0.98 }}
                    className={`bg-gradient-to-br ${stat.gradient} p-5 rounded-xl border border-white/10 backdrop-blur-sm shadow-lg`}
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
                <h4 className="text-lg font-semibold text-white/90 mb-4">
                  Additional Insights
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="transform transition-all duration-500 hover:translate-x-1">
                    <p className="text-sm text-white/50">Total Likes</p>
                    <p className="text-xl font-bold text-white">
                      {influencerData.total_likes}
                    </p>
                  </div>
                  <div className="transform transition-all duration-500 hover:translate-x-1">
                    <p className="text-sm text-white/50">Avg. Comments</p>
                    <p className="text-xl font-bold text-white">
                      {formatDisplayNumber(
                        influencerData.avg_likes
                          ? parseInt(formatNumber(influencerData.avg_likes)) /
                              20
                          : 0
                      )}
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Call to action with navigation */}
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
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="m9 18 6-6-6-6" />
                  </svg>
                </motion.button>
              </motion.div>
            </div>
            {/* <TrendGraph influencer={graphInfluencer} /> */}
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

          <SearchForm
            searchQuery={searchQuery}
            handleInputChange={handleInputChange}
            handleSearch={handleSearch}
            users={users}
            isLoading={isLoading}
            setSearchQuery={setSearchQuery}
          />

          {error && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-2xl mx-auto p-4 mb-6 bg-red-500/20 border border-red-500/30 text-red-300 rounded-md"
            >
              <p>{error}</p>
            </motion.div>
          )}

          {influencerData && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{
                opacity: isResultVisible ? 1 : 0,
                y: isResultVisible ? 0 : 30,
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
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={influencerData.channel_info}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      influencerData.channel_info.charAt(0).toUpperCase()
                    )}
                  </motion.div>
                  <motion.div
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.4 }}
                  >
                    <h3 className="text-2xl font-bold">
                      {influencerData.channel_info}
                    </h3>
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
                      gradient: "from-blue-900/30 to-blue-800/30",
                    },
                    {
                      title: "Posts",
                      value: formatDisplayNumber(influencerData.posts),
                      icon: <Image size={18} className="text-green-400" />,
                      gradient: "from-green-900/30 to-green-800/30",
                    },
                    {
                      title: "Avg. Likes",
                      value: formatDisplayNumber(influencerData.avg_likes),
                      icon: <Heart size={18} className="text-pink-400" />,
                      gradient: "from-pink-900/30 to-pink-800/30",
                    },
                    {
                      title: "Engagement",
                      value: `${calculateEngagementRate(
                        influencerData.avg_likes,
                        influencerData.followers
                      )}%`,
                      icon: <TrendingUp size={18} className="text-amber-400" />,
                      gradient: "from-amber-900/30 to-amber-800/30",
                    },
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
                        <p className="text-white/70 font-medium">
                          {stat.title}
                        </p>
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
                  <h4 className="text-lg font-semibold text-white/90 mb-4">
                    Additional Insights
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="transform transition-all duration-500 hover:translate-x-1">
                      <p className="text-sm text-white/50">Total Likes</p>
                      <p className="text-xl font-bold text-white">
                        {formatDisplayNumber(influencerData.total_likes)}
                      </p>
                    </div>
                    <div className="transform transition-all duration-500 hover:translate-x-1">
                      <p className="text-sm text-white/50">Avg. Comments</p>
                      <p className="text-xl font-bold text-white">
                        {formatDisplayNumber(
                          influencerData.avg_likes
                            ? parseInt(formatNumber(influencerData.avg_likes)) /
                                20
                            : 0
                        )}
                      </p>
                    </div>
                  </div>
                </motion.div>

                {/* Call to action with navigation */}
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
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="m9 18 6-6-6-6" />
                    </svg>
                  </motion.button>
                </motion.div>
              </div>
              {/* <TrendGraph influencer={graphInfluencer} /> */}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Search;

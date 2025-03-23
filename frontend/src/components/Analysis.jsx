import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  User,
  Image,
  Heart,
  TrendingUp,
  Award,
  Calendar,
  MessageCircle,
  BarChart2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import InfluencerComparison from "./InfluencerComparision"; // Make sure path is correct

const InfluencerSuggestions = () => {
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showComparisonSidebar, setShowComparisonSidebar] = useState(false);
  const [selectedForComparison, setSelectedForComparison] = useState([]);
  const [showComparisonView, setShowComparisonView] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const influencersPerView = 3; // Changed from 4 to 3
  const navigate = useNavigate();

  // Track sidebar state for debugging
  useEffect(() => {
    console.log("Sidebar visibility changed:", showComparisonSidebar);
  }, [showComparisonSidebar]);

  const handleNavigateToAnalysis = (influencerData) => {
    const username = influencerData.channel_info;
    navigate(`/influencers/${username}`, {
      state: { influencer: influencerData },
    });
  };

  const handleAddToComparison = (influencer) => {
    setSelectedForComparison((prevSelected) => {
      // Check if the influencer is already selected
      const isAlreadySelected = prevSelected.some(
        (item) => item.channel_info === influencer.channel_info
      );

      if (isAlreadySelected) {
        // If already selected, remove them from the comparison list
        return prevSelected.filter(
          (item) => item.channel_info !== influencer.channel_info
        );
      } else if (prevSelected.length < 2) {
        // If not selected and there's space, add them to the comparison list
        return [...prevSelected, influencer];
      } else {
        // If the list is full, replace the second influencer
        return [prevSelected[0], influencer];
      }
    });
  };

  const handleComparisonClick = () => {
    setShowComparisonView(true); // Show comparison component
    setShowComparisonSidebar(false); // Hide sidebar when showing comparison
  };

  // Function to go back to suggestions view
  const handleBackToSuggestions = () => {
    setShowComparisonView(false);
  };

  const goToPrevious = () => {
    setCurrentIndex((prev) => Math.max(0, prev - influencersPerView));
  };

  const goToNext = () => {
    setCurrentIndex((prev) =>
      Math.min(
        filteredUsers.length - influencersPerView,
        prev + influencersPerView
      )
    );
  };

  // Clear and defined function to close sidebar
  const closeSidebar = () => {
    console.log("Closing sidebar");
    setShowComparisonSidebar(false);
  };

  // Function to open sidebar
  const openSidebar = () => {
    console.log("Opening sidebar");
    setShowComparisonSidebar(true);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const stored = localStorage.getItem("suggestedInfluencers");
        if (!stored) {
          setError("No suggestions found in localStorage.");
          setLoading(false);
          return;
        }

        const parsedSuggestions = JSON.parse(stored);
        const usernames = parsedSuggestions.flatMap((sugg) =>
          sugg.username.split("\n").map((uname) => uname.trim().toLowerCase())
        );

        const response = await fetch("https://influenceiq.onrender.com/users");
        if (!response.ok) {
          throw new Error("Failed to fetch user data from server.");
        }

        const data = await response.json();
        const allUsers = data.users;

        const filtered = allUsers.filter((user) =>
          usernames.includes(user.channel_info.toLowerCase())
        );

        setFilteredUsers(filtered);
      } catch (err) {
        console.error(err);
        setError(err.message || "Something went wrong.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const formatDisplayNumber = (num) => {
    if (!num) return "0";

    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + "M";
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + "K";
    } else {
      return num.toString();
    }
  };

  const parseFormattedNumber = (formatted) => {
    if (!formatted || typeof formatted !== "string") return 0;

    if (formatted.endsWith("k") || formatted.endsWith("K")) {
      return parseFloat(formatted) * 1000;
    } else if (formatted.endsWith("m") || formatted.endsWith("M")) {
      return parseFloat(formatted) * 1000000;
    } else if (formatted.endsWith("b") || formatted.endsWith("B")) {
      return parseFloat(formatted) * 1000000000;
    }

    return parseFloat(formatted) || 0;
  };

  const calculateEngagementRate = (likes, followers) => {
    const likesNum =
      typeof likes === "number" ? likes : parseFormattedNumber(likes);
    const followersNum =
      typeof followers === "number"
        ? followers
        : parseFormattedNumber(followers);

    if (!followersNum) return "0";
    return ((likesNum / followersNum) * 100).toFixed(2);
  };

  // Format score to show only two decimal places
  const formatScore = (score) => {
    if (score === undefined || score === null) return "N/A";
    return typeof score === "number" ? score.toFixed(2) : score;
  };

  // Calculate if next/prev buttons should be disabled
  const canGoBack = currentIndex > 0;
  const canGoForward = currentIndex + influencersPerView < filteredUsers.length;

  // Current visible influencers
  const visibleInfluencers = filteredUsers.slice(
    currentIndex,
    currentIndex + influencersPerView
  );

  // Render influencer comparison if showComparisonView is true
  if (showComparisonView && selectedForComparison.length === 2) {
    return (
      <InfluencerComparison
        initialInfluencers={selectedForComparison}
        onGoBack={handleBackToSuggestions}
      />
    );
  }

  // Otherwise render the suggestions view
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

        <div className="relative z-10 w-full mx-auto px-6 py-20">
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="bg-gradient-to-b from-neutral-50 to-neutral-400 bg-clip-text text-center text-4xl md:text-7xl font-bold text-transparent mb-12"
          >
            Suggested Influencers
          </motion.h1>

          {loading && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-2xl mx-auto p-4 mb-6 bg-blue-500/20 border border-blue-500/30 text-blue-300 rounded-md text-center"
            >
              <p>Loading suggestions...</p>
            </motion.div>
          )}

          {error && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-2xl mx-auto p-4 mb-6 bg-red-500/20 border border-red-500/30 text-red-300 rounded-md"
            >
              <p>{error}</p>
            </motion.div>
          )}

          {!loading && filteredUsers.length === 0 && !error && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-2xl mx-auto p-4 mb-6 bg-yellow-500/20 border border-yellow-500/30 text-yellow-300 rounded-md text-center"
            >
              <p>No matching influencers found in platform data.</p>
            </motion.div>
          )}

          {!loading && filteredUsers.length > 0 && (
            <div className="relative w-full">
              {/* Carousel Navigation Buttons */}
              <div className="flex justify-between absolute top-1/2 -translate-y-1/2 w-full px-4 z-20 pointer-events-none">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={goToPrevious}
                  disabled={!canGoBack}
                  className={`p-3 rounded-full bg-white/10 backdrop-blur-md text-white hover:bg-white/20 transition-all transform pointer-events-auto ${
                    !canGoBack ? "opacity-30 cursor-not-allowed" : ""
                  }`}
                >
                  <ChevronLeft size={24} />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={goToNext}
                  disabled={!canGoForward}
                  className={`p-3 rounded-full bg-white/10 backdrop-blur-md text-white hover:bg-white/20 transition-all transform pointer-events-auto ${
                    !canGoForward ? "opacity-30 cursor-not-allowed" : ""
                  }`}
                >
                  <ChevronRight size={24} />
                </motion.button>
              </div>

              {/* Influencer Cards - Modified to be wider with adjusted spacing */}
              <div className="flex justify-center space-x-8 w-full py-6 px-4 overflow-visible">
                {visibleInfluencers.map((user, index) => (
                  <motion.div
                    key={currentIndex + index}
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    className="border border-white/20 rounded-2xl overflow-hidden bg-black/30 backdrop-blur-sm shadow-lg flex-shrink-0 w-full max-w-sm"
                    whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
                  >
                    {/* Header Section */}
                    <div className="bg-gradient-to-r from-purple-900/70 to-indigo-900/70 p-4 border-b border-white/10">
                      <div className="flex items-center gap-3">
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{
                            delay: 0.3 + index * 0.1,
                            type: "spring",
                          }}
                          className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center text-white font-bold text-xl"
                        >
                          {user.channel_info.charAt(0).toUpperCase()}
                        </motion.div>
                        <motion.div
                          initial={{ x: -20, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          transition={{ delay: 0.4 + index * 0.1 }}
                        >
                          <a
                            href={`https://www.instagram.com/${user.channel_info.replace(
                              "@",
                              ""
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group inline-flex items-center gap-1 transition-all duration-300 hover:translate-y-[-2px]"
                          >
                            <motion.h1
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.5, delay: 0.4 }}
                              className="text-lg font-bold bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent group-hover:from-blue-300 group-hover:to-purple-400"
                            >
                              @{user.channel_info}
                            </motion.h1>
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              className="w-4 h-4 text-gray-400 group-hover:text-purple-400 transition-all duration-300 opacity-0 group-hover:opacity-100 transform group-hover:translate-x-1"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M7 17l9.2-9.2M17 17V7H7" />
                            </svg>
                          </a>
                          <div className="flex items-center mt-1 text-white/70 text-xs">
                            <div className="flex items-center gap-1">
                              <span>📍</span>
                              <span>{user.country || "N/A"}</span>
                            </div>
                            <span className="mx-1">•</span>
                            <div className="flex items-center gap-1">
                              <span>✨</span>
                              <span>Rank #{user.rank}</span>
                            </div>
                          </div>
                        </motion.div>
                      </div>
                    </div>

                    {/* Stats Cards - Making grid larger */}
                    <div className="p-6">
                      <motion.h4
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 + index * 0.1 }}
                        className="text-md font-semibold text-white/90 mb-3"
                      >
                        Performance Metrics
                      </motion.h4>

                      <div className="grid grid-cols-2 gap-4 mb-5">
                        {[
                          {
                            title: "Followers",
                            value: formatDisplayNumber(user.followers),
                            icon: <User size={14} className="text-blue-400" />,
                            gradient: "from-blue-900/30 to-blue-800/30",
                          },
                          {
                            title: "Posts",
                            value: formatDisplayNumber(user.posts),
                            icon: (
                              <Image size={14} className="text-green-400" />
                            ),
                            gradient: "from-green-900/30 to-green-800/30",
                          },
                          {
                            title: "Avg. Likes",
                            value: formatDisplayNumber(user.avg_likes),
                            icon: <Heart size={14} className="text-pink-400" />,
                            gradient: "from-pink-900/30 to-pink-800/30",
                          },
                          {
                            title: "Engagement",
                            value: `${calculateEngagementRate(
                              user.avg_likes,
                              user.followers
                            )}%`,
                            icon: (
                              <TrendingUp
                                size={14}
                                className="text-amber-400"
                              />
                            ),
                            gradient: "from-amber-900/30 to-amber-800/30",
                          },
                        ].map((stat, statIndex) => (
                          <motion.div
                            key={statIndex}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{
                              delay: 0.6 + index * 0.1 + statIndex * 0.1,
                            }}
                            whileHover={{ scale: 1.05 }}
                            className={`bg-gradient-to-br ${stat.gradient} p-4 rounded-xl border border-white/10 backdrop-blur-sm`}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <p className="text-white/70 text-xs font-medium">
                                {stat.title}
                              </p>
                              {stat.icon}
                            </div>
                            <p className="text-sm font-bold text-white">
                              {stat.value}
                            </p>
                          </motion.div>
                        ))}
                      </div>

                      {/* Additional Stats - Compacted for horizontal layout */}
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1 + index * 0.1 }}
                        className="bg-white/5 border border-white/10 p-4 rounded-xl mb-5"
                      >
                        <h4 className="text-sm font-semibold text-white/90 mb-3">
                          Score Metrics
                        </h4>
                        <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                          {[
                            {
                              label: "InfluenceIQ",
                              value: formatScore(user.influenceiq_score),
                              icon: (
                                <Award size={12} className="text-purple-400" />
                              ),
                            },
                            {
                              label: "Influence",
                              value: formatScore(user.influence_score),
                              icon: (
                                <TrendingUp
                                  size={12}
                                  className="text-blue-400"
                                />
                              ),
                            },
                            {
                              label: "Credibility",
                              value: formatScore(user.credibility_score),
                              icon: (
                                <BarChart2
                                  size={12}
                                  className="text-green-400"
                                />
                              ),
                            },
                            {
                              label: "Engagement",
                              value: formatScore(user.engagement_quality_score),
                              icon: (
                                <MessageCircle
                                  size={12}
                                  className="text-pink-400"
                                />
                              ),
                            },
                          ].map((item, itemIndex) => (
                            <motion.div
                              key={itemIndex}
                              className="transform transition-all duration-500 hover:translate-x-1 flex items-center gap-2"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{
                                delay: 1.1 + index * 0.1 + itemIndex * 0.05,
                              }}
                            >
                              {item.icon}
                              <div>
                                <p className="text-xs text-white/50">
                                  {item.label}
                                </p>
                                <p className="text-xs font-bold text-white">
                                  {item.value}
                                </p>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      </motion.div>

                      {/* Action Buttons */}
                      <div className="space-y-3">
                        <motion.button
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 1.2 + index * 0.1 }}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="w-full bg-white text-black px-4 py-3 rounded-md hover:bg-opacity-90 transition-all font-medium flex items-center justify-center gap-2 text-sm"
                          onClick={() => handleNavigateToAnalysis(user)}
                        >
                          View Analytics
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="14"
                            height="14"
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

                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAddToComparison(user);
                          }}
                          className={`w-full px-4 py-3 rounded-md transition-all font-medium flex items-center justify-center gap-2 text-xs ${
                            selectedForComparison.some(
                              (inf) => inf.channel_info === user.channel_info
                            )
                              ? "bg-purple-600 hover:bg-purple-500 text-white"
                              : "bg-gray-800 hover:bg-gray-700 text-white"
                          }`}
                        >
                          {selectedForComparison.some(
                            (inf) => inf.channel_info === user.channel_info
                          )
                            ? "Remove from Comparison"
                            : "Add to Comparison"}
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Pagination Indicators */}
              {filteredUsers.length > influencersPerView && (
                <div className="flex justify-center space-x-2 mt-6">
                  {Array.from({
                    length: Math.ceil(
                      filteredUsers.length / influencersPerView
                    ),
                  }).map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentIndex(i * influencersPerView)}
                      className={`h-2 w-2 rounded-full transition-all ${
                        i === Math.floor(currentIndex / influencersPerView)
                          ? "bg-white w-4"
                          : "bg-white/30"
                      }`}
                      aria-label={`Go to page ${i + 1}`}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Comparison Sidebar - FIXED VERSION */}
      {/* Added a separate div with full opacity for the backdrop that handles clicks */}
      {showComparisonSidebar && (
        <div
          className="fixed inset-0 bg-black/50 z-40"
          onClick={closeSidebar}
        />
      )}

      <motion.div
        className={`fixed right-0 top-0 h-full w-72 bg-black/90 border-l border-white/20 p-6 transform transition-all duration-300 ease-in-out z-50 ${
          showComparisonSidebar ? "translate-x-0" : "translate-x-full"
        }`}
        initial={false}
      >
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-white">
            Compare Influencers
          </h3>
        </div>

        <div className="mb-6">
          <p className="text-white/70 text-sm mb-3">
            Selected for comparison ({selectedForComparison.length}/2):
          </p>
          <div className="space-y-3">
            {selectedForComparison.map((inf, idx) => (
              <div
                key={idx}
                className="bg-white/10 p-3 rounded flex justify-between items-center"
              >
                <span>@{inf.channel_info}</span>
                <button
                  onClick={() => handleAddToComparison(inf)}
                  className="text-red-400 hover:text-red-300 p-1 rounded"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M18 6L6 18"></path>
                    <path d="M6 6l12 12"></path>
                  </svg>
                </button>
              </div>
            ))}

            {selectedForComparison.length < 2 && (
              <div className="bg-white/5 p-3 rounded border border-dashed border-white/20 text-center text-white/50 text-sm">
                Select {2 - selectedForComparison.length} more influencer
                {selectedForComparison.length === 0 ? "s" : ""}
              </div>
            )}
          </div>
        </div>

        <button
          onClick={handleComparisonClick}
          disabled={selectedForComparison.length < 2}
          className={`w-full py-3 rounded-md text-white font-medium transition-all ${
            selectedForComparison.length === 2
              ? "bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              : "bg-gray-700 cursor-not-allowed opacity-50"
          }`}
        >
          Compare Influencers
        </button>
      </motion.div>

      {/* Comparison Toggle Button */}
      <motion.button
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        onClick={openSidebar}
        className="fixed bottom-6 right-6 bg-gradient-to-r from-purple-600 to-blue-600 p-4 rounded-full shadow-lg text-white hover:from-purple-700 hover:to-blue-700 transition-all z-40"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="21 8 21 21 3 21 3 8"></polyline>
          <rect x="1" y="3" width="22" height="5"></rect>
          <line x1="10" y1="12" x2="14" y2="12"></line>
        </svg>
      </motion.button>
    </div>
  );
};

export default InfluencerSuggestions;

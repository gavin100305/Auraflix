import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion } from "framer-motion";

const CollabSimulator = () => {
  const [businessDetails, setBusinessDetails] = useState({
    businessName: "",
    businessCategory: "",
    description: "",
    budget: 0,
  });

  const [influencers, setInfluencers] = useState([]);
  const [selectedInfluencer, setSelectedInfluencer] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);

  // Animation variants
  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
    hover: {
      y: -5,
      boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)",
      transition: { duration: 0.2 },
    },
  };

  const contentVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -5 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.3 },
    },
  };

  // Fetch influencers on component mount
  useEffect(() => {
    const fetchInfluencers = async () => {
      try {
        const response = await axios.get("http://127.0.0.1:8000/data");
        setInfluencers(response.data);
      } catch (error) {
        console.error("Error fetching influencers:", error);
      }
    };

    fetchInfluencers();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setBusinessDetails((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleInfluencerChange = (e) => {
    setSelectedInfluencer(e.target.value);
  };

  const simulateCollab = async () => {
    if (!selectedInfluencer || !businessDetails.businessName) {
      alert("Please select an influencer and enter business details");
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/collab-simulation",
        {
          business: businessDetails,
          influencer_username: selectedInfluencer,
        }
      );

      setResults(response.data);
    } catch (error) {
      console.error("Error simulating collaboration:", error);
      alert("Failed to simulate collaboration");
    } finally {
      setLoading(false);
    }
  };

  const getRecommendations = async () => {
    if (!businessDetails.businessName) {
      alert("Please enter business details");
      return;
    }

    setLoadingRecommendations(true);

    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/batch-collab-recommendations",
        {
          business: businessDetails,
          count: 10, // Get top 10 recommendations
        }
      );

      setRecommendations(response.data.recommendations);
    } catch (error) {
      console.error("Error getting recommendations:", error);
      alert("Failed to get recommendations");
    } finally {
      setLoadingRecommendations(false);
    }
  };

  // Color mapping for match percentage
  const getMatchColor = (percentage) => {
    if (percentage >= 80) return "bg-green-500/40 text-green-200";
    if (percentage >= 60) return "bg-blue-500/40 text-blue-200";
    if (percentage >= 40) return "bg-yellow-500/40 text-yellow-200";
    return "bg-red-500/40 text-red-200";
  };

  return (
    <div className="min-h-screen flex flex-col bg-black text-white">
      <div className="relative flex-1 flex overflow-hidden bg-black/[0.96] antialiased">
        {/* Grid background */}
        <div
          className="pointer-events-none absolute inset-0 select-none opacity-80"
          style={{
            backgroundImage:
              "linear-gradient(to right, #171717 1px, transparent 1px), linear-gradient(to bottom, #171717 1px, transparent 1px)",
            backgroundSize: "35px 35px",
          }}
        />

        <div className="relative z-10 w-full mx-auto px-6 py-12 md:py-24">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-gradient-to-b from-neutral-50 to-neutral-400 bg-clip-text text-3xl md:text-5xl font-bold text-transparent leading-tight mb-12"
          >
            Collaboration Simulator
          </motion.h1>

          {/* Business Details Form */}
          <motion.div
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            whileHover="hover"
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-neutral-900/50 rounded-xl border border-neutral-800 overflow-hidden backdrop-blur-sm mb-8"
          >
            <div className="px-6 py-4 border-b border-neutral-800">
              <h2 className="text-xl font-bold text-white">Business Details</h2>
            </div>
            <div className="px-6 py-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-neutral-400 mb-1">
                    Business Name
                  </label>
                  <input
                    type="text"
                    name="businessName"
                    value={businessDetails.businessName}
                    onChange={handleInputChange}
                    className="w-full bg-neutral-800 text-white border border-neutral-700 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-400 mb-1">
                    Business Category
                  </label>
                  <input
                    type="text"
                    name="businessCategory"
                    value={businessDetails.businessCategory}
                    onChange={handleInputChange}
                    className="w-full bg-neutral-800 text-white border border-neutral-700 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-neutral-400 mb-1">
                    Business Description
                  </label>
                  <textarea
                    name="description"
                    value={businessDetails.description}
                    onChange={handleInputChange}
                    rows="3"
                    className="w-full bg-neutral-800 text-white border border-neutral-700 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  ></textarea>
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-400 mb-1">
                    Budget (Optional)
                  </label>
                  <input
                    type="number"
                    name="budget"
                    value={businessDetails.budget}
                    onChange={handleInputChange}
                    className="w-full bg-neutral-800 text-white border border-neutral-700 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="mt-6 flex flex-col sm:flex-row gap-4">
                <motion.button
                  onClick={getRecommendations}
                  disabled={loadingRecommendations}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-medium rounded-md flex items-center justify-center transition-all"
                >
                  {loadingRecommendations ? (
                    <>
                      <motion.div
                        className="mr-2 h-4 w-4 rounded-full border-2 border-t-transparent border-white"
                        animate={{ rotate: 360 }}
                        transition={{
                          duration: 1,
                          repeat: Infinity,
                          ease: "linear",
                        }}
                      />
                      Finding Matches...
                    </>
                  ) : (
                    "Get Recommended Influencers"
                  )}
                </motion.button>
              </div>
            </div>
          </motion.div>

          {/* Recommendations Section */}
          {recommendations.length > 0 && (
            <motion.div
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              whileHover="hover"
              transition={{ duration: 0.5, delay: 0.3 }}
              className="bg-neutral-900/50 rounded-xl border border-neutral-800 overflow-hidden backdrop-blur-sm mb-8"
            >
              <div className="px-6 py-4 border-b border-neutral-800">
                <h2 className="text-xl font-bold text-white">
                  Top Recommended Influencers
                </h2>
              </div>
              <div className="px-6 py-6 overflow-x-auto">
                <table className="min-w-full divide-y divide-neutral-800">
                  <thead>
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">
                        Influencer
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">
                        Category
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">
                        Followers
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">
                        Match %
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">
                        Est. Cost
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">
                        Est. ROI
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-800">
                    {recommendations.map((rec) => (
                      <tr key={rec.username}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-white">
                            {rec.channel_info}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-neutral-400">
                            {rec.category}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-neutral-400">
                            {rec.followers}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getMatchColor(
                              rec.match_percentage
                            )}`}
                          >
                            {rec.match_percentage}%
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-400">
                          ${rec.estimated_cost.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-400">
                          {rec.estimated_roi}%
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <motion.button
                            onClick={() => {
                              setSelectedInfluencer(rec.username);
                              simulateCollab();
                            }}
                            whileHover={{ scale: 1.05 }}
                            className="text-blue-400 hover:text-blue-300"
                          >
                            Details
                          </motion.button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {/* Individual Collab Simulator */}
          <motion.div
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            whileHover="hover"
            transition={{ duration: 0.5, delay: 0.4 }}
            className="bg-neutral-900/50 rounded-xl border border-neutral-800 overflow-hidden backdrop-blur-sm mb-8"
          >
            <div className="px-6 py-4 border-b border-neutral-800">
              <h2 className="text-xl font-bold text-white">
                Simulate Specific Collaboration
              </h2>
            </div>
            <div className="px-6 py-6">
              <div className="mb-4">
                <label className="block text-sm font-medium text-neutral-400 mb-1">
                  Select Influencer
                </label>
                <select
                  value={selectedInfluencer}
                  onChange={handleInfluencerChange}
                  className="w-full bg-neutral-800 text-white border border-neutral-700 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">-- Select Influencer --</option>
                  {influencers.map((influencer) => (
                    <option
                      key={influencer.channel_info}
                      value={getUsername(influencer.channel_info)}
                    >
                      {influencer.channel_info} ({influencer.followers}{" "}
                      followers)
                    </option>
                  ))}
                </select>
              </div>

              <motion.button
                onClick={simulateCollab}
                disabled={loading}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-medium rounded-md flex items-center justify-center transition-all"
              >
                {loading ? (
                  <>
                    <motion.div
                      className="mr-2 h-4 w-4 rounded-full border-2 border-t-transparent border-white"
                      animate={{ rotate: 360 }}
                      transition={{
                        duration: 1,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                    />
                    Simulating...
                  </>
                ) : (
                  "Simulate Collaboration"
                )}
              </motion.button>
            </div>
          </motion.div>

          {/* Results Section */}
          {results && (
            <motion.div
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              whileHover="hover"
              transition={{ duration: 0.5, delay: 0.5 }}
              className="bg-neutral-900/50 rounded-xl border border-neutral-800 overflow-hidden backdrop-blur-sm"
            >
              <div className="px-6 py-4 border-b border-neutral-800">
                <h2 className="text-xl font-bold text-white">
                  Collaboration Simulation Results
                </h2>
              </div>
              <div className="px-6 py-6">
                <motion.div
                  variants={contentVariants}
                  initial="hidden"
                  animate="visible"
                >
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <motion.div
                      variants={itemVariants}
                      className="bg-neutral-800/50 rounded-lg p-4 border border-neutral-700/50"
                    >
                      <div className="text-sm font-medium text-neutral-400">
                        Match Percentage
                      </div>
                      <div
                        className={`mt-1 text-3xl font-semibold ${
                          results.match_percentage >= 70
                            ? "text-green-400"
                            : "text-yellow-400"
                        }`}
                      >
                        {results.match_percentage}%
                      </div>
                    </motion.div>

                    <motion.div
                      variants={itemVariants}
                      className="bg-neutral-800/50 rounded-lg p-4 border border-neutral-700/50"
                    >
                      <div className="text-sm font-medium text-neutral-400">
                        Estimated Cost
                      </div>
                      <div className="mt-1 text-3xl font-semibold text-white">
                        ${results.estimated_cost.toLocaleString()}
                      </div>
                    </motion.div>

                    <motion.div
                      variants={itemVariants}
                      className="bg-neutral-800/50 rounded-lg p-4 border border-neutral-700/50"
                    >
                      <div className="text-sm font-medium text-neutral-400">
                        Estimated ROI
                      </div>
                      <div
                        className={`mt-1 text-3xl font-semibold ${
                          results.estimated_roi >= 100
                            ? "text-green-400"
                            : "text-yellow-400"
                        }`}
                      >
                        {results.estimated_roi}%
                      </div>
                    </motion.div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <motion.div
                      variants={itemVariants}
                      className="bg-neutral-800/50 rounded-lg p-4 border border-neutral-700/50"
                    >
                      <div className="text-sm font-medium text-neutral-400">
                        Estimated Reach
                      </div>
                      <div className="mt-1 text-2xl font-semibold text-white">
                        {results.estimated_reach.toLocaleString()} users
                      </div>
                    </motion.div>

                    <motion.div
                      variants={itemVariants}
                      className="bg-neutral-800/50 rounded-lg p-4 border border-neutral-700/50"
                    >
                      <div className="text-sm font-medium text-neutral-400">
                        Relevancy Score
                      </div>
                      <div className="mt-1 text-2xl font-semibold text-white">
                        {results.relevancy_score}/100
                      </div>
                    </motion.div>

                    <motion.div
                      variants={itemVariants}
                      className="bg-neutral-800/50 rounded-lg p-4 border border-neutral-700/50"
                    >
                      <div className="text-sm font-medium text-neutral-400">
                        Longevity Potential
                      </div>
                      <div className="mt-1 text-2xl font-semibold text-white">
                        {results.longevity_potential}/100
                      </div>
                    </motion.div>
                  </div>

                  <motion.div
                    variants={itemVariants}
                    className="bg-blue-900/30 border border-blue-800/50 p-4 rounded-lg"
                  >
                    <div className="text-sm font-medium text-blue-300 mb-2">
                      Recommendation
                    </div>
                    <div className="text-blue-100">
                      {results.recommendation}
                    </div>
                  </motion.div>
                </motion.div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

// Helper function to extract username from channel info
const getUsername = (channelInfo) => {
  if (!channelInfo) return "unknown";
  return channelInfo.startsWith("@") ? channelInfo.substring(1) : channelInfo;
};

export default CollabSimulator;

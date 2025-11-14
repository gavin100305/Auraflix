import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { motion } from "framer-motion";

const CollabSimulator = () => {
  const [businessDetails, setBusinessDetails] = useState({
    businessName: "",
    businessCategory: "",
    description: "",
  });

  const [influencers, setInfluencers] = useState([]);
  const [selectedInfluencer, setSelectedInfluencer] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);

  const simulateCollabSectionRef = useRef(null);
  const resultsSectionRef = useRef(null);

  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
    hover: {
      y: -5,
      boxShadow: "0 15px 30px -5px rgba(0, 0, 0, 0.2)",
      transition: { duration: 0.3 },
    },
  };

  const contentVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -5 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.4 },
    },
  };

  useEffect(() => {
    const fetchInfluencers = async () => {
      try {
        const response = await axios.get(
          "https://influenceiq-python.onrender.com/data"
        );
        setInfluencers(response.data);
      } catch (error) {
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
        "https://influenceiq-python.onrender.com/collab-simulation",
        {
          business: businessDetails,
          influencer_username: selectedInfluencer,
        }
      );

      setResults(response.data);

      setTimeout(() => {
        if (resultsSectionRef.current) {
          resultsSectionRef.current.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }
      }, 100);
    } catch (error) {
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
        "https://influenceiq-python.onrender.com/batch-collab-recommendations",
        {
          business: businessDetails,
          count: 10, 
        }
      );

      setRecommendations(response.data.recommendations);
    } catch (error) {
      alert("Failed to get recommendations");
    } finally {
      setLoadingRecommendations(false);
    }
  };

  const handleDetailsClick = (username) => {
    setSelectedInfluencer(username);

    if (simulateCollabSectionRef.current) {
      simulateCollabSectionRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }

  };

  const getMatchColor = (percentage) => {
    if (percentage >= 80) return "bg-green-500/50 text-green-100";
    if (percentage >= 60) return "bg-blue-500/50 text-blue-100";
    if (percentage >= 40) return "bg-yellow-500/50 text-yellow-100";
    return "bg-red-500/50 text-red-100";
  };

  const getUsername = (channelInfo) => {
    if (!channelInfo) return "unknown";
    return channelInfo.startsWith("@") ? channelInfo.substring(1) : channelInfo;
  };

  return (
    <div className="min-h-screen flex flex-col text-white">
      <div className="relative flex-1 flex overflow-hidden antialiased">
        <div className="relative z-10 w-full max-w-7xl mx-auto px-6 py-12 md:py-24">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="bg-gradient-to-r from-white to-blue-200 bg-clip-text text-4xl md:text-6xl font-bold text-transparent leading-tight mb-6"
          >
            Collaboration Simulator
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-neutral-400 text-lg mb-12 max-w-3xl"
          >
            Predict and optimize your influencer marketing campaigns with
            ML-powered collaboration simulations.
          </motion.p>

          <motion.div
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            whileHover="hover"
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-neutral-900/60 rounded-xl border border-neutral-800 overflow-hidden backdrop-blur-sm mb-8 shadow-xl"
          >
            <div className="px-6 py-4 border-b border-neutral-800 flex items-center">
              <h2 className="text-xl font-bold text-white">Business Details</h2>
              <div className="ml-2 h-1 w-1 rounded-full bg-blue-400"></div>
            </div>
            <div className="px-6 py-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-2">
                    Business Name
                  </label>
                  <input
                    type="text"
                    name="businessName"
                    value={businessDetails.businessName}
                    onChange={handleInputChange}
                    className="w-full bg-neutral-800/80 text-white border border-neutral-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="Enter your business name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-2">
                    Business Category
                  </label>
                  <input
                    type="text"
                    name="businessCategory"
                    value={businessDetails.businessCategory}
                    onChange={handleInputChange}
                    className="w-full bg-neutral-800/80 text-white border border-neutral-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="e.g., Fashion, Technology, Food"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-neutral-300 mb-2">
                    Business Description
                  </label>
                  <textarea
                    name="description"
                    value={businessDetails.description}
                    onChange={handleInputChange}
                    rows="3"
                    className="w-full bg-neutral-800/80 text-white border border-neutral-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="Describe your products, services, and target audience"
                  ></textarea>
                </div>
              </div>

              <div className="mt-8 flex flex-col sm:flex-row gap-4">
                <motion.button
                  onClick={getRecommendations}
                  disabled={loadingRecommendations}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-lg flex items-center justify-center transition-all shadow-lg shadow-blue-600/20 hover:shadow-blue-600/30"
                >
                  {loadingRecommendations ? (
                    <>
                      <motion.div
                        className="mr-2 h-5 w-5 rounded-full border-2 border-t-transparent border-white"
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

          {recommendations.length > 0 && (
            <motion.div
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              whileHover="hover"
              transition={{ duration: 0.5, delay: 0.3 }}
              className="bg-neutral-900/60 rounded-xl border border-neutral-800 overflow-hidden backdrop-blur-sm mb-8 shadow-xl"
            >
              <div className="px-6 py-4 border-b border-neutral-800 flex items-center">
                <h2 className="text-xl font-bold text-white">
                  Top Recommended Influencers
                </h2>
                <div className="ml-2 h-1 w-1 rounded-full bg-green-400"></div>
              </div>
              <div className="px-6 py-6 overflow-x-auto">
                <table className="min-w-full divide-y divide-neutral-800">
                  <thead>
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-neutral-300 uppercase tracking-wider">
                        Influencer
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-neutral-300 uppercase tracking-wider">
                        Category
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-neutral-300 uppercase tracking-wider">
                        Followers
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-neutral-300 uppercase tracking-wider">
                        Match %
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-neutral-300 uppercase tracking-wider">
                        Est. Cost
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-neutral-300 uppercase tracking-wider">
                        Est. ROI
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-neutral-300 uppercase tracking-wider">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-800">
                    {recommendations.map((rec) => (
                      <tr
                        key={rec.username}
                        className="hover:bg-neutral-800/30 transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-white">
                            {rec.channel_info}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-neutral-300">
                            {rec.category}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-neutral-300">
                            {rec.followers}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getMatchColor(
                              rec.match_percentage
                            )}`}
                          >
                            {rec.match_percentage}%
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-300">
                          ${rec.estimated_cost.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-300">
                          {rec.estimated_roi}%
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <motion.button
                            onClick={() => handleDetailsClick(rec.username)}
                            whileHover={{ scale: 1.05 }}
                            className="text-blue-400 hover:text-blue-300 bg-blue-900/30 px-3 py-1 rounded-lg transition-all"
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

          <motion.div
            ref={simulateCollabSectionRef}
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            whileHover="hover"
            transition={{ duration: 0.5, delay: 0.4 }}
            className="bg-neutral-900/60 rounded-xl border border-neutral-800 overflow-hidden backdrop-blur-sm mb-8 shadow-xl"
          >
            <div className="px-6 py-4 border-b border-neutral-800 flex items-center">
              <h2 className="text-xl font-bold text-white">
                Simulate Specific Collaboration
              </h2>
              <div className="ml-2 h-1 w-1 rounded-full bg-purple-400"></div>
            </div>
            <div className="px-6 py-6">
              <div className="mb-6">
                <label className="block text-sm font-medium text-neutral-300 mb-2">
                  Select Influencer
                </label>
                <select
                  value={selectedInfluencer}
                  onChange={handleInfluencerChange}
                  className="w-full bg-neutral-800/80 text-white border border-neutral-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all appearance-none"
                  style={{
                    backgroundImage:
                      "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23ffffff'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E\")",
                    backgroundRepeat: "no-repeat",
                    backgroundPosition: "right 1rem center",
                    backgroundSize: "1.5em 1.5em",
                    paddingRight: "3rem",
                  }}
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
                className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-medium rounded-lg flex items-center justify-center transition-all shadow-lg shadow-green-600/20 hover:shadow-green-600/30"
              >
                {loading ? (
                  <>
                    <motion.div
                      className="mr-2 h-5 w-5 rounded-full border-2 border-t-transparent border-white"
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

          {results && (
            <motion.div
              ref={resultsSectionRef}
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              whileHover="hover"
              transition={{ duration: 0.5, delay: 0.5 }}
              className="bg-neutral-900/60 rounded-xl border border-neutral-800 overflow-hidden backdrop-blur-sm shadow-xl"
            >
              <div className="px-6 py-4 border-b border-neutral-800 flex items-center">
                <h2 className="text-xl font-bold text-white">
                  Collaboration Simulation Results
                </h2>
                <div className="ml-2 h-1 w-1 rounded-full bg-blue-400"></div>
              </div>
              <div className="px-6 py-6">
                <motion.div
                  variants={contentVariants}
                  initial="hidden"
                  animate="visible"
                >
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <motion.div
                      variants={itemVariants}
                      className="bg-neutral-800/70 rounded-lg p-5 border border-neutral-700/70 shadow-lg transform transition-all hover:translate-y-1"
                    >
                      <div className="text-sm font-medium text-neutral-300 mb-1">
                        Match Percentage
                      </div>
                      <div
                        className={`mt-1 text-4xl font-semibold ${
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
                      className="bg-neutral-800/70 rounded-lg p-5 border border-neutral-700/70 shadow-lg transform transition-all hover:translate-y-1"
                    >
                      <div className="text-sm font-medium text-neutral-300 mb-1">
                        Estimated Cost
                      </div>
                      <div className="mt-1 text-4xl font-semibold text-white">
                        ${results.estimated_cost.toLocaleString()}
                      </div>
                    </motion.div>

                    <motion.div
                      variants={itemVariants}
                      className="bg-neutral-800/70 rounded-lg p-5 border border-neutral-700/70 shadow-lg transform transition-all hover:translate-y-1"
                    >
                      <div className="text-sm font-medium text-neutral-300 mb-1">
                        Estimated ROI
                      </div>
                      <div
                        className={`mt-1 text-4xl font-semibold ${
                          results.estimated_roi >= 100
                            ? "text-green-400"
                            : "text-yellow-400"
                        }`}
                      >
                        {results.estimated_roi}%
                      </div>
                    </motion.div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <motion.div
                      variants={itemVariants}
                      className="bg-neutral-800/70 rounded-lg p-5 border border-neutral-700/70 shadow-lg transform transition-all hover:translate-y-1"
                    >
                      <div className="text-sm font-medium text-neutral-300 mb-1">
                        Estimated Reach
                      </div>
                      <div className="mt-1 text-2xl font-semibold text-white">
                        {results.estimated_reach.toLocaleString()} users
                      </div>
                    </motion.div>

                    <motion.div
                      variants={itemVariants}
                      className="bg-neutral-800/70 rounded-lg p-5 border border-neutral-700/70 shadow-lg transform transition-all hover:translate-y-1"
                    >
                      <div className="text-sm font-medium text-neutral-300 mb-1">
                        Relevancy Score
                      </div>
                      <div className="mt-1 text-2xl font-semibold text-white">
                        {results.relevancy_score}/100
                      </div>
                    </motion.div>

                    <motion.div
                      variants={itemVariants}
                      className="bg-neutral-800/70 rounded-lg p-5 border border-neutral-700/70 shadow-lg transform transition-all hover:translate-y-1"
                    >
                      <div className="text-sm font-medium text-neutral-300 mb-1">
                        Longevity Potential
                      </div>
                      <div className="mt-1 text-2xl font-semibold text-white">
                        {results.longevity_potential}/100
                      </div>
                    </motion.div>
                  </div>

                  <motion.div
                    variants={itemVariants}
                    className="bg-blue-900/40 border border-blue-700/60 p-6 rounded-lg shadow-lg"
                  >
                    <div className="text-sm font-medium text-blue-300 mb-3">
                      Recommendation
                    </div>
                    <div className="text-blue-100 text-lg">
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

export default CollabSimulator;

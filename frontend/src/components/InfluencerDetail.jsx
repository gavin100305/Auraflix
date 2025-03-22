import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import TrendGraph from "./TrendGraph";

const InfluencerDetail = () => {
  const { username } = useParams();
  const [influencer, setInfluencer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [summary, setSummary] = useState("");
  const [summaryLoading, setSummaryLoading] = useState(false);

  useEffect(() => {
    const fetchInfluencerDetail = async () => {
      try {
        setLoading(true);
        // Fetch all influencers and find the matching one
        const response = await fetch("http://127.0.0.1:8000/data");

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        const foundInfluencer = data.find(
          (inf) => getUsername(inf.channel_info) === username
        );

        if (!foundInfluencer) {
          throw new Error("Influencer not found");
        }

        setInfluencer(foundInfluencer);
        setLoading(false);

        // After loading influencer data, get AI summary
        generateSummary(foundInfluencer);
      } catch (err) {
        setError(`Failed to fetch influencer data: ${err.message}`);
        setLoading(false);
      }
    };

    fetchInfluencerDetail();
  }, [username]);

  const generateSummary = async (influencerData) => {
    try {
      setSummaryLoading(true);

      // This part assumes you have a backend endpoint that connects to Gemini
      // Replace with your actual summary generation endpoint
      const response = await fetch("http://127.0.0.1:8000/generate-summary", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          influencer: influencerData,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      setSummary(data.summary);
    } catch (err) {
      console.error("Error generating summary:", err);
      setSummary("Unable to generate influencer summary at this time.");
    } finally {
      setSummaryLoading(false);
    }
  };

  // Helper function to extract username from channel info (same as in InfluencerList)
  const getUsername = (channelInfo) => {
    if (!channelInfo) return "unknown";
    return channelInfo.startsWith("@") ? channelInfo.substring(1) : channelInfo;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-950">
        <motion.div
          className="rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-500"
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
        />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-950 text-white p-8">
        <div className="bg-red-900/60 border border-red-700 text-red-200 px-8 py-6 rounded-lg max-w-lg text-center">
          <h2 className="text-xl font-bold mb-4">Error</h2>
          <p>{error}</p>
          <Link
            to="/"
            className="mt-6 inline-block bg-purple-700 hover:bg-purple-600 text-white px-6 py-2 rounded-lg"
          >
            Back to Influencer List
          </Link>
        </div>
      </div>
    );
  }

  if (!influencer) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-950 text-white">
        <h2 className="text-2xl font-bold mb-4">Influencer not found</h2>
        <Link
          to="/"
          className="bg-purple-700 hover:bg-purple-600 text-white px-6 py-2 rounded-lg"
        >
          Back to Influencer List
        </Link>
      </div>
    );
  }

  return (
    <motion.div
      className="bg-gray-950 min-h-screen pb-12"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-black py-16 px-8">
        <div className="container mx-auto">
          <Link
            to="/"
            className="flex items-center text-gray-300 hover:text-white mb-6 transition-colors"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Back to Influencer List
          </Link>

          <div className="flex items-center">
            <motion.div
              className="h-24 w-24 rounded-full bg-gradient-to-br from-purple-600 to-blue-700 flex items-center justify-center text-white text-3xl font-bold mr-6"
              whileHover={{
                scale: 1.1,
                boxShadow: "0 0 35px rgba(139, 92, 246, 0.7)",
              }}
            >
              {influencer.channel_info.charAt(0).toUpperCase()}
            </motion.div>

            <div>
              <h1 className="text-4xl font-bold text-white">
                {influencer.channel_info}
              </h1>
              <div className="flex items-center mt-2">
                <span className="bg-purple-600/30 text-purple-300 px-3 py-1 rounded-full text-sm">
                  Rank #{influencer.rank}
                </span>
                {influencer.country && (
                  <span className="ml-3 text-gray-300 flex items-center">
                    <span className="mr-1">🌍</span>
                    {influencer.country}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-8 mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Stats */}
          <div className="lg:col-span-1">
            <motion.div
              className="bg-gray-900 rounded-2xl shadow-xl overflow-hidden border border-gray-800"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="px-6 py-4 border-b border-gray-800 bg-black">
                <h2 className="text-xl font-bold text-white">
                  Influence Metrics
                </h2>
              </div>
              <div className="px-6 py-4 space-y-4">
                <div>
                  <div className="text-gray-400 text-sm">Followers</div>
                  <div className="text-blue-500 text-xl font-bold">
                    {influencer.followers}
                  </div>
                </div>
                <div>
                  <div className="text-gray-400 text-sm">Posts</div>
                  <div className="text-green-500 text-xl font-bold">
                    {influencer.posts}
                  </div>
                </div>
                <div>
                  <div className="text-gray-400 text-sm">Average Likes</div>
                  <div className="text-red-500 text-xl font-bold">
                    {influencer.avg_likes}
                  </div>
                </div>
                <div>
                  <div className="text-gray-400 text-sm">Engagement Rate</div>
                  <div className="text-amber-500 text-xl font-bold">
                    {influencer.avg_engagement}
                  </div>
                </div>
                <div>
                  <div className="text-gray-400 text-sm">Total Likes</div>
                  <div className="text-indigo-500 text-xl font-bold">
                    {influencer.total_likes}
                  </div>
                </div>
                <div>
                  <div className="text-gray-400 text-sm">
                    New Post Average Likes
                  </div>
                  <div className="text-pink-500 text-xl font-bold">
                    {influencer.new_post_avg_like}
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              className="bg-gray-900 rounded-2xl shadow-xl overflow-hidden border border-gray-800 mt-8"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <div className="px-6 py-4 border-b border-gray-800 bg-black">
                <h2 className="text-xl font-bold text-white">
                  Performance Scores
                </h2>
              </div>
              <div className="px-6 py-4 space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-gray-400 text-sm">
                      Influence Score
                    </span>
                    <span className="text-purple-500 font-bold">
                      {influencer.influence_score}
                    </span>
                  </div>
                  <div className="w-full bg-gray-800 rounded-full h-2">
                    <div
                      className="bg-purple-600 h-2 rounded-full"
                      style={{ width: `${influencer.influence_score}%` }}
                    ></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-gray-400 text-sm">
                      Credibility Score
                    </span>
                    <span className="text-blue-500 font-bold">
                      {influencer.credibility_score?.toFixed(1) || "N/A"}
                    </span>
                  </div>
                  <div className="w-full bg-gray-800 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${influencer.credibility_score}%` }}
                    ></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-gray-400 text-sm">
                      Longevity Score
                    </span>
                    <span className="text-green-500 font-bold">
                      {influencer.longevity_score?.toFixed(1) || "N/A"}
                    </span>
                  </div>
                  <div className="w-full bg-gray-800 rounded-full h-2">
                    <div
                      className="bg-green-600 h-2 rounded-full"
                      style={{ width: `${influencer.longevity_score * 10}%` }}
                    ></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-gray-400 text-sm">
                      Engagement Quality Score
                    </span>
                    <span className="text-orange-500 font-bold">
                      {(influencer.engagement_quality_score * 100)?.toFixed(
                        1
                      ) || "N/A"}
                      %
                    </span>
                  </div>
                  <div className="w-full bg-gray-800 rounded-full h-2">
                    <div
                      className="bg-orange-600 h-2 rounded-full"
                      style={{
                        width: `${influencer.engagement_quality_score * 100}%`,
                      }}
                    ></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-gray-400 text-sm">
                      InfluenceIQ Score
                    </span>
                    <span className="text-pink-500 font-bold">
                      {influencer.influenceiq_score?.toFixed(1) || "N/A"}
                    </span>
                  </div>
                  <div className="w-full bg-gray-800 rounded-full h-2">
                    <div
                      className="bg-pink-600 h-2 rounded-full"
                      style={{ width: `${influencer.influenceiq_score}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right Column - Summary and Graph */}
          <div className="lg:col-span-2">
            <motion.div
              className="bg-gray-900 rounded-2xl shadow-xl overflow-hidden border border-gray-800 mb-8"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <div className="px-6 py-4 border-b border-gray-800 bg-black flex items-center">
                <h2 className="text-xl font-bold text-white">
                  Influencer Summary
                </h2>
                {summaryLoading && (
                  <motion.div
                    className="ml-3 h-4 w-4 rounded-full border-2 border-t-transparent border-purple-500"
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                  />
                )}
              </div>
              <div className="px-6 py-6">
                {summary ? (
                  <p className="text-gray-300 leading-relaxed">{summary}</p>
                ) : summaryLoading ? (
                  <div className="h-32 flex items-center justify-center">
                    <p className="text-gray-400">Generating summary...</p>
                  </div>
                ) : (
                  <p className="text-gray-300 leading-relaxed">
                    {influencer.channel_info} is an influencer with{" "}
                    {influencer.followers} followers and an engagement rate of{" "}
                    {influencer.avg_engagement}. They have posted{" "}
                    {influencer.posts} and receive an average of{" "}
                    {influencer.avg_likes} likes per post.
                  </p>
                )}
              </div>
            </motion.div>

            <motion.div
              className="bg-gray-900 rounded-2xl shadow-xl overflow-hidden border border-gray-800"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <div className="px-6 py-4 border-b border-gray-800 bg-black">
                <h2 className="text-xl font-bold text-white">
                  Engagement Trends
                </h2>
              </div>
              <div className="px-6 py-6 h-96">
                {/* Pass the entire influencer object directly */}
                <TrendGraph influencer={influencer} />
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default InfluencerDetail;

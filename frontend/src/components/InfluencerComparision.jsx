import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, 
  PolarRadiusAxis, Radar 
} from "recharts";
import { ChevronLeft, RefreshCw, Download } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

const InfluencerComparison = () => {
  const [influencers, setInfluencers] = useState([]);
  const [selectedInfluencers, setSelectedInfluencers] = useState([null, null]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  // Parse formatted numbers (e.g. "34.7m", "367.8k") to actual numbers
  const parseFormattedNumber = (formatted) => {
    if (!formatted || typeof formatted !== 'string') return 0;
    
    const numPart = formatted.replace(/[^0-9.]/g, '');
    const multiplier = formatted.endsWith('k') || formatted.endsWith('K') 
      ? 1000 
      : formatted.endsWith('m') || formatted.endsWith('M') 
        ? 1000000 
        : formatted.endsWith('b') || formatted.endsWith('B') 
          ? 1000000000 
          : 1;
    
    return parseFloat(numPart) * multiplier || 0;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Check if we have an influencer passed via location state
        if (location.state?.influencer) {
          const firstInfluencer = location.state.influencer;
          setSelectedInfluencers([firstInfluencer, null]);
        }

        const response = await fetch("http://127.0.0.1:8000/users");
        if (!response.ok) {
          throw new Error("Failed to fetch user data from server.");
        }

        const data = await response.json();
        setInfluencers(data.users);
      } catch (err) {
        console.error(err);
        setError(err.message || "Something went wrong.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [location]);

  const handleInfluencerSelect = (influencer, index) => {
    const newSelected = [...selectedInfluencers];
    newSelected[index] = influencer;
    setSelectedInfluencers(newSelected);
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  const formatLargeNumber = (num) => {
    if (num >= 1000000000) {
      return (num / 1000000000).toFixed(1) + 'B';
    } else if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  // Prepare data for followers and likes comparison
  const prepareAudienceData = () => {
    const data = [];
    
    if (selectedInfluencers[0] || selectedInfluencers[1]) {
      data.push({
        name: "Followers",
        [selectedInfluencers[0]?.channel_info || "Influencer 1"]: selectedInfluencers[0] 
          ? parseFormattedNumber(selectedInfluencers[0].followers) 
          : 0,
        [selectedInfluencers[1]?.channel_info || "Influencer 2"]: selectedInfluencers[1] 
          ? parseFormattedNumber(selectedInfluencers[1].followers) 
          : 0,
      });
      
      data.push({
        name: "Average Likes",
        [selectedInfluencers[0]?.channel_info || "Influencer 1"]: selectedInfluencers[0] 
          ? parseFormattedNumber(selectedInfluencers[0].avg_likes) 
          : 0,
        [selectedInfluencers[1]?.channel_info || "Influencer 2"]: selectedInfluencers[1] 
          ? parseFormattedNumber(selectedInfluencers[1].avg_likes) 
          : 0,
      });
      
      data.push({
        name: "Total Posts",
        [selectedInfluencers[0]?.channel_info || "Influencer 1"]: selectedInfluencers[0] 
          ? parseFormattedNumber(selectedInfluencers[0].posts) 
          : 0,
        [selectedInfluencers[1]?.channel_info || "Influencer 2"]: selectedInfluencers[1] 
          ? parseFormattedNumber(selectedInfluencers[1].posts) 
          : 0,
      });
    }
    
    return data;
  };

  // Prepare data for scores comparison
  const prepareScoreData = () => {
    const scoreData = [];
    
    if (selectedInfluencers[0] && selectedInfluencers[1]) {
      scoreData.push({
        subject: "Influence Score",
        A: selectedInfluencers[0].influence_score || 0,
        B: selectedInfluencers[1].influence_score || 0,
        fullMark: 100,
      });
      scoreData.push({
        subject: "Credibility",
        A: selectedInfluencers[0].credibility_score || 0,
        B: selectedInfluencers[1].credibility_score || 0,
        fullMark: 100,
      });
      scoreData.push({
        subject: "Engagement Quality",
        A: selectedInfluencers[0].engagement_quality_score || 0,
        B: selectedInfluencers[1].engagement_quality_score || 0,
        fullMark: 10,
      });
      scoreData.push({
        subject: "Longevity",
        A: selectedInfluencers[0].longevity_score || 0,
        B: selectedInfluencers[1].longevity_score || 0,
        fullMark: 10,
      });
      scoreData.push({
        subject: "InfluenceIQ",
        A: selectedInfluencers[0].influenceiq_score || 0,
        B: selectedInfluencers[1].influenceiq_score || 0,
        fullMark: 100,
      });
    }
    
    return scoreData;
  };

  // Prepare data for engagement metrics
  const prepareEngagementData = () => {
    const data = [];
    
    if (selectedInfluencers[0] || selectedInfluencers[1]) {
      // Calculate engagement rate
      const getEngagementRate = (influencer) => {
        if (!influencer) return 0;
        const likes = parseFormattedNumber(influencer.avg_likes);
        const followers = parseFormattedNumber(influencer.followers);
        return followers > 0 ? (likes / followers) * 100 : 0;
      };
      
      data.push({
        name: "Engagement Rate (%)",
        [selectedInfluencers[0]?.channel_info || "Influencer 1"]: getEngagementRate(selectedInfluencers[0]),
        [selectedInfluencers[1]?.channel_info || "Influencer 2"]: getEngagementRate(selectedInfluencers[1]),
      });
      
      data.push({
        name: "Engagement Quality",
        [selectedInfluencers[0]?.channel_info || "Influencer 1"]: selectedInfluencers[0]?.engagement_quality_score || 0,
        [selectedInfluencers[1]?.channel_info || "Influencer 2"]: selectedInfluencers[1]?.engagement_quality_score || 0,
      });
    }
    
    return data;
  };

  // Custom tooltip for the bar charts
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-black/90 p-3 border border-white/20 rounded-md backdrop-blur-md">
          <p className="font-medium text-white">{`${label}`}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {`${entry.name}: ${formatLargeNumber(entry.value)}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

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

        <div className="relative z-10 w-full max-w-6xl mx-auto px-6 py-12">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-4 mb-8"
          >
            <button
              onClick={handleGoBack}
              className="flex items-center gap-2 text-white/70 hover:text-white transition-colors"
            >
              <ChevronLeft size={20} />
              <span>Back</span>
            </button>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-blue-500 bg-clip-text text-transparent">
              Influencer Comparison
            </h1>
          </motion.div>

          {loading ? (
            <div className="flex items-center justify-center h-64">
              <RefreshCw size={32} className="animate-spin text-purple-500" />
            </div>
          ) : error ? (
            <div className="bg-red-500/20 border border-red-500/30 p-4 rounded-md text-red-300">
              {error}
            </div>
          ) : (
            <>
              {/* Influencer Selection */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10"
              >
                {[0, 1].map((index) => (
                  <div key={index} className="bg-white/5 p-6 rounded-xl border border-white/10">
                    <h3 className="text-xl font-medium mb-4 text-white/90">
                      Select Influencer {index + 1}
                    </h3>
                    <select
                      className="w-full p-3 bg-black/50 border border-white/20 rounded-lg text-white"
                      value={selectedInfluencers[index]?.channel_info || ""}
                      onChange={(e) => {
                        const selected = influencers.find(
                          (inf) => inf.channel_info === e.target.value
                        );
                        handleInfluencerSelect(selected, index);
                      }}
                    >
                      <option value="">-- Select an influencer --</option>
                      {influencers.map((inf) => (
                        <option key={inf.channel_info} value={inf.channel_info}>
                          @{inf.channel_info}
                        </option>
                      ))}
                    </select>

                    {selectedInfluencers[index] && (
                      <div className="mt-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-xl font-bold">
                            {selectedInfluencers[index].channel_info.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium">@{selectedInfluencers[index].channel_info}</p>
                            <p className="text-sm text-white/60">
                              Rank #{selectedInfluencers[index].rank} • 
                              {selectedInfluencers[index].country ? ` ${selectedInfluencers[index].country}` : " Unknown"}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </motion.div>

              {/* Comparison Graphs */}
              {(selectedInfluencers[0] || selectedInfluencers[1]) && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-8"
                >
                  {/* Followers and Likes Comparison */}
                  <div className="bg-white/5 p-6 rounded-xl border border-white/10">
                    <h3 className="text-xl font-medium mb-6 text-white/90">
                      Audience & Content Metrics
                    </h3>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={prepareAudienceData()}
                          margin={{ top: 10, right: 30, left: 20, bottom: 40 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                          <XAxis dataKey="name" stroke="#aaa" />
                          <YAxis
                            stroke="#aaa"
                            tickFormatter={formatLargeNumber}
                          />
                          <Tooltip content={<CustomTooltip />} />
                          <Legend verticalAlign="top" wrapperStyle={{ paddingBottom: "20px" }} />
                          <Bar
                            dataKey={selectedInfluencers[0]?.channel_info || "Influencer 1"}
                            fill="#8884d8"
                            name={selectedInfluencers[0]?.channel_info || "Not Selected"}
                          />
                          <Bar
                            dataKey={selectedInfluencers[1]?.channel_info || "Influencer 2"}
                            fill="#82ca9d"
                            name={selectedInfluencers[1]?.channel_info || "Not Selected"}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Engagement Metrics */}
                  <div className="bg-white/5 p-6 rounded-xl border border-white/10">
                    <h3 className="text-xl font-medium mb-6 text-white/90">
                      Engagement Metrics
                    </h3>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={prepareEngagementData()}
                          margin={{ top: 10, right: 30, left: 20, bottom: 40 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                          <XAxis dataKey="name" stroke="#aaa" />
                          <YAxis stroke="#aaa" />
                          <Tooltip content={<CustomTooltip />} />
                          <Legend verticalAlign="top" wrapperStyle={{ paddingBottom: "20px" }} />
                          <Bar
                            dataKey={selectedInfluencers[0]?.channel_info || "Influencer 1"}
                            fill="#ff84d8"
                            name={selectedInfluencers[0]?.channel_info || "Not Selected"}
                          />
                          <Bar
                            dataKey={selectedInfluencers[1]?.channel_info || "Influencer 2"}
                            fill="#f7ca9d"
                            name={selectedInfluencers[1]?.channel_info || "Not Selected"}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Score Metrics (Radar Chart) */}
                  {selectedInfluencers[0] && selectedInfluencers[1] && (
                    <div className="bg-white/5 p-6 rounded-xl border border-white/10">
                      <h3 className="text-xl font-medium mb-6 text-white/90">
                        Score Comparison
                      </h3>
                      <div className="h-96">
                        <ResponsiveContainer width="100%" height="100%">
                          <RadarChart outerRadius="70%" data={prepareScoreData()}>
                            <PolarGrid stroke="#444" />
                            <PolarAngleAxis dataKey="subject" stroke="#aaa" />
                            <PolarRadiusAxis stroke="#aaa" />
                            <Radar
                              name={selectedInfluencers[0]?.channel_info}
                              dataKey="A"
                              stroke="#8884d8"
                              fill="#8884d8"
                              fillOpacity={0.6}
                            />
                            <Radar
                              name={selectedInfluencers[1]?.channel_info}
                              dataKey="B"
                              stroke="#82ca9d"
                              fill="#82ca9d"
                              fillOpacity={0.6}
                            />
                            <Legend />
                            <Tooltip />
                          </RadarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  )}

                  {/* Credibility, Engagement Quality, and Longevity Comparison */}
                  <div className="bg-white/5 p-6 rounded-xl border border-white/10">
                    <h3 className="text-xl font-medium mb-6 text-white/90">
                      Performance Score Breakdown
                    </h3>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={[
                            {
                              name: "Credibility",
                              [selectedInfluencers[0]?.channel_info || "Influencer 1"]: 
                                selectedInfluencers[0]?.credibility_score || 0,
                              [selectedInfluencers[1]?.channel_info || "Influencer 2"]: 
                                selectedInfluencers[1]?.credibility_score || 0,
                            },
                            {
                              name: "Engagement Quality",
                              [selectedInfluencers[0]?.channel_info || "Influencer 1"]: 
                                selectedInfluencers[0]?.engagement_quality_score || 0,
                              [selectedInfluencers[1]?.channel_info || "Influencer 2"]: 
                                selectedInfluencers[1]?.engagement_quality_score || 0,
                            },
                            {
                              name: "Longevity",
                              [selectedInfluencers[0]?.channel_info || "Influencer 1"]: 
                                selectedInfluencers[0]?.longevity_score || 0,
                              [selectedInfluencers[1]?.channel_info || "Influencer 2"]: 
                                selectedInfluencers[1]?.longevity_score || 0,
                            },
                          ]}
                          margin={{ top: 10, right: 30, left: 20, bottom: 40 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                          <XAxis dataKey="name" stroke="#aaa" />
                          <YAxis stroke="#aaa" />
                          <Tooltip content={<CustomTooltip />} />
                          <Legend verticalAlign="top" wrapperStyle={{ paddingBottom: "20px" }} />
                          <Bar
                            dataKey={selectedInfluencers[0]?.channel_info || "Influencer 1"}
                            fill="#fc766a"
                            name={selectedInfluencers[0]?.channel_info || "Not Selected"}
                          />
                          <Bar
                            dataKey={selectedInfluencers[1]?.channel_info || "Influencer 2"}
                            fill="#5b84b1"
                            name={selectedInfluencers[1]?.channel_info || "Not Selected"}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Download Button */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex justify-center mt-8"
                  >
                    <button
                      className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 px-6 py-3 rounded-lg text-white font-medium hover:from-purple-700 hover:to-blue-700 transition-all"
                    >
                      <Download size={18} />
                      Download Comparison Report
                    </button>
                  </motion.div>
                </motion.div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default InfluencerComparison;
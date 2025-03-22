// import React, { useState, useEffect } from "react";
// import {
//   LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, Legend, Label
// } from "recharts";

// const TrendGraph = ({ influencer }) => {
//   if(!influencer) return null;
//   const [trendData, setTrendData] = useState([]);

//   useEffect(() => {
//     const data = generateTrendData(influencer.engagement_quality_score);
//     setTrendData(data);
//   }, [influencer]);

//   const generateTrendData = (currentScore) => {
//     const data = [];
//     for (let i = 6; i >= 0; i--) {
//       const date = new Date();
//       date.setDate(date.getDate() - i);
//       const score = +(currentScore + (Math.random() - 0.5) * 0.1).toFixed(4);
//       data.push({
//         date: date.toISOString().split("T")[0],
//         engagement_quality_score: score,
//       });
//     }
//     return data;
//   };

//   // Format date to be more readable (e.g., "Mar 22" instead of "2025-03-22")
//   const formatDate = (dateStr) => {
//     const date = new Date(dateStr);
//     return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
//   };

//   // Custom tooltip to make data more understandable
//   const CustomTooltip = ({ active, payload, label }) => {
//     if (active && payload && payload.length) {
//       const score = payload[0].value;
//       let quality = "Average";
//       let color = "text-yellow-500";

//       if (score > 0.85) {
//         quality = "Excellent";
//         color = "text-green-600";
//       } else if (score > 0.75) {
//         quality = "Good";
//         color = "text-green-500";
//       } else if (score < 0.65) {
//         quality = "Needs Improvement";
//         color = "text-red-500";
//       }

//       return (
//         <div className="bg-white p-4 shadow-lg rounded-lg border border-gray-200">
//           <p className="font-semibold">{formatDate(label)}</p>
//           <p>Quality Score: <span className="font-bold">{(score * 100).toFixed(1)}%</span></p>
//           <p>Rating: <span className={`font-bold ${color}`}>{quality}</span></p>
//         </div>
//       );
//     }
//     return null;
//   };

//   return (
//     <div className="bg-white p-6 rounded-2xl shadow-lg mt-6">
//       <h2 className="text-xl font-bold mb-4 text-center">
//         {influencer.channel_info}'s Engagement Quality
//       </h2>
//       <p className="text-center text-gray-500 mb-4">Last 7 days</p>

//       <ResponsiveContainer width="100%" height={350}>
//         <LineChart
//           data={trendData}
//           margin={{ top: 20, right: 30, left: 20, bottom: 40 }}
//         >
//           <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
//           <XAxis
//             dataKey="date"
//             tickFormatter={formatDate}
//             axisLine={{ stroke: "#e0e0e0" }}
//             tick={{ fill: "#666" }}
//             height={50}
//           >
//             <Label
//               value="Date"
//               position="bottom"
//               offset={20}
//               style={{ textAnchor: 'middle', fill: '#666', fontWeight: 'bold' }}
//             />
//           </XAxis>
//           <YAxis
//             domain={[
//               dataMin => Math.floor(dataMin * 10) / 10,
//               dataMax => Math.ceil(dataMax * 10) / 10
//             ]}
//             tickFormatter={value => `${(value * 100).toFixed(0)}%`}
//             axisLine={{ stroke: "#e0e0e0" }}
//             tick={{ fill: "#666" }}
//             width={60}
//           >
//             <Label
//               value="Engagement Quality"
//               angle={-90}
//               position="insideLeft"
//               offset={-5}
//               style={{ textAnchor: 'middle', fill: '#666', fontWeight: 'bold' }}
//             />
//           </YAxis>
//           <Tooltip content={<CustomTooltip />} />
//           <Line
//             type="monotone"
//             dataKey="engagement_quality_score"
//             stroke="#10b981"
//             strokeWidth={2}
//             dot={{ r: 4, fill: "#10b981", stroke: "#fff", strokeWidth: 2 }}
//             activeDot={{ r: 6, fill: "#059669", stroke: "#fff", strokeWidth: 2 }}
//             name="Engagement Quality"
//           />
//           <Legend verticalAlign="top" height={36} />
//         </LineChart>
//       </ResponsiveContainer>

//       <div className="mt-4 bg-gray-50 p-4 rounded-lg">
//         <h3 className="font-semibold mb-2">What is Engagement Quality?</h3>
//         <p className="text-sm text-gray-600">
//           This score measures how meaningful the interactions with your content are.
//           Higher scores indicate more authentic engagement from real followers who care
//           about your content.
//         </p>
//       </div>
//     </div>
//   );
// };

// export default TrendGraph;

import React, { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
  Label,
  ReferenceLine,
  Area,
  AreaChart,
  ComposedChart,
  Bar,
} from "recharts";
import { motion } from "framer-motion";

const TrendGraph = ({ influencer }) => {
  const [trendData, setTrendData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedMetrics, setSelectedMetrics] = useState([
    "engagement",
    "quality_score",
  ]);
  const [activeTab, setActiveTab] = useState("engagement");

  useEffect(() => {
    if (!influencer) return;

    const fetchTrendData = async () => {
      setLoading(true);
      try {
        // Extract username
        const username = influencer.channel_info?.startsWith("@")
          ? influencer.channel_info.substring(1)
          : influencer.channel_info;

        if (!username) {
          throw new Error("Invalid username");
        }

        // Fetch trend data from backend
        const response = await fetch(
          `http://127.0.0.1:8000/trends/${username}`
        );

        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }

        const data = await response.json();
        setTrendData(data);
      } catch (err) {
        console.error("Error fetching trend data:", err);
        setError(err.message);

        // Fall back to generated data if API fails
        if (influencer.engagement_quality_score) {
          const generatedData = generateFallbackData(
            influencer.engagement_quality_score
          );
          setTrendData(generatedData);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchTrendData();
  }, [influencer]);

  // Fallback data generation (simplified from your original function)
  const generateFallbackData = (qualityScore) => {
    const data = [];
    const baseDate = new Date();
    baseDate.setMonth(baseDate.getMonth() - 11); // Start 12 months ago

    for (let i = 0; i < 12; i++) {
      const currentDate = new Date(baseDate);
      currentDate.setMonth(currentDate.getMonth() + i);

      // Create variation based on quality score
      const quality = +(qualityScore + (Math.random() - 0.5) * 0.1).toFixed(3);
      const engagement = +Math.max(
        0.5,
        quality * 4 + (Math.random() - 0.5)
      ).toFixed(2);

      data.push({
        month: currentDate.toLocaleString("default", { month: "short" }),
        period: `${currentDate.toLocaleString("default", {
          month: "short",
        })} ${currentDate.getFullYear()}`,
        quality_score: quality,
        engagement: engagement,
        followers: Math.floor(50000 + i * 5000 + Math.random() * 10000),
        likes: Math.floor(1000 + i * 200 + Math.random() * 500),
      });
    }

    return data;
  };

  // Format date to be more readable
  const formatDate = (month) => {
    return month; // Already formatted as "MMM" from API
  };

  // Handle tab changes
  const handleTabChange = (tab) => {
    setActiveTab(tab);

    // Set appropriate metrics for each tab
    switch (tab) {
      case "engagement":
        setSelectedMetrics(["engagement", "quality_score"]);
        break;
      case "followers":
        setSelectedMetrics(["followers"]);
        break;
      case "likes":
        setSelectedMetrics(["likes"]);
        break;
      default:
        setSelectedMetrics(["engagement", "quality_score"]);
    }
  };

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload || !payload.length) return null;

    // Get quality score if available
    const qualityScore = payload.find(
      (p) => p.dataKey === "quality_score"
    )?.value;
    const engagement = payload.find((p) => p.dataKey === "engagement")?.value;
    const followers = payload.find((p) => p.dataKey === "followers")?.value;
    const likes = payload.find((p) => p.dataKey === "likes")?.value;

    // Determine quality rating
    let quality = "Average";
    let color = "text-yellow-400";

    if (qualityScore > 0.8) {
      quality = "Excellent";
      color = "text-green-400";
    } else if (qualityScore > 0.6) {
      quality = "Good";
      color = "text-blue-400";
    } else if (qualityScore < 0.4) {
      quality = "Needs Improvement";
      color = "text-orange-400";
    } else if (qualityScore < 0.2) {
      quality = "Poor";
      color = "text-red-400";
    }

    // Format numbers
    const formatNumber = (num) => {
      if (!num && num !== 0) return "N/A";

      if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + "M";
      } else if (num >= 1000) {
        return (num / 1000).toFixed(1) + "K";
      }
      return num.toLocaleString();
    };

    // Get the period (month + year) or fallback to label
    const period = payload[0].payload.period || label;

    return (
      <div className="bg-gray-800 border-gray-700 p-4 shadow-lg rounded-lg border">
        <p className="font-semibold text-center border-b pb-2 mb-2 border-gray-700">
          {period}
        </p>

        <div className="space-y-1">
          {engagement !== undefined && (
            <p className="flex justify-between">
              <span className="text-gray-400 mr-3">Engagement:</span>
              <span className="font-bold text-blue-400">{engagement}%</span>
            </p>
          )}

          {qualityScore !== undefined && (
            <p className="flex justify-between">
              <span className="text-gray-400 mr-3">Quality:</span>
              <span className={`font-bold ${color}`}>
                {(qualityScore * 100).toFixed(1)}%
              </span>
            </p>
          )}

          {followers !== undefined && (
            <p className="flex justify-between">
              <span className="text-gray-400 mr-3">Followers:</span>
              <span className="font-bold text-purple-400">
                {formatNumber(followers)}
              </span>
            </p>
          )}

          {likes !== undefined && (
            <p className="flex justify-between">
              <span className="text-gray-400 mr-3">Avg. Likes:</span>
              <span className="font-bold text-pink-400">
                {formatNumber(likes)}
              </span>
            </p>
          )}

          {qualityScore !== undefined && (
            <p className="flex justify-between mt-2 pt-1 border-t border-gray-700">
              <span className="text-gray-400 mr-3">Rating:</span>
              <span className={`font-bold ${color}`}>{quality}</span>
            </p>
          )}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64 bg-gray-900 rounded-lg">
        <motion.div
          className="w-12 h-12 border-4 border-t-transparent rounded-full border-purple-500"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
      </div>
    );
  }

  if (error && trendData.length === 0) {
    return (
      <div className="flex flex-col justify-center items-center h-64 bg-gray-900 text-red-400 rounded-lg p-6">
        <p className="text-center">Error loading trend data: {error}</p>
        <button
          className="mt-4 px-4 py-2 rounded bg-purple-700 hover:bg-purple-600 text-white"
          onClick={() => window.location.reload()}
        >
          Retry
        </button>
      </div>
    );
  }

  // Color mapping for different metrics
  const colors = {
    engagement: "#3b82f6", // blue
    quality_score: "#10b981", // green
    followers: "#8b5cf6", // purple
    likes: "#ec4899", // pink
  };

  // Data visualization based on active tab
  const renderChart = () => {
    switch (activeTab) {
      case "engagement":
        return (
          <ComposedChart
            data={trendData}
            margin={{ top: 20, right: 30, left: 15, bottom: 40 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
            <XAxis
              dataKey="month"
              axisLine={{ stroke: "#555" }}
              tick={{ fill: "#bbb" }}
            />
            <YAxis
              yAxisId="left"
              domain={[0, "auto"]}
              tickFormatter={(value) => `${value}%`}
              axisLine={{ stroke: "#555" }}
              tick={{ fill: "#bbb" }}
            >
              <Label
                angle={-90}
                position="insideLeft"
                style={{ textAnchor: "middle", fill: "#bbb" }}
                value="Engagement (%)"
              />
            </YAxis>
            <YAxis
              yAxisId="right"
              orientation="right"
              domain={[0, 1]}
              tickFormatter={(value) => `${(value * 100).toFixed(0)}%`}
              axisLine={{ stroke: "#555" }}
              tick={{ fill: "#bbb" }}
            >
              <Label
                angle={90}
                position="insideRight"
                style={{ textAnchor: "middle", fill: "#bbb" }}
                value="Quality Score"
              />
            </YAxis>
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Area
              yAxisId="left"
              type="monotone"
              dataKey="engagement"
              name="Engagement Rate"
              fill={`${colors.engagement}20`}
              stroke={colors.engagement}
              activeDot={{ r: 8 }}
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="quality_score"
              name="Quality Score"
              stroke={colors.quality_score}
              strokeWidth={2}
              dot={{ r: 4, strokeWidth: 2 }}
              activeDot={{ r: 8 }}
            />
            <ReferenceLine
              y={0.5}
              yAxisId="right"
              stroke="#f59e0b"
              strokeDasharray="3 3"
              label={{
                value: "Quality Benchmark",
                position: "insideTopRight",
                fill: "#f59e0b",
                fontSize: 12,
              }}
            />
          </ComposedChart>
        );

      case "followers":
        return (
          <AreaChart
            data={trendData}
            margin={{ top: 20, right: 30, left: 15, bottom: 40 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
            <XAxis
              dataKey="month"
              axisLine={{ stroke: "#555" }}
              tick={{ fill: "#bbb" }}
            />
            <YAxis
              tickFormatter={(value) => {
                if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
                if (value >= 1000) return `${(value / 1000).toFixed(0)}K`;
                return value;
              }}
              axisLine={{ stroke: "#555" }}
              tick={{ fill: "#bbb" }}
            >
              <Label
                angle={-90}
                position="insideLeft"
                style={{ textAnchor: "middle", fill: "#bbb" }}
                value="Followers"
              />
            </YAxis>
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Area
              type="monotone"
              dataKey="followers"
              name="Followers"
              stroke={colors.followers}
              fill={`${colors.followers}30`}
              strokeWidth={2}
              activeDot={{ r: 8 }}
            />
          </AreaChart>
        );

      case "likes":
        return (
          <ComposedChart
            data={trendData}
            margin={{ top: 20, right: 30, left: 15, bottom: 40 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
            <XAxis
              dataKey="month"
              axisLine={{ stroke: "#555" }}
              tick={{ fill: "#bbb" }}
            />
            <YAxis
              tickFormatter={(value) => {
                if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
                if (value >= 1000) return `${(value / 1000).toFixed(0)}K`;
                return value;
              }}
              axisLine={{ stroke: "#555" }}
              tick={{ fill: "#bbb" }}
            >
              <Label
                angle={-90}
                position="insideLeft"
                style={{ textAnchor: "middle", fill: "#bbb" }}
                value="Likes"
              />
            </YAxis>
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar
              dataKey="likes"
              name="Average Likes"
              fill={colors.likes}
              fillOpacity={0.8}
              activeDot={{ r: 8 }}
            />
          </ComposedChart>
        );

      default:
        return null;
    }
  };

  return (
    <div className="w-full text-gray-200">
      {/* Tab navigation */}
      <div className="flex mb-4 border-b border-gray-700">
        <button
          onClick={() => handleTabChange("engagement")}
          className={`py-2 px-4 ${
            activeTab === "engagement"
              ? "bg-gray-800 text-blue-400 border-blue-500 border-b-2"
              : "text-gray-400 hover:text-gray-200"
          }`}
        >
          Engagement
        </button>
        <button
          onClick={() => handleTabChange("followers")}
          className={`py-2 px-4 ${
            activeTab === "followers"
              ? "bg-gray-800 text-purple-400 border-purple-500 border-b-2"
              : "text-gray-400 hover:text-gray-200"
          }`}
        >
          Followers
        </button>
        <button
          onClick={() => handleTabChange("likes")}
          className={`py-2 px-4 ${
            activeTab === "likes"
              ? "bg-gray-800 text-pink-400 border-pink-500 border-b-2"
              : "text-gray-400 hover:text-gray-200"
          }`}
        >
          Likes
        </button>
      </div>

      {/* Chart container */}
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          {renderChart()}
        </ResponsiveContainer>
      </div>

      {/* Legend and description */}
      <div className="mt-6 p-4 rounded-lg bg-gray-800">
        <h3 className="font-medium mb-2">
          {activeTab === "engagement" && "About Engagement & Quality Metrics"}
          {activeTab === "followers" && "Followers Growth Analysis"}
          {activeTab === "likes" && "Engagement Performance"}
        </h3>
        <p className="text-sm text-gray-300">
          {activeTab === "engagement" &&
            "Engagement rate shows the percentage of followers who interact with the influencer's content. Quality score measures how meaningful these interactions are, with higher scores indicating more authentic engagement from real followers who care about the content."}
          {activeTab === "followers" &&
            "This graph shows the growth trend of the influencer's follower count over time. A consistent upward trend indicates growing popularity and reach potential for marketing campaigns."}
          {activeTab === "likes" &&
            "Average likes per post is a key metric for measuring content performance. This data helps predict how well sponsored content might perform with this influencer's audience."}
        </p>
      </div>
    </div>
  );
};

export default TrendGraph;
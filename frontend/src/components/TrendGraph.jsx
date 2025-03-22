import React, { useState, useEffect } from "react";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, Legend, Label
} from "recharts";

const TrendGraph = ({ influencer }) => {
    if(!influencer) return null;
  const [trendData, setTrendData] = useState([]);

  useEffect(() => {
    const data = generateTrendData(influencer.engagement_quality_score);
    setTrendData(data);
  }, [influencer]);

  const generateTrendData = (currentScore) => {
    const data = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const score = +(currentScore + (Math.random() - 0.5) * 0.1).toFixed(4);
      data.push({
        date: date.toISOString().split("T")[0],
        engagement_quality_score: score,
      });
    }
    return data;
  };

  // Format date to be more readable (e.g., "Mar 22" instead of "2025-03-22")
  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // Custom tooltip to make data more understandable
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const score = payload[0].value;
      let quality = "Average";
      let color = "text-yellow-500";
      
      if (score > 0.85) {
        quality = "Excellent";
        color = "text-green-600";
      } else if (score > 0.75) {
        quality = "Good";
        color = "text-green-500";
      } else if (score < 0.65) {
        quality = "Needs Improvement";
        color = "text-red-500";
      }
      
      return (
        <div className="bg-white p-4 shadow-lg rounded-lg border border-gray-200">
          <p className="font-semibold">{formatDate(label)}</p>
          <p>Quality Score: <span className="font-bold">{(score * 100).toFixed(1)}%</span></p>
          <p>Rating: <span className={`font-bold ${color}`}>{quality}</span></p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg mt-6">
      <h2 className="text-xl font-bold mb-4 text-center">
        {influencer.channel_info}'s Engagement Quality
      </h2>
      <p className="text-center text-gray-500 mb-4">Last 7 days</p>
      
      <ResponsiveContainer width="100%" height={350}>
        <LineChart 
          data={trendData}
          margin={{ top: 20, right: 30, left: 20, bottom: 40 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis 
            dataKey="date" 
            tickFormatter={formatDate}
            axisLine={{ stroke: "#e0e0e0" }}
            tick={{ fill: "#666" }}
            height={50}
          >
            <Label 
              value="Date" 
              position="bottom" 
              offset={20} 
              style={{ textAnchor: 'middle', fill: '#666', fontWeight: 'bold' }}
            />
          </XAxis>
          <YAxis 
            domain={[
              dataMin => Math.floor(dataMin * 10) / 10, 
              dataMax => Math.ceil(dataMax * 10) / 10
            ]}
            tickFormatter={value => `${(value * 100).toFixed(0)}%`}
            axisLine={{ stroke: "#e0e0e0" }}
            tick={{ fill: "#666" }}
            width={60}
          >
            <Label 
              value="Engagement Quality" 
              angle={-90} 
              position="insideLeft" 
              offset={-5}
              style={{ textAnchor: 'middle', fill: '#666', fontWeight: 'bold' }}
            />
          </YAxis>
          <Tooltip content={<CustomTooltip />} />
          <Line
            type="monotone"
            dataKey="engagement_quality_score"
            stroke="#10b981"
            strokeWidth={2}
            dot={{ r: 4, fill: "#10b981", stroke: "#fff", strokeWidth: 2 }}
            activeDot={{ r: 6, fill: "#059669", stroke: "#fff", strokeWidth: 2 }}
            name="Engagement Quality"
          />
          <Legend verticalAlign="top" height={36} />
        </LineChart>
      </ResponsiveContainer>
      
      <div className="mt-4 bg-gray-50 p-4 rounded-lg">
        <h3 className="font-semibold mb-2">What is Engagement Quality?</h3>
        <p className="text-sm text-gray-600">
          This score measures how meaningful the interactions with your content are.
          Higher scores indicate more authentic engagement from real followers who care
          about your content.
        </p>
      </div>
    </div>
  );
};

export default TrendGraph;
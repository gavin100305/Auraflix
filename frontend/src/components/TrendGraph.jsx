import React, { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

const TrendGraph = ({influencer}) => {
  const [influencerData, setInfluencerData] = useState(null);
  const [trendData, setTrendData] = useState([]);
  const [regressionData, setRegressionData] = useState({});
  const [activeMetric, setActiveMetric] = useState('engagement');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [csvData, setCsvData] = useState(null);
  const [showPredictions, setShowPredictions] = useState(false);

  useEffect(() => {
    if (!influencer) return;

    const fetchTrendData = async () => {
      setIsLoading(true);  // Fixed: changed setLoading to setIsLoading
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
        setIsLoading(false);  // Fixed: changed setLoading to setIsLoading
      }
    };
    fetchTrendData();
}, [influencer]);

// Generate fallback data if API fails
const generateFallbackData = (baseEngagement) => {
// Using the historical data generation logic for fallback
return generateHistoricalData(influencer);
};


  // Generate 3 years of historical data based on current metrics
  const generateHistoricalData = (influencer) => {
    if (!influencer) return [];
    
    const data = [];
    const baseDate = new Date();
    baseDate.setMonth(baseDate.getMonth() - 35); // Start 36 months ago
    
    // Get base values for consistency in generated data
    const baseLongevity = influencer.longevity_score;
    const baseEngagement = influencer.engagement_quality_score;
    const baseFollowers = parseFloat(influencer.followers.replace('m', '')) * 1000000;
    const baseLikes = parseFloat(influencer.avg_likes.replace('m', '')) * 1000000;
    
    // Add seasonality and trend factors
    const seasonalityFactors = [0.98, 0.96, 0.97, 1.02, 1.04, 1.06, 1.08, 1.09, 1.05, 1.02, 0.99, 0.95]; // Monthly factors
    const trendFactor = 1.008; // Annual growth trend
    
    for (let i = 0; i < 36; i++) {
      const currentDate = new Date(baseDate);
      currentDate.setMonth(currentDate.getMonth() + i);
      const monthIndex = currentDate.getMonth();
      
      // Calculate year-based and month-based factors
      const yearFactor = Math.pow(trendFactor, i / 12);
      const monthFactor = seasonalityFactors[monthIndex];
      
      // Create more realistic patterns with seasonality and trends
      const longevity = +(baseLongevity * 0.8 * yearFactor * (1 + (Math.random() * 0.02 - 0.01)) * monthFactor).toFixed(3);
      const engagement = +(baseEngagement * 0.75 * yearFactor * monthFactor * (1 + (Math.random() * 0.05 - 0.025))).toFixed(3);
      
      // Add some volatility to followers and likes
      const followerVolatility = 1 + (Math.random() * 0.03 - 0.01);
      const likesVolatility = 1 + (Math.random() * 0.08 - 0.03);
      
      // Apply both growth trend and seasonal factors
      const followers = Math.floor(baseFollowers * 0.95 * yearFactor * monthFactor * followerVolatility);
      const likes = Math.floor(baseLikes * 0.65 * yearFactor * monthFactor * likesVolatility);
      
      data.push({
        month: currentDate.toLocaleString("default", { month: "short" }),
        period: `${currentDate.toLocaleString("default", {
          month: "short",
        })} ${currentDate.getFullYear()}`,
        quality_score: longevity,
        engagement: engagement,
        followers: followers,
        likes: likes
      });
    }
    
    return data;
  };
  
  useEffect(() => {
    if (trendData && trendData.length > 0 && activeMetric) {
      fetchRegressionData(activeMetric);
    }
  }, [trendData, activeMetric]);
  
  // Fetch regression data from the backend
  // Modify the fetchRegressionData function to ensure better predictions
const fetchRegressionData = async (metric) => {
  if (!trendData || trendData.length < 2) return;
  
  setIsLoading(true);
  
  try {
    // Prepare data for API request
    const apiData = trendData.map(item => ({
      month: item.month,
      period: item.period,
      quality_score: item.quality_score || item.longevity_score,
      engagement: item.engagement || item.engagement_quality_score,
      followers: item.followers,
      likes: item.likes
    }));
    
    // Call the backend regression API
    const response = await fetch(`http://127.0.0.1:8000/analyze/regression/${metric}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(apiData)
    });
    
    if (!response.ok) {
      throw new Error(`Regression API error: ${response.status}`);
    }
    
    const regressionResult = await response.json();
    
    // Ensure continuity between actual and predicted values
    if (regressionResult.predictions && regressionResult.predictions.length > 0) {
      // Get the last actual data point
      const lastActualDataPoint = trendData[trendData.length - 1];
      const lastActualValue = lastActualDataPoint[metric];
      
      // Find the first future prediction
      const firstFuturePrediction = regressionResult.predictions.find(p => p.is_future);
      
      if (firstFuturePrediction) {
        const discontinuity = firstFuturePrediction.predicted - lastActualValue;
        
        // Adjust all future predictions to eliminate the discontinuity
        regressionResult.predictions = regressionResult.predictions.map(prediction => {
          if (prediction.is_future) {
            return {
              ...prediction,
              predicted: prediction.predicted - discontinuity
            };
          }
          return prediction;
        });
      }
    }
    
    // Update state with the regression results
    setRegressionData(prevData => ({
      ...prevData,
      [metric]: regressionResult
    }));
  } catch (err) {
    console.error("Error calculating regression:", err);
    setError(`Error calculating regression: ${err.message}`);
  } finally {
    setIsLoading(false);
  }
};
  
  // Format value based on metric
  const formatValue = (value, metric) => {
    if (!value && value !== 0) return 'N/A';
    
    if (metric === 'engagement' || metric === 'quality_score') {
      return value.toFixed(2);
    } else if (metric === 'followers') {
      return value >= 1000000 ? `${(value / 1000000).toFixed(1)}M` : value >= 1000 ? `${(value / 1000).toFixed(1)}K` : value;
    } else if (metric === 'likes') {
      return value >= 1000000 ? `${(value / 1000000).toFixed(1)}M` : value >= 1000 ? `${(value / 1000).toFixed(1)}K` : value;
    }
    return value;
  };
  
  // Get color based on metric
  const getMetricColor = (metric) => {
    switch (metric) {
      case 'engagement': return '#3b82f6'; // blue
      case 'quality_score': return '#10b981'; // green
      case 'followers': return '#8b5cf6'; // purple
      case 'likes': return '#ec4899'; // pink
      default: return '#3b82f6';
    }
  };
  
  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload || !payload.length) return null;
    
    const dataPoint = payload[0].payload;
    const isFuture = dataPoint.is_future;
    
    return (
      <div className="bg-gray-800 border border-gray-700 p-3 rounded-md shadow-lg">
        <p className="font-medium text-white mb-1">
          {dataPoint.period || label}
          {isFuture && " (Forecast)"}
        </p>
        
        {!isFuture && dataPoint[activeMetric] !== undefined && (
          <p className="text-blue-400">
            Actual: {formatValue(dataPoint[activeMetric], activeMetric)}
          </p>
        )}
        
        {dataPoint.predicted !== undefined && (
          <p className={isFuture ? "text-orange-400" : "text-yellow-400"}>
            {isFuture ? "Forecast: " : "Predicted: "}
            {formatValue(dataPoint.predicted, activeMetric)}
          </p>
        )}
      </div>
    );
  };
  
  // Get human-readable metric name
  const getMetricName = (metric) => {
    switch (metric) {
      case 'engagement': return 'Engagement Quality';
      case 'quality_score': return 'Longevity';
      case 'followers': return 'Followers';
      case 'likes': return 'Likes';
      default: return metric;
    }
  };
  
  // Render chart with regression line
  const renderChart = () => {
    if (!trendData || trendData.length === 0) {
      return <div className="text-gray-400 text-center py-16">No data available</div>;
    }
    
    const currentRegression = regressionData[activeMetric];
    
    // Combine historical data with future predictions
    let chartData = [...trendData];
    
    if (currentRegression && currentRegression.predictions) {
      // Filter only future predictions
      const futurePredictions = currentRegression.predictions.filter(p => p.is_future);
      
      if (showPredictions) {
        // Add future predictions to the chart data
        chartData = [...chartData, ...futurePredictions];
      }
    }
  
    return (
      <ResponsiveContainer width="100%" height={350}>
        <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis 
            dataKey="month" 
            stroke="#9ca3af"
            // Modify tickFormatter to show year for January or future months
            tickFormatter={(value, index) => {
              const item = chartData[index];
              if (item && (item.month === 'Jan' || item.is_future)) {
                return `${item.month} ${item.period.split(' ')[1]}`;
              }
              return value;
            }}
          />
          <YAxis 
            stroke="#9ca3af"
            tickFormatter={(value) => formatValue(value, activeMetric)}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          
          {/* Actual historical data line */}
          <Line 
            type="monotone" 
            dataKey={activeMetric} 
            name={`Actual ${getMetricName(activeMetric)}`} 
            stroke={getMetricColor(activeMetric)} 
            strokeWidth={2}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
            // Only show for non-future data points
            isAnimationActive={false}
          />
          
          {/* Predictions line - for both historical and future */}
          {currentRegression && (
            <Line 
              type="monotone" 
              dataKey="predicted"
              name="Predicted trend" 
              stroke="#ff7300" 
              strokeWidth={2}
              dot={(props) => {
                // Only show dots for future predictions
                const { payload } = props;
                if (payload && payload.is_future) {
                  return <circle {...props} r={4} fill="#ff7300" />;
                }
                return null;
              }}
              activeDot={(props) => {
                const { payload } = props;
                if (payload && payload.is_future) {
                  return <circle {...props} r={6} fill="#ff7300" />;
                }
                return null;
              }}
              // Use dashed line for historical predictions, solid for future
              strokeDasharray={(props) => {
                const { payload } = props;
                return payload && payload.is_future ? "0" : "5 5";
              }}
              isAnimationActive={false}
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    );
  };
  
  // Render stats panel with regression info
  const renderStats = () => {
    const currentRegression = regressionData[activeMetric];
    
    if (!currentRegression) {
      return (
        <div className="text-gray-400 italic">
          Regression data not available
        </div>
      );
    }
    
    // Calculate growth trend and meaning
    const slope = currentRegression.slope;
    const trendDescription = slope > 0 
      ? `Increasing by ${formatValue(slope, activeMetric)} per month` 
      : `Decreasing by ${formatValue(Math.abs(slope), activeMetric)} per month`;
    
    const trendColor = slope > 0 ? 'text-green-500' : 'text-red-500';
    
    return (
      <div className="space-y-4">
        <div className="bg-gray-800 p-4 rounded-lg">
          <p className="text-gray-400 text-sm">Trend</p>
          <p className={`text-lg font-medium ${trendColor}`}>{trendDescription}</p>
        </div>
        
        <div className="bg-gray-800 p-4 rounded-lg">
          <p className="text-gray-400 text-sm mb-2">Future Predictions</p>
          <div className="space-y-2">
            {currentRegression.predictions
              .filter(p => p.is_future)
              .slice(0, 6) // Show only first 6 predictions to avoid overload
              .map((prediction, idx) => (
                <div key={idx} className="flex justify-between items-center border-b border-gray-700 pb-2">
                  <span className="text-gray-300">{prediction.period}</span>
                  <span className="font-medium text-orange-400">
                    {formatValue(prediction.predicted, activeMetric)}
                  </span>
                </div>
              ))
            }
          </div>
        </div>
      </div>
    );
  };
  
  return (
    <div className="bg-gray-900 text-gray-100 rounded-xl shadow-xl">
      <div className="p-4 border-b border-gray-800 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-medium">
            {influencerData ? `@${influencerData.channel_info}` : 'Influencer'} Analysis
          </h2>
          <p className="text-gray-400 text-sm">3-year metric trends with 12-month forecast</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowPredictions(!showPredictions)}
            className={`px-4 py-2 ${showPredictions ? 'bg-orange-600 hover:bg-orange-700' : 'bg-blue-600 hover:bg-blue-700'} text-white rounded transition-colors`}
          >
            {showPredictions ? 'Show Actual Data' : 'Show Predictions'}
          </button>
        </div>
      </div>
      
      {/* Metric selector */}
      <div className="p-4 border-b border-gray-800">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveMetric('engagement')}
            className={`px-3 py-1 rounded ${activeMetric === 'engagement' 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}
          >
            Engagement Quality
          </button>
          <button
            onClick={() => setActiveMetric('quality_score')}
            className={`px-3 py-1 rounded ${activeMetric === 'quality_score' 
              ? 'bg-green-600 text-white' 
              : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}
          >
            Longevity Score
          </button>
          <button
            onClick={() => setActiveMetric('followers')}
            className={`px-3 py-1 rounded ${activeMetric === 'followers' 
              ? 'bg-purple-600 text-white' 
              : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}
          >
            Followers
          </button>
          <button
            onClick={() => setActiveMetric('likes')}
            className={`px-3 py-1 rounded ${activeMetric === 'likes' 
              ? 'bg-pink-600 text-white' 
              : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}
          >
            Likes
          </button>
        </div>
      </div>
      
      {/* Loading state */}
      {isLoading && (
        <div className="flex justify-center items-center p-8">
          <div className="w-8 h-8 border-4 border-t-blue-500 border-r-transparent border-b-blue-500 border-l-transparent rounded-full animate-spin"></div>
        </div>
      )}
      
      {/* Error message */}
      {error && !isLoading && (
        <div className="bg-red-900/20 border border-red-800 text-red-300 p-4 m-4 rounded">
          {error}
        </div>
      )}
      
      {/* Main content */}
      {!isLoading && (
        <div className="p-4 grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 bg-gray-800 rounded-lg p-4">
            {renderChart()}
          </div>
          <div className="bg-gray-800 rounded-lg p-4">
            {renderStats()}
          </div>
        </div>  
      )}
    </div>
  );
};

export default TrendGraph;
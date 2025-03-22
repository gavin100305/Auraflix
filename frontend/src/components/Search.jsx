import React, { useState, useEffect } from "react";
import { Search as SearchIcon, User, Heart, Image, TrendingUp } from "lucide-react";

const Search = () => {
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

  // Animation effect when influencer data changes
  useEffect(() => {
    if (influencerData) {
      // Slight delay to ensure animation is visible
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

  // Function to format numbers for display (e.g., 1000 -> 1K)
  const formatDisplayNumber = (num) => {
    if (typeof num === 'string') {
      // If it already has K or M, return as is
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

  return (
    <div className="max-w-4xl mx-auto p-6 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 transform transition-all duration-500 hover:shadow-2xl">
        <h2 className="text-3xl font-bold text-center mb-8 text-gray-800 relative">
          <span className="relative inline-block">
            Influencer Analytics{" "}
            <span className="text-purple-600 inline-block animate-pulse">Hub</span>
            <span className="absolute -bottom-2 left-0 w-full h-1 bg-gradient-to-r from-purple-400 to-indigo-500 transform scale-x-0 transition-transform duration-300 group-hover:scale-x-100"></span>
          </span>
        </h2>

        <form onSubmit={handleSearch} className="relative mb-6 transform transition duration-500">
          <div className="relative">
            <input
              type="text"
              placeholder="Enter influencer username..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full p-4 pl-12 pr-32 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-lg transition-all duration-300 shadow-sm hover:shadow-md focus:shadow-md"
            />
            <SearchIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 transition-all duration-300" size={20} />
            <button
              type="submit"
              disabled={isLoading}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition duration-300 disabled:opacity-50 font-medium shadow-md hover:shadow-lg"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Searching
                </span>
              ) : (
                "Search"
              )}
            </button>
          </div>
        </form>

        {error && (
          <div className="p-4 mb-6 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-md transform transition-all duration-300 animate-fadeIn">
            <p>{error}</p>
          </div>
        )}

        {recentSearches.length > 0 && (
          <div className="mb-8 transform">
            <p className="text-sm text-gray-500 mb-2">Recent searches:</p>
            <div className="flex flex-wrap gap-2">
              {recentSearches.map((search, index) => (
                <button
                  key={index}
                  onClick={() => setSearchQuery(search)}
                  className="text-sm bg-gray-100 px-4 py-2 rounded-lg hover:bg-gray-200 transition-all duration-300 border border-gray-200 hover:border-gray-300 hover:scale-105 transform"
                  style={{ transitionDelay: `${index * 50}ms` }}
                >
                  {search}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {influencerData && (
        <div 
          className={`bg-white rounded-2xl shadow-xl overflow-hidden transition-all duration-700 transform ${
            isResultVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
          }`}
        >
          {/* Header Section */}
          <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-6 text-white">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-purple-600 font-bold text-3xl shadow-lg animate-fadeIn">
                {influencerData.channel_info.charAt(0).toUpperCase()}
              </div>
              <div className="animate-slideInRight" style={{ animationDelay: "0.2s" }}>
                <h3 className="text-2xl font-bold">{influencerData.channel_info}</h3>
                <div className="flex items-center mt-1 text-purple-100">
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
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="p-6">
            <h4 className="text-lg font-semibold text-gray-700 mb-4 animate-fadeIn" style={{ animationDelay: "0.3s" }}>
              Performance Metrics
            </h4>
            
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {[
                {
                  title: "Followers",
                  value: formatDisplayNumber(influencerData.followers),
                  icon: <User size={18} className="text-blue-500" />,
                  classes: "from-blue-50 to-blue-100 border-blue-200 text-blue-800 text-blue-900"
                },
                {
                  title: "Posts",
                  value: formatDisplayNumber(influencerData.posts),
                  icon: <Image size={18} className="text-green-500" />,
                  classes: "from-green-50 to-green-100 border-green-200 text-green-800 text-green-900"
                },
                {
                  title: "Avg. Likes",
                  value: formatDisplayNumber(influencerData.avg_likes),
                  icon: <Heart size={18} className="text-pink-500" />,
                  classes: "from-pink-50 to-pink-100 border-pink-200 text-pink-800 text-pink-900"
                },
                {
                  title: "Engagement",
                  value: `${calculateEngagementRate(influencerData.avg_likes, influencerData.followers)}%`,
                  icon: <TrendingUp size={18} className="text-amber-500" />,
                  classes: "from-amber-50 to-amber-100 border-amber-200 text-amber-800 text-amber-900"
                }
              ].map((stat, index) => (
                <div
                  key={index}
                  className={`bg-gradient-to-br ${stat.classes} p-5 rounded-xl shadow-sm border transform transition-all duration-500 hover:shadow-md hover:scale-105`}
                  style={{ animationDelay: `${(index + 1) * 100}ms`, opacity: 0, animation: "fadeSlideUp 0.5s forwards", animationDelay: `${0.4 + index * 0.1}s` }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <p className={`${stat.classes.split(' ')[3]} font-medium`}>{stat.title}</p>
                    {stat.icon}
                  </div>
                  <p className={`text-2xl font-bold ${stat.classes.split(' ')[4]}`}>
                    {stat.value}
                  </p>
                </div>
              ))}
            </div>
            
            {/* Additional Stats */}
            <div 
              className="bg-gray-50 p-5 rounded-xl mb-6 transform transition-all duration-500 hover:shadow-md"
              style={{ opacity: 0, animation: "fadeSlideUp 0.5s forwards", animationDelay: "0.8s" }}
            >
              <h4 className="text-lg font-semibold text-gray-700 mb-4">Additional Insights</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="transform transition-all duration-500 hover:translate-x-1">
                  <p className="text-sm text-gray-500">Total Likes</p>
                  <p className="text-xl font-bold text-gray-800">{formatDisplayNumber(influencerData.total_likes)}</p>
                </div>
                <div className="transform transition-all duration-500 hover:translate-x-1">
                  <p className="text-sm text-gray-500">Avg. Comments</p>
                  <p className="text-xl font-bold text-gray-800">{formatDisplayNumber(influencerData.avg_likes ? parseInt(formatNumber(influencerData.avg_likes)) / 20 : 0)}</p>
                </div>
              </div>
            </div>

            {/* Call to action */}
            <div 
              className="flex justify-center"
              style={{ opacity: 0, animation: "fadeSlideUp 0.5s forwards", animationDelay: "0.9s" }}
            >
              <button className="bg-purple-600 text-white px-6 py-3 rounded-xl hover:bg-purple-700 transition-all duration-300 font-medium shadow-md flex items-center gap-2 hover:gap-3 hover:px-7 transform hover:scale-105">
                View Detailed Analytics
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m9 18 6-6-6-6"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        @keyframes fadeSlideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slideInRight {
          from { 
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.5s forwards;
        }
        
        .animate-slideInRight {
          animation: slideInRight 0.5s forwards;
        }
      `}</style>
    </div>
  );
};

export default Search;
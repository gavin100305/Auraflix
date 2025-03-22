import React, { useState, useEffect } from "react";

const Search = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [influencerData, setInfluencerData] = useState(null);
  const [error, setError] = useState("");
  const [recentSearches, setRecentSearches] = useState([]);

  useEffect(() => {
    const savedSearches = localStorage.getItem("recentSearches");
    if (savedSearches) {
      setRecentSearches(JSON.parse(savedSearches));
    }
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      setError("Please enter a username");
      return;
    }

    setIsLoading(true);
    setError("");

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

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h2 className="text-2xl font-semibold text-center mb-6">
        Find Influencer Analytics 📊
      </h2>

      <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2">
        <input
          type="text"
          placeholder="Search influencer..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-grow p-3 border rounded-lg focus:ring-2 focus:ring-purple-500"
        />
        <button
          type="submit"
          disabled={isLoading}
          className="bg-purple-500 text-white px-6 py-2 rounded-lg hover:bg-purple-600 transition disabled:opacity-50"
        >
          {isLoading ? "Searching..." : "Search"}
        </button>
      </form>

      {error && <p className="text-red-600 mt-4">{error}</p>}

      {recentSearches.length > 0 && (
        <div className="mt-4">
          <p className="text-sm text-gray-500">Recent searches:</p>
          <div className="flex gap-2 mt-2">
            {recentSearches.map((search, index) => (
              <button
                key={index}
                onClick={() => setSearchQuery(search)}
                className="text-sm bg-gray-200 px-3 py-1 rounded-lg hover:bg-gray-300"
              >
                {search}
              </button>
            ))}
          </div>
        </div>
      )}

      {influencerData && (
        <div className="mt-6 bg-white p-6 rounded-xl shadow-lg">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600 flex items-center justify-center text-white font-bold text-2xl rounded-full">
              {influencerData.channel_info.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 className="text-xl font-semibold">{influencerData.channel_info}</h3>
              <p className="text-gray-500">{influencerData.country}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-6">
            <div className="bg-gray-100 p-4 rounded-lg text-center">
              <p className="text-sm text-gray-500">Followers</p>
              <p className="text-xl font-bold">{influencerData.followers}</p>
            </div>
            <div className="bg-gray-100 p-4 rounded-lg text-center">
              <p className="text-sm text-gray-500">Posts</p>
              <p className="text-xl font-bold">{influencerData.posts}</p>
            </div>
            <div className="bg-gray-100 p-4 rounded-lg text-center">
              <p className="text-sm text-gray-500">Avg. Likes</p>
              <p className="text-xl font-bold">{influencerData.avg_likes}</p>
            </div>
            <div className="bg-gray-100 p-4 rounded-lg text-center">
              <p className="text-sm text-gray-500">Total Likes</p>
              <p className="text-xl font-bold">{influencerData.total_likes}</p>
            </div>
            <div className="bg-gray-100 p-4 rounded-lg text-center">
              <p className="text-sm text-gray-500">Engagement Rate</p>
              <p className="text-xl font-bold">
                {calculateEngagementRate(influencerData.avg_likes, influencerData.followers)}%
              </p>
            </div>
          </div>

          <div className="mt-6 flex justify-center">
            <button className="bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 transition">
              View Detailed Report
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Search;

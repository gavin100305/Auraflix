import React from "react";
import { useState, useEffect } from "react";

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
      setError("Please enter an Instagram username");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("http://127.0.0.1:8000/data/rank/");
      const data = await response.json();

      // Find the influencer whose name matches the search query
      const matchedInfluencer = data.find(
        (item) => item.Tiktoker.toLowerCase() === searchQuery.toLowerCase()
      );

      if (matchedInfluencer) {
        setInfluencerData(matchedInfluencer);
        saveSearch(searchQuery);
      } else {
        setError("No Instagram profile found with that username");
        setInfluencerData(null);
      }
    } catch (err) {
      setError("Failed to fetch data. Please try again later.");
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

  return (
    <>
      <div className="bg-white rounded-xl shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Find Instagram Analytics</h2>
        <form
          onSubmit={handleSearch}
          className="flex flex-col sm:flex-row gap-2"
        >
          <div className="relative flex-grow">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                  clipRule="evenodd"
                />
              </svg>
            </span>
            <input
              type="text"
              placeholder="Search by username..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="bg-gradient-to-r from-purple-500 to-pink-500 text-white py-2 px-6 rounded-lg hover:opacity-90 transition-all duration-200 disabled:opacity-70"
          >
            {isLoading ? "Searching..." : "Search"}
          </button>
        </form>

        {error && (
          <div className="mt-4 p-3 bg-red-50 text-red-600 rounded-lg">
            {error}
          </div>
        )}

        {/* Recent Searches */}
        {recentSearches.length > 0 && (
          <div className="mt-4">
            <p className="text-sm text-gray-500 mb-2">Recent searches:</p>
            <div className="flex flex-wrap gap-2">
              {recentSearches.map((search, index) => (
                <button
                  key={index}
                  onClick={() => setSearchQuery(search)}
                  className="text-sm bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded-full transition-colors"
                >
                  {search}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {influencerData && (
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          {/* Profile Header */}
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center">
              <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600 p-0.5">
                <div className="w-full h-full rounded-full bg-white flex items-center justify-center overflow-hidden">
                  <span className="text-2xl">
                    {influencerData.Tiktoker?.charAt(0).toUpperCase() || "?"}
                  </span>
                </div>
              </div>
              <div className="ml-6">
                <h2 className="text-xl font-bold">
                  {influencerData.Tiktoker || influencerData["influencer name"]}
                </h2>
                <div className="flex mt-1 space-x-4 text-sm">
                  <span className="font-semibold">
                    {Number(
                      influencerData["Subscribers count"]
                    ).toLocaleString()}{" "}
                    followers
                  </span>
                  <span className="font-semibold">0 following</span>
                  <span className="font-semibold">
                    {influencerData["Posts count"] || "N/A"} posts
                  </span>
                </div>
                <p className="mt-2 text-sm text-gray-600">
                  Engagement rate: {calculateEngagementRate(influencerData)}%
                </p>
              </div>
            </div>
          </div>

          {/* Stats Overview */}
          <div className="p-6 grid grid-cols-2 md:grid-cols-3 gap-6">
            <div className="rounded-lg bg-gradient-to-r from-pink-50 to-red-50 p-4">
              <h3 className="text-sm text-gray-500 mb-1">Avg. Likes</h3>
              <p className="text-2xl font-bold">
                {formatNumber(influencerData["Likes avg"])}
              </p>
              <div className="flex items-center mt-2 text-pink-600">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="ml-1 text-sm">per post</span>
              </div>
            </div>

            <div className="rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 p-4">
              <h3 className="text-sm text-gray-500 mb-1">Avg. Comments</h3>
              <p className="text-2xl font-bold">
                {formatNumber(influencerData["Comments avg."])}
              </p>
              <div className="flex items-center mt-2 text-indigo-600">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="ml-1 text-sm">per post</span>
              </div>
            </div>

            <div className="rounded-lg bg-gradient-to-r from-green-50 to-teal-50 p-4">
              <h3 className="text-sm text-gray-500 mb-1">Avg. Views</h3>
              <p className="text-2xl font-bold">
                {formatNumber(influencerData["Views avg."])}
              </p>
              <div className="flex items-center mt-2 text-teal-600">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                  <path
                    fillRule="evenodd"
                    d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="ml-1 text-sm">per post</span>
              </div>
            </div>

            <div className="rounded-lg bg-gradient-to-r from-orange-50 to-amber-50 p-4">
              <h3 className="text-sm text-gray-500 mb-1">Avg. Shares</h3>
              <p className="text-2xl font-bold">
                {formatNumber(influencerData["Shares avg"])}
              </p>
              <div className="flex items-center mt-2 text-amber-600">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
                </svg>
                <span className="ml-1 text-sm">per post</span>
              </div>
            </div>

            <div className="rounded-lg bg-gradient-to-r from-purple-50 to-fuchsia-50 p-4 col-span-2 md:col-span-1">
              <h3 className="text-sm text-gray-500 mb-1">Total Followers</h3>
              <p className="text-2xl font-bold">
                {formatNumber(influencerData["Subscribers count"])}
              </p>
              <div className="flex items-center mt-2 text-purple-600">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                </svg>
                <span className="ml-1 text-sm">subscribers</span>
              </div>
            </div>
          </div>

          {/* Engagement Chart Placeholder */}
          <div className="p-6 border-t border-gray-100">
            <h3 className="font-semibold mb-4">Engagement Over Time</h3>
            <div className="h-64 w-full bg-gray-50 rounded-lg flex items-center justify-center">
              <p className="text-gray-400">
                Chart visualization would appear here
              </p>
            </div>
            <div className="mt-4 flex justify-center">
              <button className="bg-blue-50 text-blue-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors">
                Generate Detailed Report
              </button>
            </div>
          </div>
        </div>
      )}

      {!influencerData && !isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          <div className="bg-white p-6 rounded-xl shadow-md">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-purple-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">
              Comprehensive Analytics
            </h3>
            <p className="text-gray-600">
              Track engagement metrics, follower growth, and content performance
              all in one place.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md">
            <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-pink-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">Audience Insights</h3>
            <p className="text-gray-600">
              Understand your audience demographics and discover when they're
              most active.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-blue-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">Content Strategy</h3>
            <p className="text-gray-600">
              Get recommendations for optimal posting times and content themes
              based on performance data.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-green-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">Competitor Analysis</h3>
            <p className="text-gray-600">
              Compare your performance with similar accounts to identify
              opportunities for growth.
            </p>
          </div>
        </div>
      )}
    </>
  );
};

export default Search;

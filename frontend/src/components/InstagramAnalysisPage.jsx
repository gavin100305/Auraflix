import React, { useState } from "react";

const InstagramAnalysisPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [tiktokerData, setTiktokerData] = useState(null);
  const [error, setError] = useState("");

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      setError("Please enter a TikToker username.");
      return;
    }

    try {
      const response = await fetch("http://127.0.0.1:8000/data/indexumber");
      const data = await response.json();

      // Find the TikToker whose name matches the search query
      const matchedTiktoker = data.find(
        (item) => item.Tiktoker.toLowerCase() === searchQuery.toLowerCase()
      );

      if (matchedTiktoker) {
        setTiktokerData(matchedTiktoker);
        setError("");
      } else {
        setError("No TikToker found with that username.");
        setTiktokerData(null);
      }
    } catch (err) {
      setError("Failed to fetch data. Please try again later.");
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white relative overflow-hidden">
      {/* Moving Particles Animation */}
      {[...Array(20)].map((_, i) => (
        <div
          key={i}
          className="particle w-2 h-2 bg-pink-500 rounded-full absolute opacity-50"
          data-speed={Math.random() * 10 + 5}
          style={{
            top: `${Math.random() * 100}vh`,
            left: `${Math.random() * 100}vw`,
          }}
        ></div>
      ))}

      {/* Transparent Navbar */}
      <nav className="bg-transparent p-6 fixed w-full top-0 z-50">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold text-white">Instagram Analysis</h1>
          <ul className="flex space-x-6">
            <li>
              <a href="#" className="text-white hover:text-pink-500 transition-all">
                Home
              </a>
            </li>
            <li>
              <a href="#" className="text-white hover:text-pink-500 transition-all">
                Features
              </a>
            </li>
            <li>
              <a href="#" className="text-white hover:text-pink-500 transition-all">
                About
              </a>
            </li>
          </ul>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex flex-col items-center justify-center min-h-screen relative z-10 pt-24">
        <h1 className="text-5xl font-bold text-white mb-8 animate-fade-in">
          Instagram Analysis
        </h1>
        <form
          onSubmit={handleSearch}
          className="flex items-center bg-gray-800 bg-opacity-50 backdrop-blur-md rounded-full p-2 shadow-lg animate-fade-in-up"
        >
          <input
            type="text"
            placeholder="Search for a TikToker..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-96 px-6 py-3 bg-transparent text-white placeholder-gray-400 focus:outline-none"
          />
          <button
            type="submit"
            className="bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full px-6 py-3 hover:opacity-80 transition-all duration-300"
          >
            Search
          </button>
        </form>

        {/* Display Error Message */}
        {error && <p className="text-pink-500 mt-4">{error}</p>}

        {/* Display TikToker Data */}
        {tiktokerData && (
          <div className="mt-8 bg-gray-800 bg-opacity-50 backdrop-blur-md rounded-xl p-8 w-full max-w-2xl">
            <h2 className="text-3xl font-bold text-white mb-4">
              {tiktokerData["influencer name"]}
            </h2>
            <div className="grid grid-cols-2 gap-4 text-gray-300">
              <div>
                <p className="font-semibold">Subscribers Count:</p>
                <p>{tiktokerData["Subscribers count"]}</p>
              </div>
              <div>
                <p className="font-semibold">Average Views:</p>
                <p>{tiktokerData["Views avg."]}</p>
              </div>
              <div>
                <p className="font-semibold">Average Likes:</p>
                <p>{tiktokerData["Likes avg"]}</p>
              </div>
              <div>
                <p className="font-semibold">Average Comments:</p>
                <p>{tiktokerData["Comments avg."]}</p>
              </div>
              <div>
                <p className="font-semibold">Average Shares:</p>
                <p>{tiktokerData["Shares avg"]}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="text-center text-gray-400 py-6 bg-gray-800 bg-opacity-50 backdrop-blur-md">
        <p>© 2023 Instagram Analysis. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default InstagramAnalysisPage;
import React, { useEffect, useState } from "react";

const InfluencerSuggestions = () => {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    try {
      const storedSuggestions = JSON.parse(localStorage.getItem("suggestedInfluencers"));
      const businessUser = JSON.parse(localStorage.getItem("user"));
      console.log("Business User:", businessUser);

      if (storedSuggestions && storedSuggestions.length > 0) {
        const parsedSuggestions = storedSuggestions.map((sugg) => {
          const names = sugg.name.split("\n");
          const usernames = sugg.username.split("\n");
          const profileUrls = sugg.profile_url.split("\n");

          const influencerList = names.map((name, index) => ({
            name: name.trim(),
            username: usernames[index]?.trim() || "",
            profileUrl: `https://www.instagram.com/${usernames[index]?.trim()}`,
            category: sugg.category,
          }));

          return influencerList;
        });

        const flatSuggestions = parsedSuggestions.flat();
        setSuggestions(flatSuggestions);
      } else {
        setError("No suggestions found.");
      }
    } catch (err) {
      console.error("Error parsing suggestions:", err);
      setError("Failed to load suggestions.");
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <div className="p-6 font-sans bg-gray-100 min-h-screen">
      <h2 className="text-3xl font-bold mb-4 text-gray-800">Suggested Influencers for Your Business</h2>

      {loading && <p className="text-blue-600">Loading suggestions...</p>}
      {error && <p className="text-red-600">{error}</p>}

      {!loading && suggestions.length > 0 && (
        <div className="mt-6">
          <h3 className="text-xl font-semibold mb-2 text-gray-700">Suggestions:</h3>
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {suggestions.map((inf, index) => (
              <li
                key={index}
                className="bg-white shadow-md rounded-xl p-4 hover:shadow-lg transition-shadow border border-gray-200"
              >
                <h4 className="text-lg font-semibold text-gray-900 mb-1">{inf.name}</h4>
                <p className="text-gray-700 mb-1">@{inf.username}</p>
                <p className="text-sm text-gray-600 mb-2">Category: {inf.category}</p>
                <a
                  href={inf.profileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  View Instagram Profile
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default InfluencerSuggestions;

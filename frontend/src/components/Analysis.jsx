import React, { useEffect, useState } from "react";

const InfluencerSuggestions = () => {
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const stored = localStorage.getItem("suggestedInfluencers");
        if (!stored) {
          setError("No suggestions found in localStorage.");
          setLoading(false);
          return;
        }

        const parsedSuggestions = JSON.parse(stored);
        const usernames = parsedSuggestions.flatMap((sugg) =>
          sugg.username.split("\n").map((uname) => uname.trim().toLowerCase())
        );

        const response = await fetch("http://127.0.0.1:8000/users");
        if (!response.ok) {
          throw new Error("Failed to fetch user data from server.");
        }

        const data = await response.json();
        const allUsers = data.users;

        const filtered = allUsers.filter((user) =>
          usernames.includes(user.channel_info.toLowerCase())
        );

        setFilteredUsers(filtered);
      } catch (err) {
        console.error(err);
        setError(err.message || "Something went wrong.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="p-6 font-sans bg-gray-100 min-h-screen">
      <h2 className="text-3xl font-bold mb-4 text-gray-800">
        Suggested Influencers Matching Platform Data
      </h2>

      {loading && <p className="text-blue-600">Loading suggestions...</p>}
      {error && <p className="text-red-600">{error}</p>}

      {!loading && filteredUsers.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredUsers.map((user, index) => (
            <div
              key={index}
              className="bg-white border border-gray-200 shadow-md rounded-xl p-4 hover:shadow-lg transition-shadow"
            >
              <h4 className="text-xl font-semibold text-gray-900 mb-2">
                @{user.channel_info}
              </h4>
              <ul className="text-gray-700 space-y-1 text-sm">
                <li><span className="font-medium">Rank:</span> {user.rank}</li>
                <li><span className="font-medium">Influence Score:</span> {user.influence_score}</li>
                <li><span className="font-medium">Posts:</span> {user.posts}</li>
                <li><span className="font-medium">Followers:</span> {user.followers}</li>
                <li><span className="font-medium">Avg Likes:</span> {user.avg_likes}</li>
                <li><span className="font-medium">Avg Engagement:</span> {user.avg_engagement}</li>
                <li><span className="font-medium">New Post Avg Like:</span> {user.new_post_avg_like}</li>
                <li><span className="font-medium">Total Likes:</span> {user.total_likes}</li>
                <li><span className="font-medium">Country:</span> {user.country || "N/A"}</li>
                <li><span className="font-medium">Credibility Score:</span> {user.credibility_score}</li>
                <li><span className="font-medium">Longevity Score:</span> {user.longevity_score}</li>
                <li><span className="font-medium">Engagement Quality Score:</span> {user.engagement_quality_score}</li>
                <li><span className="font-medium">InfluenceIQ Score:</span> {user.influenceiq_score}</li>
              </ul>
              <a
                href={`https://www.instagram.com/${user.channel_info}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline mt-2 block text-sm font-medium"
              >
                View Profile
              </a>
            </div>
          ))}
        </div>
      )}

      {!loading && filteredUsers.length === 0 && !error && (
        <p className="text-gray-700 mt-4">No matching influencers found in platform data.</p>
      )}
    </div>
  );
};

export default InfluencerSuggestions;

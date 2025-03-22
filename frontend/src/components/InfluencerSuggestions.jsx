import React, { useEffect, useState } from "react";

const InfluencerSuggestions = () => {
  const [suggestions, setSuggestions] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchSuggestions = async () => {
      try {
        const response = await fetch("http://127.0.0.1:8000/receive-business");  // Assumed endpoint
        if (!response.ok) {
          throw new Error("Failed to fetch suggestions");
        }

        const data = await response.json();
        setSuggestions(data.suggested_influencers);
      } catch (err) {
        console.error(err);
        setError("Error fetching influencer suggestions.");
      } finally {
        setLoading(false);
      }
    };

    fetchSuggestions();
  }, []);

  return (
    <div style={{ padding: "20px", fontFamily: "Arial" }}>
      <h2>Suggested Influencers for Your Business</h2>

      {loading && <p>Loading suggestions...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {suggestions && (
        <div style={{ marginTop: "20px" }}>
          <h3>Suggestions:</h3>
          <pre>{suggestions}</pre>
        </div>
      )}
    </div>
  );
};

export default InfluencerSuggestions;

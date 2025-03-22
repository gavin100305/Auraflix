import React, { useState, useEffect } from "react";
import axios from "axios";

const Analysis = () => {
  const [influencers, setInfluencers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSuggestedInfluencers = async () => {
      try {
        console.log("Starting to fetch influencers...");
        const cachedInfluencers = localStorage.getItem("suggestedInfluencers");
        console.log("Raw cached influencers:", cachedInfluencers);

        if (cachedInfluencers && cachedInfluencers !== "[]") {
          // Parse the data properly
          let parsedInfluencers = [];

          try {
            // Try parsing as JSON first
            const parsed = JSON.parse(cachedInfluencers);
            console.log("Parsed from localStorage:", parsed);

            // Handle different possible formats
            if (Array.isArray(parsed)) {
              if (parsed.length > 0) {
                if (typeof parsed[0] === "object") {
                  // It's already an array of objects, extract names
                  parsedInfluencers = parsed.map(
                    (item) => item.name || item.username || "Unknown"
                  );
                } else if (typeof parsed[0] === "string") {
                  // Check if it might be a single string with all names
                  if (parsed.length === 1 && parsed[0].includes("\\n")) {
                    // Split by newlines
                    parsedInfluencers = parsed[0]
                      .split("\\n")
                      .map((name) => name.trim())
                      .filter((name) => name);
                  } else {
                    // It's already an array of strings
                    parsedInfluencers = parsed;
                  }
                }
              }
            } else if (
              typeof parsed === "object" &&
              parsed.suggestedInfluencers
            ) {
              // Extract names from nested object
              const nestedArray = parsed.suggestedInfluencers;
              if (Array.isArray(nestedArray)) {
                parsedInfluencers = nestedArray.map((item) =>
                  typeof item === "object"
                    ? item.name || item.username || "Unknown"
                    : item
                );
              } else if (typeof nestedArray === "string") {
                // It might be a single string with all names
                parsedInfluencers = nestedArray
                  .split("\\n")
                  .map((name) => name.trim())
                  .filter((name) => name);
              }
            } else if (typeof parsed === "string") {
              // It's a direct string with newlines
              parsedInfluencers = parsed
                .split("\\n")
                .map((name) => name.trim())
                .filter((name) => name);
            }
          } catch (parseError) {
            console.error("Parse error:", parseError);
            // If JSON parsing fails, try to handle as a string with newlines
            if (typeof cachedInfluencers === "string") {
              // Remove JSON formatting characters and split
              parsedInfluencers = cachedInfluencers
                .replace(/^"/, "") // Remove starting quote
                .replace(/"$/, "") // Remove ending quote
                .replace(/^\[/, "") // Remove starting bracket
                .replace(/\]$/, "") // Remove ending bracket
                .replace(/\\"/g, "") // Remove escaped quotes
                .replace(/"/g, "") // Remove any remaining quotes
                .split("\\n") // Split by newlines
                .map((name) => name.trim())
                .filter((name) => name.length > 0); // Remove empty entries
            }
          }

          console.log("Final parsed influencers:", parsedInfluencers);

          if (
            Array.isArray(parsedInfluencers) &&
            parsedInfluencers.length > 0
          ) {
            setInfluencers(parsedInfluencers);
            setLoading(false);
            return;
          }
        }

        // If not in localStorage or parsing failed, fetch from server
        const token = localStorage.getItem("authToken");
        if (!token) {
          throw new Error("Authentication token not found");
        }

        const response = await axios.get(
          "http://localhost:8080/api/auth/suggestions",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        console.log("API response:", response.data);

        // Extract just the names from the response
        let names = [];
        if (response.data) {
          const suggestedData =
            response.data.suggestedInfluencers || response.data;
          console.log("Raw suggestedData:", suggestedData);

          if (Array.isArray(suggestedData)) {
            if (
              suggestedData.length === 1 &&
              typeof suggestedData[0] === "string" &&
              suggestedData[0].includes("\\n")
            ) {
              // It's an array with a single string containing all names
              names = suggestedData[0]
                .split("\\n")
                .map((name) => name.trim())
                .filter((name) => name);
            } else {
              names = suggestedData.map((item) =>
                typeof item === "object"
                  ? item.name || item.username || "Unknown"
                  : item
              );
            }
          } else if (typeof suggestedData === "string") {
            // Handle a direct string with newlines or just a single name
            names = suggestedData.includes("\\n")
              ? suggestedData
                  .split("\\n")
                  .map((name) => name.trim())
                  .filter((name) => name)
              : [suggestedData];
          }
        }

        console.log("Final names array:", names);
        setInfluencers(names);
        localStorage.setItem("suggestedInfluencers", JSON.stringify(names));
      } catch (err) {
        console.error("Error fetching influencers:", err);
        setError("Failed to load suggested influencers. " + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSuggestedInfluencers();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  if (!influencers || influencers.length === 0) {
    return <div>No suggested influencers available.</div>;
  }

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">Suggested Influencers</h2>
      <ul className="list-disc pl-5">
        {influencers.flatMap((name, index) => {
          // Handle both space-separated and individual names
          const parts = name.includes(" ")
            ? name.split(" ").filter((part) => part.trim())
            : [name];

          return parts.map((part, subIndex) => (
            <li key={`${index}-${subIndex}`} className="mb-2">
              {part}
            </li>
          ));
        })}
      </ul>
    </div>
  );
};

export default Analysis;

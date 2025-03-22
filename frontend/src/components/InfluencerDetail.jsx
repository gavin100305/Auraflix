import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import TrendGraph from "./TrendGraph";

// Assuming these components are available or will be created
import Spotlight from "../components/Spotlight";
import Header from "../components/Header";
import RomFooter from "../components/RomFooter";
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';
import L from 'leaflet';
import InfluencerWorldMap from "./InfluencerWorldMap";

const InfluencerDetail = () => {
  const { username } = useParams();
  const [influencer, setInfluencer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [summary, setSummary] = useState("");
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState(null); // State for Wikipedia image URL
  const [isResultVisible, setIsResultVisible] = useState(false); // Added missing state
  // Add these new state variables at the beginning of your component
  const [countryFlag, setCountryFlag] = useState("🌍"); // Default globe as fallback
  const [countriesData, setCountriesData] = useState(null);

  // Add this useEffect to fetch all countries data when component mounts
  useEffect(() => {
    fetchAllCountries();
  }, []);

  // Add this useEffect to set the flag when influencer or countries data changes
  useEffect(() => {
    if (influencer?.country && countriesData) {
      setFlagForCountry(influencer.country);
    }
  }, [influencer, countriesData]);

  // Function to fetch all countries data
  const fetchAllCountries = async () => {
    try {
      const response = await fetch("https://restcountries.com/v3.1/all?fields=name,cca2,flags");
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data = await response.json();
      setCountriesData(data);
    } catch (error) {
      console.error("Error fetching countries data:", error);
    }
  };

  // Function to find and set the flag for a given country name
  const setFlagForCountry = (countryName) => {
    // Default to globe emoji
    let flag = "🌍";
    
    // Try to find the country in our data
    const country = countriesData.find(
      c => 
        c.name.common.toLowerCase() === countryName.toLowerCase() ||
        c.name.official.toLowerCase() === countryName.toLowerCase()
    );
    
    if (country) {
      // Use emoji flag if available, otherwise use the SVG flag URL
      flag = country.flags.svg || country.flags.png || "🌍";
    }
    
    setCountryFlag(flag);
  };
  // Fetch Wikipedia image when influencer changes
  useEffect(() => {
    if (influencer) {
      fetchWikipediaImage(influencer.channel_info);
      setTimeout(() => {
        setIsResultVisible(true);
      }, 100);
    } else {
      setIsResultVisible(false);
    }
  }, [influencer]);
  
  // Function to fetch Wikipedia image
  const fetchWikipediaImage = async (searchTerm) => {
    try {
      // Step 1: Fetch the Wikipedia page ID for the search term
      const searchResponse = await fetch(
        `https://en.wikipedia.org/w/api.php?action=query&format=json&list=search&srsearch=${searchTerm}&origin=*`
      );
      const searchData = await searchResponse.json();

      if (searchData.query.search.length > 0) {
        const pageId = searchData.query.search[0].pageid;

        // Step 2: Fetch the image URL for the page
        const imageResponse = await fetch(
          `https://en.wikipedia.org/w/api.php?action=query&format=json&prop=pageimages&pageids=${pageId}&pithumbsize=200&origin=*`
        );
        const imageData = await imageResponse.json();

        const thumbnail = imageData.query.pages[pageId].thumbnail;
        if (thumbnail) {
          setImageUrl(thumbnail.source); // Set the image URL
        } else {
          setImageUrl(null); // Reset if no image is found
        }
      }
    } catch (error) {
      console.error("Error fetching Wikipedia image:", error);
    }
  };
  const [geoData, setGeoData] = useState(null);


  useEffect(() => {
    const fetchInfluencerDetail = async () => {
      try {
        setLoading(true);
        // Fetch all influencers and find the matching one
        const response = await fetch("http://127.0.0.1:8000/data");

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        const foundInfluencer = data.find(
          (inf) => getUsername(inf.channel_info) === username
        );

        if (!foundInfluencer) {
          throw new Error("Influencer not found");
        }

        setInfluencer(foundInfluencer);
        setLoading(false);

        // After loading influencer data, get AI summary
        generateSummary(foundInfluencer);
      } catch (err) {
        setError(`Failed to fetch influencer data: ${err.message}`);
        setLoading(false);
      }
    };

    fetchInfluencerDetail();
  }, [username]);

  const generateSummary = async (influencerData) => {
    try {
      setSummaryLoading(true);

      // Backend endpoint for summary generation
      const response = await fetch("http://127.0.0.1:8000/generate-summary", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          influencer: influencerData,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      setSummary(data.summary);
    } catch (err) {
      console.error("Error generating summary:", err);
      setSummary("Unable to generate influencer summary at this time.");
    } finally {
      setSummaryLoading(false);
    }
  };

  // Helper function to extract username from channel info
  const getUsername = (channelInfo) => {
    if (!channelInfo) return "unknown";
    return channelInfo.startsWith("@") ? channelInfo.substring(1) : channelInfo;
  };

  // Animation variants
  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5 }
    },
    hover: { 
      y: -5,
      boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)",
      transition: { duration: 0.2 }
    }
  };

  const contentVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { 
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -5 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { duration: 0.3 }
    }
  };

  const progressVariants = {
    hidden: { width: "0%" },
    visible: (width) => ({
      width: `${width}%`,
      transition: { duration: 0.8, ease: "easeOut" }
    })
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <motion.div
          className="h-16 w-16 border-t-4 border-white rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
        />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white p-8">
        <div className="bg-black/60 border border-neutral-800 text-red-400 px-8 py-6 rounded-lg max-w-lg text-center">
          <h2 className="text-xl font-bold mb-4">Error</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!influencer) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white">
        <h2 className="text-2xl font-bold mb-4">Influencer not found</h2>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-black text-white">
      <Header />

      <div className="relative flex-1 flex overflow-hidden bg-black/[0.96] antialiased">
        {/* Grid background */}
        <div
          className="pointer-events-none absolute inset-0 select-none opacity-80"
          style={{
            backgroundImage:
              "linear-gradient(to right, #171717 1px, transparent 1px), linear-gradient(to bottom, #171717 1px, transparent 1px)",
            backgroundSize: "35px 35px",
          }}
        />

        <Spotlight
          className="-top-40 left-0 md:-top-20 md:left-60"
          fill="white"
        />

        <div className="relative z-10 w-full mx-auto px-6 py-12 md:py-24">
          {/* Influencer header */}
          <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mb-12"
            >
              <div className="flex items-center gap-6">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  whileHover={{ scale: 1.05 }}
                  transition={{ delay: 0.3, type: "spring" }}
                  className="w-24 h-24 md:w-28 md:h-28 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center text-white font-bold text-3xl overflow-hidden flex-shrink-0 border border-neutral-800/50"
                >
                  {imageUrl ? (
                    <img
                      src={imageUrl}
                      alt={influencer.channel_info}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    influencer.channel_info.charAt(0).toUpperCase()
                  )}
                </motion.div>

                <div className="flex flex-col">
                  <a 
                    href={`https://www.instagram.com/${influencer.channel_info.replace('@', '')}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="group"
                  >
                    <motion.h1 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.4 }}
                      className="bg-gradient-to-b from-neutral-50 to-neutral-400 bg-clip-text text-3xl md:text-5xl font-bold text-transparent leading-tight transition-all duration-300 group-hover:from-blue-300 group-hover:to-purple-400"
                    >
                      @{influencer.channel_info}
                    </motion.h1>
                  </a>
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.5 }}
                    className="flex items-center mt-3 gap-3"
                  >
                    <motion.span 
                      whileHover={{ scale: 1.05 }}
                      className="bg-neutral-800 text-neutral-300 px-3 py-1 rounded-full text-sm font-medium"
                    >
                      Rank #{influencer.rank}
                    </motion.span>
                    {influencer.country && (
                      <motion.span 
                        whileHover={{ scale: 1.05 }}
                        className="text-neutral-400 flex items-center"
                      >
                        {countryFlag.startsWith('http') ? (
                          <img 
                            src={countryFlag} 
                            alt={`${influencer.country} flag`} 
                            className="w-5 h-3 mr-1.5 object-cover" 
                          />
                        ) : (
                          <span className="mr-1.5">{countryFlag}</span>
                        )}
                        {influencer.country}
                      </motion.span>
                    )}
                  </motion.div>
                </div>
              </div>
            </motion.div>

          {/* Main content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Stats */}
            <div className="lg:col-span-1">
              <motion.div
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                whileHover="hover"
                transition={{ duration: 0.5, delay: 0.2 }}
                className="bg-neutral-900/50 rounded-xl border border-neutral-800 overflow-hidden backdrop-blur-sm mb-8"
              >
                <div className="px-6 py-4 border-b border-neutral-800">
                  <h2 className="text-xl font-bold text-white">
                    Influence Metrics
                  </h2>
                </div>
                <motion.div 
                  variants={contentVariants}
                  initial="hidden"
                  animate="visible"
                  className="px-6 py-4 space-y-4"
                >
                  <motion.div variants={itemVariants}>
                    <div className="text-neutral-400 text-sm">Followers</div>
                    <div className="text-white text-xl font-bold">
                      {influencer.followers}
                    </div>
                  </motion.div>
                  <motion.div variants={itemVariants}>
                    <div className="text-neutral-400 text-sm">Posts</div>
                    <div className="text-white text-xl font-bold">
                      {influencer.posts}
                    </div>
                  </motion.div>
                  <motion.div variants={itemVariants}>
                    <div className="text-neutral-400 text-sm">Average Likes</div>
                    <div className="text-white text-xl font-bold">
                      {influencer.avg_likes}
                    </div>
                  </motion.div>
                  <motion.div variants={itemVariants}>
                    <div className="text-neutral-400 text-sm">Engagement Rate</div>
                    <div className="text-white text-xl font-bold">
                      {influencer.avg_engagement}
                    </div>
                  </motion.div>
                  <motion.div variants={itemVariants}>
                    <div className="text-neutral-400 text-sm">Total Likes</div>
                    <div className="text-white text-xl font-bold">
                      {influencer.total_likes}
                    </div>
                  </motion.div>
                  <motion.div variants={itemVariants}>
                    <div className="text-neutral-400 text-sm">
                      New Post Average Likes
                    </div>
                    <div className="text-white text-xl font-bold">
                      {influencer.new_post_avg_like}
                    </div>
                  </motion.div>
                </motion.div>
              </motion.div>

              <motion.div
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                whileHover="hover"
                transition={{ duration: 0.5, delay: 0.3 }}
                className="bg-neutral-900/50 rounded-xl border border-neutral-800 overflow-hidden backdrop-blur-sm"
              >
                <div className="px-6 py-4 border-b border-neutral-800">
                  <h2 className="text-xl font-bold text-white">
                    Performance Scores
                  </h2>
                </div>
                <motion.div 
                  variants={contentVariants}
                  initial="hidden"
                  animate="visible"
                  className="px-6 py-4 space-y-4"
                >
                  <motion.div variants={itemVariants}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-neutral-400 text-sm">
                        Influence Score
                      </span>
                      <span className="text-white font-bold">
                        {influencer.influence_score}
                      </span>
                    </div>
                    <div className="w-full bg-neutral-800 rounded-full h-2">
                      <motion.div
                        variants={progressVariants}
                        initial="hidden"
                        animate="visible"
                        custom={influencer.influence_score}
                        className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
                      ></motion.div>
                    </div>
                  </motion.div>
                  <motion.div variants={itemVariants}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-neutral-400 text-sm">
                        Credibility Score
                      </span>
                      <span className="text-white font-bold">
                        {influencer.credibility_score?.toFixed(1) || "N/A"}
                      </span>
                    </div>
                    <div className="w-full bg-neutral-800 rounded-full h-2">
                      <motion.div
                        variants={progressVariants}
                        initial="hidden"
                        animate="visible"
                        custom={influencer.credibility_score}
                        className="bg-gradient-to-r from-green-400 to-emerald-500 h-2 rounded-full"
                      ></motion.div>
                    </div>
                  </motion.div>
                  <motion.div variants={itemVariants}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-neutral-400 text-sm">
                        Longevity Score
                      </span>
                      <span className="text-white font-bold">
                        {influencer.longevity_score?.toFixed(1) || "N/A"}
                      </span>
                    </div>
                    <div className="w-full bg-neutral-800 rounded-full h-2">
                      <motion.div
                        variants={progressVariants}
                        initial="hidden"
                        animate="visible"
                        custom={influencer.longevity_score * 10}
                        className="bg-gradient-to-r from-yellow-500 to-orange-500 h-2 rounded-full"
                      ></motion.div>
                    </div>
                  </motion.div>
                  <motion.div variants={itemVariants}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-neutral-400 text-sm">
                        Engagement Quality Score
                      </span>
                      <span className="text-white font-bold">
                        {(influencer.engagement_quality_score)?.toFixed(1) || "N/A"}%
                      </span>
                    </div>
                    <div className="w-full bg-neutral-800 rounded-full h-2">
                      <motion.div
                        variants={progressVariants}
                        initial="hidden"
                        animate="visible"
                        custom={influencer.engagement_quality_score}
                        className="bg-gradient-to-r from-pink-500 to-rose-500 h-2 rounded-full"
                      ></motion.div>
                    </div>
                  </motion.div>
                  <motion.div variants={itemVariants}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-neutral-400 text-sm">
                        InfluenceIQ Score
                      </span>
                      <span className="text-white font-bold">
                        {influencer.influenceiq_score?.toFixed(1) || "N/A"}
                      </span>
                    </div>
                    <div className="w-full bg-neutral-800 rounded-full h-2">
                      <motion.div
                        variants={progressVariants}
                        initial="hidden"
                        animate="visible"
                        custom={influencer.influenceiq_score}
                        className="bg-gradient-to-r from-cyan-400 to-blue-600 h-2 rounded-full"
                      ></motion.div>
                    </div>
                  </motion.div>
                </motion.div>
              </motion.div>
            </div>

            {/* Right Column - Summary and Graph */}
            <div className="lg:col-span-2">
              <motion.div
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                whileHover="hover"
                transition={{ duration: 0.5, delay: 0.4 }}
                className="bg-neutral-900/50 rounded-xl border border-neutral-800 overflow-hidden backdrop-blur-sm mb-8"
              >
                <div className="px-6 py-4 border-b border-neutral-800 flex items-center">
                  <h2 className="text-xl font-bold text-white">
                    Influencer Summary
                  </h2>
                  {summaryLoading && (
                    <motion.div
                      className="ml-3 h-4 w-4 rounded-full border-2 border-t-transparent border-white"
                      animate={{ rotate: 360 }}
                      transition={{
                        duration: 1,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                    />
                  )}
                </div>
                <div className="px-6 py-6">
                  {summary ? (
                    <motion.p 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.5, delay: 0.3 }}
                      className="text-neutral-300 leading-relaxed"
                    >
                      {summary}
                    </motion.p>
                  ) : summaryLoading ? (
                    <div className="h-32 flex items-center justify-center">
                      <p className="text-neutral-400">Generating summary...</p>
                    </div>
                  ) : (
                    <motion.p 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.5, delay: 0.3 }}
                      className="text-neutral-300 leading-relaxed"
                    >
                      {influencer.channel_info} is an influencer with{" "}
                      {influencer.followers} followers and an engagement rate of{" "}
                      {influencer.avg_engagement}. They have posted{" "}
                      {influencer.posts} and receive an average of{" "}
                      {influencer.avg_likes} likes per post.
                    </motion.p>
                  )}
                </div>
              </motion.div>

              <motion.div
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                whileHover="hover"
                transition={{ duration: 0.5, delay: 0.5 }}
                className="bg-neutral-900/50 rounded-xl border border-neutral-800 overflow-hidden backdrop-blur-sm"
              >
                <div className="px-6 py-4 border-b border-neutral-800">
                  <h2 className="text-xl font-bold text-white">
                    Engagement Trends
                  </h2>
                </div>
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.8, delay: 0.6 }}
                  className="px-6 py-6 h-96"
                >
                  <TrendGraph influencer={influencer} />
                </motion.div>
              </motion.div>
{/* --------------------------------HEAT MAP------------------------------------------------------------- */}
              <div className="h-screen">
              <div className="px-6 py-4 border-b border-gray-800 bg-black">
                <h2 className="text-xl font-bold text-white">
                  WordlWide Popularity And Influence Level
                </h2>
              </div>
              <InfluencerWorldMap influencer={influencer} />
              </div>
            </div>
          </div>
        </div>
      </div>

      <RomFooter />
    </div>
  );
};

export default InfluencerDetail;
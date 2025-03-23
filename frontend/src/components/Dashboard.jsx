import React from "react";
import { Outlet, Link } from "react-router-dom";
import { motion } from "framer-motion";
import Spotlight from "./Spotlight"; // Import the Spotlight component
import CollabSimulator from "./CollabSimulator";

const Dashboard = () => {
  const isLoggedIn = true; // Replace with actual authentication logic

  // Button hover animation
  const buttonHover = {
    rest: { scale: 1 },
    hover: { scale: 1.05 },
  };

  return (
    <div className="min-h-screen flex flex-col bg-black text-white">
      {/* Spotlight */}
      <Spotlight
        className="-top-40 left-0 md:-top-20 md:left-60"
        fill="white"
      />

      {/* Grid Background */}
      <div
        className="pointer-events-none absolute inset-0 select-none opacity-80"
        style={{
          backgroundImage:
            "linear-gradient(to right, #171717 1px, transparent 1px), linear-gradient(to bottom, #171717 1px, transparent 1px)",
          backgroundSize: "35px 35px",
        }}
      />

      {/* Header */}
      <header className="fixed top-0 w-full z-50 py-4">
        <div className="max-w-4xl mx-auto px-4">
          <div className="backdrop-blur-md bg-black/30 border border-white/10 rounded-full py-3 px-6 flex justify-between items-center shadow-lg">
            <Link to="/">
              <motion.h1
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
                className="font-bricolage text-xl font-bold text-white cursor-pointer"
              >
                InfluenceIQ
              </motion.h1>
            </Link>

            <div className="flex items-center space-x-5">
              <Link
                to="/dashboard/leaderboard"
                className="text-white hover:text-purple-400 transition-colors text-sm font-inter"
              >
                Top Influencers
              </Link>
              <Link
                to="/dashboard/suggestions"
                className="text-white hover:text-purple-400 transition-colors text-sm font-inter"
              >
                Suggestions
              </Link>
              <Link
                to="/dashboard/reports"
                className="text-white hover:text-purple-400 transition-colors text-sm font-inter"
              >
                Reports
              </Link>
              <Link
                to="/dashboard/insights"
                className="text-white hover:text-purple-400 transition-colors text-sm font-inter"
              >
                Insights
              </Link>
            </div>
          </div>
        </div>
      </header>

      <CollabSimulator />

      {/* Main Content */}
      <div className="flex-1 p-6 lg:p-8 overflow-y-auto relative z-10 mt-20">
        <Outlet /> {/* This is where nested routes will be rendered */}
      </div>
    </div>
  );
};

export default Dashboard;

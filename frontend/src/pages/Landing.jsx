import React from "react";
import { motion } from "framer-motion";
import Spotlight from "../components/Spotlight";
import Header from "../components/Header";
import RomFooter from "../components/RomFooter";
import Features from "../components/Features";

const Landing = () => {
  return (
    <div className="min-h-screen flex flex-col bg-black text-white">
      <Header />

      <div className="relative flex-1 flex overflow-hidden bg-black/[0.96] antialiased items-center">
        <div
          className="pointer-events-none absolute inset-0 select-none"
          style={{
            backgroundImage:
              "linear-gradient(to right, #171717 1px, transparent 1px), linear-gradient(to bottom, #171717 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />

        <Spotlight
          className="-top-40 left-0 md:-top-20 md:left-60"
          fill="white"
        />

        <div className="relative z-10 max-w-5xl mx-auto px-6 py-20 md:py-32">
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="bg-gradient-to-b from-neutral-50 to-neutral-400 bg-clip-text text-center text-4xl md:text-7xl font-bricolage font-bold text-transparent"
          >
            Discover the Power <br /> of Influencers
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mx-auto mt-6 max-w-2xl text-center text-base md:text-lg font-inter text-neutral-300"
          >
            Search, analyze, and leverage the right influencers for your brand.
            Get comprehensive reports and insights to make data-driven
            decisions.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="mt-10 max-w-2xl mx-auto"
          >
            <div className="relative flex items-center">
              <input
                type="text"
                placeholder="Search for any influencer..."
                className="w-full bg-white/10 border border-white/20 rounded-lg px-5 py-4 text-white font-inter focus:outline-none focus:ring-2 focus:ring-white/30"
              />
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="absolute right-3 bg-white text-black p-2 rounded-md hover:bg-opacity-90 transition-all"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
              </motion.button>
            </div>
          </motion.div>
        </div>
      </div>

      <Features />

      <RomFooter />
    </div>
  );
};

export default Landing;

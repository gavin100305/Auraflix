import React from "react";
import { motion } from "framer-motion";
import Header from "../components/Header";
import RomFooter from "../components/RomFooter";
import InfluencerList from "../components/InfluencerList";

const Influencers = () => {
  return (
    <div className="min-h-screen flex flex-col bg-black text-white">
      <Header />

      <div className="relative flex-1 flex overflow-hidden bg-black/96 antialiased">
        <div
          className="pointer-events-none absolute inset-0 select-none opacity-80"
          style={{
            backgroundImage:
              "linear-gradient(to right, #171717 1px, transparent 1px), linear-gradient(to bottom, #171717 1px, transparent 1px)",
            backgroundSize: "35px 35px",
          }}
        />

        <div className="relative z-10 max-w-5xl mx-auto px-6 py-20 md:py-24 w-full">
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="bg-linear-to-b from-neutral-50 to-neutral-400 bg-clip-text text-center text-4xl md:text-6xl font-bricolage font-bold text-transparent"
          >
            Influencer Directory
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mx-auto mt-6 mb-7 max-w-2xl text-center text-base md:text-lg font-inter text-neutral-300"
          >
            Browse our curated list of top influencers across various niches.
            Filter, sort, and find the perfect match for your brand campaigns.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="mt-16 w-full"
          >
            <InfluencerList />
          </motion.div>
        </div>
      </div>

      <RomFooter />
    </div>
  );
};

export default Influencers;

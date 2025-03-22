import React, { useRef } from "react";
import { motion } from "framer-motion";
import Spotlight from "../components/Spotlight";

const Landing = () => {
  const featuresRef = useRef(null);

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const buttonHover = {
    rest: { scale: 1 },
    hover: { scale: 1.05, transition: { duration: 0.2 } },
  };

  const cardHover = {
    rest: { y: 0 },
    hover: {
      y: -8, // Slightly less movement for subtlety
      transition: {
        type: "spring",
        stiffness: 200, // Higher stiffness for snappier animation
        damping: 30, // Balanced damping for smooth finish
        duration: 0.2,
      },
    },
  };

  return (
    <div className="min-h-screen flex flex-col bg-black text-white">
      {/* Header */}
      <header className="fixed top-0 w-full z-50 py-4">
        <div className="max-w-4xl mx-auto px-4">
          <div className="backdrop-blur-md bg-black/30 border border-white/10 rounded-full py-3 px-6 flex justify-between items-center shadow-lg">
            <motion.h1
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="font-bricolage text-xl font-bold text-white"
            >
              InfluenceIQ
            </motion.h1>
            <motion.button
              initial="rest"
              whileHover="hover"
              variants={buttonHover}
              className="bg-white/90 text-black px-5 py-2 rounded-full font-inter text-sm font-bold hover:bg-white transition-all"
            >
              Get Started
            </motion.button>
          </div>
        </div>
      </header>

      {/* Hero Section with Spotlight */}
      <div className="relative flex-1 flex overflow-hidden bg-black/[0.96] antialiased items-center">
        {/* Grid Background */}
        <div
          className="pointer-events-none absolute inset-0 select-none"
          style={{
            backgroundImage:
              "linear-gradient(to right, #171717 1px, transparent 1px), linear-gradient(to bottom, #171717 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />

        {/* Spotlight Effect using the provided component */}
        <Spotlight
          className="-top-40 left-0 md:-top-20 md:left-60"
          fill="white"
        />

        {/* Hero Content */}
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

          {/* Search Box */}
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

      {/* Features Section */}
      <section className="py-20 bg-black">
        <div className="max-w-5xl mx-auto px-6">
          <motion.h2
            initial={fadeIn.hidden}
            whileInView={fadeIn.visible}
            viewport={{ once: true }}
            className="font-bricolage text-3xl md:text-5xl font-bold text-center mb-16 bg-gradient-to-r from-neutral-100 to-neutral-300 bg-clip-text text-transparent"
          >
            Why Choose InfluenceIQ
          </motion.h2>

          <motion.div
            ref={featuresRef}
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-10"
          >
            {/* Feature 1 */}
            <motion.div
              variants={fadeIn}
              whileHover={cardHover.hover}
              initial={cardHover.rest}
              className="bg-white/5 p-8 rounded-xl border border-white/10 hover:border-white/20 transition-all"
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.1, duration: 0.2 }}
                viewport={{ once: true }}
                className="bg-white/10 w-12 h-12 rounded-lg flex items-center justify-center mb-6"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                </svg>
              </motion.div>
              <h3 className="font-bricolage text-xl font-bold mb-3">
                Comprehensive Reports
              </h3>
              <p className="font-inter text-neutral-300">
                Get detailed analytics and insights about any influencer with
                our in-depth reports.
              </p>
            </motion.div>

            {/* Feature 2 */}
            <motion.div
              variants={fadeIn}
              whileHover={cardHover.hover}
              initial={cardHover.rest}
              className="bg-white/5 p-8 rounded-xl border border-white/10 hover:border-white/20 transition-all"
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.1, duration: 0.2 }}
                viewport={{ once: true }}
                className="bg-white/10 w-12 h-12 rounded-lg flex items-center justify-center mb-6"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="2" y1="12" x2="22" y2="12"></line>
                  <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
                </svg>
              </motion.div>
              <h3 className="font-bricolage text-xl font-bold mb-3">
                Global Database
              </h3>
              <p className="font-inter text-neutral-300">
                Access our extensive database of influencers across all major
                platforms and niches.
              </p>
            </motion.div>

            {/* Feature 3 */}
            <motion.div
              variants={fadeIn}
              whileHover={cardHover.hover}
              initial={cardHover.rest}
              className="bg-white/5 p-8 rounded-xl border border-white/10 hover:border-white/20 transition-all"
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.2 }}
                viewport={{ once: true }}
                className="bg-white/10 w-12 h-12 rounded-lg flex items-center justify-center mb-6"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
                </svg>
              </motion.div>
              <h3 className="font-bricolage text-xl font-bold mb-3">
                Performance Metrics
              </h3>
              <p className="font-inter text-neutral-300">
                Analyze engagement rates, audience demographics, and campaign
                effectiveness.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 border-t border-white/10">
        <div className="max-w-5xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="flex flex-col md:flex-row justify-between items-center"
          >
            <p className="font-inter text-neutral-400 text-sm">
              © {new Date().getFullYear()} InfluenceIQ Limited. All rights
              reserved.
            </p>
            <p className="font-inter text-neutral-400 text-sm mt-2 md:mt-0">
              Created by Team SOS
            </p>
          </motion.div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;

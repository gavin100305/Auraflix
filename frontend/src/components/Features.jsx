import React from "react";
import { useRef } from "react";
import { motion } from "framer-motion";

const Features = () => {
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

  const cardHover = {
    rest: { y: 0 },
    hover: {
      y: -8, 
      transition: {
        type: "spring",
        stiffness: 200, 
        damping: 30, 
        duration: 0.2,
      },
    },
  };

  return (
    <>
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
    </>
  );
};

export default Features;

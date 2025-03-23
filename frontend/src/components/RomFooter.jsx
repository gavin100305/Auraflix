import React from "react";
import { motion } from "framer-motion";

const RomFooter = () => {
  return (
    <footer className="py-10 border-t border-white/10 bg-black text-white z-10 relative">
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
  );
};

export default RomFooter;

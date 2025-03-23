import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const Header = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Check login status - replace this with your actual auth logic
  useEffect(() => {
    const checkLoginStatus = () => {
      const userToken = localStorage.getItem("authToken");
      setIsLoggedIn(!!userToken);
    };
    
    checkLoginStatus();
  }, []);

  const buttonHover = {
    rest: { scale: 1 },
    hover: { scale: 1.05, transition: { duration: 0.2 } },
  };

  return (
    <>
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
            
            <Link to={isLoggedIn ? "/dashboard" : "/auth"}>
              <motion.button
                initial="rest"
                whileHover="hover"
                variants={buttonHover}
                className="bg-white/90 text-black px-5 py-2 rounded-full font-inter text-sm font-bold hover:bg-white transition-all"
              >
                {isLoggedIn ? "Dashboard" : "Get Started"}
              </motion.button>
            </Link>
          </div>
        </div>
      </header>
    </>
  );
};

export default Header;
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const Header = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

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

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    setIsLoggedIn(false);
    navigate("/");
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

            <div className="flex gap-3 justify-between">
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

              {isLoggedIn && (
                <motion.button
                  initial="rest"
                  whileHover="hover"
                  variants={buttonHover}
                  onClick={handleLogout}
                  className="bg-red-500/90 text-white px-5 py-2 rounded-full font-inter text-sm font-bold hover:bg-red-600 transition-all"
                >
                  Logout
                </motion.button>
              )}
            </div>
          </div>
        </div>
      </header>
    </>
  );
};

export default Header;

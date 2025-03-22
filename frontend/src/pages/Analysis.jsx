import React from "react";
import Navbar from "../components/Navbar";
import Search from "../components/Search";
import RomFooter from "../components/RomFooter";

const Analysis = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 font-sans text-gray-900">
      <Navbar />

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Search />
      </div>

      <RomFooter />
    </div>
  );
};

export default Analysis;

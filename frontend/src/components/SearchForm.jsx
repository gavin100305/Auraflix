import { motion } from "framer-motion";
import { Search as SearchIcon } from "lucide-react";
import { useState, useEffect, useRef } from "react";

const SearchForm = ({
  searchQuery,
  handleInputChange,
  handleSearch,
  isLoading,
  users = [],
  setSearchQuery,
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const dropdownRef = useRef(null);
  const justSelectedRef = useRef(false);

useEffect(() => {
  if (justSelectedRef.current) {
    justSelectedRef.current = false; 
    return; 
  }
  if (searchQuery && users?.length > 0) {
    const filtered = users
  .filter(user =>
    user.channel_info &&
    user.channel_info.toLowerCase().includes(searchQuery.toLowerCase())
  )
  .slice(0, 8);


    
    if (JSON.stringify(filtered) !== JSON.stringify(filteredUsers)) {
      setFilteredUsers(filtered);
      setIsDropdownOpen(filtered.length > 0);
    }
  } else if (filteredUsers.length > 0) {
    setFilteredUsers([]);
    setIsDropdownOpen(false);
  }
}, [searchQuery, users]);


  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleUserSelect = (username) => {
    setSearchQuery(username);
    setIsDropdownOpen(false);
    justSelectedRef.current = true; 
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.3 }}
      className="max-w-2xl mx-auto mb-8"
    >
      <form onSubmit={handleSearch} className="relative">
        <div className="relative" ref={dropdownRef}>
          <input
            type="text"
            placeholder="Enter influencer username..."
            value={searchQuery}
            onChange={(e) => handleInputChange(e.target.value)}
            className="w-full bg-white/10 border border-white/20 rounded-lg px-5 py-4 text-white focus:outline-none focus:ring-2 focus:ring-white/30 pl-12"
            onFocus={() => searchQuery && filteredUsers.length > 0 && setIsDropdownOpen(true)}
          />
          <SearchIcon
            className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/50"
            size={20}
          />
          
          {isDropdownOpen && filteredUsers.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute z-50 mt-1 w-full bg-gray-900 border border-white/20 rounded-md shadow-lg max-h-60 overflow-y-auto"
              style={{ maxHeight: '15rem' }}
            >
              {filteredUsers.map((user, index) => (
  <div
    key={index}
    className="px-4 py-3 hover:bg-purple-900/40 cursor-pointer flex items-center gap-2 text-white transition"
    onClick={() => handleUserSelect(user.channel_info)}
  >
    <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center text-white/70">
      {user.channel_info.charAt(0).toUpperCase()}
    </div>
    <span>{user.channel_info}</span>
  </div>
))}

            </motion.div>
          )}
          
          <motion.button
            type="submit"
            disabled={isLoading}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-white text-black px-6 py-2 rounded-md hover:bg-opacity-90 transition-all disabled:opacity-50 font-medium"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <svg
                  className="animate-spin h-5 w-5 text-black"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Searching
              </span>
            ) : (
              "Search"
            )}
          </motion.button>
        </div>
      </form>
    </motion.div>
  );
};

export default SearchForm;
import { motion } from "framer-motion";
import { Search as SearchIcon } from "lucide-react";

const SearchForm = ({
  searchQuery,
  handleInputChange,
  handleSearch,
  isLoading,
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6, delay: 0.3 }}
    className="max-w-2xl mx-auto mb-8"
  >
    <form onSubmit={handleSearch} className="relative">
      <div className="relative">
        <input
          type="text"
          placeholder="Enter influencer username..."
          value={searchQuery}
          onChange={(e) => handleInputChange(e.target.value)}
          className="w-full bg-white/10 border border-white/20 rounded-lg px-5 py-4 text-white focus:outline-none focus:ring-2 focus:ring-white/30 pl-12"
        />
        <SearchIcon
          className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/50"
          size={20}
        />
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

export default SearchForm;

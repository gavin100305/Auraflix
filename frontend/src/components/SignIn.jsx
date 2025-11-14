import React, { useState } from "react";
import { motion } from "framer-motion";
import InputField from "./InputField";
import BottomGradientEffect from "./BottomGradientEffect";
import { useNavigate } from "react-router-dom";

const SignIn = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch(
        "https://influenceiq-node.onrender.com/api/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      const contentType = response.headers.get("content-type");
      let data;

      if (contentType && contentType.includes("application/json")) {
        data = await response.json();
      } else {
        const text = await response.text();
        throw new Error(`Server returned non-JSON response: ${text}`);
      }

      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }


      localStorage.setItem("authToken", data.token);

      if (data.businessUser) {
        localStorage.setItem("user", JSON.stringify(data.businessUser));
      }

      if (data.suggestions) {
        let processedSuggestions = data.suggestions;

        if (typeof data.suggestions === "string") {
          processedSuggestions = data.suggestions
            .replace(/"/g, "")
            .split("\\n")
            .filter((name) => name.trim())
            .map((username) => ({
              name: username,
              username: username,
              category: "Social Media",
              profile_url: `https://www.instagram.com/${username}/`,
            }));
        }

        localStorage.setItem(
          "suggestedInfluencers",
          JSON.stringify(processedSuggestions)
        );
      }

      navigate("/");
    } catch (error) {
      setError(error.message || "Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.form
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      onSubmit={handleSubmit}
      className="space-y-4"
    >
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-500 px-4 py-2 rounded-lg text-sm">
          {error}
        </div>
      )}

      <InputField
        label="Email"
        id="email"
        type="email"
        placeholder="your@email.com"
        value={formData.email}
        onChange={handleChange}
        required
      />
      <InputField
        label="Password"
        id="password"
        type="password"
        placeholder="••••••••"
        value={formData.password}
        onChange={handleChange}
        required
      />

      <div className="flex items-center justify-between mt-2">
        <div className="flex items-center">
          <input
            id="remember-me"
            type="checkbox"
            className="h-4 w-4 rounded border-white/20 bg-white/5 focus:ring-blue-500 cursor-pointer"
          />
          <label
            htmlFor="remember-me"
            className="ml-2 text-sm text-neutral-400"
          >
            Remember me
          </label>
        </div>
        <div>
          <a
            href="#"
            className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
          >
            Forgot password?
          </a>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="group relative w-full rounded-lg overflow-hidden bg-linear-to-r from-blue-600 to-purple-600 py-2 px-4 text-white font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed"
      >
        {loading ? (
          <span className="flex items-center justify-center">
            <svg
              className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
            Signing in...
          </span>
        ) : (
          "Sign In"
        )}
        <BottomGradientEffect />
      </button>
    </motion.form>
  );
};

export default SignIn;

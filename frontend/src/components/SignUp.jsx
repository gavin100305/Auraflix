import React, { useState } from "react";
import { motion } from "framer-motion";
import InputField from "./InputField";
import BottomGradientEffect from "./BottomGradientEffect";
import { useNavigate } from "react-router-dom";

const SignUp = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    businessName: "",
    email: "",
    password: "",
    confirmPassword: "",
    businessCategory: "",
    description: "",
    contact: {
      phone: "",
      address: "",
    },
    website: "",
    socialMedia: {
      instagram: "",
      twitter: "",
      linkedin: "",
    },
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 5;

  const businessCategories = [
    { value: "sports", label: "Sports" },
    { value: "food", label: "Food" },
    { value: "fashion", label: "Fashion" },
    { value: "tech", label: "Technology" },
    { value: "health", label: "Health & Wellness" },
    { value: "other", label: "Other" },
  ];

  const handleChange = (e) => {
    const { id, value } = e.target;

    if (id.startsWith("social-")) {
      const platform = id.replace("social-", "");
      setFormData({
        ...formData,
        socialMedia: {
          ...formData.socialMedia,
          [platform]: value,
        },
      });
    } else if (id.startsWith("contact-")) {
      const field = id.replace("contact-", "");
      setFormData({
        ...formData,
        contact: {
          ...formData.contact,
          [field]: value,
        },
      });
    } else {
      setFormData({
        ...formData,
        [id]: value,
      });
    }
  };

  const validateStep = () => {
    switch (currentStep) {
      case 1:
        if (!formData.businessName.trim()) {
          setError("Business name is required");
          return false;
        }
        if (!formData.email.trim() || !/\S+@\S+\.\S+/.test(formData.email)) {
          setError("Valid email is required");
          return false;
        }
        return true;
      case 2:
        if (formData.password.length < 8) {
          setError("Password must be at least 8 characters");
          return false;
        }
        if (formData.password !== formData.confirmPassword) {
          setError("Passwords don't match");
          return false;
        }
        return true;
      case 3:
        if (!formData.businessCategory) {
          setError("Please select a business category");
          return false;
        }
        if (!formData.description.trim()) {
          setError("Business description is required");
          return false;
        }
        return true;
      default:
        return true;
    }
  };

  const nextStep = () => {
    if (validateStep()) {
      setError("");
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    setError("");
    setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Prepare data for API
      const apiData = {
        ...formData,
      };

      // Remove confirmPassword as it's not needed for the API
      delete apiData.confirmPassword;

      const response = await fetch("https://auraflix-production.up.railway.app/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(apiData),
      });

      // Check if the response has content before trying to parse it
      const contentType = response.headers.get("content-type");
      let data;

      if (contentType && contentType.includes("application/json")) {
        data = await response.json();
      } else {
        // Handle non-JSON response
        const text = await response.text();
        throw new Error(`Server returned non-JSON response: ${text}`);
      }

      if (!response.ok) {
        throw new Error(data.message || "Registration failed");
      }

      // Store auth data
      localStorage.setItem("authToken", data.token);

      // Only store user data if it exists
      if (data.businessUser) {
        localStorage.setItem("user", JSON.stringify(data.businessUser));
      }

      if (data.suggestions) {
        let processedSuggestions = data.suggestions;

        // Process suggestions if they're in string format
        if (typeof data.suggestions === "string") {
          try {
            // Try parsing as JSON first in case it's a stringified array
            const parsed = JSON.parse(data.suggestions);

            if (Array.isArray(parsed)) {
              if (
                parsed.length === 1 &&
                typeof parsed[0] === "string" &&
                parsed[0].includes("\\n")
              ) {
                // Handle the case of an array with a single string containing newlines
                processedSuggestions = parsed[0]
                  .replace(/"/g, "")
                  .split("\\n")
                  .filter((name) => name.trim())
                  .map((username) => ({
                    name: username,
                    username: username,
                    category: "Social Media",
                    profile_url: `https://www.instagram.com/${username}/`,
                  }));
              } else {
                // It's already a proper array
                processedSuggestions = parsed;
              }
            }
          } catch (parseError) {
            // If JSON parsing fails, handle as a direct string with newlines
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
        }

        // Store the processed suggestions
        localStorage.setItem(
          "suggestedInfluencers",
          JSON.stringify(processedSuggestions)
        );
      } else if (data.businessUser && data.businessUser.suggestedInfluencers) {
        // If suggestions are in the user object instead
        localStorage.setItem(
          "suggestedInfluencers",
          JSON.stringify(data.businessUser.suggestedInfluencers)
        );
      }

      navigate("/dashboard");
    } catch (error) {
      setError(error.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const stepTitles = [
    "Business Info",
    "Security",
    "Business Details",
    "Contact Info",
    "Social Media",
  ];

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-5">
            <h3 className="text-xl font-medium text-white text-center mb-4">
              Tell us about your business
            </h3>
            <InputField
              label="Business Name"
              id="businessName"
              type="text"
              placeholder="Your Business Name"
              value={formData.businessName}
              onChange={handleChange}
              required
            />
            <InputField
              label="Email"
              id="email"
              type="email"
              placeholder="business@example.com"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
        );

      case 2:
        return (
          <div className="space-y-5">
            <h3 className="text-xl font-medium text-white text-center mb-4">
              Create a secure account
            </h3>
            <InputField
              label="Password"
              id="password"
              type="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              required
            />
            <InputField
              label="Confirm Password"
              id="confirmPassword"
              type="password"
              placeholder="••••••••"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
          </div>
        );

      case 3:
        return (
          <div className="space-y-5">
            <h3 className="text-xl font-medium text-white text-center mb-4">
              Business details
            </h3>
            <div className="space-y-2">
              <label
                htmlFor="businessCategory"
                className="block text-sm font-medium text-neutral-300"
              >
                Business Category
              </label>
              <div className="relative">
                <select
                  id="businessCategory"
                  value={formData.businessCategory}
                  onChange={handleChange}
                  className="w-full px-4 py-2 rounded-lg bg-[#121212] text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-transparent transition-colors appearance-none pr-10 cursor-pointer"
                  style={{
                    WebkitAppearance: "none",
                    MozAppearance: "none",
                  }}
                  required
                >
                  <option
                    value=""
                    disabled
                    style={{
                      backgroundColor: "#1f1f1f",
                      color: "#d4d4d4",
                      padding: "10px",
                      margin: "4px 0",
                    }}
                  >
                    Select a category
                  </option>
                  {businessCategories.map((category) => (
                    <option
                      key={category.value}
                      value={category.value}
                      style={{
                        backgroundColor: "#1f1f1f",
                        color: "white",
                        padding: "10px",
                        margin: "4px 0",
                        borderBottom: "1px solid rgba(255,255,255,0.1)",
                        cursor: "pointer",
                      }}
                    >
                      {category.label}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-neutral-300">
                  <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <label
                htmlFor="description"
                className="block text-sm font-medium text-neutral-300"
              >
                Business Description
              </label>
              <textarea
                id="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe your business in a few sentences..."
                rows="3"
                className="w-full px-4 py-2 rounded-lg border border-white/10 bg-white/5 text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-transparent transition-colors"
                required
              />
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-5">
            <h3 className="text-xl font-medium text-white text-center mb-4">
              Contact Information
            </h3>
            <InputField
              label="Phone Number"
              id="contact-phone"
              type="tel"
              placeholder="+1 123 456 7890"
              value={formData.contact.phone}
              onChange={handleChange}
              required
            />
            <InputField
              label="Address"
              id="contact-address"
              type="text"
              placeholder="123 Business St, City, State"
              value={formData.contact.address}
              onChange={handleChange}
              required
            />
            <InputField
              label="Website"
              id="website"
              type="url"
              placeholder="https://yourbusiness.com"
              value={formData.website}
              onChange={handleChange}
              required
            />
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-medium text-white text-center mb-4">
              Social media (optional)
            </h3>
            <InputField
              label="Instagram"
              id="social-instagram"
              type="url"
              placeholder="https://instagram.com/yourbusiness"
              value={formData.socialMedia.instagram}
              onChange={handleChange}
            />
            <InputField
              label="Twitter"
              id="social-twitter"
              type="url"
              placeholder="https://twitter.com/yourbusiness"
              value={formData.socialMedia.twitter}
              onChange={handleChange}
            />
            <InputField
              label="LinkedIn"
              id="social-linkedin"
              type="url"
              placeholder="https://linkedin.com/company/yourbusiness"
              value={formData.socialMedia.linkedin}
              onChange={handleChange}
            />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <motion.form
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
      onSubmit={(e) => e.preventDefault()}
      className="max-w-md mx-auto"
    >
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-500 px-4 py-2 rounded-lg text-sm mb-4">
          {error}
        </div>
      )}

      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          {Array.from({ length: totalSteps }, (_, i) => (
            <div
              key={i}
              className={`h-2 rounded-full transition-all duration-300 ${
                i < currentStep
                  ? "bg-blue-500 flex-grow"
                  : "bg-gray-600 flex-grow"
              } ${i < totalSteps - 1 ? "mr-1" : ""}`}
            />
          ))}
        </div>
        <p className="text-center text-xs text-neutral-400">
          <span className="font-medium">{stepTitles[currentStep - 1]}</span> -
          Step {currentStep} of {totalSteps}
        </p>
      </div>

      <div className="bg-white/5 border border-white/10 p-6 rounded-xl shadow-xl">
        {renderStepContent()}

        <div
          className={`flex ${
            currentStep === 1 ? "justify-end" : "justify-between"
          } mt-8`}
        >
          {currentStep > 1 && (
            <button
              type="button"
              onClick={prevStep}
              className="py-2 px-4 rounded-lg border border-white/10 hover:bg-white/5 transition-all text-neutral-300"
            >
              Back
            </button>
          )}
          {currentStep < totalSteps ? (
            <button
              type="button"
              onClick={nextStep}
              className="group relative rounded-lg overflow-hidden bg-gradient-to-r from-blue-600 to-purple-600 py-2 px-6 text-white font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-300"
            >
              Next
              <BottomGradientEffect />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="group relative rounded-lg overflow-hidden bg-gradient-to-r from-blue-600 to-purple-600 py-2 px-4 text-white font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed"
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
                  Registering...
                </span>
              ) : (
                "Complete Registration"
              )}
              <BottomGradientEffect />
            </button>
          )}
        </div>
      </div>
    </motion.form>
  );
};

export default SignUp;

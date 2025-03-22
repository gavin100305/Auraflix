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
  const totalSteps = 2;

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

  const nextStep = () => {
    if (!formData.businessName.trim()) {
      setError("Business name is required");
      return;
    }

    if (!formData.email.trim() || !/\S+@\S+\.\S+/.test(formData.email)) {
      setError("Valid email is required");
      return;
    }

    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords don't match");
      return;
    }

    setError("");
    setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!formData.businessCategory) {
      setError("Please select a business category");
      setLoading(false);
      return;
    }

    if (!formData.description.trim()) {
      setError("Business description is required");
      setLoading(false);
      return;
    }

    try {
      // Prepare data for API
      const apiData = {
        ...formData,
      };

      // Remove confirmPassword as it's not needed for the API
      delete apiData.confirmPassword;

      const response = await fetch("http://localhost:8080/api/auth/register", {
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

      navigate("/analysis");
    } catch (error) {
      console.error("Registration error:", error);
      setError(error.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.form
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.3 }}
      onSubmit={handleSubmit}
      className="space-y-4"
    >
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-500 px-4 py-2 rounded-lg text-sm">
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
          Step {currentStep} of {totalSteps}
        </p>
      </div>

      {currentStep === 1 ? (
        <div className="space-y-4">
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

          <button
            type="button"
            onClick={nextStep}
            className="group relative w-full rounded-lg overflow-hidden bg-gradient-to-r from-blue-600 to-purple-600 py-2 px-4 text-white font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-300"
          >
            Next
            <BottomGradientEffect />
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="space-y-1">
            <label
              htmlFor="businessCategory"
              className="block text-sm font-medium text-neutral-300"
            >
              Business Category
            </label>
            <select
              id="businessCategory"
              value={formData.businessCategory}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-lg border border-white/10 bg-white/5 text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-transparent transition-colors"
              required
            >
              <option value="" disabled>
                Select a category
              </option>
              {businessCategories.map((category) => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
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

          <div className="space-y-1">
            <label className="block text-sm font-medium text-neutral-300">
              Contact Information
            </label>
            <InputField
              label="Phone Number"
              id="contact-phone"
              type="tel"
              placeholder="+1 123 456 7890"
              value={formData.contact.phone}
              onChange={handleChange}
              noMargin
            />
            <InputField
              label="Address"
              id="contact-address"
              type="text"
              placeholder="123 Business St, City, State"
              value={formData.contact.address}
              onChange={handleChange}
              noMargin
            />
          </div>

          <InputField
            label="Website"
            id="website"
            type="url"
            placeholder="https://yourbusiness.com"
            value={formData.website}
            onChange={handleChange}
          />

          <div className="space-y-1">
            <label className="block text-sm font-medium text-neutral-300">
              Social Media (Optional)
            </label>
            <InputField
              label="Instagram"
              id="social-instagram"
              type="url"
              placeholder="https://instagram.com/yourbusiness"
              value={formData.socialMedia.instagram}
              onChange={handleChange}
              noMargin
            />
            <InputField
              label="Twitter"
              id="social-twitter"
              type="url"
              placeholder="https://twitter.com/yourbusiness"
              value={formData.socialMedia.twitter}
              onChange={handleChange}
              noMargin
            />
            <InputField
              label="LinkedIn"
              id="social-linkedin"
              type="url"
              placeholder="https://linkedin.com/company/yourbusiness"
              value={formData.socialMedia.linkedin}
              onChange={handleChange}
              noMargin
            />
          </div>

          <div className="flex gap-4">
            <button
              type="button"
              onClick={prevStep}
              className="flex-1 py-2 px-4 rounded-lg border border-white/10 hover:bg-white/5 transition-all text-neutral-300"
            >
              Back
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 group relative rounded-lg overflow-hidden bg-gradient-to-r from-blue-600 to-purple-600 py-2 px-4 text-white font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed"
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
                "Register"
              )}
              <BottomGradientEffect />
            </button>
          </div>
        </div>
      )}
    </motion.form>
  );
};

export default SignUp;

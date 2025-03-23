// server.js
const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const authRoutes = require("./routes/auth.route");
const jwt = require("jsonwebtoken");
const BusinessUser = require("./models/user.model");

dotenv.config();

const app = express();
app.use(express.json());
app.use(
  cors({
    origin: "https://influenceiq-nine.vercel.app",
    credentials: true,
  })
);

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log(err));

// Routes
app.use("/api/auth", authRoutes);

const authMiddleware = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Authorization token required" });
    }

    const token = authHeader.split(" ")[1];

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user from database
    const user = await BusinessUser.findById(decoded.id).select("-password");
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    // Attach user to request object
    req.user = user;
    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    return res.status(401).json({ message: "Not authorized, invalid token" });
  }
};

app.get("/api/auth/suggestions", authMiddleware, async (req, res) => {
  try {
    // User is already attached to request by middleware
    const user = req.user;

    let suggestedInfluencers = user.suggestedInfluencers || [];

    // Handle the complex case where it's a stringified JSON array with a single string element
    if (typeof suggestedInfluencers === "string") {
      try {
        // Try to parse it as JSON first
        const parsed = JSON.parse(suggestedInfluencers);

        if (Array.isArray(parsed)) {
          // If it's an array with a single string containing newlines
          if (
            parsed.length === 1 &&
            typeof parsed[0] === "string" &&
            parsed[0].includes("\\n")
          ) {
            suggestedInfluencers = parsed[0]
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
          // If it's already an array of objects, use it directly
          else if (parsed.length > 0 && typeof parsed[0] === "object") {
            suggestedInfluencers = parsed;
          }
        }
      } catch (parseError) {
        // If JSON parsing fails, try direct string parsing
        suggestedInfluencers = suggestedInfluencers
          .replace(/"/g, "")
          .replace(/[\[\]]/g, "") // Remove square brackets
          .split("\\n")
          .filter((name) => name.trim())
          .map((username) => ({
            name: username,
            username: username,
            category: "Social Media",
            profile_url: `https://www.instagram.com/${username}/`,
          }));
      }

      // Update the user's record with the formatted data
      await BusinessUser.findByIdAndUpdate(user._id, { suggestedInfluencers });
    }

    // Return suggestions from user document
    res.status(200).json({
      success: true,
      suggestedInfluencers,
    });
  } catch (error) {
    console.error("Error fetching suggestions:", error);
    res.status(500).json({
      success: false,
      message: "Error retrieving suggested influencers",
      error: error.message,
    });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

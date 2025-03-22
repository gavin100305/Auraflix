// routes/auth.js
const express = require("express");
const router = express.Router();
const BusinessUser = require("../models/user.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Register a new business
router.post("/register", async (req, res) => {
  try {
    const { businessName, email, password, businessCategory, description, contact, website, socialMedia } = req.body;

    // Check if user already exists
    const existingUser = await BusinessUser.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Business already registered" });
    }

    // Create new business user
    const businessUser = new BusinessUser({
      businessName,
      email,
      password,
      businessCategory,
      description,
      contact,
      website,
      socialMedia,
    });

    await businessUser.save();

    // Generate JWT token
    const token = jwt.sign({ id: businessUser._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.status(201).json({ token, businessUser });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Login for business
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const businessUser = await BusinessUser.findOne({ email });
    if (!businessUser) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, businessUser.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Generate JWT token
    const token = jwt.sign({ id: businessUser._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.status(200).json({ token, businessUser });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;
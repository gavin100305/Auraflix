
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const BusinessUserSchema = new mongoose.Schema({
  businessName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  businessCategory: {
    type: String,
    required: true,
    enum: ["sports", "food", "fashion", "tech", "health", "other"],
  },
  description: {
    type: String,
    required: true,
  },
  contact: {
    phone: String,
    address: String,
  },
  website: String,
  socialMedia: {
    instagram: String,
    twitter: String,
    linkedin: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Hash password before saving
BusinessUserSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

module.exports = mongoose.model("BusinessUser", BusinessUserSchema);
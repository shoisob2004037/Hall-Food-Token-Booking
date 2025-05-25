const express = require("express");
const Token = require("../models/Token");
const User = require("../models/User");
const { auth, admin } = require("../middleware/auth");
const router = express.Router();

// Get admin dashboard stats
router.get("/stats", [auth, admin], async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [totalUsers, totalTokens, todayTokens, tomorrowTokens] = await Promise.all([
      User.countDocuments({ isAdmin: false }),
      Token.countDocuments(),
      Token.countDocuments({ date: today }),
      Token.countDocuments({ date: tomorrow }),
    ]);

    res.json({
      totalUsers,
      totalTokens,
      todayTokens,
      tomorrowTokens,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Get daily token stats for the last 7 days, including tomorrow
router.get("/daily-stats", [auth, admin], async (req, res) => {
  try {
    // Get date range (last 6 days + today + tomorrow = 8 days total)
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 1); // Include tomorrow
    endDate.setHours(23, 59, 59, 999);

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 6); // Start 6 days before today
    startDate.setHours(0, 0, 0, 0);

    // Get all tokens in date range
    const tokens = await Token.find({
      date: { $gte: startDate, $lte: endDate },
    });

    // Group tokens by date
    const dailyStats = [];
    const dateMap = new Map();

    // Initialize the map with all dates in range
    for (let i = 0; i < 8; i++) { // Changed from 7 to 8 to include tomorrow
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      date.setHours(0, 0, 0, 0);

      const dateString = date.toISOString().split("T")[0];
      dateMap.set(dateString, {
        date: dateString,
        lunchCount: 0,
        dinnerCount: 0,
      });
    }

    // Count tokens for each date
    tokens.forEach((token) => {
      const dateString = token.date.toISOString().split("T")[0];
      const stats = dateMap.get(dateString);

      if (stats) {
        if (token.lunch) stats.lunchCount++;
        if (token.dinner) stats.dinnerCount++;
      }
    });

    // Convert map to array
    dateMap.forEach((value) => {
      dailyStats.push(value);
    });

    // Sort by date
    dailyStats.sort((a, b) => new Date(a.date) - new Date(b.date));

    res.json(dailyStats);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Get all tokens for tomorrow with user details
router.get("/tomorrow-tokens", [auth, admin], async (req, res) => {
  try {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    const tokens = await Token.find({
      date: tomorrow,
    }).populate("user", "email name studentId");

    res.json(tokens);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Promote a user to admin
router.put("/promote/:id", [auth, admin], async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.isAdmin) {
      return res.status(400).json({ message: "User is already an admin" });
    }

    user.isAdmin = true;
    await user.save();

    res.json({ message: "User promoted to admin successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
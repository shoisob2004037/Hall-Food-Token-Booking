const express = require("express");
const User = require("../models/User");
const { auth, admin } = require("../middleware/auth");
const router = express.Router();

// Get current user
router.get("/me", auth, async (req, res) => {
  try {
    res.json(req.user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Update user balance by ID (admin only)
router.put("/balance/:id", [auth, admin], async (req, res) => {
  try {
    const { amount } = req.body;

    // Validate amount
    if (!amount || isNaN(amount)) {
      return res.status(400).json({ message: "Valid amount is required" });
    }

    const amountNum = Number(amount);


    // Find the target user
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Find the admin
    const admin = await User.findById(req.user.id); // Assuming auth middleware provides admin's ID
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    // Check if admin has sufficient balance
    if (admin.balance < amountNum) {
      return res.status(400).json({ message: "Insufficient admin balance" });
    }

    // Update balances
    admin.balance -= amountNum;
    user.balance += amountNum;

    // Check for negative balances
    if (admin.balance < 0 || user.balance < 0) {
      return res.status(400).json({ message: "Balance cannot be negative" });
    }

    // Save both documents
    await admin.save();
    await user.save();

    res.json({ message: "Balance updated successfully", userBalance: user.balance, adminBalance: admin.balance });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Update user balance by studentId (admin only), deducting from admin's balance
router.put("/balance-by-studentid", [auth, admin], async (req, res) => {
  try {
    const { studentId, amount } = req.body;

    // Validate inputs
    if (!studentId) {
      return res.status(400).json({ message: "Student ID is required" });
    }

    if (!amount || isNaN(amount)) {
      return res.status(400).json({ message: "Valid amount is required" });
    }

    const amountNum = Number(amount);

    // Find the target user by studentId
    const user = await User.findOne({ studentId });
    if (!user) {
      return res.status(404).json({ message: "User not found with this Student ID" });
    }

    // Find the admin
    const admin = await User.findById(req.user.id); // Assuming auth middleware provides admin's ID
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    // Check if admin has sufficient balance
    if (admin.balance < amountNum) {
      return res.status(400).json({ message: "Insufficient admin balance" });
    }

    // Update balances
    admin.balance -= amountNum;
    user.balance += amountNum;

    // Check for negative balances
    if (admin.balance < 0 || user.balance < 0) {
      return res.status(400).json({ message: "Balance cannot be negative" });
    }

    // Save both documents
    await admin.save();
    await user.save();

    res.json({
      message: "Balance updated successfully",
      studentId: user.studentId,
      userBalance: user.balance,
      adminBalance: admin.balance,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Get all users (admin only)
router.get("/", [auth, admin], async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Get user by email (admin only)
router.get("/by-email", [auth, admin], async (req, res) => {
  try {
    const { email } = req.query;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await User.findOne({ email }).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
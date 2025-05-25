const express = require("express")
const jwt = require("jsonwebtoken")
const User = require("../models/User")
const router = express.Router()

// Register a new user
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, studentId } = req.body

    // Check if user already exists
    let user = await User.findOne({ email })
    if (user) {
      return res.status(400).json({ message: "User already exists with this email" })
    }

    // Check if student ID already exists
    user = await User.findOne({ studentId })
    if (user) {
      return res.status(400).json({ message: "User already exists with this Student ID" })
    }

    // Create new user with roll set to null to avoid unique constraint issues
    user = new User({
      name,
      email,
      password,
      studentId,
      roll: null, // Set roll to null explicitly
    })

    await user.save()

    res.status(201).json({ message: "User registered successfully" })
  } catch (err) {
    console.error("Registration error:", err)

    // More specific error messages
    if (err.code === 11000) {
      // Duplicate key error
      const field = Object.keys(err.keyValue)[0]
      return res.status(400).json({ message: `${field} already exists` })
    }

    res.status(500).json({ message: "Server error during registration. Please try again." })
  }
})

// Login user
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body

    console.log("Login attempt for email:", email)

    // Find user by email
    const user = await User.findOne({ email })
    if (!user) {
      console.log("User not found with email:", email)
      return res.status(400).json({ message: "Invalid credentials" })
    }

    console.log("User found:", {
      id: user._id,
      email: user.email,
      isAdmin: user.isAdmin,
      passwordLength: user.password ? user.password.length : 0,
    })

    // Check password
    const isMatch = await user.comparePassword(password)
    console.log("Password match result:", isMatch)

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" })
    }

    // Create JWT token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" })

    // Return user data without password
    const userData = {
      _id: user._id,
      name: user.name,
      email: user.email,
      studentId: user.studentId,
      balance: user.balance,
      isAdmin: user.isAdmin,
    }

    res.json({ token, user: userData })
  } catch (err) {
    console.error("Login error:", err)
    res.status(500).json({ message: "Server error" })
  }
})

module.exports = router

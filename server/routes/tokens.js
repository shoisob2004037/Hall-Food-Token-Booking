const express = require("express")
const mongoose = require("mongoose")
const Token = require("../models/Token")
const User = require("../models/User")
const { auth, admin } = require("../middleware/auth")
const router = express.Router()

// Buy a new token
router.post("/buy", auth, async (req, res) => {
  const session = await mongoose.startSession()
  session.startTransaction()

  try {
    const { date, lunch, dinner } = req.body

    if (!lunch && !dinner) {
      return res.status(400).json({ message: "At least one meal must be selected" })
    }

    // Validate date is for tomorrow
    const requestDate = new Date(date)
    requestDate.setHours(0, 0, 0, 0)

    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(0, 0, 0, 0)

    if (requestDate.getTime() !== tomorrow.getTime()) {
      return res.status(400).json({ message: "Tokens can only be purchased for tomorrow" })
    }

    // Calculate total price
    const totalPrice = (lunch ? 40 : 0) + (dinner ? 40 : 0)

    // Check if user has enough balance
    const user = await User.findById(req.user._id).session(session)
    if (user.balance < totalPrice) {
      await session.abortTransaction()
      session.endSession()
      return res.status(400).json({ message: "Insufficient balance" })
    }

    // Check if user already has a token for this date
    const existingToken = await Token.findOne({
      user: req.user._id,
      date: requestDate,
    }).session(session)

    if (existingToken) {
      await session.abortTransaction()
      session.endSession()
      return res.status(400).json({ message: "You already have a token for this date" })
    }

    // Create new token
    const token = new Token({
      user: req.user._id,
      date: requestDate,
      lunch,
      dinner,
    })

    await token.save({ session })

    // Deduct balance from user
    user.balance -= totalPrice
    await user.save({ session })

    await session.commitTransaction()
    session.endSession()

    res.status(201).json(token)
  } catch (err) {
    await session.abortTransaction()
    session.endSession()
    console.error(err)
    res.status(500).json({ message: "Server error" })
  }
})

// Get all tokens for current user
router.get("/user", auth, async (req, res) => {
  try {
    const tokens = await Token.find({ user: req.user._id }).sort({ date: -1 })
    res.json(tokens)
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: "Server error" })
  }
})

// Add this new route to get all tokens (admin only) - MOVED BEFORE /:id route
router.get("/all", [auth, admin], async (req, res) => {
  try {
    const tokens = await Token.find().populate("user", "name email studentId").sort({ date: -1 })
    res.json(tokens)
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: "Server error" })
  }
})

// Get a specific token by ID - MOVED AFTER /all route
router.get("/:id", auth, async (req, res) => {
  try {
    const token = await Token.findById(req.params.id)

    if (!token) {
      return res.status(404).json({ message: "Token not found" })
    }

    // Check if token belongs to current user or user is admin
    if (token.user.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      return res.status(403).json({ message: "Not authorized to view this token" })
    }

    res.json(token)
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: "Server error" })
  }
})

module.exports = router

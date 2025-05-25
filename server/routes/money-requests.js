const express = require("express")
const mongoose = require("mongoose")
const MoneyRequest = require("../models/MoneyRequest")
const User = require("../models/User")
const { auth, admin } = require("../middleware/auth")
const router = express.Router()

// Create a new money request (user)
router.post("/", auth, async (req, res) => {
  try {
    console.log("Received money request data:", req.body)

    const { amount, paymentMethod, paymentNumber, transactionId, paymentPhotoUrl, details } = req.body

    // Validate required fields
    if (!amount || amount <= 0) {
      return res.status(400).json({ message: "Please enter a valid amount" })
    }

    if (!paymentMethod || !["bkash", "nagad"].includes(paymentMethod)) {
      return res.status(400).json({ message: "Payment method must be either 'bkash' or 'nagad'" })
    }

    if (!paymentNumber) {
      return res.status(400).json({ message: "Please provide the payment number" })
    }

    if (!transactionId) {
      return res.status(400).json({ message: "Please provide the transaction ID" })
    }

    if (!paymentPhotoUrl) {
      return res.status(400).json({ message: "Please provide a payment screenshot URL" })
    }

    // Create a new money request document with all fields from the schema
    const moneyRequest = new MoneyRequest({
      user: req.user._id,
      amount: Number(amount),
      paymentMethod,
      paymentNumber,
      transactionId,
      paymentPhotoUrl,
      details: details || "",
    })

    console.log("Saving money request:", moneyRequest)

    // Save the document to MongoDB
    const savedRequest = await moneyRequest.save()
    console.log("Saved money request:", savedRequest)

    res.status(201).json({
      message: "Money request submitted successfully",
      request: savedRequest,
    })
  } catch (err) {
    console.error("Error creating money request:", err)
    res.status(500).json({ message: "Server error", error: err.message })
  }
})

// Get all money requests for current user
router.get("/user", auth, async (req, res) => {
  try {
    const requests = await MoneyRequest.find({ user: req.user._id }).sort({ createdAt: -1 })
    res.json(requests)
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: "Server error" })
  }
})

// Get all money requests (admin only)
router.get("/admin", [auth, admin], async (req, res) => {
  try {
    const requests = await MoneyRequest.find().populate("user", "name email studentId").sort({ createdAt: -1 })
    res.json(requests)
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: "Server error" })
  }
})

// Add this new route after the GET "/admin" route and before the PUT "/:id/process" route
// Get all money requests (admin only) - this is the missing endpoint
router.get("/", [auth, admin], async (req, res) => {
  try {
    const requests = await MoneyRequest.find().populate("user", "name email studentId").sort({ createdAt: -1 })
    res.json(requests)
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: "Server error" })
  }
})

// Also fix the process route to match what the frontend is expecting
// Update the route from "/:id/process" to "/:id"
router.put("/:id", [auth, admin], async (req, res) => {
  const session = await mongoose.startSession()
  session.startTransaction()

  try {
    const { status, adminNote } = req.body

    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" })
    }

    const request = await MoneyRequest.findById(req.params.id).session(session)

    if (!request) {
      await session.abortTransaction()
      session.endSession()
      return res.status(404).json({ message: "Request not found" })
    }

    if (request.status !== "pending") {
      await session.abortTransaction()
      session.endSession()
      return res.status(400).json({ message: "This request has already been processed" })
    }

    // Update request status
    request.status = status
    request.processedAt = new Date()
    request.processedBy = req.user._id
    if (adminNote) {
      request.adminNote = adminNote
    }

    // If approved, update user and admin balances
    if (status === "approved") {
      // Get the user who made the request
      const user = await User.findById(request.user).session(session)
      if (!user) {
        await session.abortTransaction()
        session.endSession()
        return res.status(404).json({ message: "User not found" })
      }

      // Get the admin user
      const admin = await User.findById(req.user._id).session(session)
      if (!admin) {
        await session.abortTransaction()
        session.endSession()
        return res.status(404).json({ message: "Admin user not found" })
      }

      // Check if admin has enough balance
      if (admin.balance < request.amount) {
        await session.abortTransaction()
        session.endSession()
        return res.status(400).json({ message: "Insufficient admin balance" })
      }

      // Update balances
      user.balance += request.amount
      admin.balance -= request.amount

      await user.save({ session })
      await admin.save({ session })
    }

    await request.save({ session })
    await session.commitTransaction()
    session.endSession()

    res.json({ message: `Request ${status}`, request })
  } catch (err) {
    await session.abortTransaction()
    session.endSession()
    console.error(err)
    res.status(500).json({ message: "Server error" })
  }
})

module.exports = router

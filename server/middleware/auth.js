const jwt = require("jsonwebtoken")
const User = require("../models/User")

// Authentication middleware
const auth = async (req, res, next) => {
  try {
    // Check for token in header
    const token = req.header("Authorization")?.replace("Bearer ", "")

    if (!token) {
      console.log("No token provided in request")
      return res.status(401).json({ message: "No authentication token, access denied" })
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    if (!decoded || !decoded.userId) {
      console.log("Invalid token payload:", decoded)
      return res.status(401).json({ message: "Token verification failed" })
    }

    console.log("Token verified for user ID:", decoded.userId)

    // Find user
    const user = await User.findById(decoded.userId).select("-password")

    if (!user) {
      console.log("User not found for ID:", decoded.userId)
      return res.status(401).json({ message: "User not found" })
    }

    // Add user to request
    req.user = user
    req.user.id = user._id.toString()

    console.log("User authenticated:", user.name)
    next()
  } catch (err) {
    console.error("Authentication error:", err)
    res.status(401).json({ message: "Token is invalid or expired" })
  }
}

// Admin middleware
const admin = (req, res, next) => {
  if (!req.user.isAdmin) {
    return res.status(403).json({ message: "Access denied, admin privileges required" })
  }
  next()
}

module.exports = { auth, admin }

const express = require("express")
const mongoose = require("mongoose")
const cors = require("cors")
const dotenv = require("dotenv")

// Load environment variables first
dotenv.config()

// Import routes with error handling
let authRoutes, userRoutes, tokenRoutes, adminRoutes, moneyRequestRoutes, topupRoutes

try {
  authRoutes = require("./routes/auth")
  userRoutes = require("./routes/users")
  tokenRoutes = require("./routes/tokens")
  adminRoutes = require("./routes/admin")
  moneyRequestRoutes = require("./routes/money-requests")
  topupRoutes = require("./routes/topup")
} catch (error) {
  console.warn("Some route files not found:", error.message)
}

// Initialize express app
const app = express()

// Middleware
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "*",
    credentials: true,
  }),
)
app.use(express.json())

// Request logging middleware (helpful for debugging)
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`)
  next()
})

// Connect to MongoDB with better error handling
if (process.env.MONGO_URI) {
  mongoose
    .connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(() => console.log("MongoDB connected"))
    .catch((err) => console.error("MongoDB connection error:", err))
} else {
  console.warn("MONGO_URI not found in environment variables")
}

// Basic route (this should always work)
app.get("/", (req, res) => {
  res.json({ 
    message: "Food Token API is running",
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV || "development"
  })
})

app.get("/health", (req, res) => {
  res.status(200).json({ 
    status: "OK", 
    message: "Server is okay",
    timestamp: new Date().toISOString()
  })
})

// Routes with error handling
if (authRoutes) app.use("/api/auth", authRoutes)
if (userRoutes) app.use("/api/users", userRoutes)
if (tokenRoutes) app.use("/api/tokens", tokenRoutes)
if (adminRoutes) app.use("/api/admin", adminRoutes)
if (moneyRequestRoutes) app.use("/api/money-requests", moneyRequestRoutes)
if (topupRoutes) app.use("/api", topupRoutes)

// 404 handler for unmatched routes
app.use("*", (req, res) => {
  res.status(404).json({
    error: "Route not found",
    path: req.originalUrl,
    method: req.method
  })
})

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Server error:", err)
  res.status(500).json({
    error: "Internal server error",
    message: process.env.NODE_ENV === "development" ? err.message : "Something went wrong"
  })
})

// For Vercel, we need to export the app
// But also start the server for local development
const PORT = process.env.PORT || 4000

if (process.env.NODE_ENV !== "production") {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
  })
}

// Export for Vercel
module.exports = app
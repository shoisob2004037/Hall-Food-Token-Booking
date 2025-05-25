const express = require("express")
const mongoose = require("mongoose")
const cors = require("cors")
const dotenv = require("dotenv")
const authRoutes = require("./routes/auth")
const userRoutes = require("./routes/users")
const tokenRoutes = require("./routes/tokens")
const adminRoutes = require("./routes/admin")
const moneyRequestRoutes = require("./routes/money-requests")
const topupRoutes = require("./routes/topup")

// Load environment variables
dotenv.config()

// Initialize express app
const app = express()

// Middleware
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000", // fallback for development
    credentials: true,
  }),
)
app.use(express.json({ limit: '10mb' })) // Add size limit
app.use(express.urlencoded({ extended: true })) // Handle form data

// Enhanced request logging middleware for development
app.use((req, res, next) => {
  const timestamp = new Date().toISOString()
  console.log(`[${timestamp}] ${req.method} ${req.url}`)
  
  // Log request body for POST/PUT requests (be careful with sensitive data)
  if (process.env.NODE_ENV === 'development' && (req.method === 'POST' || req.method === 'PUT')) {
    console.log('Request body:', JSON.stringify(req.body, null, 2))
  }
  
  next()
})

// Error handling middleware for development
app.use((err, req, res, next) => {
  console.error('Error:', err.stack)
  
  if (process.env.NODE_ENV === 'development') {
    res.status(500).json({
      error: err.message,
      stack: err.stack
    })
  } else {
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Connect to MongoDB with better error handling
mongoose
  .connect(process.env.MONGO_URI, {
    // These options are good for development
    serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
    socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
  })
  .then(() => {
    console.log("✅ MongoDB connected successfully")
    console.log(`📍 Database: ${mongoose.connection.name}`)
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err.message)
    process.exit(1) // Exit if can't connect to database
  })

// MongoDB connection event listeners for development
mongoose.connection.on('disconnected', () => {
  console.log('⚠️  MongoDB disconnected')
})

mongoose.connection.on('reconnected', () => {
  console.log('🔄 MongoDB reconnected')
})

// Routes
app.use("/api/auth", authRoutes)
app.use("/api/users", userRoutes)
app.use("/api/tokens", tokenRoutes)
app.use("/api/admin", adminRoutes)
app.use("/api/money-requests", moneyRequestRoutes)
app.use("/api", topupRoutes)

// Enhanced basic route with more info
app.get("/", (req, res) => {
  res.json({
    message: "Food Token API is running",
    version: "1.0.0",
    environment: process.env.NODE_ENV || "development",
    timestamp: new Date().toISOString(),
    endpoints: {
      auth: "/api/auth",
      users: "/api/users", 
      tokens: "/api/tokens",
      admin: "/api/admin",
      moneyRequests: "/api/money-requests",
      topup: "/api",
      health: "/health"
    }
  })
})

// Enhanced health check
app.get("/health", async (req, res) => {
  try {
    // Check database connection
    const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
    
    res.status(200).json({ 
      status: "OK", 
      message: "Server is healthy",
      database: dbStatus,
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    res.status(500).json({
      status: "ERROR",
      message: "Health check failed",
      error: error.message
    })
  }
})

// 404 handler for undefined routes
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.originalUrl,
    method: req.method
  })
})

// Graceful shutdown handling
process.on('SIGINT', async () => {
  console.log('\n🛑 Received SIGINT. Graceful shutdown...')
  
  try {
    await mongoose.connection.close()
    console.log('📦 MongoDB connection closed')
    process.exit(0)
  } catch (error) {
    console.error('❌ Error during shutdown:', error)
    process.exit(1)
  }
})

// Start server
const PORT = process.env.PORT || 4000
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`)
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`)
  console.log(`📱 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`)
  console.log(`🔗 API Base URL: http://localhost:${PORT}`)
})
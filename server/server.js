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
    origin: "http://localhost:3000",
    credentials: true,
  }),
)
app.use(express.json())

// Request logging middleware (helpful for debugging)
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`)
  next()
})

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err))

// Routes
app.use("/api/auth", authRoutes)
app.use("/api/users", userRoutes)
app.use("/api/tokens", tokenRoutes)
app.use("/api/admin", adminRoutes)
app.use("/api/money-requests", moneyRequestRoutes)
app.use("/api", topupRoutes)

// Basic route
app.get("/", (req, res) => {
  res.send("Food Token API is running")
})

// Start server
const PORT = process.env.PORT || 4000
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

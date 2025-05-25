// Create this file to debug your server setup
const express = require("express")
const app = express()

// Basic middleware
app.use(express.json())

// Debug route at the root
app.get("/", (req, res) => {
  res.send("Debug server is running")
})

// Import and use the topup routes directly
const topupRoutes = require("./routes/topup")
app.use("/api", topupRoutes)

// Start server
const PORT = 4001
app.listen(PORT, () => {
  console.log(`Debug server running on port ${PORT}`)
  console.log(`Test these URLs:`)
  console.log(`- http://localhost:${PORT}/`)
  console.log(`- http://localhost:${PORT}/api`)
  console.log(`- http://localhost:${PORT}/api/topup/test`)
})

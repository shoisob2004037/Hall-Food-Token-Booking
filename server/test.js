// Create this file to test if the topup routes file can be loaded correctly
try {
    const topupRoutes = require("./routes/topup")
    console.log("Successfully loaded topup routes")
    console.log("Routes defined:", Object.keys(topupRoutes).length > 0 ? "Yes" : "No")
    console.log("Is a router:", topupRoutes.stack ? "Yes" : "No")
  } catch (error) {
    console.error("Error loading topup routes:", error)
  }
  
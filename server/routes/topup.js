const express = require("express")
const router = express.Router()
const mongoose = require("mongoose")
const { auth } = require("../middleware/auth")
const User = require("../models/User")
const TopUp = require("../models/TopUp")
const SSLCommerzPayment = require("sslcommerz-lts")

// SSLCommerz store credentials
const store_id = process.env.STORE_ID
const store_passwd = process.env.STORE_PASSWORD
const is_live = false // Set to true for production

// Basic test route
router.get("/test-route", (req, res) => {
  res.send("Topup routes are working")
})

// Test route without auth
router.get("/topup/test", (req, res) => {
  res.status(200).json({ message: "Topup test route accessed successfully" })
})

// GET route for top-up page
router.get("/topup", auth, async (req, res) => {
  try {
    res.status(200).json({ message: "Top-up page accessed" })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
})

// Direct SSLCommerz initialization route (for testing)
router.get("/topup/direct-init", async (req, res) => {
  try {
    // Simple data for testing
    const data = {
      total_amount: 100,
      currency: "BDT",
      tran_id: "TEST-" + Date.now(), // use unique tran_id for each api call
      success_url: `${process.env.API_URL}/api/topup/success`,
      fail_url: `${process.env.API_URL}/api/topup/fail`,
      cancel_url: `${process.env.API_URL}/api/topup/cancel`,
      ipn_url: `${process.env.API_URL}/api/topup/ipn`,
      shipping_method: "No",
      product_name: "Account Top-up",
      product_category: "Digital",
      product_profile: "general",
      cus_name: "Test Customer",
      cus_email: "test@example.com",
      cus_add1: "Dhaka",
      cus_city: "Dhaka",
      cus_state: "Dhaka",
      cus_postcode: "1000",
      cus_country: "Bangladesh",
      cus_phone: "01711111111",
    }

    console.log("Initializing direct SSLCommerz payment with data:", data)
    console.log("Using store_id:", store_id)

    const sslcz = new SSLCommerzPayment(store_id, store_passwd, is_live)
    const apiResponse = await sslcz.init(data)

    console.log("SSLCommerz API response:", apiResponse)

    // Redirect the user to payment gateway
    const GatewayPageURL = apiResponse.GatewayPageURL
    if (GatewayPageURL) {
      console.log("Redirecting to: ", GatewayPageURL)
      return res.redirect(GatewayPageURL)
    } else {
      return res.status(400).json({
        message: "Failed to initialize payment",
        response: apiResponse,
      })
    }
  } catch (error) {
    console.error("Error in direct init:", error)
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

// POST route to initiate payment
router.post("/topup/initiate", auth, async (req, res) => {
  try {
    console.log("Payment initiation request received")
    console.log("Request body:", req.body)
    console.log("User ID from auth:", req.user?.id)

    const { amount } = req.body

    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Authentication failed. User ID not found." })
    }

    const userId = req.user.id

    // Validate amount
    if (!amount || amount < 200) {
      return res.status(400).json({ message: "Minimum top-up amount is 200 Tk" })
    }

    // Get user details
    const user = await User.findById(userId)
    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    console.log("User found:", user.name)

    // Create a new top-up record
    const topUp = new TopUp({
      user: userId,
      amount: amount,
    })

    await topUp.save()
    console.log("TopUp record created with ID:", topUp._id)

    // Generate transaction ID
    const transactionId = `TOP-${userId}-${Date.now()}`

    // Prepare data for SSLCommerz - following the exact format from documentation
    const data = {
      total_amount: amount,
      currency: "BDT",
      tran_id: transactionId,
      success_url: `${process.env.API_URL}/api/topup/success`,
      fail_url: `${process.env.API_URL}/api/topup/fail`,
      cancel_url: `${process.env.API_URL}/api/topup/cancel`,
      ipn_url: `${process.env.API_URL}/api/topup/ipn`,
      shipping_method: "No",
      product_name: "Account Top-up",
      product_category: "Digital",
      product_profile: "general",
      cus_name: user.name || "Customer",
      cus_email: user.email || "customer@example.com",
      cus_add1: "N/A",
      cus_city: "N/A",
      cus_state: "N/A",
      cus_postcode: "1000",
      cus_country: "Bangladesh",
      cus_phone: user.phone || "01711111111",
      value_a: userId,
      value_b: topUp._id.toString(),
    }

    console.log("SSLCommerz data prepared:", {
      ...data,
      store_id,
      is_live,
    })

    try {
      // Initialize SSLCommerz payment
      const sslcz = new SSLCommerzPayment(store_id, store_passwd, is_live)
      const apiResponse = await sslcz.init(data)

      console.log("SSLCommerz API response:", apiResponse)

      // Check if the API response contains the GatewayPageURL
      if (!apiResponse.GatewayPageURL) {
        return res.status(400).json({
          message: "Failed to initialize payment",
          sslResponse: apiResponse,
        })
      }

      // Update the topup record with transaction ID
      topUp.transactionId = transactionId
      await topUp.save()

      // Return the gateway URL
      return res.status(200).json({
        url: apiResponse.GatewayPageURL,
        transactionId: transactionId,
      })
    } catch (sslError) {
      console.error("SSLCommerz error:", sslError)
      return res.status(400).json({
        message: "SSLCommerz integration error",
        error: sslError.message,
      })
    }
  } catch (error) {
    console.error("Server error in payment initiation:", error)
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

// Payment success route
router.post("/topup/success", async (req, res) => {
  try {
    console.log("Payment success callback received:", req.body)
    const { tran_id, val_id, amount, card_type, store_amount, value_a, value_b } = req.body

    // Verify payment with SSLCommerz
    const sslcz = new SSLCommerzPayment(store_id, store_passwd, is_live)
    const validation = await sslcz.validate({ val_id })

    console.log("SSLCommerz validation response:", validation)

    if (validation.status !== "VALID") {
      console.log("Payment validation failed:", validation)
      return res.redirect(`${process.env.FRONTEND_URL}/payment-failed?reason=validation`)
    }

    // Update top-up record
    const topUp = await TopUp.findById(value_b)
    if (!topUp) {
      console.log("TopUp record not found:", value_b)
      return res.redirect(`${process.env.FRONTEND_URL}/payment-failed?reason=topup-not-found`)
    }

    // Update topup status
    topUp.status = "completed"
    topUp.processedAt = new Date()
    topUp.paymentDetails = req.body
    await topUp.save()

    // Update user balance
    const user = await User.findById(value_a)
    if (!user) {
      console.log("User not found:", value_a)
      return res.redirect(`${process.env.FRONTEND_URL}/payment-failed?reason=user-not-found`)
    }

    // Update user balance
    user.balance += Number.parseFloat(amount)
    await user.save()
    console.log(`User balance updated. New balance: ${user.balance}`)

    // Redirect to success page
    return res.redirect(`${process.env.FRONTEND_URL}/payment-success?amount=${amount}`)
  } catch (error) {
    console.error("Error in success callback:", error)
    return res.redirect(`${process.env.FRONTEND_URL}/payment-failed?reason=server-error`)
  }
})

// Payment failure route
router.post("/topup/fail", async (req, res) => {
  try {
    console.log("Payment failed callback received:", req.body)
    const { tran_id, value_b } = req.body

    // Update topup record if available
    if (value_b) {
      const topUp = await TopUp.findById(value_b)
      if (topUp) {
        topUp.status = "failed"
        topUp.paymentDetails = req.body
        await topUp.save()
        console.log("TopUp record updated to failed status")
      }
    }

    // Redirect to failure page
    return res.redirect(`${process.env.FRONTEND_URL}/payment-failed?transaction=${tran_id}`)
  } catch (error) {
    console.error("Error in fail callback:", error)
    return res.redirect(`${process.env.FRONTEND_URL}/payment-failed?reason=server-error`)
  }
})

// Payment cancel route
router.post("/topup/cancel", async (req, res) => {
  try {
    console.log("Payment cancelled callback received:", req.body)
    const { tran_id, value_b } = req.body

    // Update topup record if available
    if (value_b) {
      const topUp = await TopUp.findById(value_b)
      if (topUp) {
        topUp.status = "cancelled"
        topUp.paymentDetails = req.body
        await topUp.save()
        console.log("TopUp record updated to cancelled status")
      }
    }

    // Redirect to cancellation page
    return res.redirect(`${process.env.FRONTEND_URL}/payment-cancelled`)
  } catch (error) {
    console.error("Error in cancel callback:", error)
    return res.redirect(`${process.env.FRONTEND_URL}/payment-failed?reason=server-error`)
  }
})

// IPN (Instant Payment Notification) route
router.post("/topup/ipn", async (req, res) => {
  try {
    console.log("IPN callback received:", req.body)
    const { tran_id, val_id, status, value_a, value_b, amount } = req.body

    // Verify payment with SSLCommerz
    if (status === "VALID") {
      // Find and update the topup record
      const topUp = await TopUp.findById(value_b)
      if (topUp && topUp.status !== "completed") {
        topUp.status = "completed"
        topUp.processedAt = new Date()
        topUp.paymentDetails = req.body
        await topUp.save()
        console.log("TopUp record updated via IPN")

        // Update user balance
        const user = await User.findById(value_a)
        if (user) {
          user.balance += Number.parseFloat(amount)
          await user.save()
          console.log(`User balance updated via IPN. New balance: ${user.balance}`)
        }
      }
    }

    res.status(200).json({ status: "IPN received" })
  } catch (error) {
    console.error("Error in IPN callback:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Transaction query route (for checking status)
router.get("/topup/check/:transactionId", auth, async (req, res) => {
  try {
    const { transactionId } = req.params

    // Check if transaction exists in our database
    const topUp = await TopUp.findOne({ transactionId })
    if (!topUp) {
      return res.status(404).json({ message: "Transaction not found" })
    }

    // Query SSLCommerz for transaction status
    const sslcz = new SSLCommerzPayment(store_id, store_passwd, is_live)
    const data = { tran_id: transactionId }

    const response = await sslcz.transactionQueryByTransactionId(data)
    console.log("Transaction query response:", response)

    return res.status(200).json({
      transaction: topUp,
      sslResponse: response,
    })
  } catch (error) {
    console.error("Error checking transaction:", error)
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

module.exports = router

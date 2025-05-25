"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import { useAuth } from "../context/AuthContext"
import { Wallet, ArrowLeft, CreditCard, AlertCircle } from "lucide-react"

const TopUp = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [amount, setAmount] = useState(200)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [debug, setDebug] = useState({})

  const predefinedAmounts = [200, 500, 1000, 2000, 5000]

  const handleAmountChange = (e) => {
    const value = Number.parseInt(e.target.value)
    if (!isNaN(value)) {
      setAmount(value)
    } else {
      setAmount("")
    }
  }

  const handleSelectAmount = (value) => {
    setAmount(value)
  }

  // Direct initialization method (uses GET instead of POST)
  const handleDirectInit = () => {
    if (!amount || amount < 200) {
      setError("Minimum top-up amount is 200 Tk")
      return
    }

    // Redirect to the direct init URL
    window.location.href = `${process.env.REACT_APP_API_URL}/api/topup/direct-init?amount=${amount}`
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!amount || amount < 200) {
      setError("Minimum top-up amount is 200 Tk")
      return
    }

    setLoading(true)
    setError("")
    setDebug({})

    try {
      const token = localStorage.getItem("token")

      // Debug info
      setDebug((prev) => ({
        ...prev,
        token: token ? "Present" : "Missing",
        amount: amount,
        url: `${process.env.REACT_APP_API_URL}/api/topup/initiate`,
      }))

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }

      console.log("Sending request to:", `${process.env.REACT_APP_API_URL}/api/topup/initiate`)
      console.log("With data:", { amount })
      console.log("And headers:", config.headers)

      const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/topup/initiate`, { amount }, config)

      // Redirect to SSLCommerz payment gateway
      if (response.data.url) {
        window.location.href = response.data.url
      } else {
        setError("Payment initialization failed: No redirect URL received")
        setDebug((prev) => ({ ...prev, response: response.data }))
        setLoading(false)
      }
    } catch (err) {
      console.error("Error details:", err)
      setError(err.response?.data?.message || "Failed to process payment")
      setDebug((prev) => ({
        ...prev,
        error: err.message,
        status: err.response?.status,
        responseData: err.response?.data,
      }))
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <button onClick={() => navigate(-1)} className="flex items-center text-blue-600 hover:text-blue-800 mb-4">
          <ArrowLeft size={18} className="mr-1" />
          Back to Dashboard
        </button>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Top Up Your Account</h1>
        <p className="text-gray-600">Add funds to your account balance using SSLCommerz secure payment</p>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="bg-gradient-to-r from-green-50 to-green-100 px-6 py-4 border-b border-green-200">
          <h2 className="text-xl font-semibold text-green-800 flex items-center">
            <Wallet className="mr-2" size={20} />
            Add Balance
          </h2>
        </div>

        <div className="p-6">
          {/* Current Balance */}
          <div className="bg-blue-50 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="bg-blue-100 p-2 rounded-full mr-3">
                  <Wallet className="text-blue-600" size={18} />
                </div>
                <span className="font-medium">Current Balance</span>
              </div>
              <span className="text-xl font-bold text-blue-600">{user?.balance} Tk</span>
            </div>
          </div>

          {error && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md mb-6 flex items-start">
              <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
              <p>{error}</p>
            </div>
          )}

          {/* Debug Info (only in development) */}
          {Object.keys(debug).length > 0 && (
            <div className="bg-gray-100 p-4 rounded-md mb-6 text-xs font-mono">
              <h3 className="font-bold mb-2">Debug Info:</h3>
              <pre>{JSON.stringify(debug, null, 2)}</pre>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Predefined Amounts */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Select Amount</label>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                {predefinedAmounts.map((value) => (
                  <button
                    key={value}
                    type="button"
                    className={`py-2 px-4 rounded-md border ${
                      amount === value
                        ? "bg-green-100 border-green-500 text-green-700"
                        : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                    }`}
                    onClick={() => handleSelectAmount(value)}
                  >
                    {value} Tk
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Amount */}
            <div className="mb-6">
              <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
                Or Enter Custom Amount (Min. 200 Tk)
              </label>
              <div className="relative">
                <input
                  type="number"
                  id="amount"
                  name="amount"
                  min="200"
                  value={amount}
                  onChange={handleAmountChange}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 py-3 px-4"
                  placeholder="Enter amount"
                  required
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <span className="text-gray-500">Tk</span>
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
              <div className="bg-gray-50 border border-gray-200 rounded-md p-4">
                <div className="flex items-center">
                  <div className="bg-white p-2 rounded-md border border-gray-200 mr-3">
                    <CreditCard className="text-gray-600" size={24} />
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">SSLCommerz Payment Gateway</p>
                    <p className="text-sm text-gray-600">
                      Pay securely with credit/debit card, mobile banking, or internet banking
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Regular Submit Button */}
              <button
                type="submit"
                disabled={loading || !amount || amount < 200}
                className={`flex-1 flex items-center justify-center bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold py-3 px-4 rounded-lg transition-all shadow-md hover:shadow-lg ${
                  loading || !amount || amount < 200 ? "opacity-70 cursor-not-allowed" : ""
                }`}
              >
                {loading ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Processing...
                  </>
                ) : (
                  <>Proceed to Payment ({amount} Tk)</>
                )}
              </button>

              {/* Alternative Direct Init Button */}
              <button
                type="button"
                onClick={handleDirectInit}
                disabled={loading || !amount || amount < 200}
                className={`flex-1 flex items-center justify-center bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-4 rounded-lg transition-all shadow-md hover:shadow-lg ${
                  loading || !amount || amount < 200 ? "opacity-70 cursor-not-allowed" : ""
                }`}
              >
                Try Alternative Method
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Security Notice */}
      <div className="mt-6 bg-gray-50 border border-gray-200 rounded-lg p-4">
        <p className="text-sm text-gray-600 flex items-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 text-gray-500 mr-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            />
          </svg>
          Your payment information is securely processed by SSLCommerz. We do not store your card details.
        </p>
      </div>
    </div>
  )
}

export default TopUp

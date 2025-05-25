"use client"

import { useEffect, useState } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { CheckCircle, ArrowLeft } from "lucide-react"
import axios from "axios"

const PaymentSuccess = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [amount, setAmount] = useState(null)
  const [countdown, setCountdown] = useState(5)
  const [transactionDetails, setTransactionDetails] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get amount and transaction ID from URL query params
    const params = new URLSearchParams(location.search)
    const amountParam = params.get("amount")
    const transactionId = params.get("tran_id")

    if (amountParam) {
      setAmount(amountParam)
    }

    // If we have a transaction ID, fetch transaction details
    if (transactionId) {
      const fetchTransactionDetails = async () => {
        try {
          const token = localStorage.getItem("token")
          const config = {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }

          const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/topup/check/${transactionId}`, config)

          setTransactionDetails(response.data)
        } catch (error) {
          console.error("Error fetching transaction details:", error)
        } finally {
          setLoading(false)
        }
      }

      fetchTransactionDetails()
    } else {
      setLoading(false)
    }

    // Auto redirect countdown
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          navigate("/dashboard")
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [location, navigate])

  return (
    <div className="max-w-3xl mx-auto px-4 py-12 flex flex-col items-center">
      <div className="bg-white rounded-xl shadow-md overflow-hidden w-full max-w-md text-center">
        <div className="bg-green-500 p-8">
          <CheckCircle className="text-white mx-auto" size={80} />
        </div>

        <div className="p-8">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Payment Successful!</h1>

          {amount && (
            <p className="text-lg text-gray-600 mb-2">
              Your account has been topped up with <span className="font-bold text-green-600">{amount} Tk</span>
            </p>
          )}

          <p className="text-gray-600 mb-6">Your balance has been updated and is now available in your account.</p>

          {loading ? (
            <div className="flex justify-center mb-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-500"></div>
            </div>
          ) : transactionDetails ? (
            <div className="bg-gray-50 p-4 rounded-lg mb-6 text-left">
              <h3 className="font-medium text-gray-700 mb-2">Transaction Details</h3>
              <p className="text-sm text-gray-600">
                <span className="font-medium">Transaction ID:</span>{" "}
                {transactionDetails.transaction?.transactionId || "N/A"}
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">Amount:</span> {transactionDetails.transaction?.amount || amount || "N/A"}{" "}
                Tk
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">Status:</span>{" "}
                <span className="text-green-600 font-medium">
                  {transactionDetails.transaction?.status || "Completed"}
                </span>
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">Date:</span>{" "}
                {new Date(transactionDetails.transaction?.createdAt).toLocaleString() || "N/A"}
              </p>
            </div>
          ) : null}

          <div className="flex flex-col gap-3">
            <button
              onClick={() => navigate("/dashboard")}
              className="w-full bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Go to Dashboard
            </button>

            <p className="text-sm text-gray-500">Redirecting to dashboard in {countdown} seconds...</p>
          </div>
        </div>
      </div>

      <button onClick={() => navigate(-1)} className="mt-6 flex items-center text-blue-600 hover:text-blue-800">
        <ArrowLeft size={16} className="mr-1" />
        Back
      </button>
    </div>
  )
}

export default PaymentSuccess

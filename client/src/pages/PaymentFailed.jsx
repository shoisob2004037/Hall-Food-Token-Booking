"use client"

import { useEffect, useState } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { XCircle, ArrowLeft } from "lucide-react"

const PaymentFailed = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [reason, setReason] = useState("Unknown error")
  const [transactionId, setTransactionId] = useState(null)

  useEffect(() => {
    // Get error reason from URL query params
    const params = new URLSearchParams(location.search)
    const reasonParam = params.get("reason")
    const transactionParam = params.get("transaction")

    if (reasonParam) {
      switch (reasonParam) {
        case "validation":
          setReason("Payment validation failed")
          break
        case "topup-not-found":
          setReason("Top-up record not found")
          break
        case "user-not-found":
          setReason("User account not found")
          break
        case "server-error":
          setReason("Server error occurred")
          break
        default:
          setReason(reasonParam)
      }
    }

    if (transactionParam) {
      setTransactionId(transactionParam)
    }
  }, [location])

  return (
    <div className="max-w-3xl mx-auto px-4 py-12 flex flex-col items-center">
      <div className="bg-white rounded-xl shadow-md overflow-hidden w-full max-w-md text-center">
        <div className="bg-red-500 p-8">
          <XCircle className="text-white mx-auto" size={80} />
        </div>

        <div className="p-8">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Payment Failed</h1>

          <p className="text-lg text-gray-600 mb-2">We couldn't process your payment</p>

          <p className="text-gray-600 mb-6">
            Reason: <span className="font-medium">{reason}</span>
            {transactionId && (
              <>
                <br />
                Transaction ID: <span className="font-mono text-sm">{transactionId}</span>
              </>
            )}
          </p>

          <div className="flex flex-col gap-3">
            <button
              onClick={() => navigate("/top-up")}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Try Again
            </button>

            <button
              onClick={() => navigate("/dashboard")}
              className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Return to Dashboard
            </button>
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

export default PaymentFailed

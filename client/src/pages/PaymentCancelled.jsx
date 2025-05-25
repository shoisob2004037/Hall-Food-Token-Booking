"use client"

import { useNavigate } from "react-router-dom"
import { AlertCircle, ArrowLeft } from "lucide-react"

const PaymentCancelled = () => {
  const navigate = useNavigate()

  return (
    <div className="max-w-3xl mx-auto px-4 py-12 flex flex-col items-center">
      <div className="bg-white rounded-xl shadow-md overflow-hidden w-full max-w-md text-center">
        <div className="bg-amber-500 p-8">
          <AlertCircle className="text-white mx-auto" size={80} />
        </div>

        <div className="p-8">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Payment Cancelled</h1>

          <p className="text-lg text-gray-600 mb-2">You've cancelled the payment process</p>

          <p className="text-gray-600 mb-6">No charges have been made to your account.</p>

          <div className="flex flex-col gap-3">
            <button
              onClick={() => navigate("/top-up")}
              className="w-full bg-amber-500 hover:bg-amber-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
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

export default PaymentCancelled

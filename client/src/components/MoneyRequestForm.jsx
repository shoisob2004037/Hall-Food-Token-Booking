"use client"

import { useState, useRef } from "react"
import { DollarSign, FileText, Send, AlertCircle, Upload, CreditCard } from "lucide-react"
import { uploadToCloudinary } from "../utils/cloudinary"

const MoneyRequestForm = ({ onSubmit }) => {
  const [amount, setAmount] = useState("")
  const [paymentMethod, setPaymentMethod] = useState("bkash")
  const [paymentNumber, setPaymentNumber] = useState("")
  const [transactionId, setTransactionId] = useState("")
  const [details, setDetails] = useState("")
  const [paymentPhoto, setPaymentPhoto] = useState(null)
  const [photoPreview, setPhotoPreview] = useState(null)
  const [error, setError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const fileInputRef = useRef(null)

  const handlePhotoChange = (e) => {
    const file = e.target.files[0]
    if (!file) return

    // Check file type
    if (!file.type.includes("image/")) {
      setError("Please upload an image file")
      return
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError("Image size should be less than 5MB")
      return
    }

    setPaymentPhoto(file)

    // Create preview
    const reader = new FileReader()
    reader.onload = () => {
      setPhotoPreview(reader.result)
    }
    reader.readAsDataURL(file)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setUploadProgress(0)

    // Validate input
    if (!amount || isNaN(amount) || Number(amount) <= 0) {
      return setError("Please enter a valid amount")
    }

    if (!paymentMethod) {
      return setError("Please select a payment method")
    }

    if (!paymentNumber) {
      return setError("Please provide the payment number you used")
    }

    if (!transactionId) {
      return setError("Please provide the transaction ID")
    }

    if (!paymentPhoto) {
      return setError("Please upload a payment screenshot")
    }

    if (!details || !details.trim()) {
      return setError("Please provide a reason for your request")
    }

    setIsSubmitting(true)

    try {
      // Upload image to Cloudinary
      setUploadProgress(10)
      const paymentPhotoUrl = await uploadToCloudinary(paymentPhoto, "hall-token-picture")
      setUploadProgress(70)

      // Create the request object matching the schema (excluding user, which is set in UserDashboard)
      const requestData = {
        amount: Number(amount),
        paymentMethod,
        paymentNumber,
        transactionId,
        paymentPhotoUrl,
        details,
        reason: details || "Money request", // Add reason field to match API expectation
      }

      console.log("Submitting money request:", requestData)

      // Pass the data to onSubmit
      await onSubmit(requestData)

      setUploadProgress(100)

      // Reset form on successful submission
      setAmount("")
      setPaymentMethod("bkash")
      setPaymentNumber("")
      setTransactionId("")
      setDetails("")
      setPaymentPhoto(null)
      setPhotoPreview(null)
    } catch (err) {
      setError(err.message || "Failed to submit request")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200 shadow-sm overflow-hidden">
      <div className="bg-blue-600 px-5 py-4">
        <h3 className="text-lg font-semibold text-white flex items-center">
          <DollarSign className="mr-2 h-5 w-5" />
          Request Money
        </h3>
      </div>

      {error && (
        <div className="mx-5 mt-4 bg-red-100 border-l-4 border-red-500 text-red-700 p-3 rounded-md text-sm flex items-start">
          <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="p-5">
        <div className="mb-4">
          <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
            <DollarSign className="h-4 w-4 mr-1 text-blue-500" />
            Amount (Tk)
          </label>
          <div className="relative">
            <input
              type="number"
              id="amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              placeholder="Enter amount"
              min="1"
              required
              disabled={isSubmitting}
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-500 font-medium">Tk</span>
            </div>
          </div>
          <p className="mt-1 text-xs text-gray-500">Enter the amount you wish to request</p>
        </div>

        <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h4 className="font-medium text-yellow-800 mb-2">Payment Instructions</h4>
          <p className="text-sm text-yellow-700 mb-2">
            Please send the payment to <span className="font-bold">01905520598</span> via bKash or Nagad, then provide
            the transaction details below.
          </p>
        </div>

        <div className="mb-4">
          <label htmlFor="paymentMethod" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
            <CreditCard className="h-4 w-4 mr-1 text-blue-500" />
            Payment Method
          </label>
          <div className="grid grid-cols-2 gap-3">
            <div
              className={`border rounded-lg p-3 flex items-center cursor-pointer transition-all ${
                paymentMethod === "bkash" ? "border-pink-500 bg-pink-50" : "border-gray-300 hover:border-gray-400"
              }`}
              onClick={() => setPaymentMethod("bkash")}
            >
              <input
                type="radio"
                id="bkash"
                name="paymentMethod"
                checked={paymentMethod === "bkash"}
                onChange={() => setPaymentMethod("bkash")}
                className="mr-2"
              />
              <label htmlFor="bkash" className="flex items-center cursor-pointer">
                <span className="font-medium text-pink-600">bKash</span>
              </label>
            </div>
            <div
              className={`border rounded-lg p-3 flex items-center cursor-pointer transition-all ${
                paymentMethod === "nagad" ? "border-orange-500 bg-orange-50" : "border-gray-300 hover:border-gray-400"
              }`}
              onClick={() => setPaymentMethod("nagad")}
            >
              <input
                type="radio"
                id="nagad"
                name="paymentMethod"
                checked={paymentMethod === "nagad"}
                onChange={() => setPaymentMethod("nagad")}
                className="mr-2"
              />
              <label htmlFor="nagad" className="flex items-center cursor-pointer">
                <span className="font-medium text-orange-600">Nagad</span>
              </label>
            </div>
          </div>
        </div>

        <div className="mb-4">
          <label htmlFor="paymentNumber" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
            <CreditCard className="h-4 w-4 mr-1 text-blue-500" />
            Payment Number
          </label>
          <input
            type="text"
            id="paymentNumber"
            value={paymentNumber}
            onChange={(e) => setPaymentNumber(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            placeholder="Enter the number you used for payment"
            required
            disabled={isSubmitting}
          />
          <p className="mt-1 text-xs text-gray-500">Enter the phone number you used to make the payment</p>
        </div>

        <div className="mb-4">
          <label htmlFor="transactionId" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
            <FileText className="h-4 w-4 mr-1 text-blue-500" />
            Transaction ID
          </label>
          <input
            type="text"
            id="transactionId"
            value={transactionId}
            onChange={(e) => setTransactionId(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            placeholder="Enter transaction ID"
            required
            disabled={isSubmitting}
          />
          <p className="mt-1 text-xs text-gray-500">Enter the transaction ID from your payment confirmation</p>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
            <Upload className="h-4 w-4 mr-1 text-blue-500" />
            Payment Screenshot
          </label>
          <div
            className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:bg-gray-50 transition-colors"
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handlePhotoChange}
              accept="image/*"
              className="hidden"
              disabled={isSubmitting}
            />

            {photoPreview ? (
              <div className="relative">
                <img
                  src={photoPreview || "/placeholder.svg"}
                  alt="Payment screenshot preview"
                  className="max-h-48 mx-auto rounded-md"
                />
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    setPaymentPhoto(null)
                    setPhotoPreview(null)
                  }}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                  disabled={isSubmitting}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path
                      fillRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>
            ) : (
              <div className="py-4">
                <Upload className="mx-auto h-10 w-10 text-gray-400 mb-2" />
                <p className="text-sm text-gray-500">Click to upload a screenshot of your payment</p>
                <p className="text-xs text-gray-400 mt-1">JPG, PNG or GIF files only</p>
              </div>
            )}
          </div>
          <p className="mt-1 text-xs text-gray-500">Upload a screenshot of your payment confirmation</p>
        </div>

        <div className="mb-5">
          <label htmlFor="details" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
            <FileText className="h-4 w-4 mr-1 text-blue-500" />
            Additional Details
          </label>
          <textarea
            id="details"
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            placeholder="Any additional information about your request"
            rows="3"
            disabled={isSubmitting}
          ></textarea>
          <p className="mt-1 text-xs text-gray-500">Optional: Provide any additional details about your request</p>
        </div>

        {isSubmitting && uploadProgress > 0 && (
          <div className="mb-4">
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-500 mt-1 text-right">
              {uploadProgress < 100 ? "Uploading..." : "Upload complete!"}
            </p>
          </div>
        )}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium py-2.5 px-5 rounded-lg shadow-sm hover:shadow transition-all flex items-center disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Submitting...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Submit Request
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}

export default MoneyRequestForm

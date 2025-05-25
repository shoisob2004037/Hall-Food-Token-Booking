"use client"

import { useState, useEffect } from "react"
import { useNavigate, Link } from "react-router-dom"
import axios from "axios"
import { useAuth } from "../context/AuthContext"
import {
  Calendar,
  Coffee,
  UtensilsCrossed,
  ArrowLeft,
  ShoppingCart,
  Wallet,
  AlertCircle,
  CheckCircle,
} from "lucide-react"

const BuyToken = () => {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [nextDay, setNextDay] = useState("")
  const [formattedDate, setFormattedDate] = useState("")
  const [lunchSelected, setLunchSelected] = useState(true)
  const [dinnerSelected, setDinnerSelected] = useState(true)
  const [totalPrice, setTotalPrice] = useState(80) // Default: both meals selected (40 + 40)
  const navigate = useNavigate()
  const isAdmin = user?.isAdmin

  useEffect(() => {
    // Calculate next day date in YYYY-MM-DD format
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(0, 0, 0, 0) // Reset time part to avoid timezone issues

    // Format as YYYY-MM-DD for API
    const year = tomorrow.getFullYear()
    const month = String(tomorrow.getMonth() + 1).padStart(2, "0")
    const day = String(tomorrow.getDate()).padStart(2, "0")
    const formattedDateForApi = `${year}-${month}-${day}`

    // Format for display
    const displayDate = tomorrow.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })

    setNextDay(formattedDateForApi)
    setFormattedDate(displayDate)

    // Calculate total price based on selected meals
    let price = 0
    if (lunchSelected) price += 40
    if (dinnerSelected) price += 40
    setTotalPrice(price)
  }, [lunchSelected, dinnerSelected])

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (isAdmin) {
      return setError("Administrators cannot purchase tokens.")
    }

    if (!lunchSelected && !dinnerSelected) {
      return setError("Please select at least one meal")
    }

    if (user.balance < totalPrice) {
      return setError("Insufficient balance. Please add funds to your account.")
    }

    setLoading(true)
    setError("")
    setSuccess("")

    try {
      const token = localStorage.getItem("token")
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }

      const res = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/tokens/buy`,
        {
          date: nextDay,
          lunch: lunchSelected,
          dinner: dinnerSelected,
        },
        config,
      )

      setSuccess("Token purchased successfully!")
      setTimeout(() => {
        navigate(`/token/${res.data._id}`)
      }, 1500)
    } catch (err) {
      setError(err.response?.data?.message || "Failed to purchase token. Please try again.")
      console.error(err)
    }

    setLoading(false)
  }

  const insufficientBalance = user?.balance < totalPrice

  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 px-6 py-4">
          <h2 className="text-2xl font-bold text-white flex items-center">
            <ShoppingCart className="mr-2" size={24} />
            Buy Food Token
          </h2>
          <p className="text-blue-100 text-sm">Purchase your meal token for tomorrow</p>
        </div>

        <div className="px-6 py-8">
          {isAdmin && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md mb-6 animate-fadeIn">
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 mr-2" />
                <p>Administrators cannot purchase tokens.</p>
              </div>
            </div>
          )}

          {error && !isAdmin && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md mb-6 animate-fadeIn">
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 mr-2" />
                <p>{error}</p>
              </div>
            </div>
          )}

          {success && (
            <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded-md mb-6 animate-fadeIn">
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 mr-2" />
                <p>{success}</p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-5 shadow-sm">
              <div className="flex items-center mb-3">
                <Wallet className="text-blue-600 mr-2" size={20} />
                <h3 className="text-lg font-semibold text-gray-800">Your Balance</h3>
              </div>
              <p className={`text-3xl font-bold ${insufficientBalance ? "text-red-600" : "text-green-600"}`}>
                {user?.balance} Tk
              </p>
              {insufficientBalance && !isAdmin && (
                <p className="text-xs text-red-600 mt-1">Insufficient balance for selected meals</p>
              )}
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-5 shadow-sm">
              <div className="flex items-center mb-3">
                <Calendar className="text-purple-600 mr-2" size={20} />
                <h3 className="text-lg font-semibold text-gray-800">Token Date</h3>
              </div>
              <p className="text-xl font-bold text-purple-600">{formattedDate}</p>
              <p className="text-xs text-purple-600 mt-1">Tokens can only be purchased for tomorrow</p>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label className="block text-gray-700 font-medium mb-3">Select Your Meals</label>

              <div className="space-y-4">
                <div
                  className={`flex items-center p-4 rounded-xl border-2 transition-colors ${
                    lunchSelected && !isAdmin
                      ? "border-amber-300 bg-amber-50 shadow-sm"
                      : "border-gray-200 hover:border-gray-300"
                  } ${isAdmin ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  <input
                    type="checkbox"
                    id="lunch"
                    checked={lunchSelected}
                    onChange={() => !isAdmin && setLunchSelected(!lunchSelected)}
                    className="w-5 h-5 text-amber-500 rounded focus:ring-amber-500 disabled:opacity-50"
                    disabled={isAdmin}
                  />
                  <label
                    htmlFor="lunch"
                    className={`ml-3 flex justify-between w-full ${isAdmin ? "cursor-not-allowed" : "cursor-pointer"}`}
                  >
                    <div className="flex items-center">
                      <Coffee
                        className={`mr-2 ${lunchSelected && !isAdmin ? "text-amber-600" : "text-gray-400"}`}
                        size={20}
                      />
                      <span className="font-medium">Lunch</span>
                    </div>
                    <span className={`font-bold ${lunchSelected && !isAdmin ? "text-amber-600" : "text-gray-500"}`}>
                      40 Tk
                    </span>
                  </label>
                </div>

                <div
                  className={`flex items-center p-4 rounded-xl border-2 transition-colors ${
                    dinnerSelected && !isAdmin
                      ? "border-indigo-300 bg-indigo-50 shadow-sm"
                      : "border-gray-200 hover:border-gray-300"
                  } ${isAdmin ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  <input
                    type="checkbox"
                    id="dinner"
                    checked={dinnerSelected}
                    onChange={() => !isAdmin && setDinnerSelected(!dinnerSelected)}
                    className="w-5 h-5 text-indigo-500 rounded focus:ring-indigo-500 disabled:opacity-50"
                    disabled={isAdmin}
                  />
                  <label
                    htmlFor="dinner"
                    className={`ml-3 flex justify-between w-full ${isAdmin ? "cursor-not-allowed" : "cursor-pointer"}`}
                  >
                    <div className="flex items-center">
                      <UtensilsCrossed
                        className={`mr-2 ${dinnerSelected && !isAdmin ? "text-indigo-600" : "text-gray-400"}`}
                        size={20}
                      />
                      <span className="font-medium">Dinner</span>
                    </div>
                    <span className={`font-bold ${dinnerSelected && !isAdmin ? "text-indigo-600" : "text-gray-500"}`}>
                      40 Tk
                    </span>
                  </label>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-green-50 to-green-100 p-5 rounded-xl mb-6">
              <div className="flex justify-between items-center">
                <span className="font-bold text-lg text-gray-800">Total Amount:</span>
                <span className="font-bold text-2xl text-green-600">{totalPrice} Tk</span>
              </div>
            </div>

            <div className="flex flex-col space-y-4">
              <button
                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold py-3 px-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                type="submit"
                disabled={loading || (!lunchSelected && !dinnerSelected) || insufficientBalance || isAdmin}
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg
                      className="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
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
                  </span>
                ) : (
                  <span className="flex items-center justify-center">
                    <ShoppingCart className="mr-2" size={20} />
                    Confirm Purchase
                  </span>
                )}
              </button>

              <Link
                to={isAdmin ? "/admin" : "/dashboard"}
                className="text-blue-600 hover:text-blue-800 text-center flex items-center justify-center"
              >
                <ArrowLeft className="mr-1" size={16} />
                Back to {isAdmin ? "Admin" : "Dashboard"}
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default BuyToken
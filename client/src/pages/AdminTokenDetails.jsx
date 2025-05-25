"use client"

import { useState, useEffect, useRef } from "react"
import { useParams, Link } from "react-router-dom"
import axios from "axios"
import { useReactToPrint } from "react-to-print"
import { useAuth } from "../context/AuthContext"
import { Calendar, Printer, ArrowLeft, Check, X, Coffee, UtensilsCrossed } from "lucide-react"

const AdminTokenDetails = () => {
  const { id } = useParams()
  const { user } = useAuth()
  const [token, setToken] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const printRef = useRef()

  useEffect(() => {
    const fetchTokenDetails = async () => {
      try {
        const authToken = localStorage.getItem("token")
        if (!authToken) {
          throw new Error("Please log in to view token details")
        }

        const config = {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }

        const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/tokens/${id}`, config)
        setToken(res.data)
        setLoading(false)
      } catch (err) {
        setError(err.response?.data?.message || "Failed to fetch token details")
        setLoading(false)
        console.error("Fetch error:", err)
      }
    }

    fetchTokenDetails()
  }, [id])

  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    documentTitle: `Food Token - ${token?.date}`,
  })

  const handleMarkAsUsed = async () => {
    try {
      const authToken = localStorage.getItem("token")
      const config = {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      }

      await axios.put(
        `${process.env.REACT_APP_API_URL}/api/tokens/${id}/mark-used`,
        {},
        config
      )
      setToken((prev) => ({ ...prev, status: "used" }))
      alert("Token marked as used")
    } catch (err) {
      console.error("Mark as used error:", err)
      alert("Failed to mark token as used")
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-gray-600">Loading token details...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="p-6">
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md mb-4">
            <div className="flex items-center">
              <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              <p>{error}</p>
            </div>
          </div>
          <Link to="/admin/tokens" className="flex items-center text-blue-600 hover:text-blue-800 font-medium">
            <ArrowLeft className="mr-1" size={16} />
            Back to All Tokens
          </Link>
        </div>
      </div>
    )
  }

  if (!token) {
    return (
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="p-6">
          <div className="text-center py-6">
            <div className="bg-gray-100 rounded-full p-3 inline-block mb-3">
              <Calendar className="text-gray-500" size={24} />
            </div>
            <p className="text-gray-700 mb-4">Token not found</p>
            <Link
              to="/admin/tokens"
              className="flex items-center justify-center text-blue-600 hover:text-blue-800 font-medium"
            >
              <ArrowLeft className="mr-1" size={16} />
              Back to All Tokens
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // Format date
  const tokenDate = new Date(token.date)
  const formattedDate = tokenDate.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  // Check if token is for today, tomorrow, or past
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  const tokenDay = new Date(token.date)
  tokenDay.setHours(0, 0, 0, 0)

  let statusColor = "bg-gray-100 text-gray-800 border-gray-300"
  let statusText = "Upcoming"

  if (tokenDay.getTime() === today.getTime()) {
    statusColor = "bg-green-100 text-green-800 border-green-300"
    statusText = "Today"
  } else if (tokenDay.getTime() === tomorrow.getTime()) {
    statusColor = "bg-blue-100 text-blue-800 border-blue-300"
    statusText = "Tomorrow"
  } else if (tokenDay < today) {
    statusColor = "bg-gray-100 text-gray-500 border-gray-300"
    statusText = "Past"
  } else {
    statusColor = "bg-purple-100 text-purple-800 border-purple-300"
    statusText = "Upcoming"
  }

  return (
    <div className="max-w-md mx-auto">
      <div className="bg-white shadow-lg rounded-xl overflow-hidden mb-6">
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 px-6 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-white flex items-center">
            <Calendar className="mr-2" size={20} />
            Token Details
          </h1>
          <div className="flex space-x-3">
            <button
              onClick={handlePrint}
              className="bg-white text-blue-600 hover:bg-blue-50 font-medium py-2 px-4 rounded-lg flex items-center transition-colors"
            >
              <Printer className="mr-1" size={16} />
              Print Token
            </button>
            {token.status === "active" && (
              <button
                onClick={handleMarkAsUsed}
                className="bg-red-600 text-white hover:bg-red-700 font-medium py-2 px-4 rounded-lg flex items-center transition-colors"
              >
                Mark as Used
              </button>
            )}
          </div>
        </div>

        <div className="p-6">
          <div ref={printRef} className="border-2 border-dashed rounded-xl overflow-hidden shadow-sm print:shadow-none">
            {/* Token Header */}
            <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-4">
              <div className="text-center">
                <h2 className="text-xl font-bold">বঙ্গবন্ধু শেখ মুজিবুর রহমান হল, রুয়েট</h2>
                <p className="text-sm opacity-90 mt-1">Food Token System</p>
              </div>
            </div>

            {/* Token Status */}
            <div className="bg-white px-4 py-2 flex justify-between items-center border-b border-gray-200">
              <div className="flex items-center">
                <Calendar className="text-gray-500 mr-2" size={16} />
                <span className="text-gray-700">{formattedDate}</span>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColor}`}>
                {statusText}
              </span>
            </div>

            {/* Token Content */}
            <div className="bg-white p-6">
              {/* User Info */}
              <div className="bg-blue-50 rounded-lg p-4 mb-5">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Student Name</p>
                    <p className="font-medium text-gray-800">{token.user?.name || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Student ID</p>
                    <p className="font-medium text-gray-800">{token.user?.studentId || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Email</p>
                    <p className="font-medium text-gray-800">{token.user?.email || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Department</p>
                    <p className="font-medium text-gray-800">{token.user?.department || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Phone</p>
                    <p className="font-medium text-gray-800">{token.user?.phone || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Token ID</p>
                    <p className="text-sm text-gray-600 font-mono">{token._id.substring(0, 10)}...</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Issue Date</p>
                    <p className="text-sm text-gray-600">{new Date(token.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>

              {/* Meals */}
              <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
                <UtensilsCrossed className="mr-2" size={18} />
                Meal Details
              </h3>
              <div className="space-y-3 mb-5">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center">
                    <Coffee className="mr-2 text-amber-600" size={18} />
                    <span className="font-medium">Lunch</span>
                  </div>
                  <div className="flex items-center">
                    <span className="font-bold mr-2">{token.lunch ? "40 Tk" : "0 Tk"}</span>
                    {token.lunch ? (
                      <span className="bg-green-100 text-green-800 p-1 rounded-full">
                        <Check size={16} />
                      </span>
                    ) : (
                      <span className="bg-red-100 text-red-800 p-1 rounded-full">
                        <X size={16} />
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center">
                    <UtensilsCrossed className="mr-2 text-indigo-600" size={18} />
                    <span className="font-medium">Dinner</span>
                  </div>
                  <div className="flex items-center">
                    <span className="font-bold mr-2">{token.dinner ? "40 Tk" : "0 Tk"}</span>
                    {token.dinner ? (
                      <span className="bg-green-100 text-green-800 p-1 rounded-full">
                        <Check size={16} />
                      </span>
                    ) : (
                      <span className="bg-red-100 text-red-800 p-1 rounded-full">
                        <X size={16} />
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Total */}
              <div className="border-t border-gray-200 pt-4 mt-4">
                <div className="flex justify-between items-center bg-green-50 p-3 rounded-lg">
                  <span className="font-bold text-gray-800">Total Amount:</span>
                  <span className="font-bold text-green-700 text-xl">
                    {(token.lunch ? 40 : 0) + (token.dinner ? 40 : 0)} Tk
                  </span>
                </div>
              </div>

              {/* Footer */}
              <div className="mt-6 text-center">
                <div className="border-t border-b border-gray-200 py-3 mb-3">
                  <p className="text-sm text-gray-600">Please present this token to the cafeteria staff</p>
                  <p className="text-sm text-gray-600">Valid only for {formattedDate}</p>
                </div>
                <div className="flex justify-center">
                  <svg className="h-16 w-32" viewBox="0 0 100 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="5" y="5" width="2" height="30" fill="black" />
                    <rect x="10" y="5" width="1" height="30" fill="black" />
                    <rect x="14" y="5" width="3" height="30" fill="black" />
                    <rect x="20" y="5" width="2" height="30" fill="black" />
                    <rect x="25" y="5" width="4" height="30" fill="black" />
                    <rect x="32" y="5" width="1" height="30" fill="black" />
                    <rect x="36" y="5" width="3" height="30" fill="black" />
                    <rect x="42" y="5" width="2" height="30" fill="black" />
                    <rect x="48" y="5" width="1" height="30" fill="black" />
                    <rect x="52" y="5" width="4" height="30" fill="black" />
                    <rect x="60" y="5" width="2" height="30" fill="black" />
                    <rect x="65" y="5" width="1" height="30" fill="black" />
                    <rect x="70" y="5" width="3" height="30" fill="black" />
                    <rect x="76" y="5" width="2" height="30" fill="black" />
                    <rect x="82" y="5" width="1" height="30" fill="black" />
                    <rect x="86" y="5" width="3" height="30" fill="black" />
                    <rect x="92" y="5" width="2" height="30" fill="black" />
                  </svg>
                </div>
                <p className="text-xs text-gray-500 mt-1">{token._id}</p>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <Link to="/admin" className="flex items-center text-blue-600 hover:text-blue-800 font-medium">
              <ArrowLeft className="mr-1" size={16} />
              Back to All Tokens
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminTokenDetails
"use client"

import { useState } from "react"
import { Calendar, DollarSign, CheckCircle, XCircle, User, Clock, FileText, CreditCard, Eye } from "lucide-react"

const MoneyRequestList = ({ requests, isAdmin = false, onProcess }) => {
  const [expandedRequest, setExpandedRequest] = useState(null)
  const [viewingImage, setViewingImage] = useState(null)

  // Function to format date
  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  // Function to get status badge color and icon
  const getStatusBadge = (status) => {
    switch (status) {
      case "approved":
        return {
          className: "bg-green-100 text-green-800 border-green-200",
          icon: <CheckCircle className="w-3.5 h-3.5 mr-1" />,
        }
      case "rejected":
        return {
          className: "bg-red-100 text-red-800 border-red-200",
          icon: <XCircle className="w-3.5 h-3.5 mr-1" />,
        }
      default:
        return {
          className: "bg-amber-100 text-amber-800 border-amber-200",
          icon: <Clock className="w-3.5 h-3.5 mr-1" />,
        }
    }
  }

  // Toggle expanded view for mobile
  const toggleExpand = (id) => {
    if (expandedRequest === id) {
      setExpandedRequest(null)
    } else {
      setExpandedRequest(id)
    }
  }

  // Open image in full screen modal
  const openImageModal = (imageUrl, e) => {
    if (e) e.stopPropagation()
    setViewingImage(imageUrl)
  }

  // Close image modal
  const closeImageModal = () => {
    setViewingImage(null)
  }

  if (requests.length === 0) {
    return (
      <div className="bg-gray-50 rounded-lg border border-gray-200 p-8 text-center">
        <div className="bg-gray-100 rounded-full p-3 inline-block mb-4">
          <DollarSign className="h-6 w-6 text-gray-500" />
        </div>
        <h3 className="text-gray-700 font-medium mb-1">No Money Requests</h3>
        <p className="text-gray-500 text-sm">There are no money requests to display.</p>
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 shadow-sm">
      {/* Desktop view */}
      <div className="hidden md:block overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr className="bg-gray-50">
              <th className="py-3 px-4 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-1 text-gray-400" />
                  Date
                </div>
              </th>
              {isAdmin && (
                <th className="py-3 px-4 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <div className="flex items-center">
                    <User className="w-4 h-4 mr-1 text-gray-400" />
                    User
                  </div>
                </th>
              )}
              <th className="py-3 px-4 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <div className="flex items-center">
                  <DollarSign className="w-4 h-4 mr-1 text-gray-400" />
                  Amount
                </div>
              </th>
              <th className="py-3 px-4 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <div className="flex items-center">
                  <CreditCard className="w-4 h-4 mr-1 text-gray-400" />
                  Payment Info
                </div>
              </th>
              <th className="py-3 px-4 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <div className="flex items-center">
                  <FileText className="w-4 h-4 mr-1 text-gray-400" />
                  Details
                </div>
              </th>
              <th className="py-3 px-4 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="py-3 px-4 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Payment Proof
              </th>
              {isAdmin && (
                <th className="py-3 px-4 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {requests.map((request) => {
              if (!request || !request._id) return null
              const { className: badgeClass, icon: badgeIcon } = getStatusBadge(request.status || "pending")
              return (
                <tr key={request._id} className="hover:bg-gray-50 transition-colors">
                  <td className="py-3.5 px-4 text-sm text-gray-600">
                    <div className="font-medium">{formatDate(request.createdAt)}</div>
                  </td>
                  {isAdmin && (
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-gray-800">{request.user?.name || "Unknown User"}</div>
                      <div className="text-gray-500 text-xs">{request.user?.studentId || "No ID"}</div>
                    </td>
                  )}
                  <td className="py-3.5 px-4">
                    <div className="font-medium text-gray-900">{request.amount} Tk</div>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="text-sm">
                      <div className="font-medium text-gray-800 capitalize">{request.paymentMethod}</div>
                      <div className="text-gray-500 text-xs">Number: {request.paymentNumber}</div>
                      <div className="text-gray-500 text-xs">TrxID: {request.transactionId}</div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="text-sm text-gray-700 max-w-xs truncate">{request.details}</div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${badgeClass}`}
                    >
                      {badgeIcon}
                      {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    {request.paymentPhotoUrl ? (
                      <button
                        onClick={(e) => openImageModal(request.paymentPhotoUrl, e)}
                        className="inline-flex items-center text-blue-600 hover:text-blue-800"
                      >
                        <div className="relative w-10 h-10 mr-2 rounded-md overflow-hidden border border-gray-200">
                          <img
                            src={request.paymentPhotoUrl || "/placeholder.svg"}
                            alt="Payment proof"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <Eye className="h-4 w-4" />
                      </button>
                    ) : (
                      <span className="text-gray-400 text-sm">No image</span>
                    )}
                  </td>
                  {isAdmin && (
                    <td className="py-3.5 px-4">
                      {request.status === "pending" ? (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => onProcess(request._id, "approved")}
                            className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-3 py-1.5 rounded-md text-xs font-medium shadow-sm hover:shadow transition-all flex items-center"
                          >
                            <CheckCircle className="w-3.5 h-3.5 mr-1" />
                            Approve
                          </button>
                          <button
                            onClick={() => onProcess(request._id, "rejected")}
                            className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-3 py-1.5 rounded-md text-xs font-medium shadow-sm hover:shadow transition-all flex items-center"
                          >
                            <XCircle className="w-3.5 h-3.5 mr-1" />
                            Reject
                          </button>
                        </div>
                      ) : (
                        <div className="text-gray-400 text-sm">Processed</div>
                      )}
                    </td>
                  )}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile view */}
      <div className="md:hidden">
        <ul className="divide-y divide-gray-200">
          {requests.map((request) => {
            if (!request || !request._id) return null
            const { className: badgeClass, icon: badgeIcon } = getStatusBadge(request.status || "pending")
            const isExpanded = expandedRequest === request._id

            return (
              <li key={request._id} className="p-4 hover:bg-gray-50">
                <div
                  className="flex justify-between items-start cursor-pointer"
                  onClick={() => toggleExpand(request._id)}
                >
                  <div>
                    <div className="flex items-center mb-1">
                      <DollarSign className="w-4 h-4 mr-1 text-gray-500" />
                      <span className="font-medium text-gray-900">{request.amount} Tk</span>
                    </div>
                    <div className="text-xs text-gray-500 mb-1">{formatDate(request.createdAt)}</div>
                    {isAdmin && (
                      <div className="text-sm font-medium text-gray-700">{request.user?.name || "Unknown User"}</div>
                    )}
                  </div>
                  <span
                    className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${badgeClass}`}
                  >
                    {badgeIcon}
                    {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                  </span>
                </div>

                {isExpanded && (
                  <div className="mt-3 pt-3 border-t border-gray-100 animate-fadeIn">
                    <div className="mb-3">
                      <div className="text-xs text-gray-500 mb-1">Payment Method:</div>
                      <div className="text-sm text-gray-700 capitalize">{request.paymentMethod}</div>
                    </div>
                    <div className="mb-3">
                      <div className="text-xs text-gray-500 mb-1">Payment Number:</div>
                      <div className="text-sm text-gray-700">{request.paymentNumber}</div>
                    </div>
                    <div className="mb-3">
                      <div className="text-xs text-gray-500 mb-1">Transaction ID:</div>
                      <div className="text-sm text-gray-700">{request.transactionId}</div>
                    </div>
                    <div className="mb-3">
                      <div className="text-xs text-gray-500 mb-1">Details:</div>
                      <div className="text-sm text-gray-700">{request.details}</div>
                    </div>
                    <div className="mb-3">
                      <div className="text-xs text-gray-500 mb-1">Payment Screenshot:</div>
                      {request.paymentPhotoUrl ? (
                        <button
                          onClick={(e) => openImageModal(request.paymentPhotoUrl, e)}
                          className="flex items-center text-blue-600 hover:text-blue-800"
                        >
                          <div className="relative w-16 h-16 mr-2 rounded-md overflow-hidden border border-gray-200">
                            <img
                              src={request.paymentPhotoUrl || "/placeholder.svg"}
                              alt="Payment proof"
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <span className="text-sm">View Image</span>
                        </button>
                      ) : (
                        <span className="text-gray-400 text-sm">No image</span>
                      )}
                    </div>

                    {isAdmin && request.status === "pending" && (
                      <div className="flex space-x-2 mt-3">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            onProcess(request._id, "approved")
                          }}
                          className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-3 py-1.5 rounded-md text-xs font-medium shadow-sm hover:shadow transition-all flex items-center flex-1 justify-center"
                        >
                          <CheckCircle className="w-3.5 h-3.5 mr-1" />
                          Approve
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            onProcess(request._id, "rejected")
                          }}
                          className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-3 py-1.5 rounded-md text-xs font-medium shadow-sm hover:shadow transition-all flex items-center flex-1 justify-center"
                        >
                          <XCircle className="w-3.5 h-3.5 mr-1" />
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </li>
            )
          })}
        </ul>
      </div>

      {/* Image Modal */}
      {viewingImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
          onClick={closeImageModal}
        >
          <div className="relative max-w-3xl max-h-[90vh] w-full">
            <button
              className="absolute top-2 right-2 bg-black bg-opacity-50 text-white rounded-full p-2 hover:bg-opacity-70"
              onClick={closeImageModal}
            >
              <XCircle className="h-6 w-6" />
            </button>
            <img
              src={viewingImage || "/placeholder.svg"}
              alt="Payment proof"
              className="max-h-[90vh] max-w-full object-contain mx-auto rounded-lg"
            />
          </div>
        </div>
      )}
    </div>
  )
}

export default MoneyRequestList

"use client";

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import TokenCard from "../components/TokenCard";
import MoneyRequestForm from "../components/MoneyRequestForm";
import MoneyRequestList from "../components/MoneyRequestList";
import {
  User,
  Wallet,
  CreditCard,
  RefreshCw,
  PlusCircle,
  Clock,
  AlertCircle,
  Settings,
} from "lucide-react";

const UserDashboard = () => {
  const { user } = useAuth();
  const [tokens, setTokens] = useState([]);
  const [moneyRequests, setMoneyRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const isAdmin = user?.isAdmin;

  useEffect(() => {
    fetchData();
  }, [isAdmin]);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      const apiUrl = process.env.REACT_APP_API_URL || "http://localhost:4000";
      const [tokensRes, requestsRes] = await Promise.all([
        axios.get(`${apiUrl}/api/tokens/user`, config),
        !isAdmin
          ? axios.get(`${apiUrl}/api/money-requests/user`, config)
          : Promise.resolve({ data: [] }),
      ]);

      setTokens(tokensRes.data);
      setMoneyRequests(requestsRes.data);
      setLoading(false);
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || err.message || "Failed to fetch data";
      setError(errorMessage);
      setLoading(false);
      console.error("Fetch data error:", err.response?.data || err);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setTimeout(() => setRefreshing(false), 500);
  };

  const handleRequestSubmit = async (requestData) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      };

      // Validate required fields before sending
      const requiredFields = [
        "amount",
        "paymentMethod",
        "paymentNumber",
        "transactionId",
        "paymentPhotoUrl",
      ];
      const missingFields = requiredFields.filter(
        (field) => !requestData[field]
      );
      if (missingFields.length > 0) {
        throw new Error(`Missing required fields: ${missingFields.join(", ")}`);
      }

      const updatedRequestData = {
        ...requestData,
        user: user._id, // Dynamically set the user ID from AuthContext
      };

      // Log the data being sent for debugging
      console.log("Submitting money request:", updatedRequestData);

      const apiUrl = process.env.REACT_APP_API_URL || "http://localhost:4000";
      const res = await axios.post(
        `${apiUrl}/api/money-requests`,
        updatedRequestData,
        config
      );

      setMoneyRequests([res.data.request, ...moneyRequests]);
      setShowRequestForm(false);
      setError("");
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Failed to submit request";
      setError(errorMessage);
      console.error(
        "Error submitting money request:",
        err.response?.data || err
      );
      throw err; // Re-throw the error to let MoneyRequestForm handle it
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-gray-600">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  // Count pending requests
  const pendingRequests = moneyRequests.filter(
    (req) => req.status === "pending"
  ).length;

  // Get today's and tomorrow's tokens
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const todayTokens = tokens.filter((token) => {
    const tokenDate = new Date(token.date);
    tokenDate.setHours(0, 0, 0, 0);
    return tokenDate.getTime() === today.getTime();
  });

  const tomorrowTokens = tokens.filter((token) => {
    const tokenDate = new Date(token.date);
    tokenDate.setHours(0, 0, 0, 0);
    return tokenDate.getTime() === tomorrow.getTime();
  });

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl shadow-lg p-6 mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              {!isAdmin ? "User Dashboard" : "Admin Information & Balance"}
            </h1>
            <p className="text-blue-100">Manage your food tokens and balance</p>
          </div>
          <div className="flex items-center">
            <button
              onClick={handleRefresh}
              className="bg-white text-blue-600 hover:bg-blue-50 rounded-full p-2 transition-all"
              title="Refresh Data"
              disabled={refreshing}
            >
              <RefreshCw
                size={20}
                className={refreshing ? "animate-spin" : ""}
              />
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md mb-6 animate-fadeIn">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 mr-2" />
            <p>{error}</p>
          </div>
        </div>
      )}

      {/* User Info and Balance Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 px-6 py-4 border-b border-blue-200">
              <h2 className="text-xl font-semibold text-blue-800 flex items-center">
                <User className="mr-2" size={20} />
                {!isAdmin ? "User Information" : "Admin Information"}
              </h2>
            </div>
            <div className="p-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div className="mb-4 md:mb-0">
                  <div className="flex items-center mb-3">
                    <div className="bg-blue-100 p-2 rounded-full mr-3">
                      <User className="text-blue-600" size={24} />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-800">
                        {user?.name}
                      </h3>
                      {isAdmin && (
                        <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                          Administrator
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="ml-12 space-y-1">
                    <p className="text-gray-600 flex items-center">
                      <span className="w-24 text-sm text-gray-500">
                        {isAdmin ? "Admin ID:" : "Student ID:"}
                      </span>
                      <span className="font-medium">{user?.studentId}</span>
                    </p>
                    <p className="text-gray-600 flex items-center">
                      <span className="w-24 text-sm text-gray-500">Email:</span>
                      <span className="font-medium">{user?.email}</span>
                    </p>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-green-100 p-5 rounded-xl shadow-sm">
                  <div className="flex items-center mb-2">
                    <Wallet className="text-green-600 mr-2" size={20} />
                    <h3 className="text-lg font-semibold text-gray-800">
                      Account Balance
                    </h3>
                  </div>
                  <p className="text-3xl font-bold text-green-600 mb-2">
                    {user?.balance} Tk
                  </p>
                  {!isAdmin && (
                    <div className="flex space-x-3">
                      <button
                        onClick={() => setShowRequestForm(!showRequestForm)}
                        className={`text-sm flex items-center ${
                          showRequestForm
                            ? "text-red-600 hover:text-red-800"
                            : "text-blue-600 hover:text-blue-800"
                        }`}
                      >
                        {showRequestForm ? (
                          <>
                            <span className="mr-1">Cancel Request</span>
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                              />
                            </svg>
                          </>
                        ) : (
                          <>
                            <span className="mr-1">Request Money</span>
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                              />
                            </svg>
                          </>
                        )}
                      </button>
                      <Link
                        to="/top-up"
                        className="text-sm flex items-center text-green-600 hover:text-green-800"
                      >
                        <button className="mr-1">Top Up</button>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 4v16m8-8H4"
                          />
                        </svg>
                      </Link>
                    </div>
                  )}
                </div>
              </div>

              {showRequestForm && !isAdmin && (
                <div className="mt-6 animate-fadeIn">
                  <MoneyRequestForm onSubmit={handleRequestSubmit} />
                </div>
              )}
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-md overflow-hidden mt-6">
            <div className="bg-gradient-to-r from-teal-50 to-teal-100 px-6 py-4 border-b border-teal-200 flex items-center">
              <Wallet className="mr-2 text-teal-600" size={20} />
              <h2 className="text-xl font-semibold text-teal-800">
                Transfer Information
              </h2>
            </div>
            <div className="p-6 flex items-center space-x-4">
              <div className="bg-teal-100 p-2 rounded-full">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-teal-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2m-4-2V6m-2 2H7a2 2 0 00-2 2v6a2 2 0 002 2h2"
                  />
                </svg>
              </div>
              <p className="text-gray-600">
                From this account balance, you can transfer money to any users
                or after users' requests.
              </p>
            </div>
            <Link
              to="/admin"
              className="flex justify-center items-center w-full mx-5 my-3 bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white font-bold py-3 px-4 rounded-lg transition-all shadow-md hover:shadow-lg w-full md:w-auto"
            >
              <Settings className="mr-2 pt-5 flex justify-center" size={18} />
              Go to Admin Dashboard
            </Link>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-md overflow-hidden h-full">
            <div className="bg-gradient-to-r from-purple-50 to-purple-100 px-6 py-4 border-b border-purple-200">
              <h2 className="text-xl font-semibold text-purple-800 flex items-center">
                <CreditCard className="mr-2" size={20} />
                Token Summary
              </h2>
            </div>
            <div className="p-6">
              {isAdmin ? (
                <div className="flex flex-col items-center justify-center h-full py-6 text-center">
                  <div className="bg-blue-100 p-3 rounded-full mb-4">
                    <Settings className="text-blue-600" size={32} />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    Admin Account
                  </h3>
                  <p className="text-gray-600 mb-6">
                    As an Admin you aren't able to buy or see your token. Please
                    see the admin panel to manage tokens and system details.
                  </p>
                  <Link
                    to="/admin"
                    className="flex items-center justify-center bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-bold py-3 px-4 rounded-lg transition-all shadow-md hover:shadow-lg w-full"
                  >
                    <Settings className="mr-2" size={18} />
                    Go to Admin Panel
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-blue-50 rounded-lg p-4 flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="bg-blue-100 p-2 rounded-full mr-3">
                        <Clock className="text-blue-600" size={18} />
                      </div>
                      <span className="font-medium">Today's Tokens</span>
                    </div>
                    <span className="text-xl font-bold text-blue-600">
                      {todayTokens.length}
                    </span>
                  </div>

                  <div className="bg-purple-50 rounded-lg p-4 flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="bg-purple-100 p-2 rounded-full mr-3">
                        <Clock className="text-purple-600" size={18} />
                      </div>
                      <span className="font-medium">Tomorrow's Tokens</span>
                    </div>
                    <span className="text-xl font-bold text-purple-600">
                      {tomorrowTokens.length}
                    </span>
                  </div>

                  <div className="bg-amber-50 rounded-lg p-4 flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="bg-amber-100 p-2 rounded-full mr-3">
                        <Clock className="text-amber-600" size={18} />
                      </div>
                      <span className="font-medium">Total Tokens</span>
                    </div>
                    <span className="text-xl font-bold text-amber-600">
                      {tokens.length}
                    </span>
                  </div>

                  <Link
                    to="/buy-token"
                    className="mt-4 flex items-center justify-center bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold py-3 px-4 rounded-lg transition-all shadow-md hover:shadow-lg"
                  >
                    <PlusCircle className="mr-2" size={18} />
                    Buy New Token
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Money Requests Section (for non-admin users) */}
      {moneyRequests.length > 0 && !isAdmin && (
        <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-amber-50 to-amber-100 px-6 py-4 border-b border-amber-200 flex justify-between items-center">
            <h2 className="text-xl font-semibold text-amber-800 flex items-center">
              <Wallet className="mr-2" size={20} />
              Your Money Requests
            </h2>
            {pendingRequests > 0 && (
              <span className="bg-amber-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                {pendingRequests} pending
              </span>
            )}
          </div>
          <div className="p-6">
            <MoneyRequestList requests={moneyRequests} />
          </div>
        </div>
      )}

      {!isAdmin ? (
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="bg-gradient-to-r from-green-50 to-green-100 px-6 py-4 border-b border-green-200 flex justify-between items-center">
            <h2 className="text-xl font-semibold text-green-800 flex items-center">
              <CreditCard className="mr-2" size={20} />
              Your Food Tokens
            </h2>
            <span className="bg-green-100 text-green-800 text-xs font-medium px-3 py-1 rounded-full">
              {tokens.length} tokens
            </span>
          </div>
          <div className="p-6">
            {tokens.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <div className="bg-gray-100 rounded-full p-3 inline-block mb-4">
                  <CreditCard className="text-gray-500 mx-auto" size={32} />
                </div>
                <p className="text-gray-500 mb-6">
                  You haven't purchased any tokens yet.
                </p>
                <Link
                  to="/buy-token"
                  className="inline-flex items-center bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-all shadow-md hover:shadow-lg"
                >
                  <PlusCircle className="mr-2" size={18} />
                  Buy Your First Token
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {tokens.map((token) => (
                  <TokenCard key={token._id} token={token} />
                ))}
              </div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default UserDashboard;

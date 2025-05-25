"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom"
import { useAuth } from "../context/AuthContext";
import { format } from "date-fns";
import MoneyRequestList from "../components/MoneyRequestList";
import {
  Users,
  Ticket,
  Calendar,
  CalendarCheck,
  DollarSign,
  RefreshCw,
  User,
  Shield,
  Search,
  ChevronDown,
  ChevronUp,
  Edit,
  XCircle,
  Mail,
  CreditCard,
  ArrowUpDown,
  Wallet,
  Coffee,
  UtensilsCrossed,
} from "lucide-react";

import TokenDistributionChart from "../components/charts/TokenDistributionChart";
import UserTokensBarChart from "../components/charts/UserTokensBarChart";
import DailyTokensLineChart from "../components/charts/DailyTokensLineChart";
import UserFrequencyChart from "../components/charts/UserFrequencyChart";
import UserTokenTrendChart from "../components/charts/UserTokenTrendChart";

const AdminDashboard = () => {
  const { user, setUser } = useAuth();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalTokens: 0,
    todayTokens: 0,
    tomorrowTokens: 0,
  });
  const [dailyStats, setDailyStats] = useState([]);
  const [tomorrowTokens, setTomorrowTokens] = useState([]);
  const [moneyRequests, setMoneyRequests] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [adminUsers, setAdminUsers] = useState([]);
  const [regularUsers, setRegularUsers] = useState([]);
  const [allTokens, setAllTokens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [promoteLoading, setPromoteLoading] = useState(false);
  const [promoteError, setPromoteError] = useState("");
  const [promoteSuccess, setPromoteSuccess] = useState("");
  const [studentId, setStudentId] = useState("");
  const [balanceAmount, setBalanceAmount] = useState("");
  const [balanceLoading, setBalanceLoading] = useState(false);
  const [balanceError, setBalanceError] = useState("");
  const [balanceSuccess, setBalanceSuccess] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [activeSection, setActiveSection] = useState("dashboard");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [userBalanceAmount, setUserBalanceAmount] = useState("");
  const [sortConfig, setSortConfig] = useState({
    key: "name",
    direction: "ascending",
  });
  const [expandedSections, setExpandedSections] = useState({
    stats: true,
    dailyStats: true,
    moneyRequests: true,
    tomorrowTokens: true,
    userManagement: true,
    adminList: true,
  });

  const [userStats, setUserStats] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Please log in to access the dashboard");
        setLoading(false);
        return;
      }

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      // Fetch all data
      const [
        statsRes,
        dailyStatsRes,
        tomorrowTokensRes,
        requestsRes,
        usersRes,
        allTokensRes,
      ] = await Promise.all([
        axios.get(`${process.env.REACT_APP_API_URL}/api/admin/stats`, config),
        axios.get(
          `${process.env.REACT_APP_API_URL}/api/admin/daily-stats`,
          config
        ),
        axios.get(
          `${process.env.REACT_APP_API_URL}/api/admin/tomorrow-tokens`,
          config
        ),
        axios.get(
          `${process.env.REACT_APP_API_URL}/api/money-requests`,
          config
        ),
        axios.get(`${process.env.REACT_APP_API_URL}/api/users`, config),
        axios.get(`${process.env.REACT_APP_API_URL}/api/tokens/all`, config),
      ]);

      setStats(statsRes.data);
      setDailyStats(dailyStatsRes.data);
      setTomorrowTokens(tomorrowTokensRes.data);
      setMoneyRequests(requestsRes.data);

      // Process users data
      const users = usersRes.data;
      setAllUsers(users);
      setAdminUsers(users.filter((user) => user.isAdmin));
      setRegularUsers(users.filter((user) => !user.isAdmin));

      // Set all tokens and immediately calculate user stats
      const tokens = allTokensRes.data;
      setAllTokens(tokens);

      if (tokens && tokens.length > 0) {
        calculateUserStats(tokens);
      }

      setLoading(false);
    } catch (err) {
      setError("Failed to fetch admin statistics");
      setLoading(false);
      console.error("Fetch error:", err.response?.data, err);
    }
  };

  const calculateUserStats = (tokensData = allTokens) => {
    // Create a map to store statistics for each user
    const userStatsMap = new Map();

    // Check if we have tokens to process
    if (!tokensData || tokensData.length === 0) {
      console.log("No tokens available for statistics calculation");
      setUserStats([]);
      return;
    }

    console.log(`Processing ${tokensData.length} tokens for user statistics`);

    // Process all tokens to gather statistics
    tokensData.forEach((token) => {
      if (!token.user) {
        console.log("Found token without user data:", token._id);
        return;
      }

      const userId = token.user._id;
      const userName = token.user.name;
      const userEmail = token.user.email;
      const userStudentId = token.user.studentId;

      // Initialize user stats if not exists
      if (!userStatsMap.has(userId)) {
        userStatsMap.set(userId, {
          userId,
          name: userName,
          email: userEmail,
          studentId: userStudentId,
          totalTokens: 0,
          lunchTokens: 0,
          dinnerTokens: 0,
          totalSpent: 0,
          lastPurchase: null,
          tokenDates: new Set(),
          recentActivity: [],
        });
      }

      const stats = userStatsMap.get(userId);

      // Update statistics
      stats.totalTokens++;
      if (token.lunch) stats.lunchTokens++;
      if (token.dinner) stats.dinnerTokens++;

      // Calculate amount spent
      const tokenCost = (token.lunch ? 40 : 0) + (token.dinner ? 40 : 0);
      stats.totalSpent += tokenCost;

      // Track unique dates
      const tokenDate = new Date(token.date).toDateString();
      stats.tokenDates.add(tokenDate);

      // Track last purchase
      const createdAt = new Date(token.createdAt || token.date); // Fallback to date if createdAt is missing
      if (!stats.lastPurchase || createdAt > stats.lastPurchase) {
        stats.lastPurchase = createdAt;
      }

      // Add to recent activity (keep only 5 most recent)
      stats.recentActivity.push({
        id: token._id,
        date: new Date(token.date),
        createdAt,
        lunch: token.lunch,
        dinner: token.dinner,
        cost: tokenCost,
      });

      // Sort recent activity by creation date (newest first)
      stats.recentActivity.sort((a, b) => b.createdAt - a.createdAt);

      // Keep only 5 most recent activities
      if (stats.recentActivity.length > 5) {
        stats.recentActivity = stats.recentActivity.slice(0, 5);
      }
    });

    // Convert map to array and calculate additional metrics
    const statsArray = Array.from(userStatsMap.values()).map((stats) => {
      // Calculate frequency (average tokens per day)
      const dayCount = stats.tokenDates.size;
      const frequency =
        dayCount > 0 ? (stats.totalTokens / dayCount).toFixed(2) : 0;

      return {
        ...stats,
        uniqueDays: dayCount,
        frequency,
        tokenDates: Array.from(stats.tokenDates), // Convert Set to Array for easier rendering
      };
    });

    // Sort by total tokens (highest first)
    statsArray.sort((a, b) => b.totalTokens - a.totalTokens);

    console.log(`Generated statistics for ${statsArray.length} users`);
    setUserStats(statsArray);
  };

  useEffect(() => {
    if (allTokens && allTokens.length > 0) {
      calculateUserStats(allTokens);
    }
  }, [allTokens]);

  const handlePromoteUser = async () => {
    if (!userEmail) return;

    setPromoteLoading(true);
    setPromoteError("");
    setPromoteSuccess("");

    try {
      const token = localStorage.getItem("token");
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      const userRes = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/users/by-email?email=${userEmail}`,
        config
      );

      if (!userRes.data) {
        setPromoteError("User not found");
        setPromoteLoading(false);
        return;
      }

      await axios.put(
        `${process.env.REACT_APP_API_URL}/api/admin/promote/${userRes.data._id}`,
        {},
        config
      );

      setPromoteSuccess("User promoted to admin successfully");
      setUserEmail("");

      // Refresh users list
      const usersRes = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/users`,
        config
      );
      const users = usersRes.data;
      setAllUsers(users);
      setAdminUsers(users.filter((user) => user.isAdmin));
      setRegularUsers(users.filter((user) => !user.isAdmin));
    } catch (err) {
      setPromoteError(err.response?.data?.message || "Failed to promote user");
      console.error(err);
    }

    setPromoteLoading(false);
  };

  const handleUpdateBalance = async () => {
    if (!studentId || !balanceAmount) {
      setBalanceError("Student ID and amount are required");
      return;
    }

    if (isNaN(balanceAmount) || Number(balanceAmount) === 0) {
      setBalanceError("Please enter a valid amount");
      return;
    }

    setBalanceLoading(true);
    setBalanceError("");
    setBalanceSuccess("");

    try {
      const token = localStorage.getItem("token");
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      const res = await axios.put(
        `${process.env.REACT_APP_API_URL}/api/users/balance-by-studentid`,
        {
          studentId,
          amount: Number(balanceAmount),
        },
        config
      );

      setBalanceSuccess(
        `Balance updated successfully! New balance: ${res.data.balance} Tk`
      );
      setStudentId("");
      setBalanceAmount("");

      // Refresh users list
      const usersRes = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/users`,
        config
      );
      setAllUsers(usersRes.data);
      setAdminUsers(usersRes.data.filter((user) => user.isAdmin));
      setRegularUsers(usersRes.data.filter((user) => !user.isAdmin));
    } catch (err) {
      setBalanceError(
        err.response?.data?.message || "Failed to update balance"
      );
      console.error("Balance update error:", err.response?.data, err);
    }

    setBalanceLoading(false);
  };

  const handleUpdateUserBalance = async (userId, amount) => {
    if (!amount || isNaN(amount) || Number(amount) === 0) {
      setError("Please enter a valid amount");
      return;
    }

    try {
      setError("");
      setSuccessMessage("");

      const token = localStorage.getItem("token");
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      const res = await axios.put(
        `${process.env.REACT_APP_API_URL}/api/users/balance/${userId}`,
        { amount: Number(amount) },
        config
      );

      // Update the user in the lists
      const updatedUser = { ...selectedUser, balance: res.data.balance };
      setAllUsers(allUsers.map((u) => (u._id === userId ? updatedUser : u)));

      if (updatedUser.isAdmin) {
        setAdminUsers(
          adminUsers.map((u) => (u._id === userId ? updatedUser : u))
        );
      } else {
        setRegularUsers(
          regularUsers.map((u) => (u._id === userId ? updatedUser : u))
        );
      }

      setSelectedUser(updatedUser);
      setUserBalanceAmount("");
      setSuccessMessage(
        `Balance updated successfully! New balance: ${res.data.balance} Tk`
      );

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage("");
      }, 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update balance");
      console.error(err);
    }
  };

  const handleProcessRequest = async (requestId, status) => {
    try {
      setError("");
      setSuccessMessage("");

      const token = localStorage.getItem("token");
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      await axios.put(
        `${process.env.REACT_APP_API_URL}/api/money-requests/${requestId}`,
        { status },
        config
      );

      // Update the requests list
      setMoneyRequests(
        moneyRequests.map((request) => {
          if (request._id === requestId) {
            return { ...request, status };
          }
          return request;
        })
      );

      setSuccessMessage(`Request ${status} successfully`);

      // Refresh admin balance
      const userRes = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/users/me`,
        config
      );
      if (setUser) {
        setUser(userRes.data);
      }

      // Refresh users list
      const usersRes = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/users`,
        config
      );
      setAllUsers(usersRes.data);
      setAdminUsers(usersRes.data.filter((user) => user.isAdmin));
      setRegularUsers(usersRes.data.filter((user) => !user.isAdmin));

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage("");
      }, 3000);
    } catch (err) {
      setError(err.response?.data?.message || `Failed to ${status} request`);
      console.error(err);
    }
  };

  const refreshData = async () => {
    setLoading(true);
    try {
      await fetchData();
      setSuccessMessage("Data refreshed successfully");

      setTimeout(() => {
        setSuccessMessage("");
      }, 3000);
    } catch (err) {
      setError("Failed to refresh data");
      console.error(err);
    }
    setLoading(false);
  };

  const toggleSection = (section) => {
    setExpandedSections({
      ...expandedSections,
      [section]: !expandedSections[section],
    });
  };

  const handleSort = (key) => {
    let direction = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  const sortedUsers = [...regularUsers].sort((a, b) => {
    if (a[sortConfig.key] < b[sortConfig.key]) {
      return sortConfig.direction === "ascending" ? -1 : 1;
    }
    if (a[sortConfig.key] > b[sortConfig.key]) {
      return sortConfig.direction === "ascending" ? 1 : -1;
    }
    return 0;
  });

  const filteredUsers = sortedUsers.filter((user) => {
    return (
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.studentId.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg text-gray-700 font-medium">
            Loading dashboard data...
          </p>
        </div>
      </div>
    );
  }

  const pendingRequests = moneyRequests.filter(
    (req) => req.status === "pending"
  ).length;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl shadow-lg p-6 mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Admin Dashboard
            </h1>
            <p className="text-blue-100">
              Manage users, tokens, and money requests
            </p>
          </div>
          <div className="flex items-center">
            <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2 mr-4">
              <p className="text-sm text-blue-100">Admin Balance</p>
              <p className="text-xl font-bold text-white">{user?.balance} Tk</p>
            </div>
            <button
              onClick={refreshData}
              className="bg-white text-blue-600 hover:bg-blue-50 rounded-full p-2 transition-all"
              title="Refresh Data"
            >
              <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setActiveSection("dashboard")}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            activeSection === "dashboard"
              ? "bg-blue-600 text-white"
              : "bg-white text-blue-600 hover:bg-blue-50"
          }`}
        >
          Dashboard
        </button>
        <button
          onClick={() => setActiveSection("users")}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            activeSection === "users"
              ? "bg-blue-600 text-white"
              : "bg-white text-blue-600 hover:bg-blue-50"
          }`}
        >
          User Management
        </button>
        <button
          onClick={() => setActiveSection("admins")}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            activeSection === "admins"
              ? "bg-blue-600 text-white"
              : "bg-white text-blue-600 hover:bg-blue-50"
          }`}
        >
          Admin Users
        </button>
        <button
          onClick={() => setActiveSection("requests")}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            activeSection === "requests"
              ? "bg-blue-600 text-white"
              : "bg-white text-blue-600 hover:bg-blue-50"
          }`}
        >
          Money Requests
          {pendingRequests > 0 && (
            <span className="ml-2 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
              {pendingRequests}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveSection("tokens")}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            activeSection === "tokens"
              ? "bg-blue-600 text-white"
              : "bg-white text-blue-600 hover:bg-blue-50"
          }`}
        >
          Token Management
        </button>
        {/* Add a new button in the Navigation Tabs section (around line 200)
        Find the Navigation Tabs div and add this button: */}
        <button
          onClick={() => setActiveSection("allTokens")}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            activeSection === "allTokens"
              ? "bg-blue-600 text-white"
              : "bg-white text-blue-600 hover:bg-blue-50"
          }`}
        >
          All Tokens
        </button>
        <button
          onClick={() => setActiveSection("userStats")}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            activeSection === "userStats"
              ? "bg-blue-600 text-white"
              : "bg-white text-blue-600 hover:bg-blue-50"
          }`}
        >
          User Statistics
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md mb-6 animate-fadeIn">
          <div className="flex items-center">
            <svg
              className="h-5 w-5 mr-2"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            <p>{error}</p>
          </div>
        </div>
      )}

      {successMessage && (
        <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded-md mb-6 animate-fadeIn">
          <div className="flex items-center">
            <svg
              className="h-5 w-5 mr-2"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            <p>{successMessage}</p>
          </div>
        </div>
      )}

      {/* Dashboard Section */}
      {activeSection === "dashboard" && (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-md overflow-hidden transition-transform hover:transform hover:scale-105">
              <div className="p-5 bg-gradient-to-br from-blue-50 to-blue-100">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-semibold text-blue-800">
                    Total Users
                  </h3>
                  <div className="bg-blue-500 text-white p-2 rounded-lg">
                    <Users size={20} />
                  </div>
                </div>
                <p className="text-3xl font-bold text-blue-700 mt-2">
                  {stats.totalUsers}
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  Registered in the system
                </p>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md overflow-hidden transition-transform hover:transform hover:scale-105">
              <div className="p-5 bg-gradient-to-br from-green-50 to-green-100">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-semibold text-green-800">
                    Total Tokens
                  </h3>
                  <div className="bg-green-500 text-white p-2 rounded-lg">
                    <Ticket size={20} />
                  </div>
                </div>
                <p className="text-3xl font-bold text-green-700 mt-2">
                  {stats.totalTokens}
                </p>
                <p className="text-xs text-green-600 mt-1">
                  Tokens sold to date
                </p>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md overflow-hidden transition-transform hover:transform hover:scale-105">
              <div className="p-5 bg-gradient-to-br from-yellow-50 to-yellow-100">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-semibold text-yellow-800">
                    Today's Tokens
                  </h3>
                  <div className="bg-yellow-500 text-white p-2 rounded-lg">
                    <Calendar size={20} />
                  </div>
                </div>
                <p className="text-3xl font-bold text-yellow-700 mt-2">
                  {stats.todayTokens}
                </p>
                <p className="text-xs text-yellow-600 mt-1">Active for today</p>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md overflow-hidden transition-transform hover:transform hover:scale-105">
              <div className="p-5 bg-gradient-to-br from-purple-50 to-purple-100">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-semibold text-purple-800">
                    Tomorrow's Tokens
                  </h3>
                  <div className="bg-purple-500 text-white p-2 rounded-lg">
                    <CalendarCheck size={20} />
                  </div>
                </div>
                <p className="text-3xl font-bold text-purple-700 mt-2">
                  {stats.tomorrowTokens}
                </p>
                <p className="text-xs text-purple-600 mt-1">
                  Pre-booked for tomorrow
                </p>
              </div>
            </div>
          </div>

          {/* Daily Stats and Money Requests */}
          <div className="grid grid-cols-1 gap-6 mb-8">
            {/* Daily Token Sales */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="bg-gradient-to-r from-blue-50 to-blue-100 px-6 py-4 border-b border-blue-200 flex justify-between items-center">
                <h2 className="text-xl font-semibold text-blue-800 flex items-center">
                  <Calendar className="mr-2" size={20} />
                  Daily Token Sales
                </h2>
                <button
                  onClick={() => toggleSection("dailyStats")}
                  className="text-blue-600 hover:bg-blue-200 rounded-full p-1"
                >
                  {expandedSections.dailyStats ? (
                    <ChevronUp size={20} />
                  ) : (
                    <ChevronDown size={20} />
                  )}
                </button>
              </div>
              {expandedSections.dailyStats && (
                <div className="p-6">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Date
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Lunch
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Dinner
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Total
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Revenue
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {dailyStats.map((day, index) => {
                          const date = new Date(day.date);
                          const formattedDate = format(date, "EEE, MMM d");
                          const isToday =
                            new Date().toDateString() === date.toDateString();

                          return (
                            <tr
                              key={day.date}
                              className={`${
                                isToday
                                  ? "bg-blue-50"
                                  : index % 2 === 0
                                  ? "bg-gray-50"
                                  : "bg-white"
                              } 
                                          hover:bg-gray-100 transition-colors`}
                            >
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                {isToday ? (
                                  <span className="font-bold text-blue-600">
                                    {formattedDate} (Today)
                                  </span>
                                ) : (
                                  formattedDate
                                )}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                {day.lunchCount}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                {day.dinnerCount}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                {day.lunchCount + day.dinnerCount}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                                {(day.lunchCount + day.dinnerCount) * 40} Tk
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            {/* Money Requests */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="bg-gradient-to-r from-purple-50 to-purple-100 px-6 py-4 border-b border-purple-200 flex justify-between items-center">
                <h2 className="text-xl font-semibold text-purple-800 flex items-center">
                  <DollarSign className="mr-2" size={20} />
                  Money Requests
                  {pendingRequests > 0 && (
                    <span className="ml-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                      {pendingRequests} pending
                    </span>
                  )}
                </h2>
                <button
                  onClick={() => toggleSection("moneyRequests")}
                  className="text-purple-600 hover:bg-purple-200 rounded-full p-1"
                >
                  {expandedSections.moneyRequests ? (
                    <ChevronUp size={20} />
                  ) : (
                    <ChevronDown size={20} />
                  )}
                </button>
              </div>
              {expandedSections.moneyRequests && (
                <div className="p-4">
                  {moneyRequests.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="bg-purple-100 rounded-full p-3 inline-block mb-3">
                        <DollarSign className="text-purple-500" size={24} />
                      </div>
                      <p className="text-gray-500">No money requests yet.</p>
                    </div>
                  ) : (
                    <MoneyRequestList
                      requests={moneyRequests}
                      isAdmin={true}
                      onProcess={handleProcessRequest}
                    />
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Tomorrow's Token Details */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
            <div className="bg-gradient-to-r from-green-50 to-green-100 px-6 py-4 border-b border-green-200 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-green-800 flex items-center">
                <CalendarCheck className="mr-2" size={20} />
                Tomorrow's Token Details (April 15, 2025)
              </h2>
              <button
                onClick={() => toggleSection("tomorrowTokens")}
                className="text-green-600 hover:bg-green-200 rounded-full p-1"
              >
                {expandedSections.tomorrowTokens ? (
                  <ChevronUp size={20} />
                ) : (
                  <ChevronDown size={20} />
                )}
              </button>
            </div>
            {expandedSections.tomorrowTokens && (
              <div className="p-6">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          User Email
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Student ID
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Lunch
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Dinner
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Total Cost
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {tomorrowTokens.length === 0 ? (
                        <tr>
                          <td
                            colSpan="7"
                            className="px-6 py-8 text-center text-gray-500"
                          >
                            No tokens sold for tomorrow
                          </td>
                        </tr>
                      ) : (
                        tomorrowTokens.map((token, index) => {
                          const date = new Date(token.date);
                          const formattedDate = format(date, "MMM d, yyyy");
                          const totalCost =
                            (token.lunch ? 40 : 0) + (token.dinner ? 40 : 0);

                          return (
                            <tr
                              key={token._id}
                              className={`${
                                index % 2 === 0 ? "bg-gray-50" : "bg-white"
                              } hover:bg-gray-100 transition-colors`}
                            >
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                {token.user.email}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                {token.user.name}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                {token.user.studentId}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                {formattedDate}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                {token.lunch ? (
                                  <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                                    Yes
                                  </span>
                                ) : (
                                  <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                                    No
                                  </span>
                                )}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                {token.dinner ? (
                                  <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                                    Yes
                                  </span>
                                ) : (
                                  <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                                    No
                                  </span>
                                )}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                                {totalCost} Tk
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* Admin Tools */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="bg-gradient-to-r from-green-50 to-green-100 px-6 py-4 border-b border-green-200">
                <h3 className="text-xl font-semibold text-green-800">
                  Update User Balance
                </h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Student ID
                    </label>
                    <input
                      type="text"
                      placeholder="Enter student ID"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                      value={studentId}
                      onChange={(e) => setStudentId(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Amount
                    </label>
                    <input
                      type="number"
                      placeholder="Enter amount (+ to add, - to subtract)"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                      value={balanceAmount}
                      onChange={(e) => setBalanceAmount(e.target.value)}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Use positive values to add funds, negative to deduct
                    </p>
                  </div>
                  <button
                    onClick={handleUpdateBalance}
                    className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold py-2 px-4 rounded-lg transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={balanceLoading}
                  >
                    {balanceLoading ? (
                      <span className="flex items-center justify-center">
                        <svg
                          className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
                      "Update Balance"
                    )}
                  </button>
                  {balanceError && (
                    <p className="text-red-500 text-sm mt-2">{balanceError}</p>
                  )}
                  {balanceSuccess && (
                    <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-3 rounded-md mt-2 animate-fadeIn">
                      {balanceSuccess}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="bg-gradient-to-r from-purple-50 to-purple-100 px-6 py-4 border-b border-purple-200">
                <h3 className="text-xl font-semibold text-purple-800">
                  Promote User to Admin
                </h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      User Email
                    </label>
                    <input
                      type="text"
                      placeholder="Enter user email"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                      value={userEmail}
                      onChange={(e) => setUserEmail(e.target.value)}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Enter the email of the user you want to promote
                    </p>
                  </div>
                  <button
                    onClick={handlePromoteUser}
                    className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-bold py-2 px-4 rounded-lg transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={promoteLoading}
                  >
                    {promoteLoading ? (
                      <span className="flex items-center justify-center">
                        <svg
                          className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
                      "Promote to Admin"
                    )}
                  </button>
                  {promoteError && (
                    <p className="text-red-500 text-sm mt-2">{promoteError}</p>
                  )}
                  {promoteSuccess && (
                    <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-3 rounded-md mt-2 animate-fadeIn">
                      {promoteSuccess}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* User Management Section */}
      {activeSection === "users" && (
        <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 px-6 py-4 border-b border-blue-200 flex justify-between items-center">
            <h2 className="text-xl font-semibold text-blue-800 flex items-center">
              <Users className="mr-2" size={20} />
              User Management
            </h2>
            <div className="flex items-center">
              <div className="relative">
                <Search
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={16}
                />
                <input
                  type="text"
                  placeholder="Search users..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>
          <div className="p-6">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr className="bg-gray-50">
                    <th
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort("name")}
                    >
                      <div className="flex items-center">
                        Name
                        <ArrowUpDown className="ml-1" size={14} />
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort("studentId")}
                    >
                      <div className="flex items-center">
                        Student ID
                        <ArrowUpDown className="ml-1" size={14} />
                      </div>
                    </th>
                    <th
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort("balance")}
                    >
                      <div className="flex items-center">
                        Balance
                        <ArrowUpDown className="ml-1" size={14} />
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td
                        colSpan="5"
                        className="px-6 py-8 text-center text-gray-500"
                      >
                        No users found matching your search
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((user, index) => (
                      <tr
                        key={user._id}
                        className={`${
                          index % 2 === 0 ? "bg-gray-50" : "bg-white"
                        } hover:bg-gray-100 transition-colors ${
                          selectedUser?._id === user._id ? "bg-blue-50" : ""
                        }`}
                        onClick={() => setSelectedUser(user)}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                              <User className="h-5 w-5 text-blue-600" />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {user.name}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          {user.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          {user.studentId}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-medium text-green-600">
                            {user.balance} Tk
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedUser(user);
                            }}
                            className="text-blue-600 hover:text-blue-900 mr-3"
                          >
                            <Edit size={16} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* User Details Panel */}
            {selectedUser && (
              <div className="mt-6 bg-blue-50 rounded-xl p-6 border border-blue-200 animate-fadeIn">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">
                    User Details
                  </h3>
                  <button
                    onClick={() => setSelectedUser(null)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <XCircle size={20} />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <div className="flex items-center mb-4">
                      <div className="h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                        <User className="h-8 w-8 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="text-xl font-bold text-gray-800">
                          {selectedUser.name}
                        </h4>
                        <p className="text-gray-600">{selectedUser.email}</p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center">
                        <CreditCard className="h-5 w-5 text-gray-500 mr-2" />
                        <span className="text-gray-600 mr-2">Student ID:</span>
                        <span className="font-medium">
                          {selectedUser.studentId}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <Mail className="h-5 w-5 text-gray-500 mr-2" />
                        <span className="text-gray-600 mr-2">Email:</span>
                        <span className="font-medium">
                          {selectedUser.email}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <Wallet className="h-5 w-5 text-gray-500 mr-2" />
                        <span className="text-gray-600 mr-2">Balance:</span>
                        <span className="font-medium text-green-600">
                          {selectedUser.balance} Tk
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white p-4 rounded-lg border border-gray-200">
                    <h4 className="text-lg font-medium text-gray-800 mb-3">
                      Update Balance
                    </h4>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Amount
                        </label>
                        <input
                          type="number"
                          placeholder="Enter amount (+ to add, - to subtract)"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                          value={userBalanceAmount}
                          onChange={(e) => setUserBalanceAmount(e.target.value)}
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Use positive values to add funds, negative to deduct
                        </p>
                      </div>
                      <button
                        onClick={() =>
                          handleUpdateUserBalance(
                            selectedUser._id,
                            userBalanceAmount
                          )
                        }
                        className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-all shadow-sm hover:shadow"
                      >
                        Update Balance
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Admin Users Section */}
      {activeSection === "admins" && (
        <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-purple-50 to-purple-100 px-6 py-4 border-b border-purple-200">
            <h2 className="text-xl font-semibold text-purple-800 flex items-center">
              <Shield className="mr-2" size={20} />
              Admin Users
            </h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {adminUsers.map((admin) => (
                <div
                  key={admin._id}
                  className="bg-white rounded-xl border border-purple-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow"
                >
                  <div className="bg-gradient-to-r from-purple-500 to-purple-600 px-4 py-3">
                    <div className="flex items-center">
                      <div className="bg-white rounded-full p-2 mr-3">
                        <Shield className="h-5 w-5 text-purple-600" />
                      </div>
                      <h3 className="text-lg font-semibold text-white">
                        Admin User
                      </h3>
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="flex items-center mb-4">
                      <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                        <User className="h-6 w-6 text-purple-600" />
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-800">
                          {admin.name}
                        </h4>
                        <p className="text-sm text-gray-600">{admin.email}</p>
                      </div>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Student ID:</span>
                        <span className="font-medium">{admin.studentId}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Balance:</span>
                        <span className="font-medium text-green-600">
                          {admin.balance} Tk
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Money Requests Section */}
      {activeSection === "requests" && (
        <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-purple-50 to-purple-100 px-6 py-4 border-b border-purple-200">
            <h2 className="text-xl font-semibold text-purple-800 flex items-center">
              <DollarSign className="mr-2" size={20} />
              Money Requests
              {pendingRequests > 0 && (
                <span className="ml-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                  {pendingRequests} pending
                </span>
              )}
            </h2>
          </div>
          <div className="p-6">
            {moneyRequests.length === 0 ? (
              <div className="text-center py-12">
                <div className="bg-purple-100 rounded-full p-4 inline-block mb-4">
                  <DollarSign className="text-purple-500" size={32} />
                </div>
                <h3 className="text-lg font-medium text-gray-800 mb-2">
                  No Money Requests
                </h3>
                <p className="text-gray-500">
                  There are no money requests to process at this time.
                </p>
              </div>
            ) : (
              <MoneyRequestList
                requests={moneyRequests}
                isAdmin={true}
                onProcess={handleProcessRequest}
              />
            )}
          </div>
        </div>
      )}

      {/* Token Management Section */}
      {activeSection === "tokens" && (
        <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-green-50 to-green-100 px-6 py-4 border-b border-green-200">
            <h2 className="text-xl font-semibold text-green-800 flex items-center">
              <Ticket className="mr-2" size={20} />
              Token Management
            </h2>
          </div>
          <div className="p-6">
            <div className="mb-8">
              <h3 className="text-lg font-medium text-gray-800 mb-4">
                Daily Token Sales
              </h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Lunch
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Dinner
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Revenue
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {dailyStats.map((day, index) => {
                      const date = new Date(day.date);
                      const formattedDate = format(date, "EEE, MMM d");
                      const isToday =
                        new Date().toDateString() === date.toDateString();

                      return (
                        <tr
                          key={day.date}
                          className={`${
                            isToday
                              ? "bg-blue-50"
                              : index % 2 === 0
                              ? "bg-gray-50"
                              : "bg-white"
                          } 
                                      hover:bg-gray-100 transition-colors`}
                        >
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {isToday ? (
                              <span className="font-bold text-blue-600">
                                {formattedDate} (Today)
                              </span>
                            ) : (
                              formattedDate
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                            {day.lunchCount}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                            {day.dinnerCount}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                            {day.lunchCount + day.dinnerCount}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                            {(day.lunchCount + day.dinnerCount) * 40} Tk
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-800 mb-4">
                Tomorrow's Tokens
              </h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        User Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Student ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Lunch
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Dinner
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total Cost
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {tomorrowTokens.length === 0 ? (
                      <tr>
                        <td
                          colSpan="7"
                          className="px-6 py-8 text-center text-gray-500"
                        >
                          No tokens sold for tomorrow
                        </td>
                      </tr>
                    ) : (
                      tomorrowTokens.map((token, index) => {
                        const date = new Date(token.date);
                        const formattedDate = format(date, "MMM d, yyyy");
                        const totalCost =
                          (token.lunch ? 40 : 0) + (token.dinner ? 40 : 0);

                        return (
                          <tr
                            key={token._id}
                            className={`${
                              index % 2 === 0 ? "bg-gray-50" : "bg-white"
                            } hover:bg-gray-100 transition-colors`}
                          >
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                              {token.user.email}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {token.user.name}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                              {token.user.studentId}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                              {formattedDate}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {token.lunch ? (
                                <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                                  Yes
                                </span>
                              ) : (
                                <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                                  No
                                </span>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {token.dinner ? (
                                <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                                  Yes
                                </span>
                              ) : (
                                <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                                  No
                                </span>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                              {totalCost} Tk
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Add the new All Tokens Section after the other section conditionals (after the Token Management Section) */}
      {/* All Tokens Section */}
      {activeSection === "allTokens" && (
        <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-amber-50 to-amber-100 px-6 py-4 border-b border-amber-200">
            <h2 className="text-xl font-semibold text-amber-800 flex items-center">
              <Ticket className="mr-2" size={20} />
              All Food Tokens
            </h2>
          </div>
          <div className="p-6">
            {allTokens.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <div className="bg-gray-100 rounded-full p-3 inline-block mb-4">
                  <CreditCard className="text-gray-500 mx-auto" size={32} />
                </div>
                <p className="text-gray-500 mb-6">
                  No tokens have been purchased yet.
                </p>
              </div>
            ) : (
              <div>
                <div className="mb-4">
                  <p className="text-gray-600">
                    Total tokens:{" "}
                    <span className="font-medium">{allTokens.length}</span>
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {allTokens.map((token) => (
                    <div
                      key={token._id}
                      className="border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow bg-white"
                    >
                      <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-4 py-2 text-white">
                        <div className="flex justify-between items-center">
                          <h3 className="font-semibold text-sm">
                            Token ID: {token._id.substring(0, 8)}...
                          </h3>
                          {token.user && (
                            <span className="text-xs bg-blue-700 px-2 py-0.5 rounded-full">
                              {new Date(token.date).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="p-4">
                        {/* User Information */}
                        {token.user && (
                          <div className="mb-3 pb-3 border-b border-gray-200">
                            <div className="flex items-center mb-2">
                              <User className="h-4 w-4 text-gray-500 mr-2" />
                              <span className="font-medium text-gray-800">
                                {token.user.name}
                              </span>
                            </div>
                            <div className="flex flex-col text-xs text-gray-600 space-y-1 pl-6">
                              <div>
                                Student ID:{" "}
                                <span className="font-medium">
                                  {token.user.studentId}
                                </span>
                              </div>
                              <div>
                                Email:{" "}
                                <span className="font-medium">
                                  {token.user.email}
                                </span>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Token Details */}
                        <div className="space-y-2 mb-3">
                          {token.lunch && (
                            <div className="flex justify-between items-center p-2 bg-amber-50 rounded-lg border border-amber-100">
                              <span className="flex items-center">
                                <Coffee
                                  className="mr-2 text-amber-600"
                                  size={16}
                                />
                                Lunch
                              </span>
                              <span className="font-medium text-green-600">
                                40 Tk
                              </span>
                            </div>
                          )}

                          {token.dinner && (
                            <div className="flex justify-between items-center p-2 bg-indigo-50 rounded-lg border border-indigo-100">
                              <span className="flex items-center">
                                <UtensilsCrossed
                                  className="mr-2 text-indigo-600"
                                  size={16}
                                />
                                Dinner
                              </span>
                              <span className="font-medium text-green-600">
                                40 Tk
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="flex justify-between items-center">
                          <span className="font-medium">
                            Total:{" "}
                            {(token.lunch ? 40 : 0) + (token.dinner ? 40 : 0)}{" "}
                            Tk
                          </span>
                        </div>
                        <Link
                          to={`/token/${token._id}`}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center"
                        >
                          View Details
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4 ml-1"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 5l7 7-7 7"
                            />
                          </svg>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      {/* User Statistics Section */}
      {activeSection === "userStats" && (
        <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-indigo-50 to-indigo-100 px-6 py-4 border-b border-indigo-200">
            <h2 className="text-xl font-semibold text-indigo-800 flex items-center">
              <Users className="mr-2" size={20} />
              User Token Statistics
            </h2>
          </div>
          <div className="p-6">
            {userStats.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <div className="bg-gray-100 rounded-full p-3 inline-block mb-4">
                  <CreditCard className="text-gray-500 mx-auto" size={32} />
                </div>
                <p className="text-gray-500 mb-6">
                  No token statistics available yet.
                </p>
              </div>
            ) : (
              <div>
                <div className="mb-6">
                  <h3 className="text-lg font-medium text-gray-800 mb-4">
                    Overview
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                      <p className="text-sm text-blue-600 mb-1">Total Users</p>
                      <p className="text-2xl font-bold text-blue-700">
                        {userStats.length}
                      </p>
                    </div>
                    <div className="bg-green-50 rounded-lg p-4 border border-green-100">
                      <p className="text-sm text-green-600 mb-1">
                        Total Tokens Sold
                      </p>
                      <p className="text-2xl font-bold text-green-700">
                        {userStats.reduce(
                          (sum, user) => sum + user.totalTokens,
                          0
                        )}
                      </p>
                    </div>
                    <div className="bg-amber-50 rounded-lg p-4 border border-amber-100">
                      <p className="text-sm text-amber-600 mb-1">
                        Lunch Tokens
                      </p>
                      <p className="text-2xl font-bold text-amber-700">
                        {userStats.reduce(
                          (sum, user) => sum + user.lunchTokens,
                          0
                        )}
                      </p>
                    </div>
                    <div className="bg-indigo-50 rounded-lg p-4 border border-indigo-100">
                      <p className="text-sm text-indigo-600 mb-1">
                        Dinner Tokens
                      </p>
                      <p className="text-2xl font-bold text-indigo-700">
                        {userStats.reduce(
                          (sum, user) => sum + user.dinnerTokens,
                          0
                        )}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Charts Section */}
                <div className="mb-8">
                  <h3 className="text-lg font-medium text-gray-800 mb-4">
                    Visual Analytics
                  </h3>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    {/* Token Distribution Chart */}
                    <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                      <h4 className="text-base font-medium text-gray-700 mb-4">
                        Lunch vs Dinner Distribution
                      </h4>
                      <TokenDistributionChart
                        lunchCount={userStats.reduce(
                          (sum, user) => sum + user.lunchTokens,
                          0
                        )}
                        dinnerCount={userStats.reduce(
                          (sum, user) => sum + user.dinnerTokens,
                          0
                        )}
                      />
                    </div>

                    {/* Daily Tokens Line Chart */}
                    <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                      <h4 className="text-base font-medium text-gray-700 mb-4">
                        Daily Token Sales Trend
                      </h4>
                      <DailyTokensLineChart data={dailyStats} />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* User Tokens Bar Chart */}
                    <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                      <h4 className="text-base font-medium text-gray-700 mb-4">
                        Top 10 Users by Token Usage
                      </h4>
                      <UserTokensBarChart data={userStats} />
                    </div>

                    {/* User Frequency Scatter Chart */}
                    <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                      <h4 className="text-base font-medium text-gray-700 mb-4">
                        User Token Frequency Analysis
                      </h4>
                      <UserFrequencyChart data={userStats} />
                    </div>
                  </div>
                </div>

                <div className="mb-6">
                  <h3 className="text-lg font-medium text-gray-800 mb-4">
                    User Token Usage
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            User
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Total Tokens
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Lunch / Dinner
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Total Spent
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Frequency
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Last Purchase
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {userStats.map((stat, index) => (
                          <tr
                            key={stat.userId}
                            className={`${
                              index % 2 === 0 ? "bg-gray-50" : "bg-white"
                            } hover:bg-gray-100 transition-colors`}
                          >
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center">
                                  <User className="h-5 w-5 text-indigo-600" />
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900">
                                    {stat.name}
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    {stat.studentId}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">
                                {stat.totalTokens}
                              </div>
                              <div className="text-xs text-gray-500">
                                {stat.uniqueDays} unique days
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="mr-2">
                                  <span className="px-2 py-1 text-xs font-semibold rounded-full bg-amber-100 text-amber-800">
                                    {stat.lunchTokens} L
                                  </span>
                                </div>
                                <div>
                                  <span className="px-2 py-1 text-xs font-semibold rounded-full bg-indigo-100 text-indigo-800">
                                    {stat.dinnerTokens} D
                                  </span>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-green-600">
                                {stat.totalSpent} Tk
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                {stat.frequency} tokens/day
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                {stat.lastPurchase
                                  ? format(stat.lastPurchase, "MMM d, yyyy")
                                  : "N/A"}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* User Detail Section */}
                <div>
                  <h3 className="text-lg font-medium text-gray-800 mb-4">
                    User Details
                  </h3>
                  <div className="grid grid-cols-1 gap-6">
                    {userStats.map((stat) => (
                      <div
                        key={stat.userId}
                        className="bg-gray-50 rounded-lg p-4 border border-gray-200"
                      >
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                          <div className="flex items-center mb-2 md:mb-0">
                            <div className="h-12 w-12 bg-indigo-100 rounded-full flex items-center justify-center mr-4">
                              <User className="h-6 w-6 text-indigo-600" />
                            </div>
                            <div>
                              <h4 className="text-lg font-semibold text-gray-800">
                                {stat.name}
                              </h4>
                              <p className="text-sm text-gray-600">
                                {stat.email}
                              </p>
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <div className="bg-blue-100 px-3 py-1 rounded-full text-blue-800 text-xs font-medium">
                              ID: {stat.studentId}
                            </div>
                            <div className="bg-green-100 px-3 py-1 rounded-full text-green-800 text-xs font-medium">
                              {stat.totalTokens} Tokens
                            </div>
                            <div className="bg-purple-100 px-3 py-1 rounded-full text-purple-800 text-xs font-medium">
                              {stat.totalSpent} Tk Spent
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div className="bg-white p-3 rounded-md border border-gray-200">
                            <h5 className="text-sm font-medium text-gray-700 mb-2">
                              Token Distribution
                            </h5>
                            <div className="flex items-center gap-4">
                              <div className="flex-1">
                                <div className="flex justify-between mb-1">
                                  <span className="text-xs text-gray-600">
                                    Lunch
                                  </span>
                                  <span className="text-xs font-medium text-amber-600">
                                    {stat.lunchTokens}
                                  </span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                  <div
                                    className="bg-amber-500 h-2 rounded-full"
                                    style={{
                                      width: `${
                                        stat.totalTokens > 0
                                          ? (stat.lunchTokens /
                                              stat.totalTokens) *
                                            100
                                          : 0
                                      }%`,
                                    }}
                                  ></div>
                                </div>
                              </div>
                              <div className="flex-1">
                                <div className="flex justify-between mb-1">
                                  <span className="text-xs text-gray-600">
                                    Dinner
                                  </span>
                                  <span className="text-xs font-medium text-indigo-600">
                                    {stat.dinnerTokens}
                                  </span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                  <div
                                    className="bg-indigo-500 h-2 rounded-full"
                                    style={{
                                      width: `${
                                        stat.totalTokens > 0
                                          ? (stat.dinnerTokens /
                                              stat.totalTokens) *
                                            100
                                          : 0
                                      }%`,
                                    }}
                                  ></div>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="bg-white p-3 rounded-md border border-gray-200">
                            <h5 className="text-sm font-medium text-gray-700 mb-2">
                              Usage Metrics
                            </h5>
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <p className="text-xs text-gray-500">
                                  Frequency
                                </p>
                                <p className="text-sm font-medium">
                                  {stat.frequency} tokens/day
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500">
                                  Unique Days
                                </p>
                                <p className="text-sm font-medium">
                                  {stat.uniqueDays} days
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500">
                                  Last Purchase
                                </p>
                                <p className="text-sm font-medium">
                                  {stat.lastPurchase
                                    ? format(stat.lastPurchase, "MMM d")
                                    : "N/A"}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500">
                                  Avg. Cost
                                </p>
                                <p className="text-sm font-medium">
                                  {stat.totalTokens > 0
                                    ? (
                                        stat.totalSpent / stat.totalTokens
                                      ).toFixed(0)
                                    : 0}{" "}
                                  Tk
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* User Token Trend Chart */}
                        <div className="bg-white p-3 rounded-md border border-gray-200 mb-4">
                          <h5 className="text-sm font-medium text-gray-700 mb-2">
                            Token Purchase Trend
                          </h5>
                          <UserTokenTrendChart
                            userId={stat.userId}
                            allTokens={allTokens.filter(
                              (token) =>
                                token.user && token.user._id === stat.userId
                            )}
                          />
                        </div>

                        {stat.recentActivity.length > 0 && (
                          <div>
                            <h5 className="text-sm font-medium text-gray-700 mb-2">
                              Recent Activity
                            </h5>
                            <div className="bg-white rounded-md border border-gray-200 overflow-hidden">
                              <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                  <tr>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                      Date
                                    </th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                      Purchased On
                                    </th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                      Meals
                                    </th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                      Cost
                                    </th>
                                  </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                  {stat.recentActivity.map((activity) => (
                                    <tr
                                      key={activity.id}
                                      className="hover:bg-gray-50"
                                    >
                                      <td className="px-4 py-2 whitespace-nowrap text-xs">
                                        {format(activity.date, "MMM d, yyyy")}
                                      </td>
                                      <td className="px-4 py-2 whitespace-nowrap text-xs">
                                        {format(
                                          activity.createdAt,
                                          "MMM d, yyyy"
                                        )}
                                      </td>
                                      <td className="px-4 py-2 whitespace-nowrap">
                                        <div className="flex gap-1">
                                          {activity.lunch && (
                                            <span className="px-1.5 py-0.5 text-xs rounded bg-amber-100 text-amber-800">
                                              Lunch
                                            </span>
                                          )}
                                          {activity.dinner && (
                                            <span className="px-1.5 py-0.5 text-xs rounded bg-indigo-100 text-indigo-800">
                                              Dinner
                                            </span>
                                          )}
                                        </div>
                                      </td>
                                      <td className="px-4 py-2 whitespace-nowrap text-xs font-medium text-green-600">
                                        {activity.cost} Tk
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;

"use client"

import { useState, useEffect } from "react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

const UserTokenTrendChart = ({ userId, allTokens }) => {
  const [chartData, setChartData] = useState([])

  useEffect(() => {
    // Filter tokens for this user and prepare data
    const userTokens = allTokens.filter((token) => token.user && token.user._id === userId)

    if (!userTokens || userTokens.length === 0) {
      setChartData([])
      return
    }

    // Group tokens by month
    const tokensByMonth = {}

    userTokens.forEach((token) => {
      const date = new Date(token.date)
      const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`

      if (!tokensByMonth[monthKey]) {
        tokensByMonth[monthKey] = {
          month: new Date(date.getFullYear(), date.getMonth(), 1),
          lunch: 0,
          dinner: 0,
          total: 0,
        }
      }

      if (token.lunch) tokensByMonth[monthKey].lunch++
      if (token.dinner) tokensByMonth[monthKey].dinner++
      tokensByMonth[monthKey].total++
    })

    // Convert to array and sort by date
    const data = Object.values(tokensByMonth)
    data.sort((a, b) => a.month - b.month)

    // Format for chart
    const formattedData = data.map((item) => ({
      month: item.month.toLocaleDateString("en-US", { month: "short", year: "2-digit" }),
      lunch: item.lunch,
      dinner: item.dinner,
      total: item.total,
    }))

    setChartData(formattedData)
  }, [userId, allTokens])

  if (chartData.length === 0) {
    return (
      <div className="h-40 flex items-center justify-center bg-gray-50 rounded-md">
        <p className="text-sm text-gray-500">Not enough data for trend analysis</p>
      </div>
    )
  }

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={chartData}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="lunch" stroke="#f59e0b" name="Lunch" />
          <Line type="monotone" dataKey="dinner" stroke="#6366f1" name="Dinner" />
          <Line type="monotone" dataKey="total" stroke="#10b981" name="Total" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

export default UserTokenTrendChart

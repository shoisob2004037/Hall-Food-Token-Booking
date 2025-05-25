import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

const DailyTokensLineChart = ({ data }) => {
  // Format data for the chart
  const chartData = data.map((day) => ({
    date: new Date(day.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    lunch: day.lunchCount,
    dinner: day.dinnerCount,
    total: day.lunchCount + day.dinnerCount,
  }))

  return (
    <div className="h-80 w-full">
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
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip
            formatter={(value, name) => [
              value,
              name === "lunch" ? "Lunch Tokens" : name === "dinner" ? "Dinner Tokens" : "Total Tokens",
            ]}
          />
          <Legend />
          <Line type="monotone" dataKey="lunch" stroke="#f59e0b" activeDot={{ r: 8 }} name="Lunch Tokens" />
          <Line type="monotone" dataKey="dinner" stroke="#6366f1" activeDot={{ r: 8 }} name="Dinner Tokens" />
          <Line type="monotone" dataKey="total" stroke="#10b981" activeDot={{ r: 8 }} name="Total Tokens" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

export default DailyTokensLineChart

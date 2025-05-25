import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

const UserTokensBarChart = ({ data }) => {
  // Limit to top 10 users for better visualization
  const topUsers = [...data]
    .sort((a, b) => b.totalTokens - a.totalTokens)
    .slice(0, 10)
    .map((user) => ({
      name: user.name.split(" ")[0], // Just use first name for cleaner display
      lunch: user.lunchTokens,
      dinner: user.dinnerTokens,
      total: user.totalTokens,
    }))

  return (
    <div className="h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={topUsers}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 60,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" angle={-45} textAnchor="end" height={60} />
          <YAxis />
          <Tooltip
            formatter={(value, name) => [
              value,
              name === "lunch" ? "Lunch Tokens" : name === "dinner" ? "Dinner Tokens" : "Total Tokens",
            ]}
          />
          <Legend />
          <Bar dataKey="lunch" stackId="a" fill="#f59e0b" name="Lunch Tokens" />
          <Bar dataKey="dinner" stackId="a" fill="#6366f1" name="Dinner Tokens" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export default UserTokensBarChart

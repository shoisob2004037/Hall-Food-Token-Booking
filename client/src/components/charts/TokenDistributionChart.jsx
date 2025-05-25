import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts"

const COLORS = ["#f59e0b", "#6366f1", "#10b981", "#ef4444", "#8b5cf6"]

const TokenDistributionChart = ({ lunchCount, dinnerCount }) => {
  const data = [
    { name: "Lunch", value: lunchCount },
    { name: "Dinner", value: dinnerCount },
  ]

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(value) => [`${value} tokens`, ""]} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}

export default TokenDistributionChart

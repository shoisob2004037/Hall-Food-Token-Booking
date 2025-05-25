import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ZAxis } from "recharts"

const UserFrequencyChart = ({ data }) => {
  // Format data for the chart
  const chartData = data.map((user) => ({
    name: user.name,
    totalTokens: user.totalTokens,
    frequency: Number.parseFloat(user.frequency),
    totalSpent: user.totalSpent,
  }))

  return (
    <div className="h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart
          margin={{
            top: 20,
            right: 20,
            bottom: 20,
            left: 20,
          }}
        >
          <CartesianGrid />
          <XAxis
            type="number"
            dataKey="totalTokens"
            name="Total Tokens"
            label={{ value: "Total Tokens", position: "insideBottomRight", offset: -5 }}
          />
          <YAxis
            type="number"
            dataKey="frequency"
            name="Frequency"
            label={{ value: "Frequency (tokens/day)", angle: -90, position: "insideLeft" }}
          />
          <ZAxis type="number" dataKey="totalSpent" range={[50, 400]} name="Total Spent" />
          <Tooltip
            cursor={{ strokeDasharray: "3 3" }}
            formatter={(value, name, props) => {
              if (name === "Total Tokens") return [value, name]
              if (name === "Frequency") return [value, "Tokens per day"]
              return [value, name]
            }}
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                return (
                  <div className="bg-white p-2 border border-gray-200 shadow-md rounded-md">
                    <p className="font-medium">{payload[0]?.payload.name}</p>
                    <p>Total Tokens: {payload[0]?.value}</p>
                    <p>Frequency: {payload[1]?.value} tokens/day</p>
                    <p>Total Spent: {payload[0]?.payload.totalSpent} Tk</p>
                  </div>
                )
              }
              return null
            }}
          />
          <Scatter name="Users" data={chartData} fill="#8884d8" />
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  )
}

export default UserFrequencyChart

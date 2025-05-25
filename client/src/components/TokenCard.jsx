import { Link } from "react-router-dom"
import { Calendar, Coffee, UtensilsCrossed } from "lucide-react"

const TokenCard = ({ token }) => {
  // Format date
  const tokenDate = new Date(token.date)
  const formattedDate = tokenDate.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  })

  // Check if token is for today, tomorrow, or past
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  const tokenDay = new Date(token.date)
  tokenDay.setHours(0, 0, 0, 0)

  let statusColor = "bg-gray-100 border-gray-200"
  let statusText = ""
  let statusTextColor = "text-gray-700"

  if (tokenDay.getTime() === today.getTime()) {
    statusColor = "bg-green-100 border-green-200"
    statusText = "Today"
    statusTextColor = "text-green-700"
  } else if (tokenDay.getTime() === tomorrow.getTime()) {
    statusColor = "bg-blue-100 border-blue-200"
    statusText = "Tomorrow"
    statusTextColor = "text-blue-700"
  } else if (tokenDay < today) {
    statusColor = "bg-gray-100 border-gray-200"
    statusText = "Past"
    statusTextColor = "text-gray-500"
  } else {
    statusColor = "bg-purple-100 border-purple-200"
    statusText = "Upcoming"
    statusTextColor = "text-purple-700"
  }

  return (
    <div className={`border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow ${statusColor}`}>
      <div className="p-4">
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-semibold text-lg flex items-center">
            <Calendar className="mr-2" size={16} />
            {formattedDate}
          </h3>
          <span className={`text-xs font-medium px-2 py-1 rounded-full bg-white ${statusTextColor}`}>{statusText}</span>
        </div>

        <div className="space-y-2 mb-4">
          {token.lunch && (
            <div className="flex justify-between items-center p-2 bg-white rounded-lg border border-gray-100">
              <span className="flex items-center">
                <Coffee className="mr-2 text-amber-600" size={16} />
                Lunch
              </span>
              <span className="font-medium text-green-600">40 Tk</span>
            </div>
          )}

          {token.dinner && (
            <div className="flex justify-between items-center p-2 bg-white rounded-lg border border-gray-100">
              <span className="flex items-center">
                <UtensilsCrossed className="mr-2 text-indigo-600" size={16} />
                Dinner
              </span>
              <span className="font-medium text-green-600">40 Tk</span>
            </div>
          )}
        </div>

        <div className="flex justify-between items-center">
          <span className="font-medium">Total: {(token.lunch ? 40 : 0) + (token.dinner ? 40 : 0)} Tk</span>
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
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default TokenCard

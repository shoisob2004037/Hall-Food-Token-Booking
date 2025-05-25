"use client"

import { Link } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import {
  Calendar,
  Clock,
  CreditCard,
  DollarSign,
  Users,
  CheckCircle,
  AlertTriangle,
  Coffee,
  UtensilsCrossed,
  ArrowRight,
  Shield,
  Wallet,
} from "lucide-react"

const Home = () => {
  const { user } = useAuth()

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-blue-600 to-blue-800 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC40Ij48cGF0aCBkPSJNMzYgMzRjMC0yLjIgMS44LTQgNC00czQgMS44IDQgNC0xLjggNC00IDQtNC0xLjgtNC00eiIvPjwvZz48L2c+PC9zdmc+')] bg-center"></div>
        </div>
        <div className="container mx-auto px-4 py-16 md:py-24 relative">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">University Food Token System</h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100">
              A convenient way to book your meals at the university cafeteria
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {user ? (
                <Link
                  to="/dashboard"
                  className="bg-white text-blue-600 hover:bg-blue-50 px-6 py-3 rounded-lg font-medium shadow-md hover:shadow-lg transition-all flex items-center justify-center"
                >
                  Go to Dashboard
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="bg-white text-blue-600 hover:bg-blue-50 px-6 py-3 rounded-lg font-medium shadow-md hover:shadow-lg transition-all"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="bg-blue-500 hover:bg-blue-400 border border-white px-6 py-3 rounded-lg font-medium shadow-md hover:shadow-lg transition-all"
                  >
                    Register
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-gray-50 to-transparent"></div>
      </section>

      {/* Features Section */}
      <section className="py-16 container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">How It Works</h2>
          <p className="text-lg text-gray-600">
            Our food token system makes it easy to pre-book your meals at the university cafeteria
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="bg-blue-100 rounded-full w-12 h-12 flex items-center justify-center mb-4">
              <CreditCard className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2 text-gray-800">Book Tokens</h3>
            <p className="text-gray-600">
              Purchase tokens for lunch and dinner for the next day using your account balance
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="bg-green-100 rounded-full w-12 h-12 flex items-center justify-center mb-4">
              <Wallet className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2 text-gray-800">Manage Balance</h3>
            <p className="text-gray-600">Request money from administrators when your balance is low</p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="bg-purple-100 rounded-full w-12 h-12 flex items-center justify-center mb-4">
              <Calendar className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2 text-gray-800">Track Meals</h3>
            <p className="text-gray-600">View your upcoming and past meal tokens in your personalized dashboard</p>
          </div>
        </div>
      </section>

      {/* Rules Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">System Rules</h2>
            <p className="text-lg text-gray-600">
              Please familiarize yourself with the following rules for using the food token system
            </p>
          </div>

          <div className="max-w-4xl mx-auto bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl shadow-md overflow-hidden">
            <div className="bg-blue-600 px-6 py-4">
              <h3 className="text-xl font-semibold text-white flex items-center">
                <Shield className="mr-2 h-5 w-5" />
                Food Token System Rules
              </h3>
            </div>

            <div className="p-6 md:p-8">
              <ul className="space-y-6">
                <li className="flex">
                  <div className="flex-shrink-0">
                    <div className="bg-blue-100 rounded-full p-1 mt-1 border border-blue-200">
                      <Clock className="h-5 w-5 text-blue-600" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <h4 className="text-lg font-medium text-gray-800">Booking Window</h4>
                    <p className="text-gray-600 mt-1">
                      Tokens can only be purchased for the next day. Same-day bookings are not allowed.
                    </p>
                  </div>
                </li>

                <li className="flex">
                  <div className="flex-shrink-0">
                    <div className="bg-blue-100 rounded-full p-1 mt-1 border border-blue-200">
                      <DollarSign className="h-5 w-5 text-blue-600" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <h4 className="text-lg font-medium text-gray-800">Pricing</h4>
                    <p className="text-gray-600 mt-1">
                      Each meal (lunch or dinner) costs <span className="font-medium">40 Tk</span>. You can choose to
                      book either or both meals.
                    </p>
                  </div>
                </li>

                <li className="flex">
                  <div className="flex-shrink-0">
                    <div className="bg-blue-100 rounded-full p-1 mt-1 border border-blue-200">
                      <Wallet className="h-5 w-5 text-blue-600" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <h4 className="text-lg font-medium text-gray-800">Account Balance</h4>
                    <p className="text-gray-600 mt-1">
                      You must have sufficient balance in your account to purchase tokens. New users start with a
                      balance of <span className="font-medium">500 Tk</span>.
                    </p>
                  </div>
                </li>

                <li className="flex">
                  <div className="flex-shrink-0">
                    <div className="bg-blue-100 rounded-full p-1 mt-1 border border-blue-200">
                      <AlertTriangle className="h-5 w-5 text-blue-600" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <h4 className="text-lg font-medium text-gray-800">One Token Per Day</h4>
                    <p className="text-gray-600 mt-1">
                      Each user can only have one token per date. You cannot purchase multiple tokens for the same day.
                    </p>
                  </div>
                </li>

                <li className="flex">
                  <div className="flex-shrink-0">
                    <div className="bg-blue-100 rounded-full p-1 mt-1 border border-blue-200">
                      <Users className="h-5 w-5 text-blue-600" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <h4 className="text-lg font-medium text-gray-800">Money Requests</h4>
                    <p className="text-gray-600 mt-1">
                      When your balance is low, you can request money from administrators. All requests require admin
                      approval.
                    </p>
                  </div>
                </li>

                <li className="flex">
                  <div className="flex-shrink-0">
                    <div className="bg-blue-100 rounded-full p-1 mt-1 border border-blue-200">
                      <CheckCircle className="h-5 w-5 text-blue-600" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <h4 className="text-lg font-medium text-gray-800">Token Validation</h4>
                    <p className="text-gray-600 mt-1">
                      Present your token to the cafeteria staff during meal times. Tokens can be printed or shown on
                      your mobile device.
                    </p>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Meal Times Section */}
      <section className="py-16 container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Meal Times</h2>
          <p className="text-lg text-gray-600">The university cafeteria serves meals at the following times</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
          <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow">
            <div className="bg-gradient-to-r from-amber-500 to-amber-600 px-6 py-4">
              <h3 className="text-xl font-semibold text-white flex items-center">
                <Coffee className="mr-2 h-5 w-5" />
                Lunch
              </h3>
            </div>
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center">
                  <Clock className="h-5 w-5 text-amber-600 mr-2" />
                  <span className="text-gray-700 font-medium">Serving Hours</span>
                </div>
                <span className="text-lg font-bold text-gray-800">1:00 PM - 3:00 PM</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <DollarSign className="h-5 w-5 text-amber-600 mr-2" />
                  <span className="text-gray-700 font-medium">Price</span>
                </div>
                <span className="text-lg font-bold text-gray-800">40 Tk</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow">
            <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 px-6 py-4">
              <h3 className="text-xl font-semibold text-white flex items-center">
                <UtensilsCrossed className="mr-2 h-5 w-5" />
                Dinner
              </h3>
            </div>
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center">
                  <Clock className="h-5 w-5 text-indigo-600 mr-2" />
                  <span className="text-gray-700 font-medium">Serving Hours</span>
                </div>
                <span className="text-lg font-bold text-gray-800">8:00 PM - 10:00 PM</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <DollarSign className="h-5 w-5 text-indigo-600 mr-2" />
                  <span className="text-gray-700 font-medium">Price</span>
                </div>
                <span className="text-lg font-bold text-gray-800">40 Tk</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6">Ready to Get Started?</h2>
            <p className="text-xl mb-8 text-blue-100">
              Join the university food token system today and enjoy hassle-free meal bookings
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {user ? (
                <Link
                  to="/dashboard"
                  className="bg-white text-blue-600 hover:bg-blue-50 px-8 py-3 rounded-lg font-medium shadow-md hover:shadow-lg transition-all flex items-center justify-center"
                >
                  Go to Dashboard
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="bg-white text-blue-600 hover:bg-blue-50 px-8 py-3 rounded-lg font-medium shadow-md hover:shadow-lg transition-all"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="bg-blue-500 hover:bg-blue-400 border border-white px-8 py-3 rounded-lg font-medium shadow-md hover:shadow-lg transition-all"
                  >
                    Register
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-gray-300 py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="mb-6 md:mb-0">
                <h3 className="text-xl font-bold text-white flex items-center">
                  <CreditCard className="mr-2 h-5 w-5" />
                  Food Token System
                </h3>
                <p className="mt-2 text-sm">Bangabandhu Sheikh Mujibur Rahman Hall, RUET</p>
              </div>
              <div className="flex flex-col md:flex-row gap-4 md:gap-8">
                <Link to="/login" className="text-gray-300 hover:text-white transition-colors">
                  Login
                </Link>
                <Link to="/register" className="text-gray-300 hover:text-white transition-colors">
                  Register
                </Link>
                {user && (
                  <Link to="/dashboard" className="text-gray-300 hover:text-white transition-colors">
                    Dashboard
                  </Link>
                )}
              </div>
            </div>
            <div className="mt-8 pt-6 border-t border-gray-700 text-center text-sm">
              <p>&copy; {new Date().getFullYear()} Food Token System. All rights reserved.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Home

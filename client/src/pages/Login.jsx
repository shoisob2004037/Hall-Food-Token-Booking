"use client"

import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { CreditCard, Mail, Lock, LogIn, ArrowRight } from "lucide-react"

const Login = () => {
    const { user, login } = useAuth() 
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)
    const [loginSuccess, setLoginSuccess] = useState(false)
    const navigate = useNavigate()

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError("")
        setLoading(true)

        try {
            const result = await login(email, password)
            if (result.success) {
                console.log("Login result:", result, "user from useAuth:", user)
                setLoginSuccess(true) // Trigger navigation via useEffect
            } else {
                setError(result.message)
                setLoading(false)
            }
        } catch (err) {
            setError("Failed to login. Please try again.")
            console.error(err)
            setLoading(false)
        }
    }

    useEffect(() => {
        if (loginSuccess && user) {
            console.log("User after login:", user, "isAdmin:", user?.isAdmin)
            const isAdmin = user?.isAdmin ?? false
            navigate(isAdmin ? "/admin" : "/dashboard")
            setLoading(false)
            setLoginSuccess(false) // Reset to prevent re-navigation
        }
    }, [loginSuccess, user, navigate])

    return (
        <div className="min-h-screen flex flex-col md:flex-row bg-gray-50">
            {/* Logo Section */}
            <div className="md:w-1/2 bg-gradient-to-br from-blue-600 to-blue-800 flex flex-col justify-center items-center p-8 md:p-12">
                <div className="text-center">
                    <div className="bg-white/10 backdrop-blur-sm p-4 rounded-full inline-block mb-6">
                        <CreditCard className="h-16 w-16 text-white" />
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">Food Token System</h1>
                    <p className="text-blue-100 text-lg max-w-md mx-auto">
                        Access your account to manage meal tokens and enjoy hassle-free dining at the university cafeteria.
                    </p>
                    <div className="mt-8 hidden md:block">
                        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
                            <p className="text-white font-medium mb-2">Quick Access</p>
                            <ul className="text-blue-100 space-y-2">
                                <li className="flex items-center">
                                    <ArrowRight className="h-4 w-4 mr-2" />
                                    Book tokens for tomorrow's meals
                                </li>
                                <li className="flex items-center">
                                    <ArrowRight className="h-4 w-4 mr-2" />
                                    Check your current balance
                                </li>
                                <li className="flex items-center">
                                    <ArrowRight className="h-4 w-4 mr-2" />
                                    View your upcoming and past tokens
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            {/* Form Section */}
            <div className="md:w-1/2 flex items-center justify-center p-6 md:p-12">
                <div className="w-full max-w-md">
                    <div className="bg-white rounded-2xl shadow-xl p-8">
                        <div className="text-center mb-8">
                            <h2 className="text-2xl font-bold text-gray-800">Welcome Back</h2>
                            <p className="text-gray-600 mt-2">Sign in to your account to continue</p>
                        </div>

                        {error && (
                            <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-md mb-6 animate-fadeIn">
                                <div className="flex items-center">
                                    <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
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

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="email">
                                    Email Address
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Mail className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        className="pl-10 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                        id="email"
                                        type="email"
                                        placeholder="you@example.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="password">
                                    Password
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Lock className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        className="pl-10 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                        id="password"
                                        type="password"
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            <button
                                className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-all shadow-md hover:shadow-lg flex items-center justify-center"
                                type="submit"
                                disabled={loading}
                            >
                                {loading ? (
                                    <span className="flex items-center">
                                        <svg
                                            className="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
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
                                        Logging in...
                                    </span>
                                ) : (
                                    <span className="flex items-center">
                                        <LogIn className="mr-2 h-5 w-5" />
                                        Sign In
                                    </span>
                                )}
                            </button>

                            <div className="text-center mt-6">
                                <p className="text-gray-600">
                                    Don't have an account?{" "}
                                    <Link to="/register" className="text-blue-600 hover:text-blue-800 font-medium">
                                        Create Account
                                    </Link>
                                </p>
                            </div>
                        </form>
                    </div>

                    <div className="text-center mt-8">
                        <Link to="/" className="text-gray-600 hover:text-gray-800 text-sm">
                            ← Back to Home
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Login
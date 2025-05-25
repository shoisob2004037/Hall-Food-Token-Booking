"use client"

import { useState } from "react"
import { Link, useNavigate, useLocation } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { Home, ShoppingCart, User, LogOut, Menu, X, ChevronDown, Settings, CreditCard } from 'lucide-react'

const Navbar = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate("/login")
  }

  if (!user) return null // Don't show navbar if not logged in

  const isActive = (path) => {
    return location.pathname === path
  }

  return (
    <nav className="bg-gradient-to-r from-blue-600 to-blue-800 text-white shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-3">
          <Link to="/home" className="flex items-center space-x-2 group">
            <div className="bg-white p-1.5 rounded-md shadow-sm group-hover:shadow-md transition-all">
              <CreditCard className="h-6 w-6 text-blue-600" />
            </div>
            <span className="text-xl font-bold tracking-tight hidden md:block">Food Token System</span>
          </Link>
          <div className="hidden md:flex items-center space-x-1">
            <Link 
              to="/dashboard" 
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive("/dashboard") 
                  ? "bg-white/20 text-white" 
                  : "hover:bg-white/10 text-blue-100 hover:text-white"
              }`}
            >
              <div className="flex items-center space-x-1">
                <Home className="h-4 w-4" />
                <span>Dashboard</span>
              </div>
            </Link>
            
            {!user.isAdmin && (
              <Link 
                to="/buy-token" 
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive("/buy-token") 
                    ? "bg-white/20 text-white" 
                    : "hover:bg-white/10 text-blue-100 hover:text-white"
                }`}
              >
                <div className="flex items-center space-x-1">
                  <ShoppingCart className="h-4 w-4" />
                  <span>Buy Token</span>
                </div>
              </Link>
            )}
            
            {user.isAdmin && (
              <Link 
                to="/admin" 
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive("/admin") 
                    ? "bg-white/20 text-white" 
                    : "hover:bg-white/10 text-blue-100 hover:text-white"
                }`}
              >
                <div className="flex items-center space-x-1">
                  <Settings className="h-4 w-4" />
                  <span>Admin</span>
                </div>
              </Link>
            )}

            {/* User Profile Dropdown */}
            <div className="relative ml-3">
              <div>
                <button
                  type="button"
                  className="flex items-center px-3 py-2 text-sm font-medium rounded-md bg-blue-700 hover:bg-blue-800 transition-colors focus:outline-none"
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                >
                  <div className="flex items-center">
                    <div className="bg-blue-500 rounded-full p-1 mr-2">
                      <User className="h-4 w-4" />
                    </div>
                    <span className="max-w-[100px] truncate">{user.name}</span>
                    <ChevronDown className="ml-1 h-4 w-4" />
                  </div>
                </button>
              </div>

              {/* Dropdown Menu */}
              {profileDropdownOpen && (
                <div 
                  className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 ring-1 ring-black ring-opacity-5"
                  onMouseLeave={() => setProfileDropdownOpen(false)}
                >
                  <div className="px-4 py-2 text-sm text-gray-700 border-b">
                    <div className="font-medium truncate">{user.name}</div>
                    <div className="text-gray-500 truncate text-xs">{user.email}</div>
                  </div>
                  <Link 
                    to="/dashboard" 
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setProfileDropdownOpen(false)}
                  >
                    Profile
                  </Link>
                  
                  <div className="px-4 py-2 text-sm text-gray-700 border-b">
                    <div className="text-xs text-gray-500">Balance</div>
                    <div className="font-medium text-green-600">{user.balance} Tk</div>
                  </div>

                
                  
                  <button
                    onClick={() => {
                      setProfileDropdownOpen(false)
                      handleLogout()
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                  >
                    <div className="flex items-center">
                      <LogOut className="h-4 w-4 mr-2" />
                      <span>Logout</span>
                    </div>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-md text-blue-100 hover:text-white hover:bg-blue-700 focus:outline-none"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <span className="sr-only">Open main menu</span>
              {mobileMenuOpen ? (
                <X className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-blue-800 shadow-inner">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <Link
              to="/dashboard"
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                isActive("/dashboard")
                  ? "bg-blue-700 text-white"
                  : "text-blue-100 hover:bg-blue-700 hover:text-white"
              }`}
              onClick={() => setMobileMenuOpen(false)}
            >
              <div className="flex items-center">
                <Home className="h-5 w-5 mr-2" />
                <span>Dashboard</span>
              </div>
            </Link>
            
            {!user.isAdmin && (
              <Link
                to="/buy-token"
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  isActive("/buy-token")
                    ? "bg-blue-700 text-white"
                    : "text-blue-100 hover:bg-blue-700 hover:text-white"
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                <div className="flex items-center">
                  <ShoppingCart className="h-5 w-5 mr-2" />
                  <span>Buy Token</span>
                </div>
              </Link>
            )}
            
            {user.isAdmin && (
              <Link
                to="/admin"
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  isActive("/admin")
                    ? "bg-blue-700 text-white"
                    : "text-blue-100 hover:bg-blue-700 hover:text-white"
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                <div className="flex items-center">
                  <Settings className="h-5 w-5 mr-2" />
                  <span>Admin Dashboard</span>
                </div>
              </Link>
            )}
            
            <div className="border-t border-blue-700 pt-2">
              <div className="px-3 py-2">
                <div className="flex items-center">
                  <div className="bg-blue-600 rounded-full p-1 mr-2">
                    <User className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-white font-medium">{user.name}</div>
                    <div className="text-blue-200 text-xs">{user.balance} Tk</div>
                  </div>
                </div>
              </div>
              
              <button
                onClick={() => {
                  setMobileMenuOpen(false)
                  handleLogout()
                }}
                className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-blue-100 hover:bg-blue-700 hover:text-white"
              >
                <div className="flex items-center">
                  <LogOut className="h-5 w-5 mr-2" />
                  <span>Logout</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}

export default Navbar


"use client"

import { createContext, useState, useContext, useEffect } from "react"
import axios from "axios"

const AuthContext = createContext()

export const useAuth = () => useContext(AuthContext)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkLoggedIn = async () => {
      const token = localStorage.getItem("token")

      if (token) {
        try {
          const config = {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }

          const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/users/me`, config)
          setUser(res.data)
        } catch (err) {
          localStorage.removeItem("token")
          console.error("Authentication error:", err)
        }
      }

      setLoading(false)
    }

    checkLoggedIn()
  }, [])

  const login = async (email, password) => {
    try {
      const res = await axios.post(`${process.env.REACT_APP_API_URL}/api/auth/login`, { email, password })
      localStorage.setItem("token", res.data.token)
      setUser(res.data.user)
      return { success: true }
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || "Login failed",
      }
    }
  }

  const register = async (name, email, password, studentId) => {
    try {
      const res = await axios.post(`${process.env.REACT_APP_API_URL}/api/auth/register`, {
        name,
        email,
        password,
        studentId,
      })
      return { success: true }
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || "Registration failed",
      }
    }
  }

  const logout = () => {
    localStorage.removeItem("token")
    setUser(null)
  }

  const value = {
    user,
    loading,
    login,
    register,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

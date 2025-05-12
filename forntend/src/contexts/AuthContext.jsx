// src/contexts/AuthContext.jsx
import React, { createContext, useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // For redirecting after login/logout

const AuthContext = createContext(null);

// Mock user data - in a real app, this would come from an API
const MOCK_USER = {
  id: "user001",
  username: "admin",
  email: "admin@gmail.com",
  firstName: "Admin",
  lastName: "User",
  role: "administrator", // For future RBAC
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true); // To handle initial auth check
  const navigate = useNavigate();

  // Simulate checking for an existing session on app load
  useEffect(() => {
    const storedUser = localStorage.getItem("erpUser");
    if (storedUser) {
      try {
        setCurrentUser(JSON.parse(storedUser));
      } catch (e) {
        console.error("Error parsing stored user data:", e);
        localStorage.removeItem("erpUser"); // Clear invalid data
      }
    }
    setIsLoading(false); // Finished initial check
  }, []);

  const login = async (username, password) => {
    // Simulate API call for login
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (username === "admin" && password === "password") {
          // Simple mock validation
          localStorage.setItem("erpUser", JSON.stringify(MOCK_USER));
          setCurrentUser(MOCK_USER);
          resolve(MOCK_USER);
        } else {
          reject(new Error("Invalid username or password"));
        }
      }, 1000);
    });
  };

  const logout = () => {
    localStorage.removeItem("erpUser");
    setCurrentUser(null);
    navigate("/login"); // Redirect to login page after logout
  };

  const value = {
    currentUser,
    isLoadingAuth: isLoading, // Renamed to avoid conflict with component isLoading
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

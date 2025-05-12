// src/components/auth/ProtectedRoute.jsx
import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

const ProtectedRoute = ({ children }) => {
  const { currentUser, isLoadingAuth } = useAuth();
  const location = useLocation();

  if (isLoadingAuth) {
    // Show a loading spinner or a blank page while auth state is being determined
    return (
      <div className="fixed inset-0 flex flex-col justify-center items-center bg-slate-900 z-[9999]">
        {" "}
        {/* Full screen, high z-index */}
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-accent mb-4"></div>
        <p className="text-xl text-slate-200">Verifying authentication...</p>
        <p className="text-sm text-slate-400 mt-1">Please wait a moment.</p>
      </div>
    );
  }

  if (!currentUser) {
    // User not logged in, redirect to login page
    // Pass the current location so we can redirect back after login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // User is logged in, render the requested component
  return children;
};

export default ProtectedRoute;

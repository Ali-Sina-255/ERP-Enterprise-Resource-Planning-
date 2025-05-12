// src/pages/LoginPage.jsx
import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate, useLocation, Navigate } from "react-router-dom";
import Input from "../components/common/Input";
import Button from "../components/common/Button";
import { LogIn, AlertCircle, FileText } from "lucide-react";
// You can add a logo component or image here
// import Logo from '../components/common/Logo';

const LoginPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login, currentUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || "/dashboard"; // Where to redirect after login

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);
    try {
      await login(username, password);
      navigate(from, { replace: true }); // Redirect to intended page or dashboard
    } catch (err) {
      setError(
        err.message || "Failed to log in. Please check your credentials."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // If user is already logged in, redirect them from the login page
  if (currentUser) {
    return <Navigate to={from} replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-700 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md bg-white shadow-2xl rounded-xl p-8 md:p-12 space-y-6 transform transition-all hover:scale-105 duration-300">
        <div className="text-center">
          {/* <Logo className="w-24 h-24 mx-auto mb-4 text-accent" /> Replace with your actual logo */}
          <FileText size={48} className="mx-auto mb-4 text-accent" />{" "}
          {/* Placeholder Icon */}
          <h1 className="text-3xl font-bold text-gray-800">ERP Login</h1>
          <p className="text-gray-500 mt-2">
            Access your enterprise resources.
          </p>
        </div>

        {error && (
          <div
            className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md"
            role="alert"
          >
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
              <p className="text-sm">{error}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="Username"
            id="username"
            name="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="e.g., admin"
            required
            disabled={isSubmitting}
            autoComplete="username"
          />
          <Input
            label="Password"
            id="password"
            name="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            disabled={isSubmitting}
            autoComplete="current-password"
          />
          <Button
            type="submit"
            variant="primary"
            className="w-full !py-3 text-base" // Override default padding for a larger button
            disabled={isSubmitting}
            IconLeft={LogIn}
          >
            {isSubmitting ? "Logging In..." : "Log In"}
          </Button>
        </form>
        <p className="text-center text-sm text-gray-500">
          Forgot password?{" "}
          <a href="#" className="font-medium text-accent hover:underline">
            Reset here
          </a>
        </p>
      </div>
      <p className="text-center text-xs text-slate-400 mt-8">
        © {new Date().getFullYear()} Your ERP Solution. All rights reserved.{" "}
        <br />
        (Login with username: admin, password: password)
      </p>
    </div>
  );
};

export default LoginPage;

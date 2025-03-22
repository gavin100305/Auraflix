import React, { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const location = useLocation();

  useEffect(() => {
    // Check for token in localStorage
    const token = localStorage.getItem("authToken");
    setIsAuthenticated(!!token);
  }, []);

  if (isAuthenticated === null) {
    // Still checking authentication status
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl p-8 shadow-xl">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
          <p className="mt-4 text-white">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Not authenticated, redirect to login
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // Authenticated, render children
  return children;
};

export default ProtectedRoute;

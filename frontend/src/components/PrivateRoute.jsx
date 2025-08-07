// components/PrivateRoute.jsx
import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";

const PrivateRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth0();

  if (isLoading) return null; // Or a loader/spinner

  return isAuthenticated ? children : <Navigate to="/" />;
};

export default PrivateRoute;

import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const PrivateRoute = ({ allowedRoles }) => {
  const { authRole } = useAuth();
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  // ✅ Prevent redirecting if authRole is not yet available
  if (!user.id) {
    console.warn("🔒 Not authenticated. Redirecting to login.");
    return <Navigate to="/login" replace />;
  }

  if (!authRole) {
    console.warn("⚠️ No authRole found yet, allowing access until it's available.");
    return <Outlet />; // ✅ Let the page load first
  }

  if (!allowedRoles.includes(authRole)) {
    console.warn("🚫 Unauthorized access. Redirecting to homepage.");
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default PrivateRoute;

import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Loader from "../components/Loader";

export default function ProtectedRoute({ allowedRoles }) {
  const { user, loading } = useAuth();

  // Normalize role comparison to avoid case-sensitivity issues (e.g., "client" vs "Client")
  const userRole = (user?.role || "").toLowerCase();
  const allowed = !allowedRoles
    ? true
    : allowedRoles.some((role) => role.toLowerCase() === userRole);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
        <Loader />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowed) {
    // Redirect to their dashboard if they try to access another role's route
    const redirect = `/${userRole || "client"}/dashboard`;
    return <Navigate to={redirect} replace />;
  }

  return <Outlet />;
}

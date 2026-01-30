import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ allowedRoles }) {
  const { user, loading } = useAuth();

  if (loading) {
    return null; // or a spinner
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect to their dashboard if they try to access another role's route
    const redirect = `/${user.role}/dashboard`;
    return <Navigate to={redirect} replace />;
  }

  return <Outlet />;
}

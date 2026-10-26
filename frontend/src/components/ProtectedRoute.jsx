import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { FullPageSpinner } from "./Spinner";

export default function ProtectedRoute({ children }) {
  const { user, token } = useAuth();
  const location = useLocation();

  // While the token exists but user hasn't resolved yet, show a spinner.
  if (token && !user) return <FullPageSpinner />;
  if (!token) return <Navigate to="/login" state={{ from: location }} replace />;
  return children;
}

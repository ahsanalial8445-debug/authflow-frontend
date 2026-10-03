import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-full border-[3px] border-brand-200 border-t-brand-600 animate-spin" />
          <p className="text-sm text-slate-600">Loading your account...</p>
        </div>
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
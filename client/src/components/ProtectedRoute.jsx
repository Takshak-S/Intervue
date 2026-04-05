import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext.jsx";

function ProtectedRoute({ children }) {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 gap-4 bg-slate-50">
        <div
          className="w-10 h-10 border-4 border-slate-200 border-t-primary rounded-full animate-spin"
          role="status"
        />
        <p className="font-sans text-base text-slate-500 m-0">
          Authenticating...
        </p>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" />;

  return <div className="min-h-screen bg-slate-50">{children}</div>;
}

export default ProtectedRoute;

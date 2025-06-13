
import { Navigate } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { ReactNode } from "react";

type ProtectedRouteProps = {
  children: ReactNode;
  redirectTo?: string;
};

const ProtectedRoute = ({
  children,
  redirectTo = "/login",
}: ProtectedRouteProps) => {
  const { user, isLoading } = useAuth();

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-zinc-900"></div>
      </div>
    );
  }

  // Redirect if not authenticated
  if (!user) {
    return <Navigate to={redirectTo} />;
  }

  // Render children if authenticated
  return <>{children}</>;
};

export default ProtectedRoute;

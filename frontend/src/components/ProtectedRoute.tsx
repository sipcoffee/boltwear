import { Navigate, useLocation } from "react-router-dom";

import { useAuthStore } from "@/stores/auth";

interface ProtectedRouteProps {
  children: React.ReactNode;
  ownerOnly?: boolean;
}

export function ProtectedRoute({ children, ownerOnly = false }: ProtectedRouteProps) {
  const { user, initialized } = useAuthStore();
  const location = useLocation();

  if (!initialized) {
    return <div className="flex h-screen items-center justify-center text-muted-foreground">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  if (ownerOnly && user.role !== "OWNER") {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

import type { PropsWithChildren } from "react";
import { Navigate } from "react-router-dom";

import { useAuthStore } from "../stores/authStore";

type PublicRouteProps = PropsWithChildren;

export const PublicRoute = ({ children }: PublicRouteProps) => {
  const { user } = useAuthStore();
  return !user ? children : <Navigate to="/" replace />;
};

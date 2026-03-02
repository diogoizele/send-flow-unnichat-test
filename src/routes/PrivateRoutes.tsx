import type { PropsWithChildren } from "react";
import { Navigate } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";

type PrivateRouteProps = PropsWithChildren;

export const PrivateRoute = ({ children }: PrivateRouteProps) => {
  const { user } = useAuthStore();
  return user ? children : <Navigate to="/login" replace />;
};

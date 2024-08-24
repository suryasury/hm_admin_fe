import { UserState } from "@/types";
import React from "react";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

type ProtectedRouteProps = {
  allowedRoles: string[];
  children: React.ReactNode;
};

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  allowedRoles,
  children,
}) => {
  const user = useSelector((state: { user: UserState }) => state.user.user);

  if (!user || !allowedRoles.includes(user.role)) {
    return <Navigate to="/admin/unauthorized" replace />;
  }

  return children;
};

export default ProtectedRoute;

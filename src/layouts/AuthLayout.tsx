import logo from "@/assets/hms-logo.jpeg";
import { Outlet } from "react-router-dom";
import ErrorBoundary from "./ErrorBoundary";
const AuthLayout = () => {
  return (
    <div className="p-6">
      <img src={logo} className="w-[100px] h-[100px] mb-3" />
      <ErrorBoundary>
        <Outlet />
      </ErrorBoundary>
    </div>
  );
};

export default AuthLayout;

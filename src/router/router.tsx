import { routesAndNavItems } from "@/config/roleBasedConfig";
import LoginPage from "@/pages/LoginPage";
import { createBrowserRouter } from "react-router-dom";
import AuthLayout from "../layouts/AuthLayout";
import ErrorBoundary from "../layouts/ErrorBoundary";
import MainLayout from "../layouts/MainLayout";
import NotFoundPage from "../pages/NotFoundPage";
import FirstLoginPassword from "../pages/PasswordManagement/FirstLoginPassword/FirstLoginPassword";
import ForgetPassword from "../pages/PasswordManagement/ForgetPassword/ForgetPassword";
import ResetPassword from "../pages/PasswordManagement/ForgetPassword/ResetPassword";
import { APP_ROUTES } from "./appRoutes";
import ProtectedRoute from "./ProtectedRoutes";

const generateRoutes = () => {
  return routesAndNavItems.map(({ path, element, roles }) => ({
    path,
    element: <ProtectedRoute allowedRoles={roles}>{element}</ProtectedRoute>,
  }));
};

const router = createBrowserRouter([
  {
    path: "/admin",
    element: (
      <ErrorBoundary>
        <MainLayout />
      </ErrorBoundary>
    ),
    children: [
      ...generateRoutes(),
      /* 404 page */
      {
        path: "*",
        element: <NotFoundPage />,
      },
    ],
  },
  {
    path: "/",
    element: (
      <ErrorBoundary>
        <AuthLayout />
      </ErrorBoundary>
    ),
    children: [
      {
        path: APP_ROUTES.LOGIN,
        element: <LoginPage />,
      },
      {
        path: APP_ROUTES.FORGET_PASSWORD,
        element: <ForgetPassword />,
      },
      {
        path: APP_ROUTES.RESET_PASSWORD + "/:token",
        element: <ResetPassword />,
      },
      {
        path: APP_ROUTES.FIRST_TIME_PASSWORD + "/:token",
        element: <FirstLoginPassword />,
      },
      /* 404 page */
      {
        path: "*",
        element: <NotFoundPage />,
      },
    ],
  },
]);

export default router;

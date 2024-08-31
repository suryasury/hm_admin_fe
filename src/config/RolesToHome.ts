import { APP_ROUTES } from "@/router/appRoutes";

export const roleToHomeRoute: Record<string, string> = {
  ADMIN: APP_ROUTES.DASHBOARD,
  DOCTOR: APP_ROUTES.APPOINTMENTS,
};

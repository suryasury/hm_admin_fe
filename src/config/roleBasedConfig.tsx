// roleBasedConfig.ts
import Admins from "@/pages/Admin/Admins";
import CreateAdmin from "@/pages/Admin/CreateAdmin";
import UpdateAdmin from "@/pages/Admin/UpdateAdmin";
import Ailments from "@/pages/Ailments/Ailments";
import AppointmentFeedback from "@/pages/AppointmentFeedbacks";
import AppointmentDetails from "@/pages/Appointments/AppointmentDetails";
import AppointmentsPage from "@/pages/Appointments/AppointmentsPage";
import HomePage from "@/pages/DashboardPage";
import CreateDoctor from "@/pages/Doctos/CreateDoctor";
import Doctors from "@/pages/Doctos/Doctors";
import UpdateDoctor from "@/pages/Doctos/UpdateDoctor";
import Medicines from "@/pages/Medicines/Medicines";
import PatientDetails from "@/pages/Patients/PatientDetails";
import PatientsPage from "@/pages/Patients/PatientsPage";
import ProfilePage from "@/pages/ProfilePage";
import Slot from "@/pages/Slots/Slot";
import { APP_ROUTES } from "@/router/appRoutes";
import {
  BetweenHorizontalStart,
  Biohazard,
  CalendarPlus2,
  LayoutDashboard,
  MessageSquareText,
  PillBottle,
  Stethoscope,
  UserRoundCog,
  Users,
} from "lucide-react";

const navItemIconClass = "h-4 w-4";

// eslint-disable-next-line react-refresh/only-export-components
const ROLES: Record<string, string> = {
  ADMIN: "ADMIN",
  DOCTOR: "DOCTOR",
} as const;

export const routesAndNavItems = [
  {
    path: APP_ROUTES.DASHBOARD,
    element: <HomePage />,
    label: "Dashboard",
    icon: <LayoutDashboard className={navItemIconClass} />,
    roles: [ROLES.ADMIN],
  },
  {
    path: APP_ROUTES.PATIENTS,
    element: <PatientsPage />,
    label: "Patients",
    icon: <Users className={navItemIconClass} />,
    roles: [ROLES.ADMIN],
  },
  {
    path: APP_ROUTES.DOCTORS,
    element: <Doctors />,
    label: "Doctors",
    icon: <Stethoscope className={navItemIconClass} />,
    roles: [ROLES.ADMIN],
  },
  {
    path: APP_ROUTES.APPOINTMENTS,
    element: <AppointmentsPage />,
    label: "Appointments",
    icon: <CalendarPlus2 className={navItemIconClass} />,
    roles: [ROLES.ADMIN, ROLES.DOCTOR],
  },
  {
    path: APP_ROUTES.MEDICATION,
    element: <Medicines />,
    label: "Medicines",
    icon: <PillBottle className={navItemIconClass} />,
    roles: [ROLES.ADMIN],
  },
  {
    path: APP_ROUTES.AILMENTS,
    element: <Ailments />,
    label: "Ailments",
    icon: <Biohazard className={navItemIconClass} />,
    roles: [ROLES.ADMIN],
  },
  {
    path: APP_ROUTES.SLOTS,
    element: <Slot />,
    label: "Slots",
    icon: <BetweenHorizontalStart className={navItemIconClass} />,
    roles: [ROLES.ADMIN],
  },
  {
    path: APP_ROUTES.APPOINTMENT_FEEDBACKS,
    element: <AppointmentFeedback />,
    label: "Feedbacks",
    icon: <MessageSquareText className={navItemIconClass} />,
    roles: [ROLES.ADMIN, ROLES.DOCTOR],
  },
  {
    path: APP_ROUTES.ADMINS,
    element: <Admins />,
    label: "Admins",
    icon: <UserRoundCog className={navItemIconClass} />,
    roles: [ROLES.ADMIN],
  },
  {
    path: APP_ROUTES.CREATE_ADMIN,
    element: <CreateAdmin />,
    roles: [ROLES.ADMIN],
  },
  {
    path: APP_ROUTES.UPDATE_ADMIN + "/:id",
    element: <UpdateAdmin />,
    roles: [ROLES.ADMIN],
  },
  {
    path: APP_ROUTES.CREATE_DOCTOR,
    element: <CreateDoctor />,
    roles: [ROLES.ADMIN],
  },
  {
    path: APP_ROUTES.UPDATE_DOCTOR + "/:id",
    element: <UpdateDoctor />,
    roles: [ROLES.ADMIN],
  },
  {
    path: APP_ROUTES.PROFILE,
    element: <ProfilePage />,
    label: "Profile",
    icon: null,
    roles: [ROLES.ADMIN, ROLES.DOCTOR],
  },
  {
    path: APP_ROUTES.PATIENT_DETAILS + "/:id",
    element: <PatientDetails />,
    roles: [ROLES.ADMIN, ROLES.DOCTOR],
  },
  {
    path: APP_ROUTES.APPOINTMENT_DETAILS + "/:id",
    element: <AppointmentDetails />,
    roles: [ROLES.ADMIN, ROLES.DOCTOR],
  },
];

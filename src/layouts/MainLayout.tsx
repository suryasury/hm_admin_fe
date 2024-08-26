import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { routesAndNavItems } from "@/config/roleBasedConfig";
import { APP_ROUTES } from "@/router/appRoutes";
import { clearUser } from "@/state/userReducer";
import { UserState } from "@/types";
import {
  ChevronLeft,
  ChevronRight,
  Menu,
  Package2,
  UserIcon,
} from "lucide-react";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Link,
  Navigate,
  Outlet,
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";
import { toast } from "sonner";

const generateNavItems = (userRole: string) => {
  return routesAndNavItems
    .filter((item) => item.roles.includes(userRole) && item.label && item.icon)
    .map(({ label, icon, path }) => ({
      label,
      icon,
      link: path,
    }));
};

const DashboardLayout = () => {
  const [openSidebar, setOpenSidebar] = useState<boolean>(false);
  const [collapseSidebar, setCollapseSidebar] = useState<boolean>(false);
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((state: { user: UserState }) => state.user.user);
  const { id } = useParams();


  const linkToTitle = {
    [APP_ROUTES.DASHBOARD]: "Dashboard",
    [APP_ROUTES.PATIENTS]: "Patients",
    [APP_ROUTES.PATIENT_DETAILS + `/${id}`]: "Patient Details",
    [APP_ROUTES.ADMINS]: "Admins",
    [APP_ROUTES.CREATE_ADMIN]: "Create Admin",
    [APP_ROUTES.UPDATE_ADMIN + `/${id}`]: "Update Admin",
    [APP_ROUTES.APPOINTMENTS]: "Appointments",
    [APP_ROUTES.MEDICATION]: "Medicines",
    [APP_ROUTES.AILMENTS]: "Ailments",
    [APP_ROUTES.SLOTS]: "Slots",
    [APP_ROUTES.APPOINTMENT_FEEDBACKS]: "Feedbacks",
    [APP_ROUTES.DOCTORS]: "Doctors",
    [APP_ROUTES.UPDATE_DOCTOR + `/${id}`]: "Update Doctor",
    [APP_ROUTES.CREATE_DOCTOR]: "Create Doctor",
    [APP_ROUTES.PROFILE]: "Profile",
    [APP_ROUTES.APPOINTMENT_DETAILS + `/${id}`]: "Appointment Details",
  } as const;

  const navItems = generateNavItems(user?.role ?? "admin");

  if (!user) {
    toast.error("Session expired. Please login again.");
    return <Navigate to={APP_ROUTES.LOGIN} />;
  }

  return (
    <div
      className={`grid min-h-screen w-full ${
        collapseSidebar ? "md:grid-cols-[80px_1fr]" : "md:grid-cols-[230px_1fr]"
      }`}
    >
      <div
        className={`hidden border-r bg-muted/40 md:block ${
          collapseSidebar ? "w-fit" : ""
        }`}
      >
        <div className="flex h-full max-h-screen flex-col gap-2">
          <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-4">
            <Link to="/" className="flex items-center gap-2 font-semibold">
              <Package2 className="h-6 w-6" />
              {!collapseSidebar && <span className="">HMS</span>}
            </Link>
          </div>
          <div className="flex-1 relative">
            <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
              {navItems.map((item) => (
                <Link
                  key={item.link}
                  to={item.link}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary  ${
                    location.pathname.includes(item.link)
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground"
                  }`}
                >
                  {item.icon}
                  {!collapseSidebar && item.label}
                </Link>
              ))}
            </nav>
            <Button
              size="icon"
              variant={"outline"}
              className="absolute top-1/2 right-[-18px]"
              onClick={() => setCollapseSidebar((prev) => !prev)}
            >
              {collapseSidebar ? <ChevronRight /> : <ChevronLeft />}
            </Button>
          </div>
        </div>
      </div>
      <div className="flex flex-col">
        <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6">
          <Sheet onOpenChange={setOpenSidebar} open={openSidebar}>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="shrink-0 md:hidden"
              >
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="flex flex-col w-[260px]">
              <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
                {navItems.map((item) => (
                  <Link
                    key={item.link}
                    to={item.link}
                    onClick={() => setOpenSidebar(false)}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary  ${
                      location.pathname.includes(item.link)
                        ? "bg-primary bg-opacity-10"
                        : "text-muted-foreground"
                    }`}
                  >
                    {item.icon}
                    {item.label}
                  </Link>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
          <div className="w-full flex-1">
            <h1 className="text-lg font-semibold md:text-2xl" id="header-title">
              {linkToTitle[location.pathname as keyof typeof linkToTitle]}
            </h1>
          </div>
          <div className="flex flex-col ">
            <p className="font-semibold">{user?.name}</p>
            <p className="text-muted-foreground text-[12px] capitalize">
              {user.role.toLowerCase()}
            </p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary" size="icon" className="rounded-full">
                <Avatar className="w-10 h-10">
                  <AvatarImage
                    src={user?.signedUrl}
                    alt="image"
                    className="object-fit "
                  />
                  <AvatarFallback className="hover:cursor-pointer">
                    <UserIcon className="w-12 h-12" />
                  </AvatarFallback>
                </Avatar>
                <span className="sr-only">Toggle user menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate(APP_ROUTES.PROFILE)}>
                Profile
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => {
                  dispatch(clearUser());
                  navigate(APP_ROUTES.LOGIN);
                }}
              >
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>

        <Outlet />
      </div>
    </div>
  );
};

export default DashboardLayout;

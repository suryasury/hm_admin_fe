import {
  Activity,
  ArrowUpRight,
  CalendarCheck,
  CalendarPlus2,
  CalendarX,
  Hourglass,
  Stethoscope,
  Users,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Spinner from "@/components/ui/spinner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import useErrorHandler from "@/hooks/useError";
import { getAppointmentList, getDashboardMetrics } from "@/https/admin-service";
import { APP_ROUTES } from "@/router/appRoutes";
import { Appointment } from "@/types";
import { statusClasses } from "@/utils";
import { format } from "date-fns";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

interface ITodaysMetrics {
  todaysAppointment: number;
  completedAppointments: number;
  todaysCancelledAppointments: number;
}
interface IMetrics {
  totalAppointments: number;
  totalDoctors: number;
  totalPatients: number;
  activeAppointments: number;
}

const METRICS_INITIAL_STATE: IMetrics = {
  totalAppointments: 0,
  totalDoctors: 0,
  totalPatients: 0,
  activeAppointments: 0,
};

const TODAYS_METRICS_INITIAL_STATE: ITodaysMetrics = {
  todaysAppointment: 0,
  completedAppointments: 0,
  todaysCancelledAppointments: 0,
};

const DashboardPage = () => {
  const [fetching, setFetching] = useState<boolean>(false);
  const [metrics, setMetrics] = useState<IMetrics>(METRICS_INITIAL_STATE);
  const [todaysMetrics, setTodaysMetrics] = useState<ITodaysMetrics>(
    TODAYS_METRICS_INITIAL_STATE
  );
  const [appointmentList, setApppointmentList] = useState<Appointment[]>([]);
  const navigate = useNavigate();

  const handleError = useErrorHandler();

  const fetchDashboardMetrics = async () => {
    try {
      const [metricsRes, todaysMetricsRes, appointmentListRes] =
        await Promise.all([
          getDashboardMetrics(),
          getDashboardMetrics("today"),
          getAppointmentList({
            page: "1",
            limit: "5",
            date: format(new Date(), "yyyy-MM-dd"),
          }),
        ]);
      setMetrics(metricsRes.data.data);
      setTodaysMetrics(todaysMetricsRes.data.data);
      setApppointmentList(appointmentListRes.data.data.appointmentList);
    } catch (error) {
      handleError(error, "Error fetching dashboard metrics");
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchDashboardMetrics();

    return () => {
      setMetrics(METRICS_INITIAL_STATE);
      setTodaysMetrics(TODAYS_METRICS_INITIAL_STATE);
      setApppointmentList([]);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      {fetching ? (
        <div className="flex gap-2 items-center">
          <Spinner />
          <span className="text-muted-foreground">Fetching metrics...</span>
        </div>
      ) : (
        <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
          <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
            <Card x-chunk="dashboard-01-chunk-0">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Appointments
                </CardTitle>
                <CalendarPlus2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {metrics?.totalAppointments}
                </div>
              </CardContent>
            </Card>
            <Card x-chunk="dashboard-01-chunk-1">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Doctors
                </CardTitle>
                <Stethoscope className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {metrics?.totalDoctors}
                </div>
              </CardContent>
            </Card>
            <Card x-chunk="dashboard-01-chunk-2">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Patients
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {metrics?.totalPatients}
                </div>
              </CardContent>
            </Card>
            <Card x-chunk="dashboard-01-chunk-3">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Active Appointments
                </CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {metrics?.activeAppointments}
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="grid gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3">
            <Card className="xl:col-span-2" x-chunk="dashboard-01-chunk-4">
              <CardHeader className="flex flex-row items-center">
                <div className="grid gap-2">
                  <CardTitle>Today's Appointments</CardTitle>
                  <CardDescription>
                    Today's recent appointments from your hospital.
                  </CardDescription>
                </div>
                <Button
                  asChild
                  size="sm"
                  className="ml-auto gap-1"
                  variant="link"
                >
                  <Link to={APP_ROUTES.APPOINTMENTS}>
                    View All
                    <ArrowUpRight className="h-4 w-4" />
                  </Link>
                </Button>
              </CardHeader>
              <CardContent>
                <Table className={fetching ? "pointer-events-none" : ""}>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Patient</TableHead>
                      <TableHead>Doctor</TableHead>
                      <TableHead>Token No</TableHead>
                      <TableHead className="hidden md:table-cell">
                        Date & Time
                      </TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  {appointmentList.length === 0 ? (
                    <TableBody>
                      <TableRow>
                        <TableCell colSpan={4} className="text-center">
                          No Appoinments
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  ) : (
                    <TableBody>
                      {appointmentList?.map((appointment: Appointment) => (
                        <TableRow
                          key={appointment.id}
                          onClick={() =>
                            navigate(
                              `${APP_ROUTES.APPOINTMENT_DETAILS}/${appointment.id}`
                            )
                          }
                          className="cursor-pointer"
                        >
                          <TableCell className="font-medium">
                            <div className="font-medium">
                              {appointment.patient.name}
                            </div>
                            <div className="hidden text-sm text-muted-foreground md:inline">
                              {appointment.patient.phoneNumber}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="font-medium">
                              {appointment.doctor.name}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="font-medium">
                              {appointment.tokenNumber}
                            </div>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            {`${format(
                              appointment.appointmentDate,
                              "dd-MM-yyyy"
                            )}, ${appointment.doctorSlots.slot.startTime}`}
                          </TableCell>
                          <TableCell className="capitalize">
                            <p
                              className={`badge ${
                                statusClasses[appointment.appointmentStatus]
                              } px-2 py-1 rounded-lg text-xs w-[90px] text-center capitalize self-start`}
                            >
                              {appointment.appointmentStatus.toLowerCase()}
                            </p>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  )}
                </Table>
              </CardContent>
            </Card>
            <Card x-chunk="dashboard-01-chunk-5">
              <CardHeader className="flex flex-row items-center">
                <div className="grid gap-2">
                  <CardTitle>Today's stats</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="grid gap-8 p-4">
                <Card x-chunk="dashboard-01-chunk-0">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Appointments Scheduled 
                    </CardTitle>
                    <CalendarCheck className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {todaysMetrics?.todaysAppointment}
                    </div>
                  </CardContent>
                </Card>
                <Card x-chunk="dashboard-01-chunk-0">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Completed Appointments
                    </CardTitle>
                    <Hourglass className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {todaysMetrics?.completedAppointments}
                    </div>
                  </CardContent>
                </Card>
                <Card x-chunk="dashboard-01-chunk-0">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Cancelled Appointments
                    </CardTitle>
                    <CalendarX className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {todaysMetrics?.todaysCancelledAppointments}
                    </div>
                  </CardContent>
                </Card>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </>
  );
};

export default DashboardPage;

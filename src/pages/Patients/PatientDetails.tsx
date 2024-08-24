import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
} from "@/components/ui/pagination";
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
import { getAppointmentList, getPatientDetails } from "@/https/admin-service";
import { APP_ROUTES } from "@/router/appRoutes";
import { Appointment } from "@/types";
import { statusClasses } from "@/utils";
import { format } from "date-fns";
import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

interface PatientDetails {
  id: string;
  createdAt: string;
  updatedAt: string;
  name: string;
  email: string;
  password: string;
  isEmailVerified: boolean;
  isMobileNumberVerified: boolean;
  phoneNumber: string;
  isd_code: string;
  dateOfBirth: string;
  gender: "MALE" | "FEMALE" | "OTHERS";
  profilePictureUrl: string;
  bloodGroup: string;
  houseNumber: string;
  address1: string;
  address2: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  isActive: boolean;
  isDeleted: boolean;
  signedUrl: string;
}
const PatientDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  if (!id) {
    navigate(APP_ROUTES.PATIENTS);
  }

  const [fetching, setIsFetching] = useState<boolean>(false);
  const [totalRecords, setTotalRecords] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [noOfPages, setNoOfPages] = useState(0);
  const [appointmentList, setAppointmentList] = useState<Appointment[]>([]);
  const [patientDetails, setPatientDetails] = useState<PatientDetails>();
  const startIndex = (currentPage - 1) * rowsPerPage + 1;
  const endIndex = appointmentList?.length + startIndex - 1;

  const handleError = useErrorHandler();

  const fetchPatientDetails = async () => {
    try {
      setIsFetching(true);
      const response = await getPatientDetails(id!);
      setPatientDetails(response.data.data);
    } catch (error) {
      handleError(error, "Failed to fetch patient details");
    } finally {
      setIsFetching(false);
    }
  };
  const fetchAppointmentList = async () => {
    try {
      setIsFetching(true);
      const response = await getAppointmentList({
        page: currentPage.toString(),
        limit: rowsPerPage.toString(),
        patientId: id!,
      });
      const data = response.data.data.appointmentList;
      const totalRecords = response.data.data.meta.totalMatchingRecords;
      setTotalRecords(totalRecords);
      setNoOfPages(Math.ceil(totalRecords / rowsPerPage));
      setAppointmentList(data);
    } catch (error) {
      handleError(error, "Failed to fetch medicine list");
    } finally {
      setIsFetching(false);
    }
  };
  const getCombinedAddress = (details: PatientDetails) => {
    const addressParts = [
      details.houseNumber,
      details.address1,
      details.address2,
      details.city,
      details.state,
      details.pincode,
      details.country,
    ].filter((part) => part);

    return addressParts.length > 0
      ? addressParts.join(", ")
      : "No address provided";
  };

  useEffect(() => {
    fetchAppointmentList();
  }, [currentPage, rowsPerPage]);

  useEffect(() => {
    fetchPatientDetails();
  }, []);

  if (fetching) {
    return <Spinner />;
  }

  return fetching ? (
    <div className="flex gap-2">
      <Spinner /> Fetching details...
    </div>
  ) : (
    patientDetails && (
      <div className="p-8">
        <Button
          variant="link"
          size="sm"
          className="mb-4"
          onClick={() => navigate(APP_ROUTES.PATIENTS)}
        >
          <ArrowLeft className="h-3.5 w-3.5 mr-2" />
          Go Back
        </Button>
        <div className="flex gap-4  md:gap-8 flex-wrap">
          <Card
            x-chunk="appointment-details-patient-details-chunk"
            className="h-fit max-w-[375px]"
          >
            <CardHeader>
              <CardTitle>Patient Details</CardTitle>
            </CardHeader>
            <CardContent className="min-w-[300px]">
              <div className="flex flex-col justify-between w-full gap-2 mb-2">
                <div className="flex justify-between items-center gap-2">
                  <p className="text-muted-foreground">Name: </p>
                  <p className="font-medium self-start">
                    {patientDetails?.name}
                  </p>
                </div>
                <div className="flex justify-between items-center gap-2">
                  <p className="text-muted-foreground">Date of Birth: </p>
                  <p className="font-medium self-start">
                    {patientDetails?.dateOfBirth &&
                      format(new Date(patientDetails.dateOfBirth), "PP")}
                  </p>
                </div>
                <div className="flex justify-between items-center gap-2">
                  <p className="text-muted-foreground">Gender: </p>
                  <p className="font-medium self-start capitalize">
                    {patientDetails?.gender.toLowerCase()}
                  </p>
                </div>
                <div className="flex justify-between items-center gap-2">
                  <p className="text-muted-foreground">Mobile: </p>
                  <p className="font-medium self-start">
                    {patientDetails?.phoneNumber}
                  </p>
                </div>
                <div className="flex justify-between items-center gap-2">
                  <p className="text-muted-foreground">Email: </p>
                  <p className="font-medium self-start">
                    {patientDetails?.email}
                  </p>
                </div>
                <div className="flex justify-between items-center gap-2">
                  <p className="text-muted-foreground">Blood Group: </p>
                  <p className="font-medium self-start">
                    {patientDetails?.bloodGroup}
                  </p>
                </div>
                <div className="flex justify-between items-center gap-2">
                  <p className="text-muted-foreground">Address: </p>
                  <p className="font-medium text-right">
                    {patientDetails && getCombinedAddress(patientDetails!)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="flex-1 h-fit" x-chunk="dashboard-01-chunk-4">
            <CardHeader className="flex flex-row items-center">
              <CardTitle>Appointments</CardTitle>
            </CardHeader>
            <CardContent>
              <Table
                className={fetching ? "pointer-events-none" : "max-h-[300px]"}
              >
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
                  <TableCell
                    colSpan={4}
                    className="font-medium text-muted-foreground mt-4 text-center"
                  >
                    No Appointments
                  </TableCell>
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
            <CardFooter className="flex-wrap gap-4">
              <Pagination className="w-fit">
                <PaginationContent className="flex-wrap gap-2 items-center">
                  <PaginationItem className="flex gap-2 items-center">
                    <p className="text-sm">Rows per page:</p>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 gap-1"
                        >
                          {rowsPerPage}
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setRowsPerPage(5)}>
                          5
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setRowsPerPage(10)}>
                          10
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setRowsPerPage(25)}>
                          25
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setRowsPerPage(50)}>
                          50
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setRowsPerPage(100)}>
                          100
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </PaginationItem>
                  <PaginationItem className="flex gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() =>
                        setCurrentPage((prev) => (prev > 1 ? prev - 1 : 1))
                      }
                    >
                      <ChevronLeft className="h-3 w-3" />
                    </Button>
                    <div className="flex gap-4 items-center">
                      <Input
                        value={currentPage}
                        type="text"
                        inputMode="numeric"
                        pattern="\d*"
                        className="w-8 text-center px-1 h-7"
                        onChange={(e) => {
                          const value = Number(e.target.value);
                          if (isNaN(value) || value < 1 || value > noOfPages) {
                            setCurrentPage(1);
                          } else {
                            setCurrentPage(value);
                          }
                        }}
                      />
                      <p>of {noOfPages} pages</p>
                    </div>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() =>
                        setCurrentPage((prev) =>
                          prev === noOfPages ? noOfPages : prev + 1
                        )
                      }
                    >
                      <ChevronRight className="w-3 h-3" />{" "}
                    </Button>
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
              <div className="text-xs text-muted-foreground">
                {
                  <div className="text-xs text-muted-foreground">
                    Showing{" "}
                    <strong>
                      {startIndex}-{endIndex}
                    </strong>{" "}
                    of <strong>{totalRecords}</strong> appointments
                  </div>
                }
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    )
  );
};

export default PatientDetails;

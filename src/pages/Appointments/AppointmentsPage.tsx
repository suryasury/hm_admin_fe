import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import DatePicker from "@/components/ui/date-picker";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
} from "@/components/ui/pagination";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
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
import {
  getAppointmentList,
  getDoctorMinifiedList,
} from "@/https/admin-service";
import { cn } from "@/lib/utils";
import { APP_ROUTES } from "@/router/appRoutes";
import { Appointment, IFilterDoctor, UserState } from "@/types";
import { statusClasses } from "@/utils";
import { CaretSortIcon } from "@radix-ui/react-icons";
import { CommandLoading } from "cmdk";
import { format } from "date-fns";
import debounce from "lodash.debounce";
import {
  CheckCircle,
  CheckCircle2,
  CheckIcon,
  ChevronLeft,
  ChevronRight,
  Eye,
  Hourglass,
  MoreVertical,
  Search,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

const showCancelBtn = (status: string) => {
  if (status === "COMPLETED") return false;
  if (status === "CANCELLED") return false;
  return true;
};
type AppointmentStatus =
  | "SCHEDULED"
  | "COMPLETED"
  | "CANCELLED"
  | "APPROVED"
  | "";

const statusToText = {
  SCHEDULED: {
    icon: <Hourglass className="mr-2 h-4 w-4" />,
    text: "Scheduled",
  },
  APPROVED: {
    icon: <CheckCircle className="mr-2 h-4 w-4" />,
    text: "Approved",
  },
  COMPLETED: {
    icon: <CheckCircle2 className="mr-2 h-4 w-4" />,
    text: "Completed",
  },
  CANCELLED: {
    icon: <X className="mr-2 h-4 w-4" />,
    text: "Cancelled",
  },
};
const AppointmentsPage = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [noOfPages, setNoOfPages] = useState(15);
  const [totalRecords, setTotalRecords] = useState(0);
  const [appointmentsList, setAppointmentList] = useState<Appointment[]>([]);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [search, setSearch] = useState("");
  const [appointmentStatus, setAppointmentStatus] =
    useState<AppointmentStatus>("");

  const [currentPage, setCurrentPage] = useState(1);
  const navigate = useNavigate();

  const [isFetching, setIsFetching] = useState<boolean>(false);
  const [doctorsList, setDoctorsList] = useState<IFilterDoctor[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState<IFilterDoctor>();
  const [showDoctorList, setShowDoctorList] = useState(false);
  const [fetchingDoctors, setFetchingDoctors] = useState(false);
  const user = useSelector((state: { user: UserState }) => state.user.user);
  const startIndex = (currentPage - 1) * rowsPerPage + 1;
  const endIndex = appointmentsList?.length + startIndex - 1;

  const handleError = useErrorHandler();

  const fetchAppointmentList = async () => {
    try {
      setIsFetching(true);
      const queryParams: Record<string, string> = {
        page: currentPage.toString(),
        limit: rowsPerPage.toString(),
        appointmentStatus: appointmentStatus,
        search,
      };
      if (date) {
        queryParams["date"] = format(date, "yyyy-MM-dd");
      }
      if (selectedDoctor) {
        queryParams["doctorId"] = selectedDoctor.id;
      }
      if (user && user.role === "DOCTOR") {
        queryParams["doctorId"] = user.id;
      }
      const response = await getAppointmentList(queryParams);
      const data = response.data.data.appointmentList;
      const totalRecords = response.data.data.meta.totalMatchingRecords;
      setTotalRecords(totalRecords);
      setNoOfPages(Math.ceil(totalRecords / rowsPerPage));
      setAppointmentList(data);
    } catch (error) {
      handleError(error, "Failed to fetch appointment list");
    } finally {
      setIsFetching(false);
    }
  };

  const fetchDoctorList = async () => {
    try {
      setFetchingDoctors(true);
      const res = await getDoctorMinifiedList({});
      setDoctorsList(res.data.data.doctorMinifiedList);
    } catch (error) {
      handleError(error, "Failed to fetch doctor list");
    } finally {
      setFetchingDoctors(false);
    }
  };

  const handleSearch = debounce((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setCurrentPage(1);
  }, 900);

  useEffect(() => {
    fetchAppointmentList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    currentPage,
    rowsPerPage,
    appointmentStatus,
    search,
    date,
    selectedDoctor,
  ]);

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <Card x-chunk="dashboard-06-chunk-0">
        <CardContent>
          <div className="table-header flex items-center w-full mb-2 mt-4">
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  onChange={handleSearch}
                  type="search"
                  placeholder="Search..."
                  className="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[320px]"
                />
              </div>
              <DatePicker
                date={date}
                setDate={setDate}
                placeholder="Filter by date"
              />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="text-muted-foreground text-sm font-normal"
                  >
                    {appointmentStatus !== "" ? (
                      <p className="flex items-center">
                        {statusToText[appointmentStatus].icon}
                        {statusToText[appointmentStatus].text}
                      </p>
                    ) : (
                      "Filter by status"
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={() => setAppointmentStatus("SCHEDULED")}
                  >
                    <Hourglass className="mr-2 h-4 w-4" />
                    Scheduled
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setAppointmentStatus("APPROVED")}
                  >
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Approved
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    onClick={() => setAppointmentStatus("COMPLETED")}
                  >
                    <CheckCircle2 className="mr-2 h-4 w-4" /> Completed
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    onClick={() => setAppointmentStatus("CANCELLED")}
                  >
                    <X className="mr-2 h-4 w-4" />
                    Cancelled
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setAppointmentStatus("")}>
                    Clear Filter
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              {user && user.role !== "DOCTOR" && (
                <Popover open={showDoctorList} onOpenChange={setShowDoctorList}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      className="justify-between text-muted-foreground font-normal"
                      onClick={() => {
                        setShowDoctorList(true);
                        fetchDoctorList();
                      }}
                    >
                      {selectedDoctor?.name
                        ? selectedDoctor?.name
                        : " Filter by doctor"}
                      <CaretSortIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Command>
                      <CommandList>
                        <CommandInput placeholder="Search doctor..." />
                        <ScrollArea className="h-[200px]">
                          <CommandEmpty>No Medicine found.</CommandEmpty>
                          {fetchingDoctors && (
                            <CommandLoading>
                              <div className="flex gap-2 items-center justify-center mt-4">
                                <Spinner />
                                <span className="text-muted-foreground">
                                  Please wait...
                                </span>
                              </div>
                            </CommandLoading>
                          )}
                          <CommandGroup>
                            {doctorsList.map((doctor: IFilterDoctor) => (
                              <CommandItem
                                className="gap-2"
                                key={doctor.id}
                                value={doctor.name?.toString()}
                                onSelect={() => {
                                  setSelectedDoctor(doctor);

                                  setShowDoctorList(false);
                                }}
                              >
                                <p className="flex flex-col">
                                  {doctor.name}
                                  <span className="text-sm text-muted-foreground">
                                    {doctor.speciality}
                                  </span>
                                </p>
                                {selectedDoctor?.id === doctor.id && (
                                  <CheckIcon
                                    className={cn("ml-auto h-4 w-4")}
                                  />
                                )}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </ScrollArea>
                      </CommandList>
                    </Command>
                    <DropdownMenuSeparator />
                    <Button
                      variant="ghost"
                      onClick={() => {
                        setSelectedDoctor(undefined), setShowDoctorList(false);
                      }}
                      className="font-normal w-full  justify-start"
                    >
                      Clear Filter
                    </Button>
                  </PopoverContent>
                </Popover>
              )}
            </div>
            {isFetching && (
              <div className="flex gap-1 ml-10 items-start text-muted-foreground ">
                <Spinner />
                Looking for appointments...
              </div>
            )}
          </div>
          <Table className={isFetching ? "pointer-events-none" : ""}>
            <TableHeader>
              <TableRow>
                <TableHead>Patient</TableHead>
                <TableHead>Doctor</TableHead>
                <TableHead>Token No</TableHead>
                <TableHead className="hidden md:table-cell">
                  Date & Time
                </TableHead>
                <TableHead className="hidden md:table-cell">Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            {appointmentsList.length === 0 ? (
              <TableBody>
                <TableCell
                  colSpan={6}
                  className="font-medium text-muted-foreground mt-4 text-center"
                >
                  No Appointments found...
                </TableCell>
              </TableBody>
            ) : (
              <TableBody>
                {appointmentsList?.map((appointment: Appointment) => (
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
                      {`${format(appointment.appointmentDate, "dd-MM-yyyy")}, ${
                        appointment.doctorSlots.slot.startTime
                      }`}
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
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            size="icon"
                            variant="outline"
                            className="h-8 w-8"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() =>
                              navigate(
                                `${APP_ROUTES.APPOINTMENT_DETAILS}/${appointment.id}`
                              )
                            }
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            View
                          </DropdownMenuItem>

                          {showCancelBtn(appointment.appointmentStatus) && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem>
                                <X className="mr-2 h-4 w-4" />
                                Cancel
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
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
                    <Button size="sm" variant="outline" className="h-7 gap-1">
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
                  <ChevronLeft className="h-3 w-3" />{" "}
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
                  <ChevronRight className="h-3 w-3" />
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
  );
};

export default AppointmentsPage;

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
import { getPatientPrescriptionStatusList } from "@/https/admin-service";
import { PatientPrescriponList } from "@/types";
import { DropdownMenuTrigger } from "@radix-ui/react-dropdown-menu";
import { format } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";

interface patientPrescriptionProps {
  appointmentId: string;
  patientId: string;
}

const PatientAppointmentPrescription: React.FC<patientPrescriptionProps> = ({
  appointmentId,
  patientId,
}) => {
  const handleError = useErrorHandler();
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);
  const [noOfPages, setNoOfPages] = useState(0);
  const [totalRecords, setTotalRecords] = useState(0);
  const [patientPrescriptionList, setPatientPrescriptionList] = useState<
    PatientPrescriponList[]
  >([]);
  const startIndex = (currentPage - 1) * rowsPerPage + 1;
  const endIndex = patientPrescriptionList?.length + startIndex - 1;
  const [isFetching, setIsFetching] = useState(false);
  const fetchPatientPrescriptionForAppointment = async () => {
    try {
      setIsFetching(true);
      const queryParams: Record<string, string> = {
        page: currentPage.toString(),
        limit: rowsPerPage.toString(),
      };

      const response = await getPatientPrescriptionStatusList(
        appointmentId,
        patientId,
        queryParams,
      );
      const data = response.data.data.prescriptionList;
      const totalRecords = response.data.data.meta.totalMatchingRecords;
      setTotalRecords(totalRecords);
      setNoOfPages(Math.ceil(totalRecords / rowsPerPage));
      setPatientPrescriptionList(data);
    } catch (error) {
      handleError(error, "Failed to fetch appointment list");
    } finally {
      setIsFetching(false);
    }
  };
  useEffect(() => {
    if (appointmentId && patientId) {
      fetchPatientPrescriptionForAppointment();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appointmentId, patientId, currentPage, rowsPerPage]);
  return (
    <Card>
      <CardHeader className="relative">
        <CardTitle>Patients Prescription Status</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="table-header flex items-center w-full mb-2 mt-0">
          <div className="flex gap-2 flex-wrap md:flex-nowrap"></div>
          {isFetching && (
            <div className="flex gap-1 ml-10 items-start text-muted-foreground ">
              <Spinner />
              Looking for prescriptions...
            </div>
          )}
        </div>
        <Table className={isFetching ? "pointer-events-none" : ""}>
          <TableHeader>
            <TableRow>
              <TableHead>Medication Name</TableHead>
              <TableHead>Food Relation</TableHead>
              <TableHead className="hidden md:table-cell">Date</TableHead>
              <TableHead className="hidden md:table-cell">
                Time Of Day
              </TableHead>
              <TableHead className="hidden md:table-cell">
                Prescription Remarks
              </TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          {patientPrescriptionList.length === 0 ? (
            <TableBody>
              <TableCell
                colSpan={6}
                className="font-medium text-muted-foreground mt-4 text-center"
              >
                No prescriptions found for this appointment
              </TableCell>
            </TableBody>
          ) : (
            <TableBody>
              {patientPrescriptionList?.map(
                (prescription: PatientPrescriponList) => (
                  <TableRow key={prescription.id} className="cursor-pointer">
                    <TableCell className="font-medium">
                      <div className="font-medium">
                        {
                          prescription.prescriptionDays.patientPrescription
                            .medicationStock.medicationName
                        }
                      </div>
                      <div className="hidden text-sm text-muted-foreground md:inline">
                        {
                          prescription.prescriptionDays.patientPrescription
                            .medicationStock.medicationDosage
                        }
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">
                        {
                          prescription.prescriptionDays.patientPrescription
                            .foodRelation
                        }
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {`${format(
                        prescription.prescriptionDays.prescriptionDate,
                        "dd-MM-yyyy",
                      )}`}
                    </TableCell>
                    <TableCell>
                      <div className="font-medium hidden md:table-cell">
                        {prescription.timeOfDay}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium hidden md:table-cell">
                        {prescription.prescriptionDays.patientPrescription
                          .prescriptionRemarks || "NA"}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div
                        className={`font-medium ${
                          prescription.isPrescriptionTaken
                            ? "bg-green-100 text-green-800 py-1 px-2 rounded w-fit"
                            : "bg-red-100 text-red-800 py-1 px-2 rounded w-fit"
                        }`}
                      >
                        {prescription.isPrescriptionTaken
                          ? "TAKEN"
                          : "NOT TAKEN"}
                      </div>
                    </TableCell>
                  </TableRow>
                ),
              )}
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
                    prev === noOfPages ? noOfPages : prev + 1,
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
              of <strong>{totalRecords}</strong> prescriptions
            </div>
          }
        </div>
      </CardFooter>
    </Card>
  );
};

export default PatientAppointmentPrescription;

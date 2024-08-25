/* eslint-disable react-hooks/exhaustive-deps */
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import Spinner from "@/components/ui/spinner";
import StarRating from "@/components/ui/star";
import { Textarea } from "@/components/ui/textarea";
import useErrorHandler from "@/hooks/useError";
import {
  getAppointmentDetails,
  getMedicineList,
  updateAppointment,
  updateVitals,
} from "@/https/admin-service";
import { cn } from "@/lib/utils";
import { APP_ROUTES } from "@/router/appRoutes";
import {
  Appointment,
  IAppointmentUpdate,
  ICreateMedicationForm,
  IMedcation,
  User,
} from "@/types";
import { statusClasses } from "@/utils";
import { CaretSortIcon } from "@radix-ui/react-icons";
import { CommandLoading } from "cmdk";
import { format } from "date-fns";
import debounce from "lodash.debounce";
import { ArrowLeft, Check, CheckIcon, Plus, Trash2, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import NoDataFound from "../NoDataFound";

interface TimeOfDayOption {
  value: "MORNING" | "AFTERNOON" | "EVENING" | "NIGHT";
  label: string;
}
interface foodRelationOption {
  value: "BEFORE_MEAL" | "AFTER_MEAL";
  label: string;
}

const foodRelationOptions: foodRelationOption[] = [
  {
    value: "BEFORE_MEAL",
    label: "Before Meal",
  },
  {
    value: "AFTER_MEAL",
    label: "After Meal",
  },
];
const timeOfDay: TimeOfDayOption[] = [
  {
    value: "MORNING",
    label: "Morning",
  },
  {
    value: "AFTERNOON",
    label: "Afternoon",
  },
  {
    value: "EVENING",
    label: "Evening",
  },
  {
    value: "NIGHT",
    label: "Night",
  },
];
const PRESCRIPTION_INITIAL_STATE: IMedcation = {
  medicationStockId: "",
  durationInDays: "",
  foodRelation: "",
  timeOfDay: [],
  prescriptionRemarks: "",
};

const showCancelBtn = (status: string) => {
  if (status === "COMPLETED") return false;
  if (status === "CANCELLED") return false;
  return true;
};

const vitalsInitialState: Record<string, string> = {
  feverLevel: "",
  bloodPreassure: "",
  pulse: "",
  patientWeight: "",
  otherVitalRemarks: "",
};

const AppointmentDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  if (!id) {
    navigate(APP_ROUTES.APPOINTMENTS);
  }
  const [appointmentDetails, setAppointmentDetails] = useState<Appointment>();
  const [fetchingDetails, setFetchingDetails] = useState<boolean>(false);

  const dialogRef = useRef<HTMLDivElement>(null);
  const [showMedicineList, setShowMedicineList] = useState<boolean>(false);
  const [searchMedicine, setSearchMedicine] = useState<string>("");
  const [fetchingMedicines, setFetchingMedicines] = useState<boolean>(false);
  const [medicinesList, setMedicinesList] = useState<ICreateMedicationForm[]>(
    []
  );
  const [showPrescriptionDialog, setShowPrescriptionDialog] =
    useState<boolean>(false);
  const [prescription, setPrescription] = useState<IMedcation[]>([]);
  const [tempPrescription, setTempPrescription] = useState<IMedcation>(
    PRESCRIPTION_INITIAL_STATE
  );
  const [codeToMedicineMap, setCodeToMedicineMap] =
    useState<Record<string, string>>();

  const [selectedMedicine, setSelectedMedicine] =
    useState<ICreateMedicationForm | null>(null);

  const [isCancelling, setIsCancelling] = useState<boolean>(false);
  const [cancelAppointment, setCancelAppointment] = useState<boolean>(false);
  const [completeAppointment, setCompleteAppointment] =
    useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isApproving, setIsApproving] = useState<boolean>(false);
  const [remarks, setRemarks] = useState<string>("");
  const user = useSelector(
    (state: { user: { user: User } }) => state.user.user
  );
  const [vitals, setVitals] =
    useState<Record<string, string>>(vitalsInitialState);
  const [isSubmittingVitals, setIsSubmittingVitals] = useState<boolean>(false);

  const handleError = useErrorHandler();

  const fetchAppointmentDetails = async () => {
    try {
      setFetchingDetails(true);
      const res = await getAppointmentDetails(id!);
      setAppointmentDetails(res.data.data);
    } catch (error) {
      handleError(error, "Error in fetching appointment details");
    } finally {
      setFetchingDetails(false);
    }
  };

  const fetchMedicineList = async () => {
    try {
      setFetchingMedicines(true);
      const response = await getMedicineList({
        search: searchMedicine,
      });
      const data = response.data.data.medicationList;
      setMedicinesList(data);
    } catch (error) {
      handleError(error, "Failed to fetch medicine list");
    } finally {
      setFetchingMedicines(false);
    }
  };

  const handleCancel = async () => {
    try {
      setIsCancelling(true);
      const payload: IAppointmentUpdate = {
        status: "CANCELLED",
        appointmentId: id!,
      };
      const res = await updateAppointment(payload);
      if (res.status === 200) {
        setCancelAppointment(false);
        toast.success("Appoinement cancelled successfully");
        fetchAppointmentDetails();
      }
    } catch (error) {
      handleError(error, "Error cancelling appointment");
    } finally {
      setIsCancelling(false);
    }
  };

  const handleSubmitVitals = async () => {
    try {
      setIsSubmittingVitals(true);
      const payload: Record<string, string> = {};
      Object.keys(vitals).forEach((key) => {
        if (vitals[key] !== "") {
          payload[key] = vitals[key];
        }
      });
      const res = await updateVitals(payload, id!);
      if (res.status === 200) {
        setVitals(vitalsInitialState);
        toast.success("Vitals updated successfully");
        fetchAppointmentDetails();
      }
    } catch (error) {
      handleError(error, "Failed to update vitals");
    } finally {
      setIsSubmittingVitals(false);
    }
  };

  const handleComplete = async () => {
    try {
      setIsSubmitting(true);
      const payload: IAppointmentUpdate = {
        status: "COMPLETED",
        appointmentId: id!,
        prescriptions: prescription,
        doctorRemarks: remarks,
      };
      const res = await updateAppointment(payload);
      if (res.status === 200) {
        setCancelAppointment(false);
        toast.success("Appoinement updated successfully");
        fetchAppointmentDetails();
        setPrescription([]);
      }
    } catch (error) {
      handleError(error, "Failed to update the appointment");
    } finally {
      setIsSubmitting(false);
    }
  };
  const handleApprove = async () => {
    try {
      setIsApproving(true);
      const payload: IAppointmentUpdate = {
        status: "APPROVED",
        appointmentId: id!,
      };
      const res = await updateAppointment(payload);
      if (res.status === 200) {
        setCancelAppointment(false);
        toast.success("Appoinement approved successfully");
        fetchAppointmentDetails();
      }
    } catch (error) {
      handleError(error, "Failed to approve the appointment");
    } finally {
      setIsApproving(false);
    }
  };

  const handleSearch = debounce((search: string) => {
    setSearchMedicine(search);
  }, 900);
  useEffect(() => {
    fetchAppointmentDetails();
  }, [id]);

  useEffect(() => {
    fetchMedicineList();
  }, [searchMedicine]);

  useEffect(() => {
    const header = document.getElementById("header-title");
    if (header) {
      header.innerText = "Appointment Details";
    }
  }, []);

  const isPrescriptionValid = (): boolean => {
    if (tempPrescription.medicationStockId === "") return false;
    if (
      tempPrescription.durationInDays === 0 ||
      tempPrescription.durationInDays === ""
    )
      return false;
    if (tempPrescription.foodRelation === "") return false;
    if (tempPrescription.timeOfDay.length === 0) return false;
    return true;
  };

  const CancelDialogContent = () => {
    return (
      <AlertDialogContent className="max-w-[375px] md:max-w-[475px]">
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently cancel the
            appointment.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => setCancelAppointment(false)}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={() => {
              handleCancel();
            }}
          >
            Continue
            {isCancelling && <Spinner type="light" />}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    );
  };
  const CompleteAppointmentContent = () => {
    return (
      <AlertDialogContent className="max-w-[375px] md:max-w-[475px]">
        <AlertDialogHeader>
          <AlertDialogTitle>Complete Appointment ?</AlertDialogTitle>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => setCompleteAppointment(false)}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={() => {
              handleComplete();
            }}
          >
            Continue
            {isSubmitting && <Spinner type="light" />}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    );
  };

  return (
    <>
      {fetchingDetails ? (
        <div className="flex gap-2">
          <Spinner /> Fetching details...
        </div>
      ) : appointmentDetails ? (
        <div className="p-8">
          <div className="flex justify-between items-center gap-4">
            <Button
              variant="link"
              size="sm"
              className="mb-4"
              onClick={() => navigate(APP_ROUTES.APPOINTMENTS)}
            >
              <ArrowLeft className="h-3.5 w-3.5 mr-2" />
              Go Back
            </Button>
            <p className="font-semibold">
              Token No : {appointmentDetails.tokenNumber || "NA"}
            </p>
            {showCancelBtn(appointmentDetails?.appointmentStatus) && (
              <Button
                size="sm"
                className="w-fit"
                variant="ghost"
                onClick={() => setCancelAppointment(true)}
              >
                <X className="h-3.5 w-3.5 mr-2" />
                Cancel Appointment
              </Button>
            )}
          </div>

          <div className="flex flex-col justify-center md:justify-normal gap-8 flex-wrap">
            {/* patient details and reports */}
            <Card
              x-chunk="appointment-details-patient-details-chunk"
              className="h-fit"
            >
              <CardHeader className="relative">
                <CardTitle>Patient Details</CardTitle>
                {appointmentDetails?.appointmentStatus && (
                  <div
                    className={`badge ${
                      statusClasses[appointmentDetails?.appointmentStatus]
                    } px-2 py-1 rounded-lg text-xs font-medium w-[90px] text-center capitalize absolute right-5 top-4`}
                  >
                    {appointmentDetails?.appointmentStatus.toLowerCase()}
                  </div>
                )}
              </CardHeader>
              <CardContent className="min-w-[300px]">
                <div className="grid md:grid-flow-col w-full gap-2 mb-2">
                  <div className="flex flex-col justify-between">
                    <p className="text-muted-foreground">Name: </p>
                    <p className="font-medium">
                      {appointmentDetails?.patient.name}
                    </p>
                  </div>
                  <div className="flex justify-between flex-col">
                    <p className="text-muted-foreground">Mobile: </p>
                    <p className="font-medium">
                      {appointmentDetails?.patient.phoneNumber}
                    </p>
                  </div>
                  <div className="flex justify-between flex-col">
                    <p className="text-muted-foreground">Email: </p>
                    <p className="font-medium">
                      {appointmentDetails?.patient.email}
                    </p>
                  </div>
                  <div className="flex justify-between flex-col">
                    <p className="text-muted-foreground">Blood Group: </p>
                    <p className="font-medium">
                      {appointmentDetails?.patient.bloodGroup}
                    </p>
                  </div>
                  <div className="flex justify-between flex-col">
                    <p className="text-muted-foreground">Age </p>
                    <p className="font-medium">
                      {new Date().getFullYear() -
                        new Date(
                          appointmentDetails?.patient.dateOfBirth
                        ).getFullYear()}{" "}
                      Yrs
                    </p>
                  </div>
                  <div className="flex justify-between flex-col">
                    <p className="text-muted-foreground">Ailment: </p>
                    <p className="font-medium">
                      {appointmentDetails?.ailment.name}
                    </p>
                  </div>
                  {appointmentDetails?.remarks && (
                    <div className="flex justify-between flex-col">
                      <p className="text-muted-foreground">Remarks: </p>
                      <p className="font-medium">
                        {appointmentDetails?.remarks}
                      </p>
                    </div>
                  )}
                </div>
                <div className="border-t-2 border-solid border-primary/10 my-4" />
                <div className="flex flex-col justify-between w-full gap-2 mb-2 mt-4">
                  <CardTitle>Patient Reports</CardTitle>
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    {appointmentDetails?.patientAppointmentDocs.length ===
                      0 && <p className="text-sm">No Records Available</p>}
                    {appointmentDetails?.patientAppointmentDocs.map((doc) => (
                      <div key={doc.id as string} className="">
                        <Badge
                          variant={"secondary"}
                          onClick={() =>
                            window.open(
                              doc.signedUrl as string,
                              "_blank",
                              "noopener,noreferrer"
                            )
                          }
                          className="cursor-pointer w-fit"
                        >
                          {`${
                            (doc.documentTypes as Record<string, string>).name
                          }.${doc.fileExtension}`}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
                {appointmentDetails?.isFeedbackProvided && (
                  <>
                    <div className="border-t-2 border-solid border-primary/10 my-4" />
                    <div className="flex flex-col justify-between w-full gap-2 mb-2 mt-4">
                      <CardTitle>Feedback</CardTitle>
                      <div className="grid md:grid-cols-6 w-full  mb-2">
                        <div className="flex  gap-2 w-fit">
                          <p className="text-muted-foreground">Rating: </p>
                          <p className="font-medium">
                            <StarRating
                              totalStars={5}
                              onClick={() => {}}
                              value={Number(
                                appointmentDetails?.appointmentFeedbacks
                                  .overallSatisfaction
                              )}
                              disable={true}
                            />
                          </p>
                        </div>
                        {!!appointmentDetails.appointmentFeedbacks
                          .feedBackRemarks && (
                          <div className="flex  gap-2 ">
                            <p className="text-muted-foreground">Remarks: </p>
                            <p className="font-medium">
                              {
                                appointmentDetails.appointmentFeedbacks
                                  .feedBackRemarks
                              }
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
            {/* patient vitals */}
            <Card
              x-chunk="appointment-details-patient-details-chunk"
              className="h-fit"
            >
              <CardHeader className="relative">
                <CardTitle>Patient Vitals</CardTitle>
              </CardHeader>
              <CardContent className="min-w-[300px]">
                {/* Fever level, Blood pressure, pulse(bpm), weight, other remarks */}
                <div className="grid md:grid-flow-col w-full gap-2 mb-2">
                  <div className="flex gap-2 flex-col justify-between">
                    <Label>
                      Fever Level
                      <span className="text-normal ml-[4px] text-sm text-muted-foreground">
                        (°F)
                      </span>
                      :
                    </Label>
                    <Input
                      disabled={
                        !showCancelBtn(appointmentDetails.appointmentStatus)
                      }
                      onChange={(e) => {
                        setVitals((prev) => ({
                          ...prev,
                          feverLevel: e.target.value,
                        }));
                      }}
                      value={vitals.feverLevel || appointmentDetails.feverLevel}
                      placeholder="Enter Fever level"
                    />
                  </div>
                  <div className="flex gap-2 justify-between flex-col">
                    <Label>
                      Blood Pressure{" "}
                      <span className="text-normal ml-[4px] text-sm text-muted-foreground">
                        (mmHg)
                      </span>
                      :
                    </Label>
                    <Input
                      disabled={
                        !showCancelBtn(appointmentDetails.appointmentStatus)
                      }
                      onChange={(e) => {
                        setVitals((prev) => ({
                          ...prev,
                          bloodPreassure: e.target.value,
                        }));
                      }}
                      value={
                        vitals.bloodPreassure ||
                        appointmentDetails.bloodPreassure
                      }
                      placeholder="Enter Blood Pressure"
                    />
                  </div>
                  <div className="flex gap-2 justify-between flex-col">
                    <Label>
                      Pulse{" "}
                      <span className="text-normal ml-[4px] text-sm text-muted-foreground">
                        (BPM)
                      </span>
                      :{" "}
                    </Label>
                    <Input
                      disabled={
                        !showCancelBtn(appointmentDetails.appointmentStatus)
                      }
                      onChange={(e) => {
                        setVitals((prev) => ({
                          ...prev,
                          pulse: e.target.value,
                        }));
                      }}
                      placeholder="Enter Pulse"
                      value={vitals.pulse || appointmentDetails.pulse}
                    />
                  </div>
                  <div className="flex gap-2 justify-between flex-col">
                    <Label>
                      Weight{" "}
                      <span className="text-normal ml-[4px] text-sm text-muted-foreground">
                        (Kgs)
                      </span>
                      :{" "}
                    </Label>
                    <Input
                      disabled={
                        !showCancelBtn(appointmentDetails.appointmentStatus)
                      }
                      onChange={(e) => {
                        setVitals((prev) => ({
                          ...prev,
                          patientWeight: e.target.value,
                        }));
                      }}
                      value={
                        vitals.patientWeight || appointmentDetails.patientWeight
                      }
                      placeholder="Enter Weight"
                    />
                  </div>
                </div>
                <div className="flex gap-2 justify-between flex-col mt-4">
                  <Label>Other Remarks:</Label>
                  <Textarea
                    disabled={
                      !showCancelBtn(appointmentDetails.appointmentStatus)
                    }
                    maxLength={50}
                    onChange={(e) => {
                      setVitals((prev) => ({
                        ...prev,
                        otherVitalRemarks: e.target.value,
                      }));
                    }}
                    value={
                      vitals.otherVitalRemarks ||
                      appointmentDetails.otherVitalRemarks
                    }
                    placeholder="Enter Other Remarks"
                  />
                </div>
                {appointmentDetails.appointmentStatus === "APPROVED" && (
                  <div className="flex  justify-end w-full gap-2 mb-2 mt-4">
                    <Button
                      size="sm"
                      className="w-fit"
                      disabled={
                        isSubmittingVitals ||
                        Object.values(vitals).every((i) => i === "")
                      }
                      onClick={handleSubmitVitals}
                    >
                      Save
                      {isSubmittingVitals && <Spinner type="light" />}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
            {/* Doctor details and appointment details */}
            <Card
              x-chunk="appointment-details-patient-details-chunk"
              className="h-fit"
            >
              <CardHeader className="relative">
                <CardTitle>Doctor Details</CardTitle>
              </CardHeader>
              <CardContent className="min-w-[300px]">
                <div className="grid md:grid-flow-col w-full gap-4 mb-2">
                  <div className="flex justify-between flex-col">
                    <p className="text-muted-foreground">Name: </p>
                    <p className="font-medium">
                      {appointmentDetails?.doctor.name}
                    </p>
                  </div>
                  <div className="flex justify-between flex-col">
                    <p className="text-muted-foreground">Speciality: </p>
                    <p className="font-medium">
                      {appointmentDetails?.doctor.speciality}
                    </p>
                  </div>
                  <div className="flex justify-between flex-col">
                    <p className="text-muted-foreground">Appointment Date: </p>
                    <p className="font-medium">
                      {format(appointmentDetails?.appointmentDate, "PP")}
                    </p>
                  </div>
                  <div className="flex justify-between flex-col">
                    <p className="text-muted-foreground">From: </p>
                    <p className="font-medium">
                      {appointmentDetails?.doctorSlots.slot.startTime}
                    </p>
                  </div>
                  <div className="flex justify-between flex-col">
                    <p className="text-muted-foreground">To: </p>
                    <p className="font-medium">
                      {appointmentDetails?.doctorSlots.slot.endTime}
                    </p>
                  </div>
                </div>
                {/* @ts-expect-error-free */}
                {appointmentDetails.appointmentStatus !== "CANCELLED" && (
                  <>
                    {(appointmentDetails.appointmentStatus === "APPROVED" ||
                      appointmentDetails.appointmentStatus === "COMPLETED") && (
                      <>
                        <div className="border-t-2 border-solid border-primary/10 my-4" />
                        <div className="flex flex-col justify-between w-full gap-2 mb-2 mt-2">
                          <CardTitle>Prescription </CardTitle>
                          <div className="flex flex-col gap-2 mt-2">
                            {/* add prescription cta */}
                            {appointmentDetails.patientPrescription &&
                              appointmentDetails.patientPrescription.map(
                                (pres) => (
                                  <div className="flex gap-2 items-center border p-2 rounded-md flex-wrap">
                                    <div className="flex justify-between items-center gap-2">
                                      <p className="font-medium text-sm">
                                        Medicine:
                                      </p>
                                      <p>
                                        {pres.medicationStock?.medicationName}
                                      </p>
                                    </div>
                                    <div className="flex justify-between items-center gap-2">
                                      <p className="font-medium text-sm">
                                        Duration:
                                      </p>
                                      <p>{pres.durationInDays} days</p>
                                    </div>
                                    <div className="flex justify-between items-center gap-2">
                                      <p className="font-medium text-sm">
                                        Time:
                                      </p>
                                      <p className="capitalize">
                                        {pres.timeOfDay
                                          .map((i) => i.toLowerCase())
                                          .join(", ")}
                                      </p>
                                    </div>
                                    <div className="flex justify-between items-center gap-2">
                                      <p className="font-medium text-sm">
                                        Food Relation:
                                      </p>
                                      <p>
                                        {pres.foodRelation === "BEFORE_MEAL"
                                          ? "Before Meal"
                                          : "After Meal"}
                                      </p>
                                    </div>
                                    <div className="flex justify-between items-center gap-2">
                                      <p className="font-medium text-sm">
                                        Prescription Remarks:
                                      </p>
                                      <p>
                                        {pres.prescriptionRemarks || "None"}
                                      </p>
                                    </div>
                                  </div>
                                )
                              )}
                            {prescription.length !== 0 &&
                              prescription.map((pres) => (
                                <div className="flex gap-2 items-center relative">
                                  <div className="flex gap-2 items-center border p-2 rounded-md flex-wrap">
                                    <div className="flex justify-between items-center gap-2">
                                      <p className="font-medium text-sm">
                                        Medicine:
                                      </p>
                                      <p>
                                        {
                                          codeToMedicineMap?.[
                                            pres.medicationStockId
                                          ]
                                        }
                                      </p>
                                    </div>
                                    <div className="flex justify-between items-center gap-2">
                                      <p className="font-medium text-sm">
                                        Duration:
                                      </p>
                                      <p>{pres.durationInDays} days</p>
                                    </div>
                                    <div className="flex justify-between items-center gap-2">
                                      <p className="font-medium text-sm">
                                        Time:
                                      </p>
                                      <p className="capitalize">
                                        {pres.timeOfDay
                                          .map((i) => i.toLowerCase())
                                          .join(", ")}
                                      </p>
                                    </div>
                                    <div className="flex justify-between items-center gap-2">
                                      <p className="font-medium text-sm">
                                        Food Relation:
                                      </p>
                                      <p>
                                        {pres.foodRelation === "BEFORE_MEAL"
                                          ? "Before Meal"
                                          : "After Meal"}
                                      </p>
                                    </div>
                                    <div className="flex justify-between items-center gap-2">
                                      <p className="font-medium text-sm">
                                        Prescription Remarks:
                                      </p>
                                      <p>
                                        {pres.prescriptionRemarks || "None"}
                                      </p>
                                    </div>
                                  </div>
                                  <Button
                                    size="icon"
                                    variant={"outline"}
                                    className="absolute md:relative top-0 right-0"
                                    onClick={() =>
                                      setPrescription((prev) =>
                                        prev.filter(
                                          (i) =>
                                            i.medicationStockId !==
                                            pres.medicationStockId
                                        )
                                      )
                                    }
                                  >
                                    <Trash2 className="min-h-4 min-w-4" />
                                  </Button>
                                </div>
                              ))}

                            {appointmentDetails.appointmentStatus ===
                              "APPROVED" &&
                              user.role === "DOCTOR" && (
                                <Button
                                  size="sm"
                                  variant="secondary"
                                  className="w-fit"
                                  onClick={() => {
                                    setShowPrescriptionDialog(true);
                                  }}
                                >
                                  <Plus className="h-3.5 w-3.5 mr-2" />
                                  Add
                                </Button>
                              )}
                          </div>
                        </div>
                        <div className="border-t-2 border-solid border-primary/10 my-4" />
                      </>
                    )}
                  </>
                )}

                {appointmentDetails.appointmentStatus === "APPROVED" &&
                  user.role === "DOCTOR" && (
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="doctorRemarks">Doctor Remarks</Label>
                      <Textarea
                        value={remarks}
                        onChange={(e) => setRemarks(e.target.value)}
                      />
                    </div>
                  )}

                {appointmentDetails.appointmentStatus === "COMPLETED" &&
                  user.role === "DOCTOR" && (
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="doctorRemarks">Doctor Remarks</Label>
                      <p className="font-normal">
                        {appointmentDetails?.doctorRemarks || (
                          <span className="text-muted-foreground">
                            No remarks given by doctor
                          </span>
                        )}
                      </p>
                    </div>
                  )}
              </CardContent>
            </Card>
            <>
              <div className="flex gap-2 h-fit w-full justify-end">
                {appointmentDetails?.appointmentStatus === "SCHEDULED" &&
                  user.role === "ADMIN" && (
                    <Button
                      size="sm"
                      variant="secondary"
                      className="w-fit"
                      onClick={() => handleApprove()}
                    >
                      {isApproving ? (
                        <>
                          <Spinner type="light" />
                          Approving...
                        </>
                      ) : (
                        <>
                          <Check className="h-3.5 w-3.5 mr-2" />
                          Approve
                        </>
                      )}
                    </Button>
                  )}
                {appointmentDetails?.appointmentStatus === "APPROVED" &&
                  user.role === "DOCTOR" && (
                    <Button
                      size="sm"
                      className="w-fit"
                      onClick={() => setCompleteAppointment(true)}
                    >
                      <Check className="h-3.5 w-3.5 mr-2" />
                      Mark Complete
                    </Button>
                  )}
              </div>
            </>
          </div>
        </div>
      ) : (
        <div className="p-8">
          <Button
            variant="link"
            size="sm"
            className="mb-4"
            onClick={() => navigate(APP_ROUTES.APPOINTMENTS)}
          >
            <ArrowLeft className="h-3.5 w-3.5 mr-2" />
            Go Back
          </Button>
          <NoDataFound message="Appointment details not found" />
        </div>
      )}
      <Dialog
        open={showPrescriptionDialog}
        onOpenChange={setShowPrescriptionDialog}
      >
        <DialogContent
          className="max-w-[375px] md:max-w-[475px]"
          ref={dialogRef}
        >
          <DialogHeader>
            <DialogTitle>Add Prescription</DialogTitle>
            <DialogDescription>
              Add prescription details for the patient
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <p className="font-medium text-sm">Medicine: </p>
              <Popover
                open={showMedicineList}
                onOpenChange={setShowMedicineList}
              >
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    className="justify-between text-muted-foreground font-normal"
                    onClick={() => {
                      setShowMedicineList(true);
                      fetchMedicineList();
                    }}
                  >
                    {selectedMedicine
                      ? selectedMedicine.medicationName
                      : " Select Medicine"}
                    <CaretSortIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  className="min-w-[325px] md:min-w-[425px] p-0"
                  align="start"
                  container={
                    dialogRef?.current === null ? undefined : dialogRef?.current
                  }
                >
                  <Command>
                    <CommandList>
                      <CommandInput
                        placeholder="Search country..."
                        onValueChange={handleSearch}
                      />
                      <ScrollArea className="h-[200px]">
                        <CommandEmpty>No Medicine found.</CommandEmpty>
                        {fetchingMedicines && (
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
                          {medicinesList.map(
                            (medicine: ICreateMedicationForm) => (
                              <CommandItem
                                className="gap-2"
                                key={medicine.id}
                                value={medicine.id?.toString()}
                                onSelect={() => {
                                  setSelectedMedicine(medicine);
                                  setTempPrescription((prev) => ({
                                    ...prev,
                                    medicationStockId: medicine.id as string,
                                  }));
                                  setShowMedicineList(false);
                                  setCodeToMedicineMap((prev) => ({
                                    ...prev,
                                    [medicine.id as string]:
                                      medicine.medicationName,
                                  }));
                                }}
                              >
                                <p>{medicine.medicationName}</p>
                                {selectedMedicine?.id === medicine.id && (
                                  <CheckIcon
                                    className={cn("ml-auto h-4 w-4")}
                                  />
                                )}
                              </CommandItem>
                            )
                          )}
                        </CommandGroup>
                      </ScrollArea>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
            <div className="flex flex-col gap-2">
              <p className="font-medium text-sm">
                Duration
                <span className="text-muted-foreground text-sm font-normal">
                  {" (in days):"}
                </span>
              </p>
              <Input
                type="text"
                placeholder="Duration in days"
                value={tempPrescription.durationInDays}
                onChange={(e) => {
                  const value = e.target.value;
                  if (!isNaN(Number(value)) || value === "") {
                    setTempPrescription((prev) => ({
                      ...prev,
                      durationInDays: value === "" ? value : Number(value),
                    }));
                  }
                }}
              />
            </div>

            <div className="flex flex-col gap-2">
              <p className="font-medium text-sm">Time: </p>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="text-muted-foreground font-normal justify-start capitalize"
                  >
                    {tempPrescription.timeOfDay.length === 0
                      ? "Select Time of the day"
                      : tempPrescription.timeOfDay
                          .map((i) => i.toLowerCase())
                          .join(", ")}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="min-w-[325px] md:min-w-[425px] p-0">
                  <DropdownMenuSeparator />
                  {timeOfDay.map((time: TimeOfDayOption) => (
                    <DropdownMenuCheckboxItem
                      key={time.value}
                      checked={tempPrescription?.timeOfDay?.includes(
                        time.value
                      )}
                      onCheckedChange={(isChecked: boolean) => {
                        setTempPrescription((prev) => ({
                          ...prev,
                          timeOfDay: isChecked
                            ? [...prev.timeOfDay, time.value]
                            : prev.timeOfDay.filter(
                                (val) => val !== time.value
                              ),
                        }));
                      }}
                    >
                      {time.label}
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div className="flex flex-col gap-2">
              <p className="font-medium text-sm">Food Relation: </p>
              <div className="flex gap-5">
                {foodRelationOptions.map((option) => (
                  <div
                    className="flex items-center space-x-2"
                    key={option.value}
                  >
                    <Checkbox
                      id={option.value}
                      onCheckedChange={(isChecked) =>
                        setTempPrescription((prev) => ({
                          ...prev,
                          foodRelation: isChecked ? option.value : "",
                        }))
                      }
                      checked={tempPrescription.foodRelation === option.value}
                    />
                    <Label
                      htmlFor={option.value}
                      className="text-sm text-muted-foreground leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {option.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <Label className="font-medium text-sm">
                Prescription Remarks:{" "}
              </Label>
              <Textarea
                maxLength={50}
                value={tempPrescription.prescriptionRemarks}
                onChange={(e) => {
                  setTempPrescription((prev) => ({
                    ...prev,
                    prescriptionRemarks: e.target.value,
                  }));
                }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              disabled={!isPrescriptionValid()}
              onClick={() => {
                setPrescription((prev) => [...prev, tempPrescription]);
                setTempPrescription(PRESCRIPTION_INITIAL_STATE);
                setShowPrescriptionDialog(false);
                setSelectedMedicine(null);
              }}
            >
              Save changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <AlertDialog
        open={cancelAppointment || completeAppointment}
        onOpenChange={(open) =>
          cancelAppointment
            ? setCancelAppointment(open)
            : setCompleteAppointment(open)
        }
      >
        {cancelAppointment ? (
          <CancelDialogContent />
        ) : (
          <CompleteAppointmentContent />
        )}
      </AlertDialog>
    </>
  );
};

export default AppointmentDetails;

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardTitle } from "@/components/ui/card";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import DatePicker from "@/components/ui/date-picker";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import Spinner from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import useErrorHandler from "@/hooks/useError";
import {
  createAppointment,
  getDoctorMinifiedList,
  getPatientList,
  getTimeSlots,
  getWeekdaysList,
} from "@/https/admin-service";
import { cn } from "@/lib/utils";
import { APP_ROUTES } from "@/router/appRoutes";
import {
  IAppointmentForm,
  IFilterDoctor,
  IMedicalReport,
  ISlot,
  ITimeSlot,
  IWeekday,
  PatientRecord,
} from "@/types";
import { getWeekdayId } from "@/utils";
import { CaretSortIcon } from "@radix-ui/react-icons";
import { CommandLoading } from "cmdk";
import { format } from "date-fns";
import debounce from "lodash.debounce";
import { ArrowLeft, CalendarX, CheckIcon, X } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import Ailment from "./AilmentList";
import AvailableSlots from "./TimeSlots";
import UploadReport from "./UploadReports";

const AddAppointment = () => {
  const [fetchingPatients, setFetchingPatients] = useState<boolean>(false);
  const [fetchingDoctors, setFetchingDoctors] = useState<boolean>(false);
  const [patientList, setPatientList] = useState<PatientRecord[]>([]);
  const [doctorList, setDoctorList] = useState<IFilterDoctor[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<PatientRecord | null>(
    null
  );
  const [selectedDoctor, setSelectedDoctor] = useState<IFilterDoctor>();

  const [showDoctorList, setShowDoctorList] = useState<boolean>(false);
  const [showPatientList, setShowPatientList] = useState<boolean>(false);

  const [fetchingTimeSlots, setFetchingTimeSlots] = useState<boolean>(false);
  const [timeSlots, setTimeSlots] = useState<ITimeSlot>({
    isSlotAvailable: false,
    slots: { Morning: [], Afternoon: [], Evening: [] },
  });
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [weekdays, setWeekdays] = useState<IWeekday[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<ISlot | undefined>(
    undefined
  );
  const [medicalReports, setMedicalReports] = useState<IMedicalReport[]>([]);
  const [selectedAilment, setSelectedAilment] = useState<string>();
  const [remarks, setRemarks] = useState<string>();
  const [submitting, setSubmitting] = useState<boolean>(false);

  const navigate = useNavigate();
  const handleError = useErrorHandler();

  const fetchPatientList = async (searchVal?: string) => {
    try {
      setFetchingPatients(true);
      const queryParams: Record<string, string> = {};
      if (searchVal) {
        queryParams["search"] = searchVal;
      }
      const res = await getPatientList(queryParams);
      setPatientList(res.data.data.patientList);
    } catch (error) {
      handleError(error, "Failed to fetch patients list");
    } finally {
      setFetchingPatients(false);
    }
  };

  const fetchDoctorList = async (searchVal?: string) => {
    try {
      setFetchingDoctors(true);
      const queryParams: Record<string, string> = {};
      if (searchVal) {
        queryParams["search"] = searchVal;
      }
      const res = await getDoctorMinifiedList(queryParams);
      setDoctorList(res.data.data.doctorMinifiedList);
    } catch (error) {
      handleError(error, "Failed to fetch doctors list");
    } finally {
      setFetchingDoctors(false);
    }
  };

  const handlePatientSearch = debounce(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      fetchPatientList(value);
    },
    900
  );
  const handleDoctorSearch = debounce(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      fetchDoctorList(value);
    },
    900
  );

  const handleSelectDoctor = async () => {
    try {
      if (!selectedDate || weekdays.length === 0) {
        return setTimeSlots({
          isSlotAvailable: false,
          slots: { Morning: [], Afternoon: [], Evening: [] },
        });
      }
      setFetchingTimeSlots(true);
      const weekdayId = getWeekdayId(weekdays!, selectedDate);
      if (weekdayId) {
        const res = await getTimeSlots(weekdayId, selectedDoctor?.id as string);
        const formattedData = (slot: { id: string; slot: ISlot }) => {
          return {
            id: slot.id,
            startTime: slot.slot.startTime,
            endTime: slot.slot.endTime,
          };
        };

        const data = res.data.data;
        const timeSlotData = {
          isSlotAvailable: res.data.data.isSlotAvailableForTheDay,
          slots: {
            Morning: data.slotDetails.morningSlots.map(formattedData),
            Afternoon: data.slotDetails.afternoonSlots.map(formattedData),
            Evening: data.slotDetails.eveningSlots.map(formattedData),
          },
        };

        setTimeSlots(timeSlotData);
      }
    } catch (error) {
      handleError(error, "Something went wrong");
    } finally {
      setFetchingTimeSlots(false);
    }
  };

  const fetchWeekDayList = async () => {
    try {
      const res = await getWeekdaysList();
      setWeekdays(res.data.data.weekDayList);
    } catch (error) {
      handleError(error, "Failed to fetch weekdays list");
    }
  };

  const handleUpdateMedicalReport = (file: IMedicalReport) => {
    setMedicalReports((prev) => [...prev, file]);
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      const payload: IAppointmentForm = {
        doctorId: selectedDoctor?.id,
        doctorSlotId: selectedSlot?.id,
        remarks: remarks,
        ailmentId: selectedAilment,
        patientId: selectedPatient?.patient?.id,
        appointmentDate: format(selectedDate, "yyyy-MM-dd"),
        documents: medicalReports,
      };
      const res = await createAppointment(payload);
      if (res.status === 200) {
        toast.success("Appointment booked successfully");
        navigate(APP_ROUTES.APPOINTMENTS);
      }
    } catch (error) {
      handleError(error, "Failed to book appointment");
    } finally {
      setSubmitting(false);
    }
  };

  const disableSubmitBtn = () => {
    return (
      !selectedAilment ||
      !selectedPatient ||
      !selectedDoctor ||
      !selectedSlot ||
      !selectedDate
    );
  };

  useEffect(() => {
    fetchWeekDayList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    handleSelectDoctor();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDoctor, selectedDate]);

  return (
    <div className="flex flex-col gap-2  items-start ">
      <Button variant="link" onClick={() => navigate(APP_ROUTES.APPOINTMENTS)}>
        <ArrowLeft className="h-4 w-4 mr-1" />
        Go Back
      </Button>
      <div className="flex md:flex-row flex-col gap-4 w-full ">
        <Card className="p-6 flex justify-between w-full space-y-4">
          <CardContent className="p-0 w-full">
            <CardTitle className="mb-4">Patient Details</CardTitle>
            <Popover
              open={showPatientList}
              onOpenChange={(isOpen) => {
                setShowPatientList(isOpen);
                isOpen && fetchPatientList();
              }}
            >
              <Label>Patient Name</Label>
              <PopoverTrigger
                asChild
                className="flex w-full mt-2 space-y-4 mb-4"
              >
                <Button
                  variant="outline"
                  role="combobox"
                  className="justify-between text-muted-foreground font-normal"
                >
                  {selectedPatient
                    ? selectedPatient.patient.name
                    : "Select Patient"}
                  <CaretSortIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className=" p-0 mr-4" align="start">
                <Command>
                  <CommandList className="p-2 ">
                    <Input
                      className="mb-2"
                      placeholder="Search patient..."
                      onChange={handlePatientSearch}
                    />
                    <ScrollArea className="h-[200px]">
                      <CommandEmpty>No Patient found.</CommandEmpty>
                      {fetchingPatients && (
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
                        {patientList.map((item: PatientRecord) => (
                          <CommandItem
                            className="gap-2 cursor-pointer"
                            key={item.id}
                            value={item.patient.name}
                            onSelect={() => {
                              console.log(item, "patinet");
                              setSelectedPatient(item);
                              setShowPatientList(false);
                            }}
                          >
                            <p className="flex flex-col">{item.patient.name}</p>
                            {selectedPatient &&
                              selectedPatient?.id === item.id && (
                                <CheckIcon className={cn("ml-auto h-4 w-4")} />
                              )}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </ScrollArea>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            {selectedPatient && (
              <div className="flex flex-col gap-4">
                <div className="flex flex-col space-y-2">
                  <Label>Mobile Number</Label>
                  <Input
                    value={selectedPatient.patient?.phoneNumber}
                    disabled
                  />
                </div>
                <div className="flex flex-col space-y-2">
                  <Label>Ailment</Label>
                  <Ailment
                    onChange={(value: string) => {
                      setSelectedAilment(value);
                    }}
                    selectedValue={selectedAilment as string}
                  />
                </div>
                <div className="flex flex-col space-y-2">
                  <Label>Remarks (optional)</Label>
                  <Textarea
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    placeholder="Enter remarks"
                  />
                </div>

                <div className="flex flex-col space-y-2">
                  <Label>Medical Reports (optional)</Label>
                  <div>
                    {medicalReports.length !== 0 &&
                      medicalReports.map((file: IMedicalReport, index) => {
                        if (!file) return null;
                        const fileType =
                          file?.documentTypeName || `Report - ${index + 1}`;
                        return (
                          <Badge
                            variant={"secondary"}
                            className="cursor-pointer"
                            onClick={() =>
                              window.open(
                                file.signedUrl as string,
                                "_blank",
                                "noopener,noreferrer"
                              )
                            }
                          >
                            <div className="flex w-full gap-2 items-center capitalize">
                              <p>{`${fileType}.${file.fileExtension}`}</p>
                              <X
                                className="w-3 h-3 hover:scale-110"
                                onClick={(e) => {
                                  setMedicalReports((prev) =>
                                    prev.filter((_, i) => i !== index)
                                  );
                                  e.stopPropagation();
                                }}
                              />
                            </div>
                          </Badge>
                        );
                      })}
                    <UploadReport
                      updateMedicalReport={handleUpdateMedicalReport}
                      patientId={selectedPatient.id}
                    />
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
        <Card className="p-6 flex justify-between w-full space-y-4">
          <CardContent className="p-0 w-full">
            <CardTitle className="mb-4">Doctor Details</CardTitle>
            <Popover
              open={showDoctorList}
              onOpenChange={(isOpen) => {
                setShowDoctorList(isOpen);
                isOpen && fetchDoctorList();
              }}
            >
              <Label>Doctor Name</Label>
              <PopoverTrigger
                asChild
                className="flex w-full mt-2 space-y-4 mb-4"
              >
                <Button
                  variant="outline"
                  role="combobox"
                  className="justify-between text-muted-foreground font-normal"
                >
                  {selectedDoctor ? selectedDoctor.name : "Select Doctor"}
                  <CaretSortIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0 mr-4" align="start">
                <Command>
                  <CommandList className="p-2">
                    <Input
                      className="mb-2"
                      placeholder="Search doctor..."
                      onChange={handleDoctorSearch}
                    />
                    <ScrollArea className="h-[200px]">
                      <CommandEmpty>No Doctor found.</CommandEmpty>
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
                        {doctorList.map((item: IFilterDoctor) => (
                          <CommandItem
                            className="gap-2 cursor-pointer"
                            key={item.id}
                            value={item.name}
                            onSelect={() => {
                              setSelectedDoctor(item);
                              setShowDoctorList(false);
                            }}
                          >
                            <p className="flex flex-col">{item.name}</p>
                            {selectedDoctor &&
                              selectedDoctor?.id === item.id && (
                                <CheckIcon className={cn("ml-auto h-4 w-4")} />
                              )}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </ScrollArea>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            {selectedDoctor && (
              <div>
                {fetchingTimeSlots ? (
                  <>
                    <Spinner />
                    <span>Fetching time slots...</span>
                  </>
                ) : (
                  <div>
                    <DatePicker
                      date={selectedDate}
                      setDate={(date) => setSelectedDate(date as Date)}
                      placeholder="Select a date"
                      disabled={{ before: new Date() }}
                    />

                    {timeSlots.isSlotAvailable ? (
                      <AvailableSlots
                        timeSlots={timeSlots}
                        selectedSlot={selectedSlot}
                        handleSlotClick={(slot) => {
                          console.log(slot, "handle change");
                          setSelectedSlot(slot);
                        }}
                      />
                    ) : (
                      <p
                        className={`flex items-center justify-center  p-2 mt-4 ${
                          selectedDate
                            ? "bg-red-100 text-red-500"
                            : "bg-blue-100 text-blue-500"
                        } rounded-md`}
                      >
                        <CalendarX className="w-6 h-6 mr-2" />
                        <span className="text-md font-medium">
                          {selectedDate
                            ? "No slots available"
                            : "Please select a date"}
                        </span>
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      <CardFooter className="md:justify-end justify-center w-full mt-4 ">
        <Button
          className="md:w-fit w-full"
          onClick={handleSubmit}
          disabled={disableSubmitBtn()}
        >
          {submitting ? (
            <>
              <Spinner />
              <span>Please wait...</span>
            </>
          ) : (
            "Book Appointment"
          )}
        </Button>
      </CardFooter>
    </div>
  );
};

export default AddAppointment;

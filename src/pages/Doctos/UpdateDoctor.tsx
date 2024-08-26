// src/pages/Profile.tsx
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import useErrorHandler from "@/hooks/useError";
import {
  getDoctorDetails,
  getDoctorSlots,
  getWeekdaysList,
  updateDoctor,
  uploadDoctorProfilePicture,
} from "@/https/admin-service";
import { ICreateDoctor, IDoctorSlots, ISlot, IUpdateDoctor } from "@/types";
import { ArrowLeft, CloudSun, Loader, Moon, Sun, UserIcon } from "lucide-react";
import React, { Dispatch, useEffect, useRef, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { toast } from "sonner";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

import { PhoneInput } from "@/components/ui/phone-input";
import Spinner from "@/components/ui/spinner";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { APP_ROUTES } from "@/router/appRoutes";
import { dirtyValues, replaceNullWithEmptyString } from "@/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { isValidPhoneNumber } from "react-phone-number-input";
import { useNavigate, useParams } from "react-router-dom";
import { z } from "zod";
import NoDataFound from "../NoDataFound";

const getIconForPeriod = (period: string) => {
  switch (period) {
    case "Morning":
      return <Sun className="w-5 h-5 text-yellow-500" />;
    case "Afternoon":
      return <CloudSun className="w-5 h-5 text-orange-500" />;
    case "Evening":
      return <Moon className="w-5 h-5 text-blue-500" />;
    default:
      return null;
  }
};

interface ISelectedSlot {
  [selectedWeek: string]: {
    slots: string[];
    isDoctorAvailableForTheDay: boolean;
  };
}
interface IRenderSlotProps {
  time: string;
  slots: ISlot[];
  selectedSlots: ISelectedSlot | undefined;
  setSelectedSlot: Dispatch<React.SetStateAction<ISelectedSlot | undefined>>;
  setNewSelectedSlots: Dispatch<
    React.SetStateAction<ISelectedSlot | undefined>
  >;
  setRemovedSlots: Dispatch<React.SetStateAction<string[] | undefined>>;
  selectedWeek: string;
  dbSelectedSlotIds: string[];
}
const RenderSlots = ({
  time,
  slots,
  selectedSlots,
  setSelectedSlot,
  setNewSelectedSlots,
  selectedWeek,
  dbSelectedSlotIds,
  setRemovedSlots,
}: IRenderSlotProps) => {
  const handleChange = (slot: ISlot) => {
    setSelectedSlot((prev) => {
      const currentSlots = prev?.[selectedWeek]?.slots || [];
      const isSlotSelected = currentSlots.includes(slot.id);
      const updatedSlots = isSlotSelected
        ? currentSlots.filter((item) => item !== slot.id)
        : [...currentSlots, slot.id];

      return {
        ...prev,
        [selectedWeek]: {
          slots: updatedSlots,
          isDoctorAvailableForTheDay:
            prev?.[selectedWeek]?.isDoctorAvailableForTheDay ?? true,
        },
      };
    });

    if (dbSelectedSlotIds.includes(slot.id)) {
      setRemovedSlots((prev) => {
        const currentSlots = prev || [];
        console.log(slot.doctorSlotId);
        const isSlotSelected = currentSlots.includes(slot?.doctorSlotId ?? "");
        const updatedSlots = isSlotSelected
          ? currentSlots.filter((item) => item !== slot.doctorSlotId)
          : [...currentSlots, slot.doctorSlotId];
        return updatedSlots as string[];
      });
    }

    if (!dbSelectedSlotIds.includes(slot.id)) {
      setNewSelectedSlots((prev) => {
        const currentSlots = prev?.[selectedWeek]?.slots || [];
        const isSlotSelected = currentSlots.includes(slot.id);
        const updatedSlots = isSlotSelected
          ? currentSlots.filter((item) => item !== slot.id)
          : [...currentSlots, slot.id];

        return {
          ...prev,
          [selectedWeek]: {
            slots: updatedSlots,
            isDoctorAvailableForTheDay:
              prev?.[selectedWeek]?.isDoctorAvailableForTheDay ?? true,
          },
        };
      });
    }
  };
  return slots.length > 0 ? (
    <React.Fragment key="morning">
      <div className="col-span-full flex items-center gap-4">
        {getIconForPeriod(time)}
        <h5 className="text-md font-semibold">{time}</h5>
      </div>
      <div className={`col-span-full grid grid-cols-3  md:grid-cols-7 gap-2`}>
        {(slots as unknown as ISlot[]).map((slot) => (
          <div
            key={slot.id}
            className={`p-1 md:p-2 text-sm md:text-base rounded cursor-pointer border w-auto text-center ${
              selectedSlots?.[selectedWeek]?.slots?.includes(slot.id)
                ? "bg-gray-200"
                : "hover:bg-gray-200"
            }`}
            onClick={() => handleChange(slot)}
          >
            {`${slot.startTime} - ${slot.endTime}`}{" "}
          </div>
        ))}
      </div>
      <div className="col-span-full">
        <hr className="border-t border-gray-200 my-2" />
      </div>
    </React.Fragment>
  ) : null;
};
const userSchema = z.object({
  name: z.string().min(3, "Name is required"),
  email: z.string().email("Invalid email"),
  speciality: z.string().min(3, "Speciality is required"),
  phoneNumber: z
    .string()
    .refine(isValidPhoneNumber, { message: "Invalid phone number" })
    .or(z.literal("")),
  houseNumber: z.string().optional(),
  address1: z.string().optional(),
  address2: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  pincode: z.string().optional(),
  country: z.string().optional(),
  profilePictureUrl: z.string().optional(),
  role: z.string().optional(),
  signedUrl: z.string().optional(),
  qualification: z.string().optional(),
});
const UpdateDoctor: React.FC = () => {
  const { id } = useParams();
  const [uploadingImage, setUploadingImage] = useState(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [weekDayList, setWeekDayList] = useState<Record<string, string>[]>([]);
  const [selectedWeek, setSelectedWeek] = useState<string>("");
  const [slots, setSlots] = useState<Record<string, IDoctorSlots | boolean>>(
    {}
  );
  const [selectedSlots, setSelectedSlot] = useState<ISelectedSlot | undefined>(
    undefined
  );

  const [newSelectedSlots, setNewSelectedSlots] = useState<
    ISelectedSlot | undefined
  >(undefined);
  const [removedSlots, setRemovedSlots] = useState<string[] | undefined>([]);
  const [dbSelectedSlotIds, setDbSelectedSlotIds] = useState<string[]>([]);
  const [fetchingSlots, setFetchingSlots] = useState<boolean>(false);
  const [profilePicture, setProfilePicture] = useState<string | undefined>();
  const [error, setError] = useState<boolean>(false);

  const imageRef = useRef<HTMLInputElement>(null);
  const handleError = useErrorHandler();
  const navigate = useNavigate();
  const tabsRef = useRef<HTMLDivElement>();

  const form = useForm<ICreateDoctor["doctorDetails"]>({
    resolver: zodResolver(userSchema),
  });

  const fetchWeekDayList = async () => {
    try {
      const response = await getWeekdaysList();
      setWeekDayList(response.data.data.weekDayList);
      setSelectedWeek(response.data.data.weekDayList[0].id);
    } catch (error) {
      handleError(error, "Failed to fetch week day list");
    }
  };

  const fetchSlots = async () => {
    try {
      setFetchingSlots(true);
      const response = await getDoctorSlots({
        weekDayId: selectedWeek,
        doctorId: id!,
      });

      setSlots(response.data.data);
      const morningSlots = response.data.data.morningSlots ?? [];
      const afterNoonSlots = response.data.data.afternoonSlots ?? [];
      const eveningSlots = response.data.data.eveningSlots ?? [];
      const isDoctorAvailableForTheDay =
        response.data.data.slotDaySettings.isDoctorAvailableForTheDay ?? true;

      setSelectedSlot((prev) => ({
        ...prev,
        [selectedWeek]: {
          slots: [...morningSlots, ...afterNoonSlots, ...eveningSlots]
            .filter((slot) => slot.isSlotSelected)
            .map((slot) => slot.id),
          isDoctorAvailableForTheDay,
        },
      }));

      setDbSelectedSlotIds(
        [...morningSlots, ...afterNoonSlots, ...eveningSlots]
          .filter((slot) => slot.isSlotSelected)
          .map((slot) => slot.id)
      );

      tabsRef && tabsRef.current?.scrollIntoView({ behavior: "smooth" });
    } catch (error) {
      handleError(error, "Failed to fetch slots");
    } finally {
      setFetchingSlots(false);
    }
  };
  const fetchDoctorDetails = async () => {
    try {
      error && setError(false);
      const res = await getDoctorDetails(id!);

      const details = res.data.data;
      const transformedDetails = replaceNullWithEmptyString(details);

      form.reset({
        ...transformedDetails,
        phoneNumber: `${transformedDetails?.isd_code}${transformedDetails?.phoneNumber}`,
      });
    } catch (error) {
      handleError(error, "Failed to fetch doctor details");
      setError(true);
    }
  };

  useEffect(() => {
    fetchWeekDayList();
    fetchDoctorDetails();
  }, []);

  useEffect(() => {
    if (selectedWeek) {
      fetchSlots();
    }
  }, [selectedWeek]);

  const onSubmit: SubmitHandler<ICreateDoctor["doctorDetails"]> = async () => {
    try {
      setSubmitting(true);
      const data: IUpdateDoctor["doctorDetails"] = dirtyValues(
        form.formState.dirtyFields,
        form.getValues()
      );

      const payload: IUpdateDoctor = {};
      if (form.formState.isDirty) {
        payload.doctorDetails = {
          ...data,
            phoneNumber: data?.phoneNumber?.substring(3),
            isd_code: data?.phoneNumber?.substring(0, 3),
          role: "DOCTOR",
        };
      }
      if (newSelectedSlots && Object.keys(newSelectedSlots).length !== 0) {
        payload.slotDetails = Object.keys(newSelectedSlots).map((key) => {
          return {
            weekDaysId: key,
            isDoctorAvailableForTheDay:
              newSelectedSlots[key].isDoctorAvailableForTheDay,
            selectedSlots: newSelectedSlots[key].slots,
          };
        });
      }
      if (removedSlots && removedSlots.length > 0) {
        payload.removedSlotIds = removedSlots;
      }
      const res = await updateDoctor(payload, id!);
      if (res.status === 200) {
        toast.success("Doctor updated successfully");
        fetchDoctorDetails();
      }
    } catch (error) {
      handleError(error, "Failed to update profile");
    } finally {
      setSubmitting(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = e.target.files?.[0];
      setUploadingImage(true);
      if (file) {
        const validImageTypes = ["image/jpeg", "image/png"];
        if (!validImageTypes.includes(file.type)) {
          toast.error("Only images are allowed");
          throw new Error("Not an image");
        }
        const formData = new FormData();
        formData.append("file", file);
        const res = await uploadDoctorProfilePicture(formData);
        toast.success("Profile picture uploaded successfully");
        form.setValue("profilePictureUrl", res.data.data.bucketPath, {
          shouldDirty: true,
        });
        setProfilePicture(res.data.data.signedUrl);
      } else {
        throw new Error("No file selected");
      }
    } catch (error) {
      handleError(error, "Failed to upload profile picture");
    } finally {
      setUploadingImage(false);
    }
  };

  return (
    <div className="mx-auto w-full">
      <Button
        variant="link"
        size="sm"
        className="mb-4"
        onClick={() => navigate(APP_ROUTES.DOCTORS)}
      >
        <ArrowLeft className="h-3.5 w-3.5 mr-2" />
        Go Back
      </Button>
      {error ? (
        <NoDataFound message="Doctor details not found" />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Doctor Details</CardTitle>
          </CardHeader>
          <CardContent>
            {/* First Row */}
            <div className="flex flex-wrap gap-4 mb-4">
              <div className="flex items-center w-full md:w-1/3">
                <div className="flex gap-3 items-center">
                  <Avatar className="w-24 h-24">
                    <AvatarImage
                      // @ts-expect-error-free
                      src={profilePicture || form.getValues("signedUrl")}
                      alt="image"
                      className="object-fit aspect-square"
                    />
                    <AvatarFallback
                      className="hover:cursor-pointer"
                      onClick={() => imageRef?.current?.click()}
                    >
                      <UserIcon className="w-12 h-12" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col items-start ml-4">
                    <Label>Profile Picture</Label>
                    <p className="text-gray-400 text-sm mt-1">
                      Choose a photo from your device
                    </p>
                    <Button
                      variant="link"
                      onClick={(e) => {
                        e.preventDefault();
                        imageRef?.current?.click();
                      }}
                      className="mt-2 ml-[-12px]"
                    >
                      {uploadingImage ? (
                        <>
                          <Loader className="animate-spin" />
                          Uploading...
                        </>
                      ) : form.getValues("profilePictureUrl") ? (
                        "Update Picture"
                      ) : (
                        "Add Picture"
                      )}
                    </Button>
                  </div>
                  <input
                    ref={imageRef}
                    type="file"
                    className="hidden"
                    onChange={handleImageUpload}
                    accept="image/jpeg,image/png"
                  />
                </div>
              </div>
            </div>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                {/* First Row */}

                <div className="flex flex-wrap gap-4 mb-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem className="w-full md:w-1/2 lg:w-1/4 mb-4">
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="speciality"
                    render={({ field }) => (
                      <FormItem className="w-full md:w-1/2 lg:w-1/4 mb-4">
                        <FormLabel>Speciality</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="qualification"
                    render={({ field }) => (
                      <FormItem className="w-full md:w-1/2 lg:w-1/4 mb-4">
                        <FormLabel>Qualification</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="phoneNumber"
                    render={({ field }) => (
                      <FormItem className="w-full md:w-1/2 lg:w-1/4 mb-4">
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <PhoneInput
                            defaultCountry="IN"
                            placeholder="Enter a phone number"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem className="w-full md:w-1/2 lg:w-1/4 mb-4">
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input {...field} type="email" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                    disabled
                  />
                </div>

                <hr className="my-4" />

                {/* Third Row */}
                <p className="font-semibold text-md">
                  Address Details{" "}
                  <span className="text-muted-foreground text-sm">
                    (optional)
                  </span>
                </p>
                <div className="flex flex-wrap gap-4 mb-4">
                  <FormField
                    control={form.control}
                    name="houseNumber"
                    render={({ field }) => (
                      <FormItem className="w-full md:w-1/2 lg:w-1/4 mb-4">
                        <FormLabel>House Number</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="address1"
                    render={({ field }) => (
                      <FormItem className="w-full md:w-1/2 lg:w-1/4 mb-4">
                        <FormLabel>Colony</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem className="w-full md:w-1/2 lg:w-1/4 mb-4">
                        <FormLabel>City</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="state"
                    render={({ field }) => (
                      <FormItem className="w-full md:w-1/2 lg:w-1/4 mb-4">
                        <FormLabel>State</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="country"
                    render={({ field }) => (
                      <FormItem className="w-full md:w-1/2 lg:w-1/4 mb-4">
                        <FormLabel>Country</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="pincode"
                    render={({ field }) => (
                      <FormItem className="w-full md:w-1/2 lg:w-1/4 mb-4">
                        <FormLabel>Pincode</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div>
                  <p className="font-semibold text-md mb-4">Time Slots</p>
                  <Tabs
                    value={selectedWeek}
                    onValueChange={setSelectedWeek}
                    className="min-h-[500px]"
                  >
                  <TabsList className="flex-wrap h-100">
                  {weekDayList.map((item) => (
                        <TabsTrigger key={item.id} value={item.id}>
                          {item.name}
                        </TabsTrigger>
                      ))}
                    </TabsList>
                    {fetchingSlots ? (
                      <div className="flex gap-2 mt-4">
                        <Spinner />
                        Looking for slots...
                      </div>
                    ) : (
                      <TabsContent value={selectedWeek}>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                          <div className="flex items-center space-x-2">
                            <Label htmlFor="doc-availability">
                              Doctor Availability
                            </Label>
                            <Switch
                              id="doc-availability"
                              checked={
                                newSelectedSlots?.[selectedWeek]
                                  ?.isDoctorAvailableForTheDay ??
                                selectedSlots?.[selectedWeek]
                                  ?.isDoctorAvailableForTheDay
                              }
                              onCheckedChange={(checked) => {
                                setNewSelectedSlots((prev) => {
                                  return {
                                    ...prev,
                                    [selectedWeek]: {
                                      slots:
                                        selectedSlots?.[selectedWeek].slots ||
                                        [],
                                      isDoctorAvailableForTheDay: checked,
                                    },
                                  };
                                });
                              }}
                            />
                          </div>
                          {slots.morningSlots && (
                            <RenderSlots
                              time="Morning"
                              slots={slots?.morningSlots as unknown as ISlot[]}
                              selectedSlots={selectedSlots}
                              setSelectedSlot={setSelectedSlot}
                              selectedWeek={selectedWeek}
                              setNewSelectedSlots={setNewSelectedSlots}
                              dbSelectedSlotIds={dbSelectedSlotIds}
                              setRemovedSlots={setRemovedSlots}
                            />
                          )}
                          {slots.afternoonSlots && (
                            <RenderSlots
                              time="Afternoon"
                              slots={
                                slots?.afternoonSlots as unknown as ISlot[]
                              }
                              selectedSlots={selectedSlots}
                              setSelectedSlot={setSelectedSlot}
                              selectedWeek={selectedWeek}
                              setNewSelectedSlots={setNewSelectedSlots}
                              dbSelectedSlotIds={dbSelectedSlotIds}
                              setRemovedSlots={setRemovedSlots}
                            />
                          )}
                          {slots.eveningSlots && (
                            <RenderSlots
                              time="Evening"
                              slots={slots.eveningSlots as unknown as ISlot[]}
                              selectedSlots={selectedSlots}
                              setSelectedSlot={setSelectedSlot}
                              selectedWeek={selectedWeek}
                              setNewSelectedSlots={setNewSelectedSlots}
                              dbSelectedSlotIds={dbSelectedSlotIds}
                              setRemovedSlots={setRemovedSlots}
                            />
                          )}
                        </div>
                      </TabsContent>
                    )}
                  </Tabs>
                </div>
                <div className="flex w-full justify-end">
                  <Button
                    type="submit"
                    className="md:w-fit w-full mt-4 self-right"
                    disabled={
                      submitting ||
                      (newSelectedSlots === undefined &&
                        removedSlots &&
                        removedSlots.length === 0 &&
                        !form.formState.isDirty)
                    }
                  >
                    {submitting ? (
                      <>
                        <Spinner type="light" />
                        Please wait...
                      </>
                    ) : (
                      "Update Doctor"
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default UpdateDoctor;

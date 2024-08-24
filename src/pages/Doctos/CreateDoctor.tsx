// src/pages/Profile.tsx
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import useErrorHandler from "@/hooks/useError";
import {
  createDoctor,
  getDoctorSlots,
  getWeekdaysList,
  uploadDoctorProfilePicture,
} from "@/https/admin-service";
import { ICreateDoctor, IDoctorSlots, ISlot } from "@/types";
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
import { zodResolver } from "@hookform/resolvers/zod";
import { isValidPhoneNumber } from "react-phone-number-input";
import { useNavigate } from "react-router-dom";
import { z } from "zod";

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
  selectedWeek: string;
}
const RenderSlots = ({
  time,
  slots,
  selectedSlots,
  setSelectedSlot,
  selectedWeek,
}: IRenderSlotProps) => {
  return (
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
            onClick={() => {
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
            }}
          >
            {`${slot.startTime} - ${slot.endTime}`}{" "}
          </div>
        ))}
      </div>
      <div className="col-span-full">
        <hr className="border-t border-gray-200 my-2" />
      </div>
    </React.Fragment>
  );
};
const userSchema = z.object({
  name: z.string().min(3, "Name is required"),
  email: z.string().email("Invalid email"),
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
  speciality: z.string().min(3, "Speciality is required"),
  qualification: z.string(),
});
const CreateDoctor: React.FC = () => {
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
  const [fetchingSlots, setFetchingSlots] = useState<boolean>(false);
  const [profilePicture, setProfilePicture] = useState<string>();

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
      });

      setSlots(response.data.data);
      tabsRef && tabsRef.current?.scrollIntoView({ behavior: "smooth" });
    } catch (error) {
      handleError(error, "Failed to fetch slots");
    } finally {
      setFetchingSlots(false);
    }
  };

  useEffect(() => {
    fetchWeekDayList();
  }, []);

  useEffect(() => {
    if (selectedWeek) {
      fetchSlots();
    }
  }, [selectedWeek]);

  const onSubmit: SubmitHandler<ICreateDoctor["doctorDetails"]> = async (
    data
  ) => {
    try {
      setSubmitting(true);
      const payload: ICreateDoctor = {
        doctorDetails: {
          ...data,
          phoneNumber: data.phoneNumber.substring(3),
          isd_code: data.phoneNumber.substring(0, 3),
          role: "DOCTOR",
        },
      };
      if (selectedSlots && Object.keys(selectedSlots).length !== 0) {
        payload.slotDetails = Object.keys(selectedSlots).map((key) => {
          return {
            weekDaysId: key,
            isDoctorAvailableForTheDay:
              selectedSlots[key].isDoctorAvailableForTheDay,
            selectedSlots: selectedSlots[key].slots,
          };
        });
      }
      console.log(payload);
      const res = await createDoctor(payload);
      if (res.status === 200) {
        toast.success("Doctor created successfully");
        navigate(APP_ROUTES.DOCTORS);
      }
    } catch (error) {
      handleError(error, "Failed to create doctor");
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
    <div className=" p-8 mx-auto w-full">
      <Button
        variant="link"
        size="sm"
        className="mb-4"
        onClick={() => navigate(APP_ROUTES.DOCTORS)}
      >
        <ArrowLeft className="h-3.5 w-3.5 mr-2" />
        Go Back
      </Button>
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
                    src={profilePicture ?? form.getValues("profilePictureUrl")}
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
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                  orientation="vertical"
                >
                  <TabsList>
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
                              selectedSlots?.[selectedWeek]
                                ?.isDoctorAvailableForTheDay ?? true
                            }
                            onCheckedChange={(checked) => {
                              setSelectedSlot((prev) => {
                                return {
                                  ...prev,
                                  [selectedWeek]: {
                                    slots: prev?.[selectedWeek]?.slots || [],
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
                          />
                        )}
                        {slots.afternoonSlots && (
                          <RenderSlots
                            time="Afternoon"
                            slots={slots?.afternoonSlots as unknown as ISlot[]}
                            selectedSlots={selectedSlots}
                            setSelectedSlot={setSelectedSlot}
                            selectedWeek={selectedWeek}
                          />
                        )}
                        {slots.eveningSlots && (
                          <RenderSlots
                            time="Evening"
                            slots={slots.eveningSlots as unknown as ISlot[]}
                            selectedSlots={selectedSlots}
                            setSelectedSlot={setSelectedSlot}
                            selectedWeek={selectedWeek}
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
                  disabled={submitting || !form.formState.isDirty}
                >
                  {submitting ? (
                    <>
                      <Spinner type="light" />
                      Please wait...
                    </>
                  ) : (
                    "Create Doctor"
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateDoctor;

// redux state type

import { Dispatch, SetStateAction } from "react";

export interface UserState {
  user: User | null;
}

export interface IWeekday {
  id: string;
  day:
    | "Monday"
    | "Tuesday"
    | "Wednesday"
    | "Thursday"
    | "Friday"
    | "Saturday"
    | "Sunday";
}
export interface IAppointmentState {
  weekdays: IWeekday[] | null;
}

export interface ICreateMedicationForm {
  id?: string | null;
  medicationName: string;
  code: string;
  description: string;
  manufacturer: string;
  expirationDate: string | Date; // ISO 8601 date string
  dosageForm:
    | "Tablet"
    | "Capsule"
    | "Syrup"
    | "Powder"
    | "Ointment"
    | "Cream"
    | "Gel"
    | "Pastes"
    | "Granules"
    | "Pellets"
    | "Lozenges"
    | "Elixirs"
    | "Tinctures"
    | "Liniments"
    | "Others";
  medicationDosage: string;
  hospitalId?: string;
}

export interface IAppointmentUpdate {
  status: "COMPLETED" | "CANCELLED" | "APPROVED";
  appointmentId: string;
  doctorRemarks?: string;
  prescriptions?: IMedcation[];
}

export interface IMedcation {
  medicationStock?: Record<string, string>;
  medicationStockId: string;
  durationInDays: number | "";
  foodRelation: "BEFORE_MEAL" | "AFTER_MEAL" | "";
  timeOfDay: Array<"MORNING" | "AFTERNOON" | "EVENING" | "NIGHT">;
  prescriptionRemarks?: string;
}

export interface IFilterDoctor {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  isd_code: string;
  speciality: string;
}

export interface Ailment {
  id?: string;
  createdAt?: string;
  updatedAt?: string;
  name: string;
  description?: string | null;
  isActive?: boolean;
  isDefault?: boolean;
  isDeleted?: boolean;
  hospitalId?: string;
}

export interface Slots {
  id?: string;
  startTime: string | null;
  endTime: string | null;
}

export interface Patient {
  name: string;
  id: string;
  phoneNumber: string;
  gender: string;
  dateOfBirth: string;
  bloodGroup: string;
  isd_code: string;
  email: string;
}

export interface PatientRecord {
  id: string;
  createdAt: string;
  updatedAt: string;
  hospitalId: string;
  patientId: string;
  patient: Patient;
}

interface DoctorSlots {
  doctorId: string;
  weekDaysId: string;
  id: string;
  slot: {
    id: string;
    startTime: string;
    endTime: string;
    hospitalId: string;
  };
}
export interface Appointment {
  id: string;
  appointmentDate: string;
  appointmentStatus: "APPROVED" | "SCHEDULED" | "PENDING" | "COMPLETED";
  patientPrescription?: IMedcation[];
  doctor: {
    id: string;
    name: string;
    speciality: string;
    profilePictureUrl: string;
  };
  patient: {
    id: string;
    name: string;
    email: string;
    phoneNumber: string;
    isd_code: string;
    bloodGroup: string;
    dateOfBirth: string;
    gender: string;
  };
  ailment: Ailment;
  doctorSlots: DoctorSlots;
  patientAppointmentDocs: Array<
    Record<string, string | Record<string, string>>
  >;
  remarks: "";
  doctorRemarks: "";
  isFeedbackProvided: boolean;
  appointmentFeedbacks: Record<string, string>;
  feverLevel: string;
  bloodPreassure: string;
  pulse: string;
  patientWeight: string;
  otherVitalRemarks: string;
  tokenNumber: string;
  hospital: {
    name: string;
    address: string;
    phoneNumber: string;
    isd_code: string;
    pincode: string;
  };
}

// app types
export interface User {
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
  bloodGroup: string;
  address: {
    houseNumber: string;
    colony: string;
    city: string;
    state: string;
    country: string;
    pincode: string;
  };
  signedUrl: string;
  profilePictureUrl: string;
  role: "ADMIN" | "DOCTOR" | "PATIENT";
}
export interface Doctor {
  id: string;
  name: string;
  profilePictureUrl: string;
  speciality: string;
  isd_code: string;
  phoneNumber: string;
  address: string;
}

export interface Feedbacks {
  id: string;
  overallSatisfaction: number;
  feedBackRemarks: string;
  appointment: Appointment;
}

export interface IAppointmentForm {
  doctorId?: string;
  doctorSlotId?: string;
  patientId?: string;
  remarks?: string;
  ailmentId?: string;
  appointmentDate?: string;
  documents?: IMedicalReport[];
}

export interface IloginForm {
  userName: string;
  password: string;
}
export interface IForgotPasswordForm {
  oldPassword: string;
  newPassword: string;
}

export interface IResetPasswordForm {
  currentPassword: string;
  newPassword: string;
}
export interface ISlot {
  id: string;
  startTime: string;
  hospitalId: string;
}
export interface ISlots {
  Morning?: ISlot[];
  Afternoon?: ISlot[];
  Evening?: ISlot[];
}
export interface ITimeSlot {
  isSlotAvailable: boolean;
  slots: ISlots;
}

export interface IAppointmentResponse {
  id: string;
  createdAt: string;
  updatedAt: string;
  doctorSlotId: string;
  doctorId: string;
  patientId: string;
  hospitalId: string;
  remarks: string;
  doctorRemarks: string | null;
  ailmentId: string;
  appointmentStatus:
    | "SCHEDULED"
    | "PENDING"
    | "COMPLETED"
    | "CANCELED"
    | "APPROVED";
  appointmentDate: string;
  doctor: Doctor;
  doctorSlots: {
    id: string;
    doctorId: string;
    createdAt: string;
    updatedAt: string;
    slotId: string;
    weekDaysId: string;
    slotLimit: number;
    isEnabled: boolean;
    isActive: boolean;
    isDeleted: boolean;
    slot: {
      id: string;
      startTime: string;
      endTime: string;
      createdAt: string;
      updatedAt: string;
      hospitalId: string;
    };
  };
  patientAppointmentDocs?: IMedicalReport[];
  isFeedbackProvided: boolean;
  appointmentFeedbacks: Record<string, string>;
  patientPrescription: IPrescription[];
}

export interface IMedicationStock {
  id: string;
  medicationName: string;
  medicationDosage: string;
  description: string;
}

export interface IPrescription {
  id: string;
  createdAt: string;
  updatedAt: string;
  appointmentId: string;
  patientId: string;
  hospitalId: string;
  durationInDays: number;
  medicationStockId: string;
  foodRelation: string;
  medicationStock: IMedicationStock;
}

export interface IMedicationResponse {
  prescriptionId: string;
  appointmentId: string;
  hospitalId: string;
  patientId: string;
  medicationName: string;
  medicationDosage: string;
  foodRelation: string;
  prescriptionDate: string;
  prescriptionDayId: string;
  prescriptionTimeOfDayId: string;
  isPrescriptionTakenForTheDay: boolean;
  prescriptionTimeOfDay: string;
  isPrescriptionTaken: boolean;
}

export interface ITodaysMedicationsResponse {
  isPriscriptionAvailableForTheDay: boolean;
  morningPrescription: IMedicationResponse[];
  afterNoonPrescription: IMedicationResponse[];
  eveningPrescription: IMedicationResponse[];
  nightPrescription: IMedicationResponse[];
}

export interface MedicationsProps {
  medicationDate: Date | undefined;
  setMedicationDate: Dispatch<SetStateAction<Date | undefined>>;
  loadingMedications: boolean;
  medications: { [key: string]: IMedicationResponse[] };
}

export interface IUpdatePrescriptionTakenPayload {
  prescriptionDayId: string;
  prescriptionTimeOfDayId: string;
  isPrescriptionTaken: boolean;
}

export interface MedicationRes {
  isPrescriptionAvailable: boolean;
  times: { [key: string]: IMedicationResponse[] };
}

export interface IReportUpload {
  [reportType: string]: File;
}

export interface IUpdateAppointmentDetails {
  appointmentDetails?: {
    remarks?: string;
    ailmentId?: string;
    appointmentDate?: string;
    doctorSlotId?: string;
    appointmentStatus?: string;
  };
  removedDocuments?: {
    id: string;
    bucketPath: string;
  }[];
  documents?: IMedicalReport[];
}

export interface IUpdateUserProfile {
  name?: string;
  email?: string;
  dateOfBirth?: string | Date;
  gender?: "MALE" | "FEMALE" | "OTHERS";
  bloodGroup?: string;
  houseNumber?: string;
  address1?: string;
  address2?: string;
  city?: string;
  state?: string;
  pincode?: string;
  country?: string;
  phoneNumber?: string;
  profilePictureUrl?: string;
  signedUrl?: string;
  isd_code?: string;
  speciality?: string;
}

export interface IMedicalReportType {
  id: string;
  name: string;
}

export interface IMedicalReport {
  id: string;
  createdAt?: string;
  updatedAt?: string;
  documentName: string;
  bucketPath: string;
  fileName: string;
  fileExtension: string;
  documentTypeId?: string;
  contentType: string;
  patientId: string;
  appointmentId: string;
  isDeleted: boolean;
  documentTypes: IMedicalReportType;
  signedUrl: string;
  documentTypeName?: string;
}

export interface ICreateUser {
  id?: string;
  name: string;
  email: string;
  role: string;
  profilePictureUrl: string;
  phoneNumber: string;
  isd_code: string;
  houseNumber?: string;
  address1?: string;
  address2?: string;
  city?: string;
  state?: string;
  country?: string;
  pincode?: string;
  createdAt?: string;
}
export interface IUpdateUser {
  id?: string;
  name?: string;
  email?: string;
  profilePictureUrl?: string;
  phoneNumber?: string;
  isd_code?: string;
  houseNumber?: string;
  address1?: string;
  address2?: string;
  city?: string;
  state?: string;
  country?: string;
  pincode?: string;
}

interface ISlotDetails {
  selectedSlots: string[];
  weekDaysId: string;
  isDoctorAvailableForTheDay: boolean;
  doctorSlodId?: string;
}
export interface ICreateDoctor {
  doctorDetails: {
    id?: string;
    createdAt?: string;
    name: string;
    email: string;
    role: string;
    speciality: string;
    profilePictureUrl: string;
    phoneNumber: string;
    isd_code: string;
    houseNumber?: string;
    address1?: string;
    address2?: string;
    city?: string;
    state?: string;
    country?: string;
    pincode?: string;
    qualification: string;
  };
  slotDetails?: ISlotDetails[];
}
export interface IUpdateDoctor {
  doctorDetails?: {
    id?: string;
    createdAt?: string;
    name?: string;
    email?: string;
    role?: string;
    speciality?: string;
    profilePictureUrl?: string;
    phoneNumber?: string;
    isd_code?: string;
    houseNumber?: string;
    address1?: string;
    address2?: string;
    city?: string;
    state?: string;
    country?: string;
    pincode?: string;
    signedUrl?: string;
    qualification?: string;
  };
  slotDetails?: ISlotDetails[];
  removedSlotIds?: string[];
}

export interface ISlot {
  startTime: string;
  endTime: string;
  id: string;
  isSlotSelected: boolean;
  doctorSlotId?: string;
}
export interface IDoctorSlots {
  morningSlots: ISlot[];
  afternoonSlots: ISlot[];
  eveningSlots: ISlot[];
  slotDaySettings: {
    isDoctorAvailableForTheDay: boolean;
  };
}

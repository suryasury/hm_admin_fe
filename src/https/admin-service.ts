import {
  Ailment,
  IAppointmentUpdate,
  ICreateDoctor,
  ICreateMedicationForm,
  ICreateUser,
  IUpdateDoctor,
  IUpdateUser,
  IUpdateUserProfile,
  Slots,
} from "@/types";
import { api } from "./api";
import { API_END_POINTS } from "./constants";

export const getMedicineList = async (queryParams: Record<string, string>) => {
  return api.get(API_END_POINTS.MEDICINES_LIST, { params: queryParams });
};

export const createMedicine = async (payload: ICreateMedicationForm) => {
  return api.post(API_END_POINTS.MEDICINE_CREATE, payload);
};

export const updateMedicine = async (
  payload: ICreateMedicationForm,
  id: string
) => {
  return api.patch(API_END_POINTS.MEDICINE_UPDATE + `/${id}`, payload);
};

export const deleteMedicine = async (id: string) => {
  return api.delete(API_END_POINTS.MEDICINE_DELETE + `/${id}`);
};

export const getAilmentList = async (queryParams?: Record<string, string>) => {
  return api.get(API_END_POINTS.AILMENT_LISt, { params: queryParams });
};

export const getSlotList = async (queryParams?: Record<string, string>) => {
  return api.get(API_END_POINTS.SLOT_LIST, { params: queryParams });
};

export const createSLot = async (payload: Slots) => {
  return api.post(API_END_POINTS.SLOT_CREATE, payload);
};

export const deleteSlot = async (id: string) => {
  return api.delete(API_END_POINTS.SLOT_DELETE + `/${id}`);
};

export const createAilment = async (payload: Ailment) => {
  return api.post(API_END_POINTS.AILMENT_CREATE, payload);
};

export const updateAilment = async (payload: Ailment, id: string) => {
  return api.patch(API_END_POINTS.AILMENT_UPDATE + `/${id}`, payload);
};

export const deleteAilment = async (id: string) => {
  return api.delete(API_END_POINTS.AILMENT_DELETE + `/${id}`);
};

export const getAppointmentList = async (
  queryParams: Record<string, string>
) => {
  return api.get(API_END_POINTS.APPOINTMENT_LIST, { params: queryParams });
};

export const getDoctorMinifiedList = async (
  queryParams: Record<string, string>
) => {
  return api.get(API_END_POINTS.DOCTOR_MINIFIED_LISt, { params: queryParams });
};

export const getAppointmentDetails = async (id: string) => {
  return api.get(API_END_POINTS.APPOINTMENT_DETAILS + `/${id}`);
};

export const updateAppointment = async (payload: IAppointmentUpdate) => {
  return api.post(API_END_POINTS.APPOINTMENT_UPDATE, payload);
};

export const updateVitals = async (
  payload: Record<string, string>,
  id: string
) => {
  return api.patch(API_END_POINTS.UPDATE_VItALS + `/${id}`, payload);
};

export const getPatientList = async (queryParams: Record<string, string>) => {
  return api.get(API_END_POINTS.PATIENTS_LIST, { params: queryParams });
};

export const getPatientDetails = async (id: string) => {
  return api.get(API_END_POINTS.PATIENT_DETAILS + `/${id}`);
};

export const getDashboardMetrics = async (id: string = "") => {
  return api.get(API_END_POINTS.DASHBOARD_METRICS + `/${id}`);
};

export const getFeedbackList = async (queryParams: Record<string, string>) => {
  return api.get(API_END_POINTS.FEEDBACK_LIST, { params: queryParams });
};

export const updateProfile = async (payload: IUpdateUserProfile) => {
  return api.patch(API_END_POINTS.UPDATE_PROFILE, payload);
};

export const uploadAdminProfilePicture = async (data: FormData) => {
  return api.post(API_END_POINTS.ADMIN_PROFILE_PIC, data);
};

export const getAdminList = async (queryParams: Record<string, string>) => {
  return api.get(API_END_POINTS.ADMIN_LIST, { params: queryParams });
};
export const getAdminDetails = async (id: string) => {
  return api.get(API_END_POINTS.ADMIN_DETAILS + `/${id}`);
};

export const createAdmin = async (payload: ICreateUser) => {
  return api.post(API_END_POINTS.CREATE_ADMIN, payload);
};

export const updateAdmin = async (payload: IUpdateUser, id: string) => {
  return api.patch(API_END_POINTS.UPDATE_ADMIN + `/${id}`, payload);
};

export const createDoctor = async (payload: ICreateDoctor) => {
  return api.post(API_END_POINTS.DOCTOR_CREATE, payload);
};

export const getDoctorList = async (queryParams: Record<string, string>) => {
  return api.get(API_END_POINTS.DOCTORS_LIST, { params: queryParams });
};

export const updateDoctor = async (payload: IUpdateDoctor, id: string) => {
  return api.patch(API_END_POINTS.DOCTOR_UPDATE + `/${id}`, payload);
};

export const getWeekdaysList = async () => {
  return api.get(API_END_POINTS.WEEKDAY_LIST);
};

export const getDoctorSlots = async (queryParams: Record<string, string>) => {
  return api.get(API_END_POINTS.DOCTOR_SLOTS, { params: queryParams });
};

export const getDoctorDetails = async (id: string) => {
  return api.get(API_END_POINTS.DOCTORS_DETAILS + `/${id}`);
};

export const uploadDoctorProfilePicture = async (data: FormData) => {
  return api.post(API_END_POINTS.DOCTOR_PROFILE_PIC, data);
};

export const deleteUser = async (id: string) => {
  return api.delete(API_END_POINTS.DELETE_USER + `/${id}`);
};

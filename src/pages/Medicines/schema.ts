import { z } from "zod";

export const dosageForms = [
  "Tablet",
  "Capsule",
  "Powder",
  "Ointment",
  "Cream",
  "Gel",
  "Syrup",
  "Pastes",
  "Granules",
  "Pellets",
  "Lozenges",
  "Elixirs",
  "Tinctures",
  "Liniments",
  "Others",
] as const;

export const medicationSchema = z.object({
  medicationName: z.string().min(1, "Medication name is required"),
  code: z.string().min(1, "Code is required"),
  description: z.string().min(1, "Description is required"),
  manufacturer: z.string().min(1, "Manufacturer is required"),
  expirationDate: z.date({ required_error: "Expiry date is required" }),

  dosageForm: z.enum(dosageForms),
  medicationDosage: z.string().min(1, "Medication dosage is required"),
});

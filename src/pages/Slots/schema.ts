import { z } from "zod";

export const slotSchema = z.object({
  startTime: z.string().min(1, "Start time is required"),
  endTime: z.string().min(1, "End time is required"),
  meridiem: z.string().min(1, "Meridiem time is required"), //AM or PM
});

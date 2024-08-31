import { z } from "zod";

export const ailmentSchema = z.object({
  name: z.string().min(1, "Ailment name is required"),
  description: z.string().optional(),
});

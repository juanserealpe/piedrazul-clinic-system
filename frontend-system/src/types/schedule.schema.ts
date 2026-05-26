import { z } from "zod";

export const dayEnum = z.enum([
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
  "SUNDAY",
]);

export const scheduleSchema = z.object({

  doctorId: z
    .string()
    .min(1, "Doctor requerido"),

  day: dayEnum,

  startHour: z
    .number()
    .min(0)
    .max(23),

  endHour: z
    .number()
    .min(1)
    .max(24),

  interval: z
    .number()
    .min(1),

});

export type ScheduleFormData =
  z.infer<typeof scheduleSchema>;
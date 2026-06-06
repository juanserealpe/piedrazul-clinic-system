import { z } from "zod";

export const registerSchema = z.object({
  id: z
    .string()
    .min(6, "La cédula debe tener mínimo 6 dígitos")
    .max(11, "La cédula es demasiado larga (máx. 11 dígitos)")
    .regex(/^[0-9]+$/, "La cédula solo puede contener números"),

  // CORRECCIÓN: email es OPCIONAL
  email: z
    .string()
    .trim()
    .optional()
    .or(z.literal(""))
    .refine(
      (val) => !val || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val),
      "Correo inválido"
    )
    .refine(
      (val) => !val || val.length <= 100,
      "Correo demasiado largo"
    ),

  password: z
    .string()
    .min(8, "La contraseña debe tener mínimo 8 caracteres")
    .max(100, "La contraseña es demasiado larga")
    .regex(
      /^(?=.*[A-Z])(?=.*[0-9])/,
      "Debe contener al menos 1 mayúscula y 1 número"
    ),

  roles: z
    .array(
      z.enum(["ADMIN", "PATIENT", "SCHEDULER", "DOCTOR"])
    )
    .min(1, "Selecciona un rol"),

  names: z
    .string()
    .min(2, "Nombres demasiado cortos")
    .max(50, "Nombres demasiado largos (máx. 50 caracteres)")
    .regex(
      /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/,
      "Solo letras y espacios"
    ),

  lastnames: z
    .string()
    .min(2, "Apellidos demasiado cortos")
    .max(50, "Apellidos demasiado largos (máx. 50 caracteres)")
    .regex(
      /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/,
      "Solo letras y espacios"
    ),

  gender: z.enum(["M", "F", "OTHER"], {
    message: "Selecciona un género válido",
  }),

  phone_number: z
    .string()
    .regex(
      /^\+?[0-9]{7,15}$/,
      "Número telefónico inválido (7–15 dígitos)"
    ),

  // CORRECCIÓN: validación de fecha de nacimiento mejorada
  born_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Formato inválido (YYYY-MM-DD)")
    .refine((val) => {
      const date = new Date(val);
      return !isNaN(date.getTime());
    }, "Fecha inválida")
    .refine((val) => {
      const date = new Date(val);
      const today = new Date();
      return date < today;
    }, "La fecha de nacimiento debe ser en el pasado")
    .refine((val) => {
      const date = new Date(val);
      const minDate = new Date("1900-01-01");
      return date >= minDate;
    }, "Fecha de nacimiento demasiado antigua")
    .refine((val) => {
      const date = new Date(val);
      const today = new Date();
      const age = today.getFullYear() - date.getFullYear();
      return age >= 1;
    }, "Debes tener al menos 1 año de edad"),
});

export type RegisterFormData = z.infer<typeof registerSchema>;
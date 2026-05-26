import { z } from "zod";

export const registerSchema = z.object({

  id: z
    .string()
    .min(6, "La cédula debe tener mínimo 6 caracteres")
    .max(11, "La cédula es demasiado larga")
    .regex(/^[0-9]+$/, "La cédula solo puede contener números"),

  email: z
    .string()
    .email("Correo inválido")
    .min(5, "Correo inválido")
    .max(100, "Correo demasiado largo")
    .optional()
    .or(z.literal("")),

  password: z
    .string()
    .min(8, "La contraseña debe tener mínimo 8 caracteres")
    .max(100, "La contraseña es demasiado larga")
    .regex(
      /^(?=.*[A-Z])(?=.*[0-9])/,
      "Debe contener 1 mayúscula y 1 número"
    ),

  roles: z
    .array(
      z.enum([
        "ADMIN",
        "PATIENT",
        "SCHEDULER",
        "DOCTOR",
      ])
    )
    .min(1, "Selecciona un rol"),

  names: z
    .string()
    .min(2, "Nombres demasiado cortos")
    .max(50, "Nombres demasiado largos")
    .regex(
      /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/,
      "Solo letras y espacios"
    ),

  lastnames: z
    .string()
    .min(2, "Apellidos demasiado cortos")
    .max(50, "Apellidos demasiado largos")
    .regex(
      /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/,
      "Solo letras y espacios"
    ),

  gender: z.enum(
    ["M", "F", "OTHER"],
    {
      message: "Selecciona un género válido",
    }
  ),

  phone_number: z
    .string()
    .regex(
      /^\+?[0-9]{7,15}$/,
      "Número telefónico inválido"
    ),

  born_date: z
    .string()
    .regex(
      /^\d{4}-\d{2}-\d{2}$/,
      "La fecha debe ser YYYY-MM-DD"
    ),

});

export type RegisterFormData =
  z.infer<typeof registerSchema>;
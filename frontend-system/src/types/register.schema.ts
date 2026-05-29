import { z } from "zod";

export const registerSchema = z.object({
  id: z
  .string()
  .min(6, "La cédula debe tener mínimo 6 caracteres")
  .max(11, "La cédula es demasiado larga")
  .regex(/^[0-9]+$/, "La cédula solo puede contener números"),

  email: z
  .string()
  .trim()
  .min(1, "El correo es obligatorio")
  .email("Correo inválido")
  .max(100, "Correo demasiado largo")
  .refine(
    (email) => email.endsWith("@unicauca.edu.co"),
    {
      message:
        "Solo se permiten correos @unicauca.edu.co",
    }
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
    .min(5, "Nombres demasiado cortos, debe tener al menos 5 caracteres")
    .max(20, "Nombres demasiado largos, debe tener máximo 20 caracteres")
    .regex(
      /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/,
      "Solo letras y espacios"
    ),

  lastnames: z
    .string()
    .min(5, "Apellidos demasiado cortos, debe tener al menos 5 caracteres")
    .max(20, "Apellidos demasiado largos, debe tener máximo 20 caracteres")
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
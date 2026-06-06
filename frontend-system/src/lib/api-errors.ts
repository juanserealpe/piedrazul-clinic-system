/**
 * api-errors.ts
 * Traduce los errores del backend (inglés/técnico) a mensajes legibles en español.
 * Úsalo en TODOS los catch de llamadas a la API.
 *
 * Uso:
 *   import { getApiErrorMessage } from "@/lib/api-errors";
 *   ...
 *   } catch (err) {
 *     setErrorMsg(getApiErrorMessage(err));
 *   }
 */

// ── Mapa de códigos de error del backend → mensaje legible ────────────────────
const ERROR_CODE_MAP: Record<string, string> = {
  // Auth
  USER_ALREADY_EXISTS:        "Este número de cédula ya está registrado.",
  USER_NOT_FOUND:             "Usuario no encontrado.",
  INVALID_CREDENTIALS:        "Cédula o contraseña incorrectos. Verifique sus datos.",
  EXTERNAL_AUTH_ERROR:        "Error de autenticación. Intente nuevamente.",
  FORBIDDEN:                  "No tiene permisos para realizar esta acción.",
  ROLE_NOT_FOUND:             "El rol seleccionado no existe.",
  CONFLICT:                   "Ya existe un registro con estos datos.",
  NOT_FOUND:                  "El recurso solicitado no fue encontrado.",
  KEYCLOAK_ERROR:             "Error interno de autenticación. Contacte al administrador.",
  INTERNAL_ERROR:             "Error interno del servidor. Intente más tarde.",

  // Citas
  APPOINTMENT_ALREADY_EXIST:  "Ya existe una cita en esa fecha y hora. Seleccione otro horario.",
  APPOINTMENT_NOT_FOUND:      "La cita no fue encontrada o no le pertenece.",
  SCHEDULE_NOT_FOUND:         "No hay un horario configurado para esa fecha.",
  SCHEDULE_NOT_AVAILABLE:     "El horario seleccionado no está disponible.",
  DOCTOR_NOT_FOUND:           "El médico indicado no existe en el sistema.",
  INVALID_INPUT:              "Los datos enviados son inválidos. Verifique los campos.",
  INVALID_INTERVAL:           "El intervalo o el horario no son válidos. Verifique la configuración.",
  INVALID_DATE:               "La fecha seleccionada no es válida. Solo puede agendar hasta 12 días adelante.",
  UNAVAILABILITY_ALREADY_EXIST: "Ya existe una indisponibilidad registrada para esas fechas.",
  UNAVAILABILITY_DOCTOR:      "El médico no está disponible en la fecha seleccionada.",
};

// ── Frases del backend que se traducen directamente ───────────────────────────
const MESSAGE_FRAGMENT_MAP: [string, string][] = [
  ["Ya existe una cita",            "Ya existe una cita en esa fecha y hora. Seleccione otro horario."],
  ["fecha.*ya paso",                "La fecha seleccionada ya pasó. Escoja una fecha futura."],
  ["muy lejana",                    "La fecha es demasiado lejana. Solo puede agendar hasta 12 días adelante."],
  ["intervalo",                     "El intervalo de la cita no coincide con el horario del médico."],
  ["indisposicion",                 "El médico tiene una indisposición registrada para esa fecha."],
  ["horario.*no.*disponible",       "El horario seleccionado no está disponible."],
  ["horario.*no.*encontrado",       "No existe horario para esa fecha y médico."],
  ["Invalid credentials",           "Cédula o contraseña incorrectos."],
  ["already exists",                "Ya existe un registro con esos datos."],
  ["not found",                     "Recurso no encontrado."],
  ["fecha.*anterior",               "La fecha de inicio debe ser posterior a hoy."],
  ["fecha final debe ser mayor",    "La fecha de fin debe ser mayor a la fecha de inicio."],
  ["Fecha anterior a hoy",          "La fecha de inicio no puede ser en el pasado."],
  ["debe seleccionar otra franja",  "Ya tiene un horario en ese rango. Seleccione otra franja horaria."],
  ["no.*le pertenece",              "La cita no le pertenece o ya fue procesada."],
  ["paciente.*no.*encontrado",      "El número de cédula no corresponde a un paciente registrado."],
  ["doctor.*no.*encontrado",        "El número de cédula no corresponde a un médico registrado."],
  ["startHour must be less",        "La hora de inicio debe ser menor a la hora de fin."],
  ["forbidden",                     "No tiene permisos para realizar esta acción."],
  ["unauthorized",                  "Sesión expirada. Por favor, inicie sesión nuevamente."],
  ["network",                       "Sin conexión al servidor. Verifique su internet e intente nuevamente."],
];

// ── Función principal ─────────────────────────────────────────────────────────
export function getApiErrorMessage(error: unknown): string {
  if (!error) return "Ocurrió un error inesperado.";

  // axios / fetch error con response del backend
  const axiosError = error as any;

  // Intentar extraer el mensaje/código del body de la respuesta
  const responseData =
    axiosError?.response?.data ??
    axiosError?.data ??
    null;

  const code    = responseData?.code    as string | undefined;
  const message = (responseData?.message ?? axiosError?.message ?? "") as string;

  // 1. Código exacto del backend
  if (code && ERROR_CODE_MAP[code]) {
    return ERROR_CODE_MAP[code];
  }

  // 2. Fragmento del mensaje backend (case-insensitive)
  const lowerMsg = message.toLowerCase();
  for (const [fragment, translation] of MESSAGE_FRAGMENT_MAP) {
    const regex = new RegExp(fragment, "i");
    if (regex.test(lowerMsg) || regex.test(message)) {
      return translation;
    }
  }

  // 3. Si el mensaje ya está en español y es legible, usarlo tal cual
  if (message && /[áéíóúñ]/i.test(message)) {
    return message;
  }

  // 4. Fallback genérico por status HTTP
  const status = axiosError?.response?.status as number | undefined;
  if (status) {
    const HTTP_MAP: Record<number, string> = {
      400: "Los datos enviados no son válidos.",
      401: "Sesión expirada o credenciales incorrectas. Inicie sesión nuevamente.",
      403: "No tiene permisos para realizar esta acción.",
      404: "El recurso solicitado no fue encontrado.",
      409: "Ya existe un registro con estos datos.",
      422: "Los datos enviados no cumplen los requisitos.",
      429: "Demasiadas solicitudes. Espere un momento e intente nuevamente.",
      500: "Error interno del servidor. Intente más tarde.",
      502: "Servidor no disponible. Intente más tarde.",
      503: "Servicio no disponible temporalmente.",
    };
    if (HTTP_MAP[status]) return HTTP_MAP[status];
  }

  // 5. Sin conexión (network error)
  if (!axiosError?.response && axiosError?.request) {
    return "Sin conexión al servidor. Verifique su internet e intente nuevamente.";
  }

  return "Ocurrió un error inesperado. Intente nuevamente.";
}
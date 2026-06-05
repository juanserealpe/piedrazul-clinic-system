/**
 * Traduce errores del backend (Axios / fetch) a mensajes legibles para el usuario.
 * Cubre los códigos definidos en error-codes.ts del backend y los mensajes
 * de ValidationPipe de NestJS.
 */

// ── Mapa de códigos de error del backend → mensaje en español ────────────────
const ERROR_CODE_MAP: Record<string, string> = {
  // Auth
  USER_ALREADY_EXISTS:    "Ya existe un usuario con ese número de cédula.",
  USER_NOT_FOUND:         "Usuario no encontrado.",
  INVALID_CREDENTIALS:    "Cédula o contraseña incorrectas.",
  EXTERNAL_AUTH_ERROR:    "Error al autenticarse. Verifica tus credenciales.",
  FORBIDDEN:              "No tienes permiso para realizar esta acción.",
  ROLE_NOT_FOUND:         "Rol no reconocido por el sistema.",
  KEYCLOAK_ERROR:         "Error en el servicio de autenticación. Intenta más tarde.",
  INTERNAL_ERROR:         "Error interno del servidor. Intenta nuevamente.",
  CONFLICT:               "Existe un conflicto con los datos enviados.",
  NOT_FOUND:              "El recurso solicitado no fue encontrado.",

  // Citas
  APPOINTMENT_ALREADY_EXIST:  "Ya existe una cita en ese horario.",
  APPOINTMENT_NOT_FOUND:      "La cita no existe o no te pertenece.",
  SCHEDULE_NOT_FOUND:         "Horario no encontrado para ese médico.",
  SCHEDULE_NOT_AVAILABLE:     "El horario seleccionado no está disponible.",
  DOCTOR_NOT_FOUND:           "El médico indicado no está registrado en el sistema.",
  INVALID_INPUT:              "Datos de entrada inválidos. Revisa los campos.",
  INVALID_INTERVAL:           "El horario no es válido. Verifica el intervalo de tiempo.",
  INVALID_DATE:               "La fecha seleccionada no es válida. Solo se puede reservar hasta 12 días en el futuro.",
  UNAVAILABILITY_ALREADY_EXIST: "Ya tienes una indisponibilidad registrada en ese rango de fechas.",
  UNAVAILABILITY_DOCTOR:      "El médico no está disponible en la fecha seleccionada.",
};

// ── Patrones de mensajes de texto del backend (ValidationPipe, etc.) ─────────
const MESSAGE_PATTERNS: Array<{ pattern: RegExp; message: string }> = [
  { pattern: /ya existe una cita en la fecha/i,           message: "Ya existe una cita en ese horario." },
  { pattern: /horario.*no.*disponible/i,                  message: "El horario seleccionado no está disponible para ese médico." },
  { pattern: /intervalo invalido/i,                       message: "El horario no coincide con el intervalo del médico." },
  { pattern: /no corresponde a un paciente/i,             message: "El ID ingresado no corresponde a un paciente registrado." },
  { pattern: /medico.*no encontrado/i,                    message: "El médico indicado no está registrado." },
  { pattern: /fecha.*ya paso/i,                           message: "La fecha seleccionada ya pasó. Elige una fecha futura." },
  { pattern: /fecha.*muy lejana/i,                        message: "Solo puedes reservar citas con máximo 12 días de anticipación." },
  { pattern: /cita a editar no existe/i,                  message: "La cita que intentas reagendar no existe o no te pertenece." },
  { pattern: /doctor tiene una indisposicion/i,           message: "El médico tiene una indisponibilidad en esa fecha." },
  { pattern: /ya tiene registrada una indisponibilidad/i, message: "Ya tienes una indisponibilidad en ese rango de fechas." },
  { pattern: /schedules overlap/i,                        message: "Los horarios configurados se solapan entre sí." },
  { pattern: /ya tiene un horario asignado/i,             message: "Ya tienes un horario asignado en esa franja. Elige otra." },
  { pattern: /invalid.*credentials/i,                     message: "Cédula o contraseña incorrectas." },
  { pattern: /invalid refresh token/i,                    message: "La sesión expiró. Por favor inicia sesión nuevamente." },
  { pattern: /missing keycloak/i,                         message: "Error de configuración del servidor. Contacta al administrador." },
  // ValidationPipe — class-validator
  { pattern: /must be a string/i,                         message: "Uno de los campos tiene un formato incorrecto." },
  { pattern: /must be an integer/i,                       message: "El valor debe ser un número entero." },
  { pattern: /must not be empty/i,                        message: "Todos los campos obligatorios deben estar completos." },
  { pattern: /invalid iso.*date/i,                        message: "El formato de fecha es inválido." },
  { pattern: /formato de fecha debe estar en utc/i,       message: "La fecha debe estar en formato UTC (terminar en Z)." },
];

// ── Función principal ─────────────────────────────────────────────────────────
export function getApiErrorMessage(error: unknown): string {
  // 1. Error de red / sin conexión
  if (isNetworkError(error)) {
    return "No se pudo conectar con el servidor. Verifica tu conexión.";
  }

  const data = extractResponseData(error);
  if (!data) return "Ocurrió un error inesperado. Intenta nuevamente.";

  // 2. Código de error estructurado del backend
  if (data.code && ERROR_CODE_MAP[data.code]) {
    return ERROR_CODE_MAP[data.code];
  }

  // 3. Mensaje de texto — busca patrones conocidos
  const rawMessage: string =
    (Array.isArray(data.message) ? data.message[0] : data.message) ?? "";

  for (const { pattern, message } of MESSAGE_PATTERNS) {
    if (pattern.test(rawMessage)) return message;
  }

  // 4. Fallback por código HTTP
  const status = extractStatus(error);
  if (status === 401) return "No tienes autorización. Inicia sesión nuevamente.";
  if (status === 403) return "No tienes permiso para realizar esta acción.";
  if (status === 404) return "El recurso solicitado no fue encontrado.";
  if (status === 409) return "Existe un conflicto con los datos. Verifica la información.";
  if (status === 422) return "Los datos enviados no son válidos. Revisa los campos.";
  if (status && status >= 500) return "Error en el servidor. Intenta más tarde.";

  // 5. Último recurso — devuelve el mensaje crudo si es legible
  if (rawMessage && rawMessage.length < 200) return rawMessage;

  return "Ocurrió un error inesperado. Intenta nuevamente.";
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function isNetworkError(error: unknown): boolean {
  return (
    error instanceof TypeError ||
    (isAxiosLike(error) && (error as any).code === "ERR_NETWORK")
  );
}

function isAxiosLike(error: unknown): boolean {
  return typeof error === "object" && error !== null && "response" in error;
}

function extractResponseData(error: unknown): any {
  if (isAxiosLike(error)) return (error as any).response?.data ?? null;
  return null;
}

function extractStatus(error: unknown): number | null {
  if (isAxiosLike(error)) return (error as any).response?.status ?? null;
  return null;
}
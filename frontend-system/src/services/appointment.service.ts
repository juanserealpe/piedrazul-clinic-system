import api from "../lib/axios";
import {
  AppointmentNotification,
  AppointmentNotificationResponse,
} from "../types/appointment-notification";

export const createAppointment = async (payload: {
  doctorId: string;
  patientId: string;
  date: string;
}) => {
  const normalizedDate = payload.date.endsWith("Z")
    ? payload.date
    : new Date(payload.date).toISOString();

  const response = await api.post("/appointments", {
    ...payload,
    date: normalizedDate,
  });
  return response.data;
};

export const getAppointments = async (date: string, doctorId?: string) => {
  const response = await api.get("/appointments/by-doctor", {
    params: { date, doctorId },
  });
  return response.data;
};

export const exportAppointmentsCsv = async (
  date: string,
  doctorId?: string
) => {
  const response = await api.get("/appointments/export/csv", {
    params: { date, doctorId },
    responseType: "blob",
  });
  return response.data;
};

export const reScheduleAppointment = async (payload: {
  doctorId?: string;
  appointmentId: string;
  newDate: string;
}) => {
  const response = await api.patch("/appointments/reschedule", payload);
  return response.data;
};

/**
 * Obtiene TODAS las citas pendientes de reagendar de un medico,
 * desde hoy en adelante, sin necesidad de especificar un rango de fechas.
 * Usa el endpoint /pending-reschedule/all/:id del backend.
 *
 * Se usa cuando el medico autenticado quiere ver sus propias citas pendientes.
 */
export const getAllPendingsByDoctor = async (
  doctorId: string
): Promise<AppointmentNotificationResponse> => {
  const response = await api.get(
    `/appointments/pending-reschedule/all/${doctorId}`
  );
  return response.data;
};

/**
 * Obtiene citas pendientes de reagendar en un rango de fechas.
 * Se usa cuando el agendador necesita ver citas de un medico especifico
 * dentro de una ventana de tiempo.
 *
 * Si no se pasa doctorId, el backend usa el ID del usuario autenticado (JWT).
 */
export const getPendingAppointmentsToReschedule = async (
  startDate: string,
  endDate: string,
  doctorId?: string
): Promise<AppointmentNotificationResponse> => {
  const response = await api.get("/appointments/pending-reschedule/range", {
    params: {
      startDate,
      endDate,
      ...(doctorId ? { doctorId } : {}),
    },
  });
  return response.data;
};
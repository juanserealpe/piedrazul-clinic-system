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

export const exportAppointmentsCsv = async (date: string, doctorId?: string) => {
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
 * Obtiene citas pendientes de reagendar en un rango de fechas.
 *
 * - Si se pasa doctorId: el backend filtra por ese medico (uso del agendador).
 * - Si NO se pasa doctorId: el backend usa el ID del usuario autenticado del JWT
 *   (uso del medico, que solo ve sus propias citas).
 */
export const getPendingAppointmentsToReschedule = async (
  startDate: string,
  endDate: string,
  doctorId?: string
): Promise<AppointmentNotificationResponse> => {

  console.log("=================================");
  console.log("Consultando citas pendientes");
  console.log("Doctor ID:", doctorId);
  console.log("Fecha inicio:", startDate);
  console.log("Fecha fin:", endDate);

  const response = await api.get(
    "/appointments/pending-reschedule/range",
    {
      params: {
        startDate,
        endDate,
        ...(doctorId ? { doctorId } : {}),
      },
    }
  );

  console.log("Respuesta backend:");
  console.log(response.data);

  return response.data;
};
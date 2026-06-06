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
  // Garantizar UTC
  const normalizedDate = payload.date.endsWith("Z")
    ? payload.date
    : new Date(payload.date).toISOString();

  const normalizedPayload = { ...payload, date: normalizedDate };
  const response = await api.post("/appointments", normalizedPayload);
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

export const getPendingAppointmentsToReschedule = async (
  startDate: string,
  endDate: string
): Promise<AppointmentNotificationResponse> => {
  const response = await api.get("/appointments/pending-reschedule/range", {
    params: { startDate, endDate },
  });
  return response.data;
};
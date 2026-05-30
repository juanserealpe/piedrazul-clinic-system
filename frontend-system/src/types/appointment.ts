import api from "../lib/axios";

export interface AppointmentItem {
  appointmentId: string | null;
  date: string;
  patientId: string;
}

export interface AppointmentsResponse {
  doctorId: string;
  date: string;
  appointments: AppointmentItem[];
  count: number;
}

export interface ReScheduleAppointmentRequest {
  doctorId?: string;
  appointmentId: string;
  newDate: string;
}

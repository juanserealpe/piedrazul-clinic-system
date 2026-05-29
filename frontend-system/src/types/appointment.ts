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
export interface AppointmentNotification {
  appointmentId: string;
  date: string;
  patientId: string;
}

export interface AppointmentNotificationResponse {
  doctorId: string;
  date: string;
  appointments: AppointmentNotification[];
  count: number;
}
import { AppointmentItemDto } from "./AppointmentItemDto";

export interface GetAppointmentsByDoctorAndDateResult {
  appointments: AppointmentItemDto[];
  total: number;
  date: Date;
  doctorId: string;
}
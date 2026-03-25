import { Status } from "src/modules/appointments/domain/entities/Status";

export interface AppointmentItemDto {
  id: string;
  patientId: string;
  doctorId: string;
  date: Date;
  observations: string;
  status: Status;
}
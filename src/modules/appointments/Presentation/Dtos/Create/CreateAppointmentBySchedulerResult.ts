import { Status } from "src/modules/appointments/domain/entities/Status";


export interface CreateAppointmentBySchedulerResult {
  appointmentId: string;
  patientId: string;
  doctorId: string;
  confirmedDate: Date;
  status: Status;
}
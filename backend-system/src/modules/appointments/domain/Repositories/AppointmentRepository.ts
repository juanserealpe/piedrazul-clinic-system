import { Appointment } from "../entities/Appointment.entity";
import { AppointmentSchedule } from "../entities/AppointmentSchedule";
import { Status } from "../entities/Status";

export interface AppointmentRepository{
    //reschedule
    findByAppointmentIdAndDoctorId(pDoctorId: string,pAppointmentId: string,)
      : Promise<Appointment | null>;
    //Doctor
    findByDoctor(id: string): Promise<Appointment[] | null>;
    findByDoctorAndStatus(id: string, status: Status): Promise<Appointment[] | null>;
    findByDoctorStatusAndDateRange(  doctorId: string, status: Status, start: string, end: string)
    : Promise<Appointment[]>
    //Cruds
    save(appointment: Appointment): Promise<Appointment>;

    update(pAppointment: Appointment, pNewSchedule: AppointmentSchedule,): Promise<Appointment>;
    existsByDoctorAndDate(pDoctorId: string,pDate: Date,): Promise<boolean>;
}
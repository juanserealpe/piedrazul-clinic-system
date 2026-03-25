import { Appointment } from "../entities/Appointment.entity";
import { Status } from "../entities/Status";

export interface AppointmentRepository{
    //Doctor
    findByDoctor(id: string): Promise<Appointment[] | null>;
    findByDoctorAndStatus(id: string, status: Status): Promise<Appointment[] | null>;
    findByDoctorStatusAndDateRange(  doctorId: string, status: Status, start: Date, end: Date)
    : Promise<Appointment[]>
    //Cruds
    save(appointment: Appointment): Promise<Appointment>;
}
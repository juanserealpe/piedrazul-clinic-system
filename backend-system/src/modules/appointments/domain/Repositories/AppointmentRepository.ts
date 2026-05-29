import { Appointment } from "../entities/Appointment.entity";
import { AppointmentSchedule } from "../entities/AppointmentSchedule";
import { Status } from "../entities/Status";

export interface AppointmentRepository{
    //reschedule
    findByAppointmentIdAndDoctorId(pDoctorId: string,pAppointmentId: string,)
      : Promise<Appointment | null>;
    //Doctor
    findByDoctor(id: string): Promise<Appointment[] | null>;

    findByAppointmentIdDoctorAndStatus(
      pAppointmentId: string,
      pDoctorId: string,
      pStatus: Status[])
      :Promise<Appointment | null>

    findByDoctorStatusAndDateRange(doctorId: string, status: Status[], start: Date, end: Date)
    : Promise<Appointment[]>;

    findByDoctorStatusAndDate(doctorId: string, status: Status[], date: Date)
    : Promise<Appointment | null>;
    
    //Cruds
    save(appointment: Appointment): Promise<Appointment>;
    update(pAppointment: Appointment, pNewSchedule: AppointmentSchedule,): Promise<Appointment>;
    existsByDoctorAndDate(pDoctorId: string,pDate: Date,): Promise<boolean>;

    //Update
    updateStatusByDoctorIdAndDateRange(
      pDoctorId: string,
      pStartDate: Date,
      pEndDate: Date,
      pStatus: Status,
    ): Promise<number>;

    findUpcomingPendingsToRescheduleByDoctorId(
    pDoctorId: string,
    pCurrentDate: Date,
): Promise<Appointment[]>;
}
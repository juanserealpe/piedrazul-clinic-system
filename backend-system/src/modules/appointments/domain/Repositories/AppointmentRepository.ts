import { Appointment } from "../entities/Appointment.entity";
import { AppointmentSchedule } from "../entities/AppointmentSchedule";
import { Status } from "../entities/Status";

export interface AppointmentRepository {
    // Cancel / generic lookup
    findById(appointmentId: string): Promise<Appointment | null>;

    // Reschedule
    findByAppointmentIdAndDoctorId(
        pDoctorId: string,
        pAppointmentId: string,
    ): Promise<Appointment | null>;

    // Doctor
    findByAppointmentIdDoctorAndStatus(
        pAppointmentId: string,
        pDoctorId: string,
        pStatus: Status[],
    ): Promise<Appointment | null>;

    findByDoctorStatusAndDateRange(
        doctorId: string,
        status: Status[],
        start: Date,
        end: Date,
    ): Promise<Appointment[]>;

    findByDoctorStatusAndDate(
        doctorId: string,
        status: Status[],
        date: Date,
    ): Promise<Appointment | null>;

    // Patient
    findByPatientId(patientId: string): Promise<Appointment[]>;

    // CRUD
    save(appointment: Appointment): Promise<Appointment>;
    update(
        pAppointment: Appointment,
        pNewSchedule: AppointmentSchedule,
    ): Promise<Appointment>;

    // Bulk updates
    updateStatusByDoctorIdAndDateRange(
        pDoctorId: string,
        pStartDate: Date,
        pEndDate: Date,
        pStatus: Status,
    ): Promise<number>;

    updateStatusByIds(
        pIds: string[],
        pStatus: Status,
    ): Promise<number>;

    findUpcomingPendingsToRescheduleByDoctorId(
        pDoctorId: string,
        pCurrentDate: Date,
    ): Promise<Appointment[]>;
}
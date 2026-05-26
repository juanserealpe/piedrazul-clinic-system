import { AppointmentSchedule } from "../entities/AppointmentSchedule";

export interface AppointmentScheduleRepository{
    save(pNewAppointmentSchedule: AppointmentSchedule): Promise<AppointmentSchedule>;
}
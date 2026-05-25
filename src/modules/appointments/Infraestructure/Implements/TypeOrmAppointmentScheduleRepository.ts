import { AppointmentSchedule } from "../../domain/entities/AppointmentSchedule";
import { AppointmentScheduleRepository } from "../../domain/Repositories/AppointmentScheduleRepository";

export class TypeOrmAppointmentScheduleRepository implements AppointmentScheduleRepository{
    constructor(
        private readonly repo: AppointmentScheduleRepository,
    ){}

    async save(pNewAppointmentSchedule: AppointmentSchedule): Promise<AppointmentSchedule>{
        return await this.repo.save(pNewAppointmentSchedule);        
    }
}
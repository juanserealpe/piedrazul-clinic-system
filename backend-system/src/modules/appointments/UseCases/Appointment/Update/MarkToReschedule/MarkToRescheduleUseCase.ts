import { AppointmentRepository } from "src/modules/appointments/domain/Repositories/AppointmentRepository";
import { MarkToRescheduleInput } from "./MarkToRescheduleInput";
import { Status } from "src/modules/appointments/domain/entities/Status";
import { AppError } from "src/common/errors/app-error.factory";

export class MarkToRescheduleUseCase{
    constructor(
        private readonly appointmentRepository: AppointmentRepository,
    ){}

    async execute(pInput: MarkToRescheduleInput): Promise<boolean> {
        const vAppointment = await this.appointmentRepository.findById(pInput.appointmentId);
        if(!vAppointment)
            throw AppError.appointmentNotFound();
        if(vAppointment.status === Status.PENDING_RESCHEDULE)
            throw AppError.alreadyMarkToReschedule(pInput.appointmentId);
        const vCountUpdate = await this.appointmentRepository.updateStatusByIds(
            [pInput.appointmentId],
            Status.PENDING_RESCHEDULE
        );

        return vCountUpdate > 0;
    }
}
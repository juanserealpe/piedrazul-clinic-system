import { AppointmentRepository } from "src/modules/appointments/domain/Repositories/AppointmentRepository";
import { UpdateAppointmentInput } from "./UpdateAppointmentInput";
import { UpdateAppointmentOutput } from "./UpdateAppointmentOutput";
import { AppError } from "src/common/errors/app-error.factory";
import { AppointmentDtoMapper } from "../../Mappers/AppointmentDtoMapper";
import { getDayOfWeek } from "src/modules/appointments/Utilities";
import { ScheduleRepository } from "src/modules/appointments/domain/Repositories/ScheduleRepository";

export class UpdateAppointment{
     constructor(
        private readonly appointmentRepository:
            AppointmentRepository,

        private readonly scheduleRepository:
            ScheduleRepository,
    ) {}

    async execute(pReschedulerId: string, pInput: UpdateAppointmentInput,
    ): Promise<UpdateAppointmentOutput> {

        const vAppointment =
            await this.appointmentRepository
                .findByAppointmentIdAndDoctorId(
                    pReschedulerId,
                    pInput.appointmentId,
                );

        if (!vAppointment) {
            throw AppError.appointmentNotFound();
        }

        const vCurrentDate =
            vAppointment.getCurrentDate();

        // Prevent rescheduling to same date
        if (vCurrentDate.getTime() === pInput.newDate.getTime()
        ) {
            throw AppError.appointmentAlreadyExist(pInput.newDate.toISOString());
        }

        // Validate schedule slot
        const vDay =
            getDayOfWeek(
                pInput.newDate,
            );

        const vSchedules =
            await this.scheduleRepository
                .findByDoctorAndDay(
                    vAppointment.doctorId,
                    vDay,
                );

        const vValidSlot =
            vSchedules.some(
                vSchedule =>
                    vSchedule.isActive &&
                    vSchedule.containsSlot(
                        pInput.newDate,
                    ),
            );

        if (!vValidSlot) {
            throw AppError.invalidAppointmentDate(pInput.newDate.toISOString());
        }

        // Validate occupied slot
        const vAlreadyTaken =
            await this.appointmentRepository
                .existsByDoctorAndDate(
                    vAppointment.doctorId,
                    pInput.newDate,
                );

        if (vAlreadyTaken) {
            throw AppError.appointmentAlreadyExist(pInput.newDate.toISOString());
        }

        // Create history event
        const vNewSchedule =
            AppointmentDtoMapper
                .toUpdateEntity(
                    pReschedulerId,
                    pInput,
                );

        // Update aggregate
        vAppointment.reschedule(
            vNewSchedule,
        );

        // Persist changes
        const vUpdatedAppointment =
            await this.appointmentRepository
                .update(
                    vAppointment,
                    vNewSchedule,
                );

        return AppointmentDtoMapper
            .toUpdateOutput(
                vUpdatedAppointment,
            );
    }
}
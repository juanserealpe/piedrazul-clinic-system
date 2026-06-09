import { AppointmentRepository } from "src/modules/appointments/domain/Repositories/AppointmentRepository";
import { UpdateAppointmentInput } from "./UpdateAppointmentInput";
import { UpdateAppointmentOutput } from "./UpdateAppointmentOutput";
import { AppError } from "src/common/errors/app-error.factory";
import { AppointmentDtoMapper } from "../../Mappers/AppointmentDtoMapper";
import { getDayOfWeek } from "src/modules/appointments/Utilities";
import { ScheduleRepository } from "src/modules/appointments/domain/Repositories/ScheduleRepository";
import { DoctorUnavailabilityRepository } from "src/modules/appointments/domain/Repositories/DoctorUnavailabilityRepository";
import { Status } from "src/modules/appointments/domain/entities/Status";

export class UpdateAppointment{
     constructor(
        private readonly appointmentRepository:
            AppointmentRepository,
        private readonly scheduleRepository:
            ScheduleRepository,
        private readonly unavailabilityRepo:
            DoctorUnavailabilityRepository,
    ) {}

    async execute(pInput: UpdateAppointmentInput,
    ): Promise<UpdateAppointmentOutput> {

        const vAppointment =
            await this.appointmentRepository
                .findByAppointmentIdDoctorAndStatus(
                    pInput.appointmentId,
                    pInput.doctorId,
                    [Status.PENDING_RESCHEDULE],
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

        /*
        */
        if(await this.unavailabilityRepo.findActiveByDoctorIdAndDate(pInput.doctorId,pInput.newDate))
            throw AppError.unavailabilityDoctor(pInput.newDate.toDateString());

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
                .findByDoctorStatusAndDate(
                    vAppointment.doctorId,
                    [Status.SCHEDULED, Status.RESCHEDULED],
                    pInput.newDate,
                );

        if (vAlreadyTaken) {
            throw AppError.appointmentAlreadyExist(pInput.newDate.toISOString());
        }
        // Create history event
        const vNewSchedule =
            AppointmentDtoMapper
                .toUpdateEntity(
                    pInput.reschedulerId,
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
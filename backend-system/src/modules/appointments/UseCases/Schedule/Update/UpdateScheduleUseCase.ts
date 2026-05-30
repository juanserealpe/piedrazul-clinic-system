import { UpdateScheduleInput } from "./UpdateScheduleInput";
import { UpdateScheduleOutput } from "./UpdateScheduleOutput";
import { ScheduleRepository } from "src/modules/appointments/domain/Repositories/ScheduleRepository";
import { AppError } from "src/common/errors/app-error.factory";
import { ScheduleDtoMapper } from "../../Mappers/ScheduleDtoMapper";
import { AppointmentRepository } from "src/modules/appointments/domain/Repositories/AppointmentRepository";
import { Status } from "src/modules/appointments/domain/entities/Status";
import { Schedule } from "src/modules/appointments/domain/entities/Schedule.entity";


export class UpdateScheduleUseCase {

    constructor(
        private readonly scheduleRepository: ScheduleRepository,
        private readonly appointmentRepository: AppointmentRepository,
  ) {}

    async execute(
        input: UpdateScheduleInput
    ): Promise<UpdateScheduleOutput> {

        const vSchedule =
            await this.scheduleRepository.findByIdAndDoctorId(
                input.id,
                input.doctorId,
            );

        if (!vSchedule) {
            throw AppError.scheduleNotFound("");
        }

        if(this.isSameSchedule(vSchedule,input)){
            throw AppError.scheduleAlreadyExist(
                vSchedule.day + " "+
                vSchedule.startHour + " "+
                vSchedule.endHour
            )
        }

        const vExistingSchedules =
            await this.scheduleRepository.findByDoctorIdAndRange(
                input.doctorId,
                input.day,
                input.startHour,
                input.endHour,
            );

        const vHasConflicts = vExistingSchedules.some(
            s => s.id !== input.id
        );

        if (vHasConflicts) {
            throw AppError.scheduleAlreadyExist(input.day.toString(),);
        }

        const vUpdatedSchedule =
            ScheduleDtoMapper.toUpdateEntity(input);

        const vSavedSchedule =
            await this.scheduleRepository.update(vUpdatedSchedule);

        const vToday = new Date();
        const vMaxDate = new Date();
        vMaxDate.setUTCDate(vToday.getUTCDate() + 12);

        const vAppointments =
            await this.appointmentRepository
                .findByDoctorStatusAndDateRange(
                    input.doctorId,
                    [
                        Status.SCHEDULED,
                        Status.RESCHEDULED,
                    ],
                    vToday,
                    vMaxDate,
                );

        const vConflictedAppointments = vAppointments.filter(
            appointment =>
                !vSavedSchedule.containsSlot(
                    appointment.date,
                ),
        );

        const vConflictedIds = vConflictedAppointments.map(
            appointment => appointment.id!,
        );

        if (vConflictedIds.length > 0) {
            await this.appointmentRepository.updateStatusByIds(
                vConflictedIds,
                Status.PENDING_RESCHEDULE,
            );
        }

        return ScheduleDtoMapper.toUpdateOutput(
            vConflictedIds.length,
            vSavedSchedule,
        );
    }

    private isSameSchedule(oldSchedule: Schedule, newSchedule: UpdateScheduleInput)
        : boolean{
        return oldSchedule.day === newSchedule.day &&
            oldSchedule.startHour === newSchedule.startHour &&
            oldSchedule.endHour === newSchedule.endHour &&
            oldSchedule.interval === newSchedule.interval;
    }
}
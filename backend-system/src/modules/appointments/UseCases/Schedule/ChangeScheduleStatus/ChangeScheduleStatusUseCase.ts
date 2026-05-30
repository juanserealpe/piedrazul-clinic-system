import { ScheduleRepository } from "src/modules/appointments/domain/Repositories/ScheduleRepository";
import { ChangeScheduleStatusInput } from "./ChangeScheduleStatusInput";
import { AppError } from "src/common/errors/app-error.factory";
import { Schedule } from "src/modules/appointments/domain/entities/Schedule.entity";
import { AppointmentRepository } from "src/modules/appointments/domain/Repositories/AppointmentRepository";
import { Status } from "src/modules/appointments/domain/entities/Status";
import { ChangeScheduleStatusOutput } from "./ChangeScheduleStatusOutput";
import { ScheduleDtoMapper } from "../../Mappers/ScheduleDtoMapper";
import { getNextDateForDay } from "src/modules/appointments/Utilities";

export class ChangeScheduleStatusUseCase{

    constructor(
        private readonly scheduleRepository: ScheduleRepository,
        private readonly appointmentRepository: AppointmentRepository,
    ) {}

    async activate(
        input: ChangeScheduleStatusInput,
    ): Promise<ChangeScheduleStatusOutput> {
        const vUpdatedSchedule = await this.changeStatus(input, true);
        return ScheduleDtoMapper.toChangeStatusOutput(0,vUpdatedSchedule);
    }

    async desactivate(
        input: ChangeScheduleStatusInput,
    ): Promise<ChangeScheduleStatusOutput> {

        const vUpdatedSchedule =  
            await this.changeStatus(input, false);

        const vAppointmentsPendings = 
            await this.markAppointmentsForReschedule(vUpdatedSchedule);
            
        return ScheduleDtoMapper.toChangeStatusOutput(vAppointmentsPendings,vUpdatedSchedule);
    }

    private async changeStatus(
        input: ChangeScheduleStatusInput,
        pNewStatus: boolean,
    ): Promise<Schedule> {

        const vSchedule =
            await this.scheduleRepository
                .findByIdAndDoctorId(
                    input.scheduleId,
                    input.doctorId,
                );

        if (!vSchedule) {
            throw AppError.scheduleNotFound(
                input.scheduleId,
            );
        }

        if (vSchedule.isActive === pNewStatus) {
            return vSchedule;
        }
        vSchedule.isActive = pNewStatus;

        await this.scheduleRepository.update(
            vSchedule,
        );
        return vSchedule;
    }

    private async markAppointmentsForReschedule(
        pSchedule: Schedule,
    ): Promise<number> {

        const vNextDate = getNextDateForDay(pSchedule.day);

        const vFollowingDate = new Date(vNextDate);
        vFollowingDate.setUTCDate(vFollowingDate.getUTCDate() + 7,);

        const vFirstStart = new Date(vNextDate);
        vFirstStart.setUTCHours(
            pSchedule.startHour,0,0,0,
        );

        const vFirstEnd = new Date(vNextDate);
        vFirstEnd.setUTCHours(
            pSchedule.endHour,0,0,0,
        );

        const vSecondStart = new Date(vFollowingDate);
        vSecondStart.setUTCHours(
            pSchedule.startHour,0,0,0,
        );

        const vSecondEnd = new Date(vFollowingDate);
        vSecondEnd.setUTCHours(
            pSchedule.endHour,0,0,0,
        );

        const vWeekOneAppointments =
            await this.appointmentRepository.findByDoctorStatusAndDateRange(
                pSchedule.doctorId,
                [Status.SCHEDULED, Status.RESCHEDULED],
                vFirstStart,
                vFirstEnd,
            );

        const vWeekTwoAppointments =
            await this.appointmentRepository.findByDoctorStatusAndDateRange(
                pSchedule.doctorId,
                [Status.SCHEDULED, Status.RESCHEDULED],
                vSecondStart,
                vSecondEnd,
            );

        const vAppointmentsIds = [...vWeekOneAppointments,...vWeekTwoAppointments,]
        .map(vAppointment => vAppointment.id)
        .filter(
            (vId): vId is string =>vId !== null,);

        if (vAppointmentsIds.length === 0) {
            return 0;
        }

        return this.appointmentRepository.updateStatusByIds(
            vAppointmentsIds,
            Status.PENDING_RESCHEDULE,
        );
    }
}
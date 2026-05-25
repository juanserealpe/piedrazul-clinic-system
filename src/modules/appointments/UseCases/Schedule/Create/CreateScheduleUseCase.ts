import { ScheduleRepository } from "src/modules/appointments/domain/Repositories/ScheduleRepository";
import { CreateScheduleInput } from "./CreateScheduleInput";
import { CreateScheduleOutput } from "./CreateScheduleOutput";
import { ScheduleDtoMapper } from "../../Mappers/ScheduleDtoMapper";
import { AppError } from "src/common/errors/app-error.factory";
import { getDayInSpanish } from "src/modules/appointments/domain/entities/DaysOfWeek";
import { IAuthService } from "src/modules/auth/auth.interface";

export class CreateScheduleUseCase{
    constructor(
        private readonly scheduleRepository: ScheduleRepository,
        private readonly authRepo: IAuthService
  ) {}

    async execute(
        pInput: CreateScheduleInput
    ): Promise<CreateScheduleOutput> {

        if(!this.authRepo.isUserInRole(pInput.doctorId,"DOCTOR"))
            throw AppError.doctorNotFound(pInput.doctorId);

        const vSchedule = 
        ScheduleDtoMapper.toEntity(
            crypto.randomUUID(),
            pInput
        );

        const vExisting =
        await this.scheduleRepository.findByDoctorAndDay(
            pInput.doctorId,
            pInput.day
        );

        const vConflict = vExisting.find(s =>
        s.overlaps(vSchedule)
        );

        if (vConflict) {
        throw AppError.scheduleAlreadyExist(
          `${getDayInSpanish(vConflict.day)}: ${vConflict.startHour}-${vConflict.endHour}`)
          }

        const vSaved =
        await this.scheduleRepository.save(vSchedule);

        return ScheduleDtoMapper.toOutput(vSaved);
    }
}
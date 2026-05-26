import { ScheduleRepository } from "src/modules/appointments/domain/Repositories/ScheduleRepository";
import { ScheduleDtoMapper } from "../../Mappers/ScheduleDtoMapper";
import { AppError } from "src/common/errors/app-error.factory";
import { getDayInSpanish } from "src/modules/appointments/domain/entities/DaysOfWeek";
import { IAuthService } from "src/modules/auth/auth.interface";
import { Console } from "console";
import { GetScheduleOutput } from "./GetScheduleOutput";

export class GetScheduleUseCase{
    constructor(
        private readonly scheduleRepository: ScheduleRepository,
  ) {}

    async execute(
  idDoctor: string
): Promise<GetScheduleOutput[]> {

  const result =
    await this.scheduleRepository
      .getSchedulesPredefinedByIdDoctor(
        idDoctor
      );

  if (result.length === 0) {

    throw AppError.appointmentAlreadyExist(
      `El doctor aún no tiene horarios predefinidos.`
    );
  }

  return result.map(
    ScheduleDtoMapper.toOutput
  );
}
}
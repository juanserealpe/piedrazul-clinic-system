import { ScheduleRepository } from "src/modules/appointments/domain/Repositories/ScheduleRepository";
import { CreateScheduleInput } from "./CreateScheduleInput";
import { CreateScheduleOutput } from "./CreateScheduleOutput";
import { ScheduleDtoMapper } from "../../Mappers/ScheduleDtoMapper";
import { AppError } from "src/common/errors/app-error.factory";
import { getDayInSpanish } from "src/modules/appointments/domain/entities/DaysOfWeek";
export class CreateManySchedulesUseCase {

  constructor(
    private readonly scheduleRepository: ScheduleRepository
  ) {}

  async execute(
    pInputs: CreateScheduleInput[]
  ): Promise<CreateScheduleOutput[]> {

    const vSchedules = pInputs.map(input =>
      ScheduleDtoMapper.toCreateEntity(crypto.randomUUID(), input)
    );

    // 2. Validar solapamientos ENTRE los nuevos
    for (let i = 0; i < vSchedules.length; i++) {
      for (let j = i + 1; j < vSchedules.length; j++) {
        if (vSchedules[i].overlaps(vSchedules[j])) {
          throw AppError.appointmentAlreadyExist("Schedules overlap in batch");
        }
      }
    }

    // 3. Validar contra BD
    for (const schedule of vSchedules) {

      const vExisting =
        await this.scheduleRepository.findByDoctorAndDay(
          schedule.doctorId,
          schedule.day
        );

      const vConflict = vExisting.find(s =>
        s.overlaps(schedule)
      );

      if (vConflict) {
        throw AppError.appointmentAlreadyExist(
          `${getDayInSpanish(vConflict.day)}: ${vConflict.startHour}-${vConflict.endHour}`
        );
      }
    }

  const vSaved = await Promise.all(
    vSchedules.map(s =>
      this.scheduleRepository.save(s)
    )
  );
    return vSaved.map(ScheduleDtoMapper.toCreateOutput);
  }
}
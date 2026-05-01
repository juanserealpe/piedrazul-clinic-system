import { ScheduleRepository } from "src/modules/appointments/domain/Repositories/ScheduleRepository";
import { CreateScheduleInput } from "./CreateScheduleInput";
import { CreateScheduleOutput } from "./CreateScheduleOutput";
import { ScheduleDtoMapper } from "../../Mappers/ScheduleDtoMapper";
import { BusinessException } from "src/modules/appointments/BusinessException";

export class CreateManySchedulesUseCase {

  constructor(
    private readonly scheduleRepository: ScheduleRepository
  ) {}

  async execute(
    pInputs: CreateScheduleInput[]
  ): Promise<CreateScheduleOutput[]> {

    const vOutputs: CreateScheduleOutput[] = [];

    for (const input of pInputs) {

      const vSchedule =
        ScheduleDtoMapper.toEntity(
          crypto.randomUUID(),
          input
        );

      const vExisting =
        await this.scheduleRepository.findByDoctorAndDay(
          input.doctorId,
          input.day
        );

      const vConflict = vExisting.find(s =>
        s.overlaps(vSchedule)
      );

      if (vConflict) {
        throw new BusinessException("Schedule overlaps with an existing one");
      }

      const vSaved =
        await this.scheduleRepository.save(vSchedule);

      vOutputs.push(
        ScheduleDtoMapper.toOutput(vSaved)
      );
    }

    return vOutputs;
  }
}
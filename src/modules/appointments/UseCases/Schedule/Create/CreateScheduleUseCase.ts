import { ScheduleRepository } from "src/modules/appointments/domain/Repositories/ScheduleRepository";
import { CreateScheduleInput } from "./CreateScheduleInput";
import { CreateScheduleOutput } from "./CreateScheduleOutput";
import { ScheduleDtoMapper } from "../../Mappers/ScheduleDtoMapper";
import { BusinessException } from "src/modules/appointments/BusinessException";

export class CreateScheduleUseCase{
    constructor(
        private readonly scheduleRepository: ScheduleRepository
  ) {}

    async execute(
        pInput: CreateScheduleInput
    ): Promise<CreateScheduleOutput> {

        //PENDIENTE CONSULTAR EN MODULO SI EXISTE DOCTOR PARA CREAR EL HORARIO CON SU ID
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
        throw new BusinessException("Schedule overlaps with an existing one");
        }

        const vSaved =
        await this.scheduleRepository.save(vSchedule);

        return ScheduleDtoMapper.toOutput(vSaved);
    }
}
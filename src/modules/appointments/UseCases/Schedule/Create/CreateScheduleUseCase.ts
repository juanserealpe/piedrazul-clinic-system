import { ScheduleRepository } from "src/modules/appointments/domain/Repositories/ScheduleRepository";
import { CreateScheduleInput } from "./CreateScheduleInput";
import { CreateScheduleOutput } from "./CreateScheduleOutput";
import { ScheduleDtoMapper } from "../../Mappers/ScheduleDtoMapper";
import { AppError } from "src/common/errors/app-error.factory";
import { getDayInSpanish } from "src/modules/appointments/domain/entities/DaysOfWeek";
import { IKeycloakService } from "src/common/keycloak/keycloak.interface";

export class CreateScheduleUseCase{
    constructor(
        private readonly scheduleRepository: ScheduleRepository,
        private readonly keyCloackService: IKeycloakService
  ) {}

    async execute(
        pInput: CreateScheduleInput
    ): Promise<CreateScheduleOutput> {

        /*
        //PENDIENTE CONSULTAR EN MODULO SI EXISTE DOCTOR PARA CREAR EL HORARIO CON SU ID
        const vToken = await this.keyCloackService.getToken()
        const vExistDoctor = await this.keyCloackService.isUserInRole(pInput.doctorId,"DOCTOR",vToken);
        if(!vExistDoctor)
            throw AppError.doctorNotFound(pInput.doctorId);
        //
        */ 
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
        throw AppError.appointmentAlreadyExist(
          `${getDayInSpanish(vConflict.day)}: ${vConflict.startHour}-${vConflict.endHour}`)
          }

        const vSaved =
        await this.scheduleRepository.save(vSchedule);

        return ScheduleDtoMapper.toOutput(vSaved);
    }
}
import { DoctorUnavailabilityRepository } from "src/modules/appointments/domain/Repositories/DoctorUnavailabilityRepository";
import { CreateDoctorUnavailabilityInput } from "./CreateDoctorUnavailabilityInput";
import { CreateDoctorUnavailabilityOutput } from "./CreateDoctorUnavailabilityOutput";
import { AppointmentRepository } from "src/modules/appointments/domain/Repositories/AppointmentRepository";
import { AppError } from "src/common/errors/app-error.factory";
import { DoctorUnavailabilityDtoMapper } from "../../Mappers/DoctorUnavailabilityDtoMapper";
import { Status } from "src/modules/appointments/domain/entities/Status";


export class CreateDoctorUnavailabilityUseCase{
    constructor(
        private readonly doctorUnavailabilityRepository:
        DoctorUnavailabilityRepository,

        private readonly appointmentRepository: 
        AppointmentRepository
    ){}

    async execute(pInput: CreateDoctorUnavailabilityInput)
    : Promise<CreateDoctorUnavailabilityOutput>{
        
        //no exista una indisposicion activa
        const vExistingUnavailability =
            await this.doctorUnavailabilityRepository
                .findActiveByDoctorIdAndDateRange(
                    pInput.doctorId,
                    pInput.startDate,
                    pInput.endDate,
                );

        if (vExistingUnavailability.length > 0) {
            throw AppError.unavailabilityAlreadyExist(
                pInput.startDate.toDateString()+ "  "+
                pInput.endDate.toDateString())
        }

        //Crear entidad
        const vNewUnavailability = 
            DoctorUnavailabilityDtoMapper.toCreateEntity(pInput);

        vNewUnavailability.validate();

        //Guardar indisposicion
        const vSavedDoctorUnavailability =
            await this.doctorUnavailabilityRepository
                .save(vNewUnavailability);

        //Actualizar citas
        const vAffectedAppointments =
            await this.appointmentRepository
                .updateStatusByDoctorIdAndDateRange(
                    pInput.doctorId,
                    pInput.startDate,
                    pInput.endDate,
                    Status.PENDING_RESCHEDULE,
                );

        //Retornar output
        return DoctorUnavailabilityDtoMapper.toCreateOutput(
            vSavedDoctorUnavailability,
            vAffectedAppointments,
        )
    }
}
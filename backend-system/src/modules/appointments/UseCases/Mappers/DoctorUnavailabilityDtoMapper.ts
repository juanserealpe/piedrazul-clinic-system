import { Appointment } from "../../domain/entities/Appointment.entity";
import { DoctorUnavailability } from "../../domain/entities/DoctorUnavailability";
import { GetPendingsToRescheduleOutput } from "../Appointment/Get/GetPendingsToReschedule/GetPendingsToRescheduleOutput";
import { CreateDoctorUnavailabilityInput } from "../DoctorUnavailability/Create/CreateDoctorUnavailabilityInput";
import { CreateDoctorUnavailabilityOutput } from "../DoctorUnavailability/Create/CreateDoctorUnavailabilityOutput";
import { AppointmentDtoMapper } from "./AppointmentDtoMapper";

export class DoctorUnavailabilityDtoMapper {

    static toCreateEntity(
        pInput: CreateDoctorUnavailabilityInput
    ): DoctorUnavailability {

        return new DoctorUnavailability(
            null,
            pInput.doctorId,
            pInput.startDate,
            pInput.endDate,
            pInput.reason,
            new Date(),
            true,
        );
    }

    static toCreateOutput(
        pEntity: DoctorUnavailability,
        pCountPendingReschedule: number
    ): CreateDoctorUnavailabilityOutput {

        return new CreateDoctorUnavailabilityOutput(
            pEntity.doctorId,
            pEntity.startDate,
            pEntity.endDate,
            pCountPendingReschedule,
        );
    }

    static toGetOutputs(
        pDoctorId: string,
        pEntities: Appointment[],
    ): GetPendingsToRescheduleOutput {

        const vItems = pEntities.map(
            pEntity => AppointmentDtoMapper.toGetItemOutput(pEntity)
        );

        return new GetPendingsToRescheduleOutput(
            pDoctorId,
            vItems,
            vItems.length,
        );
    }
}
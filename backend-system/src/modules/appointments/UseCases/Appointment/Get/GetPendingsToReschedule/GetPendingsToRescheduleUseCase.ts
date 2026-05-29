import { AppointmentRepository } from "src/modules/appointments/domain/Repositories/AppointmentRepository";
import { GetPendingsToRescheduleOutput } from "./GetPendingsToRescheduleOutput";
import { Status } from "src/modules/appointments/domain/entities/Status";
import { GetPendingsToRescheduleInput } from "./GetPendingsToRescheduleInput";
import { DoctorUnavailabilityDtoMapper } from "../../../Mappers/DoctorUnavailabilityDtoMapper";

export class GetPendingsToRescheduleUseCase {

    constructor(
        private readonly appointmentRepository:
        AppointmentRepository,
    ) {}

    async execute(
        pInput: GetPendingsToRescheduleInput
    ): Promise<GetPendingsToRescheduleOutput> {

        const vAppointments =
            await this.appointmentRepository
                .findByDoctorStatusAndDateRange(
                    pInput.doctorId,
                    [Status.PENDING_RESCHEDULE],
                    pInput.startDate,
                    pInput.endDate,
                );

        return DoctorUnavailabilityDtoMapper
            .toGetOutputs(
                pInput.doctorId,
                vAppointments,
            );
    }
}
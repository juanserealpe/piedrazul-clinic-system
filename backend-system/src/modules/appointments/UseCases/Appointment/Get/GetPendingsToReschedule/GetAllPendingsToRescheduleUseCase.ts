import { AppointmentRepository } from "src/modules/appointments/domain/Repositories/AppointmentRepository";
import { GetPendingsToRescheduleOutput } from "./GetPendingsToRescheduleOutput";
import { DoctorUnavailabilityDtoMapper } from "../../../Mappers/DoctorUnavailabilityDtoMapper";

export class GetAllPendingsToRescheduleUseCase {

    constructor(
        private readonly appointmentRepository:
        AppointmentRepository,
    ) {}

    async execute(
        pDoctorId: string,
    ): Promise<GetPendingsToRescheduleOutput> {

        const vNowUtc = new Date();

        const vAppointments =
            await this.appointmentRepository
                .findUpcomingPendingsToRescheduleByDoctorId(
                    pDoctorId,
                    vNowUtc,
                );

        return DoctorUnavailabilityDtoMapper
            .toGetOutputs(
                pDoctorId,
                vAppointments,
            );
    }
}
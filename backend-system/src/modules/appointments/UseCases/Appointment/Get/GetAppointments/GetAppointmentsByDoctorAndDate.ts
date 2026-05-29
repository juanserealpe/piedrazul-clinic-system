import { getDayRange } from "src/modules/appointments/Utilities";
import { AppointmentRepository } from "../../../../domain/Repositories/AppointmentRepository";
import { Status } from "../../../../domain/entities/Status";
import { AppointmentDtoMapper } from "../../../Mappers/AppointmentDtoMapper";
import { GetAppointmentsInput } from "./GetAppointmentsInput";
import { GetAppointmentsOutput } from "./GetAppointmentsOutput";
import { AppError } from "src/common/errors/app-error.factory";
 
export class GetAppointmentsByDoctorAndDate {
constructor(
    private readonly appointmentRepository: AppointmentRepository
  ) {}

  async execute(
    pInput: GetAppointmentsInput
  ): Promise<GetAppointmentsOutput> {
    console.log("INPUT:", pInput);
    if (!pInput.doctorId || !pInput.date) {
      throw AppError.invalidInput();
    }

    const { vStart, vEnd } = getDayRange(pInput.date);

    const vAppointments =
      await this.appointmentRepository.findByDoctorStatusAndDateRange(
        pInput.doctorId,
        [
          Status.SCHEDULED,
          Status.RESCHEDULED,
        ],
        vStart,
        vEnd
      );

    return AppointmentDtoMapper.toGetOutput(
      pInput.doctorId,
      pInput.date,
      vAppointments
    );
  }
}
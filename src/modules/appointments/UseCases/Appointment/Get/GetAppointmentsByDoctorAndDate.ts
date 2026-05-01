import { AppointmentRepository } from "../../../domain/Repositories/AppointmentRepository";
import { Status } from "../../../domain/entities/Status";
import { AppointmentDtoMapper } from "../../Mappers/AppointmentDtoMapper";
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

    if (!pInput.doctorId || !pInput.date) {
      throw AppError.invalidInput();
    }

    const vStart = new Date(pInput.date);
    vStart.setHours(0, 0, 0, 0);

    const vEnd = new Date(pInput.date);
    vEnd.setHours(23, 59, 59, 999);

    const vAppointments =
      await this.appointmentRepository.findByDoctorStatusAndDateRange(
        pInput.doctorId,
        Status.SCHEDULED,
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
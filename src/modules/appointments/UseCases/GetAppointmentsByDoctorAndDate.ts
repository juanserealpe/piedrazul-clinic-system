import { AppointmentItemDto } from "../Presentation/Dtos/Get/AppointmentItemDto";
import { GetAppointmentsByDoctorAndDateDto } from "../Presentation/Dtos/Get/GetAppointmentsByDoctorAndDateDto";
import { GetAppointmentsByDoctorAndDateResult } from "../Presentation/Dtos/Get/GetAppointmentsByDoctorAndDateResult";
import { getDayRange, parseLocalDate } from "../Utilities";
import { AppointmentRepository } from "../domain/Repositories/AppointmentRepository";
import { Appointment } from "../domain/entities/Appointment.entity";
import { Status } from "../domain/entities/Status";
 
export class GetAppointmentsByDoctorAndDate {
constructor(
    private readonly appointmentRepository: AppointmentRepository
  ) {}

  async execute(
    dto: GetAppointmentsByDoctorAndDateDto
  ): Promise<GetAppointmentsByDoctorAndDateResult> {

    const vDate = parseLocalDate(dto.date);
    const { vStart, vEnd } = getDayRange(vDate);

    const appointments = await this.appointmentRepository
      .findByDoctorStatusAndDateRange(
        dto.doctorId,
        Status.SCHEDULED,
        vStart,
        vEnd
      );

    const result: AppointmentItemDto[] = appointments.map((a: Appointment) => ({
      id: a.id,
      patientId: a.patientId,
      doctorId: a.doctorId,
      date: a.date,
      observations: a.observations,
      status: a.status,
    }));

    return {
      appointments: result,
      total: result.length,
      date: vDate,
      doctorId: dto.doctorId,
    };
  }
}

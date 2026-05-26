import { AppointmentRepository } from "../../../domain/Repositories/AppointmentRepository";
import { Status } from "../../../domain/entities/Status";
import { AppointmentDtoMapper } from "../../Mappers/AppointmentDtoMapper";
import { CreateAppointmentInput } from "./CreateAppointmentInput";
import { CreateAppointmentOutput } from "./CreateAppointmentOutput";
import { ScheduleRepository } from "src/modules/appointments/domain/Repositories/ScheduleRepository";
import { AppError } from "src/common/errors/app-error.factory";
import { getDayOfWeek } from "src/modules/appointments/Utilities";
import { IAuthService } from "src/modules/auth/auth.interface";
 
export class CreateAppointment{
  constructor(
    private readonly appointmentRepository: AppointmentRepository,
    private readonly scheduleRepository: ScheduleRepository,
    private readonly authRepo: IAuthService
  ) {}

async execute(
    pInput: CreateAppointmentInput
  ): Promise<CreateAppointmentOutput> {

    if (!pInput.doctorId || !pInput.patientId || !pInput.date) {
      throw AppError.invalidInput();
    }
    
    if(!await this.authRepo.isUserInRole(pInput.patientId, "PATIENT"))
      throw AppError.patientNotFound(pInput.patientId);

    if(!await this.authRepo.isUserInRole(pInput.doctorId, "DOCTOR"))
      throw AppError.doctorNotFound(pInput.doctorId);

    const vDay = getDayOfWeek(pInput.date);

    const vSchedules =
      await this.scheduleRepository.findByDoctorAndDay(
        pInput.doctorId,
        vDay
      );

    if (vSchedules.length === 0) {
      throw AppError.scheduleNotAvailable(pInput.date.toISOString());
    }

    const vHour = pInput.date.getUTCHours();

    const vValidSchedule = vSchedules.find(s =>
      vHour >= s.startHour && vHour < s.endHour
    );

    if (!vValidSchedule) {
      throw AppError.scheduleNotFound(pInput.date.toISOString());
    }

    const vStart = new Date(pInput.date);
    vStart.setUTCHours(vValidSchedule.startHour, 0, 0, 0);

    const diffMinutes =
      (pInput.date.getTime() - vStart.getTime()) / 60000;

    if (diffMinutes % vValidSchedule.interval !== 0) {
      throw AppError.invalidInterval();
    }

    const vExistingAppointments =
      await this.appointmentRepository.findByDoctorStatusAndDateRange(
        pInput.doctorId,
        Status.SCHEDULED,
        pInput.date.toISOString(),
        pInput.date.toISOString()
      );

    const vConflict = vExistingAppointments.find(a =>
      a.overlaps(pInput.date)
    );

    if (vConflict) {
      throw AppError.appointmentAlreadyExist(pInput.date.toISOString());
    }
    const vAppointment =
      AppointmentDtoMapper.toCreateEntity("", pInput);

    const vSaved =
      await this.appointmentRepository.save(vAppointment);

      console.log(vSaved);
    return AppointmentDtoMapper.toCreateOutput(vSaved);
  }
}
import { AppointmentRepository } from "../../../domain/Repositories/AppointmentRepository";
import { Status } from "../../../domain/entities/Status";
import { AppointmentDtoMapper } from "../../Mappers/AppointmentDtoMapper";
import { CreateAppointmentInput } from "./CreateAppointmentInput";
import { CreateAppointmentOutput } from "./CreateAppointmentOutput";
import { ScheduleRepository } from "src/modules/appointments/domain/Repositories/ScheduleRepository";
import { AppError } from "src/common/errors/app-error.factory";
import { getDayOfWeek } from "src/modules/appointments/Utilities";
import { IAuthService } from "src/modules/auth/auth.interface";
import { DoctorUnavailabilityRepository } from "src/modules/appointments/domain/Repositories/DoctorUnavailabilityRepository";
 
export class CreateAppointment{
  constructor(
    private readonly appointmentRepository: AppointmentRepository,
    private readonly scheduleRepository: ScheduleRepository,
    private readonly authRepo: IAuthService,
    private readonly unavailabilityRepo: DoctorUnavailabilityRepository,
  ) {}

async execute(
    pInput: CreateAppointmentInput
  ): Promise<CreateAppointmentOutput> {


    const vFormatted = pInput.date.toLocaleString("es-CO", {
      hour12: true,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
    console.log(vFormatted);

    if (!pInput.doctorId || !pInput.patientId || !pInput.date) {
      throw AppError.invalidInput();
    }
    if(await this.unavailabilityRepo.findActiveByDoctorIdAndDate(pInput.doctorId,pInput.date))
        throw AppError.unavailabilityDoctor(pInput.date.toDateString());
    
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
        [Status.SCHEDULED],
        pInput.date,
        pInput.date,
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
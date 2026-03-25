import { AppointmentRepository } from "../domain/Repositories/AppointmentRepository";
import { ScheduleRepository } from "../domain/Repositories/ScheduleRepository";
import { Schedule } from "../domain//entities/Schedule.entity";
import { Status } from "../domain/entities/Status";
import { GetAvailableSlotsDto } from "../Presentation/Dtos/Get/GetAvailableSlotsDto";
import { GetAvailableSlotsResult } from "../Presentation/Dtos/Get/GetAvailableSlotsResult";
import { AvailableSlotDto } from "../Presentation/Dtos/Get/AvailableSlotDto";
import { BusinessException } from "../BusinessException";
import { getDayOfWeek, getDayRange, parseLocalDate} from "../Utilities";
 
export class GetAvailableSlots {
  constructor(
    private readonly scheduleRepository: ScheduleRepository,
    private readonly appointmentRepository: AppointmentRepository
  ) {}

  async execute(dto: GetAvailableSlotsDto): Promise<GetAvailableSlotsResult> {
    const vDate = parseLocalDate(dto.date);
    const schedule = await this.getSchedule(dto.doctorId, vDate);

    const takenDates = await this.getTakenDates(dto.doctorId, vDate);

    const availableSlots = this.calculateAvailableSlots(
      schedule,
      vDate,
      takenDates
    );

    const slots = this.mapToDto(availableSlots);

    return this.buildResponse(dto.doctorId, vDate, schedule, slots);
  }

  private async getSchedule(doctorId: string, date: Date): Promise<Schedule> {
    const vDay = getDayOfWeek(date);

    const schedules = await this.scheduleRepository
      .findByDoctorAndDay(doctorId, vDay);

    if (schedules === null || !schedules.length) {
      throw new BusinessException(
        `No active schedule for doctor ${doctorId} on ${date}`
      );
    }

    return schedules[0];
  }

  private async getTakenDates(
    doctorId: string,
    date: Date
  ): Promise<Date[]> {
    const { vStart, vEnd } = getDayRange(date);

    const appointments = await this.appointmentRepository
      .findByDoctorStatusAndDateRange(
        doctorId,
        Status.SCHEDULED,
        vStart,
        vEnd
      );

    return appointments.map(a => a.date);
  }

  private calculateAvailableSlots(
    schedule: Schedule,
    date: Date,
    takenDates: Date[]
  ): Date[] {
    return schedule.getAvailableSlots(date, takenDates);
  }

  
  private mapToDto(slots: Date[]): AvailableSlotDto[] {
    return slots.map((slot: Date) => ({
      time: slot,
      isoString: slot.toISOString(),
      label: slot.toLocaleTimeString("es-CO", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
        timeZone: "America/Bogota", 
      }),
    }));
  }

  private buildResponse(
    doctorId: string,
    date: Date,
    schedule: Schedule,
    slots: AvailableSlotDto[]
  ): GetAvailableSlotsResult {
    return {
      doctorId,
      date,
      scheduleId: schedule.id,
      interval: schedule.interval,
      slots,
      totalAvailable: slots.length,
    };
  }
}
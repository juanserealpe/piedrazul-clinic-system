import { AppointmentRepository } from "src/modules/appointments/domain/Repositories/AppointmentRepository";
import { ScheduleRepository } from "src/modules/appointments/domain/Repositories/ScheduleRepository";
import { GetScheduleOutput } from "./GetScheduleOutput";
import { GetScheduleInput } from "./GetScheduleInput";
import { Status } from "src/modules/appointments/domain/entities/Status";
import { Schedule } from "src/modules/appointments/domain/entities/Schedule.entity";
import { getDayOfWeek, getDayRange } from "src/modules/appointments/Utilities";
import { DoctorUnavailabilityRepository } from "src/modules/appointments/domain/Repositories/DoctorUnavailabilityRepository";

export class GetAvailableSlotsUseCase {
  constructor(
    private readonly scheduleRepository: ScheduleRepository,
    private readonly appointmentRepository: AppointmentRepository,
    private readonly doctorUnavailabilityRepository: DoctorUnavailabilityRepository
  ) {}

  async execute(input: GetScheduleInput): Promise<GetScheduleOutput> {
    const dayOfWeek = getDayOfWeek(input.date);

    const unavailableRanges = await this.getUnavailabilityRangesForDate(
      input.doctorId,
      input.date
    );

    // 1. Obtener horarios del doctor para ese día
    const schedules = await this.scheduleRepository.findByDoctorAndDay(
      input.doctorId,
      dayOfWeek,
    );

    // ── CORRECCIÓN Bug 6: devolver lista vacía en lugar de lanzar error ──────
    // El frontend usa Promise.allSettled y filtra por slots.length > 0.
    // Lanzar NotFound aquí rompe la promesa individual y confunde al usuario.
    if (!schedules?.length) {
      return new GetScheduleOutput(input.doctorId, input.date.toISOString(), []);
    }
    // ─────────────────────────────────────────────────────────────────────────

    const activeSchedules = schedules.filter(schedule => schedule.isActive);

    if (activeSchedules.length === 0) {
      return new GetScheduleOutput(input.doctorId, input.date.toISOString(), []);
    }

    // 2. Obtener citas ocupadas del día
    const takenDates = await this.getAppointmentsForDate(input.doctorId, input.date);

    // 3. Generar slots disponibles
    const availableSlots = this.generateAvailableSlots(
      activeSchedules,
      input.date,
      takenDates,
      unavailableRanges,
    );

    return new GetScheduleOutput(input.doctorId, input.date.toISOString(), availableSlots);
  }

  private async getUnavailabilityRangesForDate(
    doctorId: string,
    date: Date
  ): Promise<{ start: Date; end: Date }[]> {
    const startOfDay = new Date(date);
    startOfDay.setUTCHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setUTCHours(23, 59, 59, 999);

    const unavailabilities = await this.doctorUnavailabilityRepository
      .findActiveByDoctorIdAndDateRange(
        doctorId,
        startOfDay,
        endOfDay
      );

    return unavailabilities.map(ua => ({
      start: new Date(ua.startDate),
      end: new Date(ua.endDate)
    }));
  }

  private async getAppointmentsForDate(doctorId: string, date: Date): Promise<Date[]> {
    const { vStart, vEnd } = getDayRange(date);
    const appointments = await this.appointmentRepository.findByDoctorStatusAndDateRange(
      doctorId,
      [
        Status.SCHEDULED,
        Status.RESCHEDULED,
      ],
      vStart,
      vEnd,
    );

    return appointments.map(apt => apt.getCurrentDate());
  }

  private generateAvailableSlots(
    schedules: Schedule[],
    date: Date,
    takenDates: Date[],
    unavailableRanges: { start: Date; end: Date }[]
  ): string[] {
    const allSlots = schedules.flatMap(schedule =>
      schedule.getAvailableSlots(date, takenDates)
    );

    const availableSlots = allSlots.filter(slot =>
      !this.isSlotInUnavailableRange(slot, unavailableRanges)
    );

    return availableSlots
      .sort((a, b) => a.getTime() - b.getTime())
      .map(slot => slot.toISOString());
  }

  private isSlotInUnavailableRange(
    slot: Date,
    unavailableRanges: { start: Date; end: Date }[]
  ): boolean {
    const slotTime = slot.getTime();

    return unavailableRanges.some(range => {
      const startTime = range.start.getTime();
      const endTime = range.end.getTime();
      return slotTime >= startTime && slotTime < endTime;
    });
  }
}
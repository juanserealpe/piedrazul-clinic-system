import { AppointmentRepository } from "src/modules/appointments/domain/Repositories/AppointmentRepository";
import { ScheduleRepository } from "src/modules/appointments/domain/Repositories/ScheduleRepository";
import { GetScheduleOutput } from "./GetScheduleOutput";
import { GetScheduleInput } from "./GetScheduleInput";
import { Status } from "src/modules/appointments/domain/entities/Status";
import { Schedule } from "src/modules/appointments/domain/entities/Schedule.entity";
import { getDayOfWeek, getDayRange } from "src/modules/appointments/Utilities";

export class GetAvailableSlotsUseCase {
  constructor(
    private readonly scheduleRepository: ScheduleRepository,
    private readonly appointmentRepository: AppointmentRepository
  ) {}

  async execute(
  input: GetScheduleInput,
): Promise<GetScheduleOutput> {

  const vDay = getDayOfWeek(input.date);

  // 1. Obtener horarios del doctor para ese día
  const vSchedules =
    await this.scheduleRepository.findByDoctorAndDay(
      input.doctorId,
      vDay,
    );

  // 2. Filtrar horarios activos
  const vActiveSchedules =
    vSchedules.filter(vSchedule => vSchedule.isActive);

  console.log("INPUT DATE:", input.date.toISOString());

  console.log(
    "ACTIVE SCHEDULES:",
    JSON.stringify(vActiveSchedules, null, 2),
  );

  // 3. Si no hay horarios
  if (vActiveSchedules.length === 0) {

    return new GetScheduleOutput(
      input.doctorId,
      input.date.toISOString(),
      [],
    );
  }

  // 4. Obtener citas del día
  const vAppointments =
    await this.getAppointmentsForDate(
      input.doctorId,
      input.date,
    );

  console.log(
    "TAKEN DATES:",
    vAppointments.map(vDate => ({
      iso: vDate.toISOString(),
      time: vDate.getTime(),
      isDate: vDate instanceof Date,
    })),
  );

  // 5. Generar slots disponibles
  const vSlots =
    this.generateAllAvailableSlots(
      vActiveSchedules,
      input.date,
      vAppointments,
    );

  console.log("AVAILABLE SLOTS:", vSlots);

  return new GetScheduleOutput(
    input.doctorId,
    input.date.toISOString(),
    vSlots,
  );
}

// -----------------------------------------

private async getAppointmentsForDate(
  doctorId: string,
  date: Date,
): Promise<Date[]> {

  const { vStart, vEnd } =
    getDayRange(date);

  const vAppointments =
    await this.appointmentRepository
      .findByDoctorStatusAndDateRange(
        doctorId,
        Status.SCHEDULED,
        vStart.toISOString(),
        vEnd.toISOString(),
      );

  return vAppointments.map(
    vAppointment => vAppointment.getCurrentDate(),
  );
}

// -----------------------------------------

private generateAllAvailableSlots(
  schedules: Schedule[],
  date: Date,
  takenDates: Date[],
): string[] {

  const vAllSlots: Date[] = [];

  for (const vSchedule of schedules) {

    const vAvailableSlots =
      vSchedule.getAvailableSlots(
        date,
        takenDates,
      );

    console.log(
      "SLOTS FOR SCHEDULE:",
      vAvailableSlots.map(
        vSlot => vSlot.toISOString(),
      ),
    );

    vAllSlots.push(...vAvailableSlots);
  }

  return vAllSlots
    .sort(
      (a, b) => a.getTime() - b.getTime(),
    )
    .map(
      vSlot => vSlot.toISOString(),
    );
  }
}
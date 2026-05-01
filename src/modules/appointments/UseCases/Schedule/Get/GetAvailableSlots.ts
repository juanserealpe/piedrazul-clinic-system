import { AppointmentRepository } from "src/modules/appointments/domain/Repositories/AppointmentRepository";
import { ScheduleRepository } from "src/modules/appointments/domain/Repositories/ScheduleRepository";
import { GetScheduleOutput } from "./GetScheduleOutput";
import { GetScheduleInput } from "./GetScheduleInput";
import { DayOfWeek } from "src/modules/appointments/domain/entities/DaysOfWeek";
import { Status } from "src/modules/appointments/domain/entities/Status";
import { Schedule } from "src/modules/appointments/domain/entities/Schedule.entity";

export class GetAvailableSlotsUseCase {
  constructor(
    private readonly scheduleRepository: ScheduleRepository,
    private readonly appointmentRepository: AppointmentRepository
  ) {}

  async execute(input: GetScheduleInput): Promise<GetScheduleOutput> {
    const vDay = this.getDayOfWeekFromDate(input.date);
    
    // 2. Obtener horarios del doctor para ese día
    const vSchedules = await this.scheduleRepository.findByDoctorAndDay(
      input.doctorId,
      vDay
    );
    
    // 3. Filtrar solo horarios activos
    const vActiveSchedules = vSchedules.filter(s => s.isActive);
    
    if (vActiveSchedules.length === 0) {
      return new GetScheduleOutput(input.doctorId, input.date.toISOString(), []);
    }
    
    // 4. Obtener citas ya agendadas para esa fecha
    const vAppointments = await this.getAppointmentsForDate(
      input.doctorId,
      input.date
    );
    
    // 5. Generar slots disponibles usando la lógica de la entidad
    const vSlots = this.generateAllAvailableSlots(
      vActiveSchedules,
      input.date,
      vAppointments
    );
    
    return new GetScheduleOutput(
      input.doctorId,
      input.date.toISOString(),
      vSlots
    );
  }
  
  //Private para coord
  private getDayOfWeekFromDate(date: Date): DayOfWeek {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
    }).toUpperCase() as DayOfWeek;
  }
  
  private async getAppointmentsForDate(
    doctorId: string,
    date: Date
  ): Promise<Date[]> {
    const vStart = new Date(date);
    vStart.setHours(0, 0, 0, 0);
    
    const vEnd = new Date(date);
    vEnd.setHours(23, 59, 59, 999);
    
    const vAppointments = await this.appointmentRepository.findByDoctorStatusAndDateRange(
      doctorId,
      Status.SCHEDULED,
      vStart,
      vEnd
    );
    
    // Extraer solo las fechas de las citas
    return vAppointments.map(a => a.date);
  }
  
  private generateAllAvailableSlots(
    schedules: Schedule[],
    date: Date,
    takenDates: Date[]
  ): string[] {
    const vAllSlots: Date[] = [];
    
    // Usar el método getAvailableSlots de schedule
    for (const schedule of schedules) {
      const vAvailableSlots = schedule.getAvailableSlots(date, takenDates);
      vAllSlots.push(...vAvailableSlots);
    }
    
    // Ordenar slots y convertir a ISO string
    return vAllSlots
      .sort((a, b) => a.getTime() - b.getTime())
      .map(slot => slot.toISOString());
  }
}
import { BusinessException } from "../BusinessException";
import {CreateAppointmentBySchedulerDto} from "../Presentation/Dtos/Create/CreateAppointmentBySchedulerDto";
import {CreateAppointmentBySchedulerResult} from "../Presentation/Dtos/Create/CreateAppointmentBySchedulerResult";
import { getDayOfWeek } from "../Utilities";
import { AppointmentRepository } from "../domain/Repositories/AppointmentRepository";
import { ScheduleRepository } from "../domain/Repositories/ScheduleRepository";
import { Appointment } from "../domain/entities/Appointment.entity";
import { Schedule } from "../domain/entities/Schedule.entity";
import { Status } from "../domain/entities/Status";
import { v4 as uuidv4 } from "uuid";
 

export class CreateAppointment{
    constructor(
    private readonly appointmentRepository: AppointmentRepository,
    private readonly scheduleRepository: ScheduleRepository
  ) {}
 
  async execute(dto: CreateAppointmentBySchedulerDto): 
  Promise<CreateAppointmentBySchedulerResult> {
    const dateDto = new Date(dto.requestedDate);
    const date = getDayOfWeek(dateDto);
    const schedules = await this.scheduleRepository.findByDoctorAndDay(dto.doctorId, date);
    
    if (!schedules || schedules.length === 0) {
      throw new BusinessException(
        `Doctor ${dto.doctorId} does not have any active schedule for ${date} (requested date: ${dto.requestedDate})`
      );
    }
      
    const matchingSchedule = schedules.find((schedule: Schedule) => {
      const contains = schedule.containsSlot(dateDto);
      return contains;
    });
 
       if (!matchingSchedule) {
      // Mostrar los horarios disponibles para ayudar al usuario
      const availableHours = schedules.map(s => `${s.startHour}:00 - ${s.endHour}:00`).join(', ');
      throw new BusinessException(
        `The requested time ${dto.requestedDate} is outside the doctor's working hours for ${date}. ` +
        `Working hours available: ${availableHours}`
      );
    }
    
    // 5. Verificar disponibilidad con citas existentes
    const existingAppointments = await this.appointmentRepository.findByDoctorAndStatus(
      dto.doctorId,
      Status.SCHEDULED
    );
    
    const takenDates = (existingAppointments ?? [])
      .filter((a: Appointment) => a.isOnSameDay(dateDto))
      .map((a: Appointment) => a.date);
    
    const availableSlots = matchingSchedule.getAvailableSlots(
      dateDto,
      takenDates
    );
    
    const isAvailable = availableSlots.some(
      (slot: Date) => slot.getTime() === dateDto.getTime()
    );
    
    if (!isAvailable) {
      // Mostrar los slots disponibles para ayudar al usuario
      const nextSlots = availableSlots.slice(0, 5).map(s => s.toISOString());
      throw new BusinessException(
        `The requested slot ${dto.requestedDate} is not available. ` +
        `Next available slots: ${nextSlots.join(', ')}`
      );
    }
    
    // 6. Crear la cita
    const newAppointment = new Appointment(
      uuidv4(),
      dto.patientId,
      dto.doctorId,
      dateDto,
      dto.observations ?? "",
      Status.SCHEDULED
    );
    
    const saved = await this.appointmentRepository.save(newAppointment);
    
    return {
      appointmentId: saved.id,
      patientId: saved.patientId,
      doctorId: saved.doctorId,
      confirmedDate: saved.date,
      status: saved.status,
    };
  }
}
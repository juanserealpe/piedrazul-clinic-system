import { DayOfWeek } from "../entities/DaysOfWeek";
import { Schedule } from "../entities/Schedule.entity";

export interface ScheduleRepository{

  findByIdAndDoctorId(id, doctorId): Promise<Schedule | null>;
    
  findByDoctor(doctorId: string): Promise<Schedule[]>;

  findByDoctorAndDay(doctorId: string, day: DayOfWeek): Promise<Schedule[]>;

  findByDoctorIdAndRange(doctorId: string, day: DayOfWeek, startHour: number, endHour: number): Promise<Schedule[]>;

  save(schedule: Schedule): Promise<Schedule>;

  getSchedulesPredefinedByIdDoctor(doctorId: string): Promise<Schedule[]>;

  update(schedule: Schedule): Promise<Schedule>;
}
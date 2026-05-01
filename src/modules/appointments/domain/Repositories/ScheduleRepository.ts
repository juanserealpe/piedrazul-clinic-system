import { DayOfWeek } from "../entities/DaysOfWeek";
import { Schedule } from "../entities/Schedule.entity";

export interface ScheduleRepository{
    
   findByDoctor(doctorId: string): Promise<Schedule[]>;

  findByDoctorAndDay(
    doctorId: string,
    day: DayOfWeek
  ): Promise<Schedule[]>;

  save(schedule: Schedule): Promise<Schedule>;

  existDoctor(id: string): Promise<boolean>;
}
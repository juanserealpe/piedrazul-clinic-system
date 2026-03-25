import { DayOfWeek } from "../entities/DaysOfWeek";
import { Schedule } from "../entities/Schedule.entity";

export interface ScheduleRepository{
    
    //By doctor
    findByDoctorAndDay(id: string, day: DayOfWeek): Promise<Schedule[] | null>;
    
    //Cruds
    findByStatus(status: string): Promise<Schedule[] | null>;
    save(schedule: Schedule): Promise<Schedule>;  

    //Actives
    findActiveByDoctor(doctorId: string): Promise<Schedule[]>;

}
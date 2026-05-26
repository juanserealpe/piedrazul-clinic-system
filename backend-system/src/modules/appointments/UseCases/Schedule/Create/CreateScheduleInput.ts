import { DayOfWeek } from "src/modules/appointments/domain/entities/DaysOfWeek";

export class CreateScheduleInput{
    constructor(
        public doctorId: string,
        public day: DayOfWeek,
        public startHour: number,
        public endHour: number,
        public interval: number,
    ){}
     
}
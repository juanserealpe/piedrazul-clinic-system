
export class UpdateScheduleOutput{
    constructor(
        public id: string,
        public doctorId: string,
        public day: string,
        public startHour: number,
        public endHour: number,
        public interval: number,
        public countPendingReschedule: number,
    ){}
}

export class ChangeScheduleStatusOutput{
    constructor(
        public scheduleId: string,
        public newStatus: boolean,
        public countPendingReschedule: number = 0,
    ){}
}
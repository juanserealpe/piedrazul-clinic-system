
export class AppointmentSchedule{
    constructor( 
        public id: string | null,
        public scheduledBy: string, 
        public scheduledDate: Date,
        public createdAt: Date
    ){}
}
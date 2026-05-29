
export class UpdateAppointmentInput{
    constructor(
        public reschedulerId: string,
        public doctorId: string,
        public appointmentId: string,
        public newDate: Date
    ){}
}
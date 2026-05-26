
export class UpdateAppointmentInput{
    constructor(
        public appointmentId: string,
        public newDate: Date
    ){}
}
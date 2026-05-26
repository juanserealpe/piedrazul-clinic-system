
export class UpdateAppointmentOutput{
    constructor(
        public appointmentId: string | null,
        public patientId: string,
        public doctorId: string,
        public newDate: Date
    ){}
}
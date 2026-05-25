
export class CreateAppointmentOutput{
    constructor(
        public appointmentId: string | null,
        public doctorId: string,
        public patientId: string,
        public date: Date
    ){}
}
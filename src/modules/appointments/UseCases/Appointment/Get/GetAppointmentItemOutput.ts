
export class GetAppointmentItemOutput{
    constructor(
        public appointmentId: string | null,
        public date: string,
        public patientId: string
    ){}
}
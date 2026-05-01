
export class CreateAppointmentInput{
    constructor(
        public doctorId: string,
        public patientId: string,
        public date: Date
    ){}
}
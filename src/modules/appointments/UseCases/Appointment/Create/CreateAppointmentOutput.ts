
export class CreateAppointmentOutput{
    constructor(
        public doctorId: string,
        public patientId: string,
        public date: Date
    ){}
}

export class CreateAppointmentInput{
    constructor(
        public createBy: string,
        public doctorId: string,
        public patientId: string,
        public date: Date
    ){}
}
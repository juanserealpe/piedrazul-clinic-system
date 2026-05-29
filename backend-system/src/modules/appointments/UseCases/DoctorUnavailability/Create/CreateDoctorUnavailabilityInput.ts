
export class CreateDoctorUnavailabilityInput{
    constructor(
        public doctorId: string,
        public startDate: Date,
        public endDate: Date,
        public reason: string,
    ){}
}
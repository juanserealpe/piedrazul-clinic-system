
export class CreateDoctorUnavailabilityOutput{
    constructor(
        public doctorId: string,
        public startDate: Date,
        public endDate: Date,
        public countPendingReschedule: Number,
    ){

    }
}
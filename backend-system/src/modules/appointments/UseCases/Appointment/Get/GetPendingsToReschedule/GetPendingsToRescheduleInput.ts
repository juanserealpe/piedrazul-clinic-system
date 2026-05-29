
export class GetPendingsToRescheduleInput{
    constructor(
        public doctorId: string,
        public startDate: Date,
        public endDate: Date,
    ){}
}
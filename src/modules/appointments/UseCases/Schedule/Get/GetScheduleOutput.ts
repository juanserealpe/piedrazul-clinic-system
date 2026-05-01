
export class GetScheduleOutput{
    constructor(
        public doctorId: string,
        public date: string,
        public slots: string[]
    ){}
}
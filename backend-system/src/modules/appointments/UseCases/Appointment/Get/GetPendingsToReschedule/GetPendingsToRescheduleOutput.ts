import { GetAppointmentItemOutput } from "../GetAppointments/GetAppointmentItemOutput";

export class GetPendingsToRescheduleOutput{
    constructor(
        public doctorId: string,
        public appointments: GetAppointmentItemOutput[],
        public count: number,
    ){}
}
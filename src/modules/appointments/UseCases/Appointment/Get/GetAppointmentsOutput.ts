import { GetAppointmentItemOutput } from "./GetAppointmentItemOutput";

export class GetAppointmentsOutput{
    constructor(
        public doctorId: string,
        public date: string,
        public appointments: GetAppointmentItemOutput[],
        public count: number
    ){}
}
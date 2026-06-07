export class GetAppointmentItemOutput {
  constructor(
    public appointmentId: string | null,
    public date: string,
    public patientId: string,
    //se agrega status para que el frontend pueda mostrar el badge y el botón Reagendar
    public status: string,
  ) {}
}
import { GetAppointmentsByDoctorAndDate } from "../Get/GetAppointments/GetAppointmentsByDoctorAndDate";
import { GetAppointmentsInput } from "../Get/GetAppointments/GetAppointmentsInput";


export class CsvExportUseCase {

  constructor(
    private readonly getAppointmentsUseCase: GetAppointmentsByDoctorAndDate
  ) {}

  async execute(pInput: GetAppointmentsInput): Promise<string> {

    const vResult =
      await this.getAppointmentsUseCase.execute(pInput);

    const vHeader = "DOCTOR-CC,PACIENTE-CC,Hora  dia/mes/año";

    const vRows = vResult.appointments.map(a => {

      const vLocalDate = this.formatDate(a.date);

      return `${vResult.doctorId},${a.patientId},${vLocalDate}`;
    });

    return [vHeader, ...vRows].join("\n");
  } 

  private formatDate(pDateStr: string): string {

    const vDate = new Date(pDateStr);

    const vYear = vDate.getUTCFullYear();
    const vMonth = String(vDate.getUTCMonth() + 1).padStart(2, "0");
    const vDay = String(vDate.getUTCDate()).padStart(2, "0");

    let vHour = vDate.getUTCHours();
    const vMin = String(vDate.getUTCMinutes()).padStart(2, "0");

    const vPeriod = vHour >= 12 ? "PM" : "AM";

    vHour = vHour % 12;
    if (vHour === 0) {
      vHour = 12;
    }

    return `${vHour}:${vMin} ${vPeriod} ${vDay}/${vMonth}/${vYear}`;
  }
}
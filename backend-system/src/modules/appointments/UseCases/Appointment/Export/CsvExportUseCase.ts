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

      const vLocalDate = this.toColombiaTime(a.date);

      return `${vResult.doctorId},${a.patientId},${vLocalDate}`;
    });

    return [vHeader, ...vRows].join("\n");
  } 

  private toColombiaTime(pDateStr: string): string {

    const vDate = new Date(pDateStr);

    //UTC
    const offsetMs = -5 * 60 * 60 * 1000;

    const vLocal = new Date(vDate.getTime() + offsetMs);

    const vYear = vLocal.getUTCFullYear();
    const vMonth = String(vLocal.getUTCMonth() + 1).padStart(2, "0");
    const vDay = String(vLocal.getUTCDate()).padStart(2, "0");

    const vHour = String(vLocal.getUTCHours()).padStart(2, "0");
    const vMin = String(vLocal.getUTCMinutes()).padStart(2, "0");

    return `${vHour}:${vMin}  ${vDay}/${vMonth}/${vYear}`;
  }
}
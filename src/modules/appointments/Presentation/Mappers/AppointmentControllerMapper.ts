import { CreateAppointmentInput } from "../../UseCases/Appointment/Create/CreateAppointmentInput";
import { CreateAppointmentOutput } from "../../UseCases/Appointment/Create/CreateAppointmentOutput";
import { GetAppointmentsInput } from "../../UseCases/Appointment/Get/GetAppointmentsInput";
import { GetAppointmentsOutput } from "../../UseCases/Appointment/Get/GetAppointmentsOutput";

export class AppointmentControllerMapper {

  static toCreateInput(pBody: any): CreateAppointmentInput {
    return new CreateAppointmentInput(
      pBody.doctorId,
      pBody.patientId,
      new Date(pBody.date)
    );
  }

  static toCreateOutput(pOutput: CreateAppointmentOutput) {
    return {
      doctorId: pOutput.doctorId,
      patientId: pOutput.patientId,
      date: pOutput.date.toISOString(),
    };
  }

  static toGetInput(pQuery: any): GetAppointmentsInput {
    return new GetAppointmentsInput(
      pQuery.doctorId,
      new Date(pQuery.date)
    );
  }

  static toGetOutput(pOutput: GetAppointmentsOutput) {
    return {
      doctorId: pOutput.doctorId,
      date: pOutput.date,
      appointments: pOutput.appointments.map(a => ({
        date: a.date,
        patientId: a.patientId,
      })),
      count: pOutput.count,
    };
  }
}
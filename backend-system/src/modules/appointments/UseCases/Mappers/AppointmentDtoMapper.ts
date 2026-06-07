import { Appointment } from "../../domain/entities/Appointment.entity";
import { AppointmentSchedule } from "../../domain/entities/AppointmentSchedule";
import { Status } from "../../domain/entities/Status";
import { CreateAppointmentInput } from "../Appointment/Create/CreateAppointmentInput";
import { CreateAppointmentOutput } from "../Appointment/Create/CreateAppointmentOutput";
import { GetAppointmentItemOutput } from "../Appointment/Get/GetAppointments/GetAppointmentItemOutput";
import { GetAppointmentsOutput } from "../Appointment/Get/GetAppointments/GetAppointmentsOutput";
import { UpdateAppointmentInput } from "../Appointment/Update/UpdateAppointmentInput";
import { UpdateAppointmentOutput } from "../Appointment/Update/UpdateAppointmentOutput";

export class AppointmentDtoMapper {

  // Use case = Create.
  static toCreateOutput(entity: Appointment): CreateAppointmentOutput {
    return new CreateAppointmentOutput(
      entity.id,
      entity.doctorId,
      entity.patientId,
      entity.getCurrentDate()
    );
  }

  static toCreateEntity(createBy: string, input: CreateAppointmentInput): Appointment {
    return new Appointment(
      // ✅ CORREGIDO: id debe ser null para que TypeORM lo autogenere.
      //    Antes se pasaba createBy (= doctorId) como id, causando que
      //    la cédula del doctor quedara como id de la cita.
      null,
      input.patientId,
      input.doctorId,
      "",
      [new AppointmentSchedule(null, input.doctorId, input.date, new Date())],
      input.date,
      Status.SCHEDULED
    );
  }

  // Use case = Get
  static toGetItemOutput(entity: Appointment): GetAppointmentItemOutput {
    return new GetAppointmentItemOutput(
      entity.id,
      entity.getCurrentDate().toISOString(),
      entity.patientId,
      // status incluido para que el frontend muestre badge y botón Reagendar
      entity.status,
    );
  }

  static toGetOutput(
    doctorId: string,
    date: Date,
    appointments: Appointment[]
  ): GetAppointmentsOutput {
    const vItems = appointments.map(a => this.toGetItemOutput(a));
    return new GetAppointmentsOutput(
      doctorId,
      date.toISOString(),
      vItems,
      vItems.length
    );
  }

  // Update
  static toUpdateEntity(reschedulerId: string, newUpdate: UpdateAppointmentInput): AppointmentSchedule {
    return new AppointmentSchedule("", reschedulerId, newUpdate.newDate, new Date());
  }

  static toUpdateOutput(appointment: Appointment): UpdateAppointmentOutput {
    return new UpdateAppointmentOutput(
      appointment.id,
      appointment.patientId,
      appointment.doctorId,
      appointment.getCurrentDate(),
    );
  }
}
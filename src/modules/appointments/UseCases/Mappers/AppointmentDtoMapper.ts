import { Appointment } from "../../domain/entities/Appointment.entity";
import { Status } from "../../domain/entities/Status";
import { CreateAppointmentInput } from "../Appointment/Create/CreateAppointmentInput";
import { CreateAppointmentOutput } from "../Appointment/Create/CreateAppointmentOutput";
import { GetAppointmentItemOutput } from "../Appointment/Get/GetAppointmentItemOutput";
import { GetAppointmentsOutput } from "../Appointment/Get/GetAppointmentsOutput";

export class AppointmentDtoMapper{

    //Use case = Create.
    static toCreateOutput(entity: Appointment): CreateAppointmentOutput{
        return new CreateAppointmentOutput(
            entity.doctorId,
            entity.patientId,
            entity.date
        );
    }
    static toCreateEntity(id: string, input: CreateAppointmentInput): Appointment{
        return new Appointment(
            id,
            input.patientId,
            input.doctorId,
            input.date,
            "",
            Status.SCHEDULED
        )
    }
    
  //Use case = Get
  static toGetItemOutput(entity: Appointment): GetAppointmentItemOutput{
    return new GetAppointmentItemOutput(
      entity.date.toISOString(),
      entity.patientId
    );
  }

  static toGetOutput(
    doctorId: string,
    date: Date,
    appointments: Appointment[]
  ): GetAppointmentsOutput{

    const vItems = appointments.map(a =>
      this.toGetItemOutput(a)
    );

    return new GetAppointmentsOutput(
      doctorId,
      date.toISOString(),
      vItems,
      vItems.length
    );
  }
}
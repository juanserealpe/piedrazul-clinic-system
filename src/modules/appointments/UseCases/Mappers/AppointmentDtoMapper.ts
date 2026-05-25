import { Appointment } from "../../domain/entities/Appointment.entity";
import { AppointmentSchedule } from "../../domain/entities/AppointmentSchedule";
import { Status } from "../../domain/entities/Status";
import { CreateAppointmentInput } from "../Appointment/Create/CreateAppointmentInput";
import { CreateAppointmentOutput } from "../Appointment/Create/CreateAppointmentOutput";
import { GetAppointmentItemOutput } from "../Appointment/Get/GetAppointmentItemOutput";
import { GetAppointmentsOutput } from "../Appointment/Get/GetAppointmentsOutput";
import { UpdateAppointmentInput } from "../Appointment/Update/UpdateAppointmentInput";
import { UpdateAppointmentOutput } from "../Appointment/Update/UpdateAppointmentOutput";

export class AppointmentDtoMapper{

    //Use case = Create.
    static toCreateOutput(entity: Appointment): CreateAppointmentOutput{
        return new CreateAppointmentOutput(
          entity.doctorId,
          entity.patientId,
          entity.getCurrentDate() 
        );
    }

    static toCreateEntity(scheduleId: string, input: CreateAppointmentInput): Appointment{
        return new Appointment(
          null,
          input.patientId,
          input.doctorId,"",
          [new AppointmentSchedule(null, scheduleId,input.date ,new Date())],
          input.date,
          Status.SCHEDULED

        )
    }
    
  //Use case = Get
  static toGetItemOutput(entity: Appointment): GetAppointmentItemOutput{
    return new GetAppointmentItemOutput(
      entity.getCurrentDate().toISOString(),
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

  //Update
  static toUpdateEntity(reschedulerId: string, newUpdate: UpdateAppointmentInput)
    : AppointmentSchedule{
    return new AppointmentSchedule(null,reschedulerId,newUpdate.newDate,new Date())
  }

  static toUpdateOutput(appointment: Appointment): UpdateAppointmentOutput{
    return new UpdateAppointmentOutput(
      appointment.id,
      appointment.patientId,
      appointment.doctorId,
      appointment.getCurrentDate(),
    )
  }
}
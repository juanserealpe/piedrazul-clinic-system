import { CreateAppointmentInput } from "../../UseCases/Appointment/Create/CreateAppointmentInput";
import { CreateAppointmentOutput } from "../../UseCases/Appointment/Create/CreateAppointmentOutput";
import { GetAppointmentsInput } from "../../UseCases/Appointment/Get/GetAppointmentsInput";
import { GetAppointmentsOutput } from "../../UseCases/Appointment/Get/GetAppointmentsOutput";
import { UpdateAppointmentInput } from "../../UseCases/Appointment/Update/UpdateAppointmentInput";
import { CreateAppointmentRequestDto } from "../Dtos/Appointment/CreateAppointmentRequestDto";
import { GetAppointmentsRequestDto } from "../Dtos/Appointment/GetAppointmentsRequestDto";
import { ReScheduleRequestDto } from "../Dtos/Appointment/ReScheduleRequestDto";

export class AppointmentControllerMapper {

  static toCreateInput(pBody: CreateAppointmentRequestDto): CreateAppointmentInput {
    return new CreateAppointmentInput(
      pBody.doctorId,
      pBody.patientId,
      new Date(pBody.date)
    );
  }

  static toGetInput(pQuery: GetAppointmentsRequestDto): GetAppointmentsInput {
    return new GetAppointmentsInput(
      pQuery.doctorId,
      new Date(pQuery.date)
    );
  }

  static toRescheduleInput(pInput: ReScheduleRequestDto): UpdateAppointmentInput{
    return {
      appointmentId: pInput.appointmentId,
      newDate: new Date(pInput.newDate),
    }
  }
}
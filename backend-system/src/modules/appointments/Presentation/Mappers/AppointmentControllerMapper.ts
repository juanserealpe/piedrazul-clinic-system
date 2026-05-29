import { CreateAppointmentInput } from "../../UseCases/Appointment/Create/CreateAppointmentInput";
import { GetAppointmentsInput } from "../../UseCases/Appointment/Get/GetAppointments/GetAppointmentsInput";
import { GetPendingsToRescheduleInput } from "../../UseCases/Appointment/Get/GetPendingsToReschedule/GetPendingsToRescheduleInput";
import { UpdateAppointmentInput } from "../../UseCases/Appointment/Update/UpdateAppointmentInput";
import { CreateAppointmentRequestDto } from "../Dtos/Appointment/CreateAppointmentRequestDto";
import { GetAppointmentsRequestDto } from "../Dtos/Appointment/GetAppointmentsRequestDto";
import { GetPendingsToRescheduleRequestDto } from "../Dtos/Appointment/GetPendingsToRescheduleRequestDto";
import { ReScheduleRequestDto } from "../Dtos/Appointment/ReScheduleRequestDto";

export class AppointmentControllerMapper {

  static toCreateInput(pDoctorId: string,pBody: CreateAppointmentRequestDto): CreateAppointmentInput {
    return new CreateAppointmentInput(
      pDoctorId,
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

  static toRescheduleInput(pReschedulerId: string, pInput: ReScheduleRequestDto): UpdateAppointmentInput{
    return {
      reschedulerId:  pReschedulerId,
      doctorId: pInput.doctorId,
      appointmentId: pInput.appointmentId,
      newDate: new Date(pInput.newDate),
    }
  }
  static toGetPendingsInput( pDoctorId: string,
    pQuery: GetPendingsToRescheduleRequestDto
    ): GetPendingsToRescheduleInput {

      return new GetPendingsToRescheduleInput(
          pDoctorId,
          new Date(pQuery.startDate),
          new Date(pQuery.endDate),
      );
    }
}
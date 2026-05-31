import { CreateScheduleInput } from "../../UseCases/Schedule/Create/CreateScheduleInput";
import { GetScheduleInput } from "../../UseCases/Appointment/GetAvaibleSlotsByDoctor/GetScheduleInput";
import { CreateScheduleRequestDto } from "../Dtos/Schedule/CreateScheduleRequestDto";
import { GetScheduleRequestDto } from "../Dtos/Schedule/GetScheduleRequestDto";
import { CreateDoctorUnavailabilityInput } from "../../UseCases/DoctorUnavailability/Create/CreateDoctorUnavailabilityInput";
import { CreateDoctorUnavailabilityRequestDto } from "../Dtos/Appointment/CreateDoctorUnavailabilityRequestDto";
import { UpdateScheduleRequestDto } from "../Dtos/Schedule/UpdateScheduleRequestDto";
import { UpdateScheduleInput } from "../../UseCases/Schedule/Update/UpdateScheduleInput";
import { ChangeScheduleStatusRequestDto } from "../Dtos/Schedule/ChangeScheduleStatusRequestDto";
import { ChangeScheduleStatusInput } from "../../UseCases/Schedule/ChangeScheduleStatus/ChangeScheduleStatusInput";

export class ScheduleControllerMapper {

  // -------- CREATE ONE --------
  static toCreateInput(pBody: CreateScheduleRequestDto): CreateScheduleInput {
    return new CreateScheduleInput(
      pBody.doctorId,
      pBody.day,
      pBody.startHour,
      pBody.endHour,
      pBody.interval
    );
  }

  static toCreateManyInput(pBody: CreateScheduleRequestDto[]): CreateScheduleInput[] {
    return pBody.map(item =>
      this.toCreateInput(item)
    );
  }


  // -------- GET SLOTS --------
  static toGetInput(pQuery: GetScheduleRequestDto): GetScheduleInput {
    return new GetScheduleInput(
      pQuery.doctorId,
      new Date(pQuery.date)
    );
  }

  //Unavailability
  static toCreateUnavailabilityInput(pDoctorId: string, pBody: CreateDoctorUnavailabilityRequestDto)
  : CreateDoctorUnavailabilityInput{
      return new CreateDoctorUnavailabilityInput(
        pDoctorId,
        new Date(pBody.startDate),
        new Date(pBody.endDate),
        pBody.reason,
      );
  }

  static toUpdateScheduleInput(pBody: UpdateScheduleRequestDto)
  : UpdateScheduleInput{
    return new UpdateScheduleInput(
      pBody.id,
      pBody.doctorId,
      pBody.day,
      pBody.startHour,
      pBody.endHour,
      pBody.interval,
      );
  }

  static toChangeStatusInput(
    pBody: ChangeScheduleStatusRequestDto,
    ): ChangeScheduleStatusInput {
      return new ChangeScheduleStatusInput(
          pBody.scheduleId,
          pBody.doctorId,
      );
  }
}
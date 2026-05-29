import { CreateScheduleInput } from "../../UseCases/Schedule/Create/CreateScheduleInput";
import { CreateScheduleOutput } from "../../UseCases/Schedule/Create/CreateScheduleOutput";
import { GetScheduleInput } from "../../UseCases/Appointment/GetAvaibleSlotsByDoctor/GetScheduleInput";
import { GetScheduleOutput } from "../../UseCases/Appointment/GetAvaibleSlotsByDoctor/GetScheduleOutput";
import { CreateScheduleRequestDto } from "../Dtos/Schedule/CreateScheduleRequestDto";
import { GetScheduleRequestDto } from "../Dtos/Schedule/GetScheduleRequestDto";
import { CreateDoctorUnavailabilityInput } from "../../UseCases/DoctorUnavailability/Create/CreateDoctorUnavailabilityInput";
import { CreateDoctorUnavailabilityOutput } from "../../UseCases/DoctorUnavailability/Create/CreateDoctorUnavailabilityOutput";
import { CreateDoctorUnavailabilityRequestDto } from "../Dtos/Appointment/CreateDoctorUnavailabilityRequestDto";

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
      )
  }
}
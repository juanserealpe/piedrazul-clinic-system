import { CreateScheduleInput } from "../../UseCases/Schedule/Create/CreateScheduleInput";
import { CreateScheduleOutput } from "../../UseCases/Schedule/Create/CreateScheduleOutput";
import { GetScheduleInput } from "../../UseCases/Schedule/Get/GetScheduleInput";
import { GetScheduleOutput } from "../../UseCases/Schedule/Get/GetScheduleOutput";
import { CreateScheduleRequestDto } from "../Dtos/Schedule/CreateScheduleRequestDto";
import { GetScheduleRequestDto } from "../Dtos/Schedule/GetScheduleRequestDto";

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

  static toCreateOutput(pOutput: CreateScheduleOutput) {
    return {
      doctorId: pOutput.doctorId,
      day: pOutput.day,
      startHour: pOutput.startHour,
      endHour: pOutput.endHour,
      interval: pOutput.interval,
      isActive: pOutput.isActive,
    };
  }

  // -------- GET SLOTS --------
  static toGetInput(pQuery: GetScheduleRequestDto): GetScheduleInput {
    return new GetScheduleInput(
      pQuery.doctorId,
      new Date(pQuery.date)
    );
  }

  static toGetOutput(pOutput: GetScheduleOutput) {
    return {
      doctorId: pOutput.doctorId,
      date: pOutput.date,
      slots: pOutput.slots,
    };
  }
}
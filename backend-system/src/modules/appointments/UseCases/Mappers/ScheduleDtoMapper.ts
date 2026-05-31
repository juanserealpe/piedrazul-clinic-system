import { Schedule } from "../../domain/entities/Schedule.entity";
import { ChangeScheduleStatusOutput } from "../Schedule/ChangeScheduleStatus/ChangeScheduleStatusOutput";
import { CreateScheduleInput } from "../Schedule/Create/CreateScheduleInput";
import { CreateScheduleOutput } from "../Schedule/Create/CreateScheduleOutput";
import { UpdateScheduleInput } from "../Schedule/Update/UpdateScheduleInput";
import { UpdateScheduleOutput } from "../Schedule/Update/UpdateScheduleOutput";

export class ScheduleDtoMapper {

  static toCreateOutput(entity: Schedule): CreateScheduleOutput {
    return new CreateScheduleOutput(
      entity.doctorId,
      entity.day,
      entity.startHour,
      entity.endHour,
      entity.interval,
      entity.isActive
    );
  }

  static toCreateEntity(id: string, input: CreateScheduleInput): Schedule {
    return new Schedule(
      id,
      input.doctorId,
      input.day,
      input.startHour,
      input.endHour,
      input.interval,
      true
    );
  }
  
  static toUpdateOutput(pCountPendingReschedule: number,entity: Schedule): UpdateScheduleOutput{
    return new UpdateScheduleOutput(
      entity.id,
      entity.doctorId,
      entity.day.toString(),
      entity.startHour,
      entity.endHour,
      entity.interval,
      pCountPendingReschedule,
    );
  }
  static toUpdateEntity(input: UpdateScheduleInput): Schedule {
      return new Schedule(
        input.id,
        input.doctorId,
        input.day,
        input.startHour,
        input.endHour,
        input.interval,
        true,
      );
  }
  static toChangeStatusOutput(countPendingReschedule: number,entity: Schedule)
  : ChangeScheduleStatusOutput{
    return new ChangeScheduleStatusOutput(
      entity.id,
      entity.isActive,
      countPendingReschedule,
    );
  }
}
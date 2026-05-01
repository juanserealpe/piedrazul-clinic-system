import { Schedule } from "../../domain/entities/Schedule.entity";
import { CreateScheduleInput } from "../Schedule/Create/CreateScheduleInput";
import { CreateScheduleOutput } from "../Schedule/Create/CreateScheduleOutput";

export class ScheduleDtoMapper {

  static toOutput(entity: Schedule): CreateScheduleOutput {
    return new CreateScheduleOutput(
      entity.doctorId,
      entity.day,
      entity.startHour,
      entity.endHour,
      entity.interval,
      entity.isActive
    );
  }

  static toEntity(id: string, input: CreateScheduleInput): Schedule {
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
}
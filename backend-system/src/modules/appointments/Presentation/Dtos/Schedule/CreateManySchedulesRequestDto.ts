import { ValidateNested, ArrayMinSize } from "class-validator";
import { Type } from "class-transformer";
import { CreateScheduleRequestDto } from "./CreateScheduleRequestDto";

export class CreateManySchedulesRequestDto {

  @ValidateNested({ each: true })
  @Type(() => CreateScheduleRequestDto)
  @ArrayMinSize(1)
  schedules: CreateScheduleRequestDto[];
}
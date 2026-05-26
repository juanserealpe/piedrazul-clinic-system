import { IsString, IsNotEmpty, IsEnum, IsInt, Min, Max, IsOptional } from "class-validator";
import { DayOfWeek } from "src/modules/appointments/domain/entities/DaysOfWeek";

export class CreateScheduleRequestDto {

  @IsString()
  @IsOptional()
  doctorId: string;

  @IsEnum(DayOfWeek)
  day: DayOfWeek;

  @IsInt()
  @Min(0)
  @Max(23)
  startHour: number;

  @IsInt()
  @Min(1)
  @Max(24)
  endHour: number;

  @IsInt()
  @Min(1)
  interval: number;
}
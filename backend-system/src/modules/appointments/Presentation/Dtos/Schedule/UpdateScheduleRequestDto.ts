import {
    IsEnum,
    IsInt,
    IsNotEmpty,
    IsString,
    Max,
    Min,
} from "class-validator";
import { DayOfWeek } from "src/modules/appointments/domain/entities/DaysOfWeek";

export class UpdateScheduleRequestDto {

    @IsString()
    @IsNotEmpty()
    id: string;

    @IsString()
    @IsNotEmpty()
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
    @Max(60)
    interval: number;
}
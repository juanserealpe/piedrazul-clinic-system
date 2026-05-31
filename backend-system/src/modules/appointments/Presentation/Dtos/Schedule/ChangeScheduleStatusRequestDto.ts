import {
    IsNotEmpty,
    IsString,
} from "class-validator";

export class ChangeScheduleStatusRequestDto {

    @IsString()
    @IsNotEmpty()
    scheduleId: string;

    @IsString()
    @IsNotEmpty()
    doctorId: string;
}
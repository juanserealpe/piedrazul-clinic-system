import {
    IsISO8601,
    IsOptional,
    IsString,
    Matches,
} from "class-validator";

export class GetPendingsToRescheduleRequestDto {

    @IsISO8601()
    @Matches(/Z$/, {
        message: "La fecha inicial debe estar en UTC",
    })
    startDate!: string;

    @IsISO8601()
    @Matches(/Z$/, {
        message: "La fecha final debe estar en UTC",
    })
    endDate!: string;

    @IsOptional()
    @IsString()
    doctorId?: string;
}
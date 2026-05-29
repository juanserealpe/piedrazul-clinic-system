import {
    IsISO8601,
    IsNotEmpty,
    IsString,
    Matches,
} from "class-validator";

export class CreateDoctorUnavailabilityRequestDto {

    @IsString()
    @IsNotEmpty()
    doctorId: string;

    @IsISO8601()
    @Matches(/Z$/, {
        message: "La fecha inicial debe estar en UTC",
    })
    startDate: string;

    @IsISO8601()
    @Matches(/Z$/, {
        message: "La fecha final debe estar en UTC",
    })
    endDate: string;

    @IsString()
    @IsNotEmpty()
    reason: string;
}
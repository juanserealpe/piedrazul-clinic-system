import { IsISO8601, IsNotEmpty, IsString, Matches } from "class-validator"

export class ReScheduleRequestDto{
    @IsString()
    @IsNotEmpty()
    doctorId: string

    @IsString()
    @IsNotEmpty()
    appointmentId: string

    @IsISO8601()
    @Matches(/Z$/, { message: "El formato de fecha debe estar en UTC(finalizar en Z)" })
    newDate: string
        
}
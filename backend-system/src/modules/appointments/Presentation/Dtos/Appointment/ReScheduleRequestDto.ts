import { IsISO8601, IsNotEmpty, IsOptional, IsString, Matches } from "class-validator"

export class ReScheduleRequestDto{
    @IsString()
    @IsOptional() 
    doctorId: string

    @IsString()
    @IsNotEmpty()
    appointmentId: string

    @IsISO8601()
    @Matches(/Z$/, { message: "El formato de fecha debe estar en UTC(finalizar en Z)" })
    newDate: string
        
}
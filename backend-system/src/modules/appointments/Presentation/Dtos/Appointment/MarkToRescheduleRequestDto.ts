import { IsNotEmpty, IsString } from "class-validator";

export class markToRescheduleRequestDto{
    
    @IsString()
    @IsNotEmpty()
    appointmentId: string
}
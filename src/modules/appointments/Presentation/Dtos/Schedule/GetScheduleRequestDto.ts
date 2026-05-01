import { IsString, IsNotEmpty, IsISO8601, Matches } from "class-validator";

export class GetScheduleRequestDto {

  @IsString()
  @IsNotEmpty()
  doctorId: string;

  @IsISO8601()
  @Matches(/Z$/, { message: 'El formato de horario debe estar en UTC' })
  date: string;
}
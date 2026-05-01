import { IsString, IsNotEmpty, IsISO8601, Matches } from "class-validator";

export class CreateAppointmentRequestDto {

  @IsString()
  @IsNotEmpty()
  doctorId: string;

  @IsString()
  @IsNotEmpty()
  patientId: string;

  @IsISO8601()
  @Matches(/Z$/, { message:'El formato de horario debe estar en UTC' })
  date: string;
}
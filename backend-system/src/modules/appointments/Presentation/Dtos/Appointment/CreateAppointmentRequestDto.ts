import { IsString, IsNotEmpty, IsISO8601, Matches, IsOptional } from "class-validator";

export class CreateAppointmentRequestDto {

  @IsString()
  @IsOptional()
  doctorId: string;

  @IsString()
  @IsNotEmpty()
  patientId: string;

  @IsISO8601()
  @Matches(/Z$/, { message:'El formato de horario debe estar en UTC' })
  date: string;
}
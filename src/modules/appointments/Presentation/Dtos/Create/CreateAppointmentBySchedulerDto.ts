import { IsISO8601, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateAppointmentBySchedulerDto {
  @IsString()
  @IsNotEmpty()
  patientId: string;

  @IsString()
  @IsNotEmpty()
  doctorId: string;

  @IsISO8601()
  @IsNotEmpty()
  requestedDate: string; // llega como string HTTP, el controller hace new Date(body.requestedDate)

  @IsString()
  @IsOptional()
  observations?: string;
}
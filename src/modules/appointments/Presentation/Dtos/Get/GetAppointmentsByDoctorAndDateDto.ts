import { IsDateString, IsEnum, IsNotEmpty, IsOptional, IsString } from "class-validator";
import { Status } from "src/modules/appointments/domain/entities/Status";

export class GetAppointmentsByDoctorAndDateDto {
  @IsString()
  @IsNotEmpty()
  doctorId: string;

  @IsDateString()
  @IsNotEmpty()
  date: string; // llega como string HTTP, el controller hace new Date(query.date)

  @IsEnum(Status)
  @IsOptional()
  status?: Status;
}
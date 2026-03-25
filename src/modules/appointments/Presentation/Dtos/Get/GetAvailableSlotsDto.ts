import { IsDateString, IsNotEmpty, IsString } from "class-validator";

export class GetAvailableSlotsDto {
  @IsString()
  @IsNotEmpty()
  doctorId: string;

  @IsDateString()
  @IsNotEmpty()
  date: string; // llega como string HTTP, el controller hace new Date(query.date)
}
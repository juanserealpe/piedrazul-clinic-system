import { IsString, IsNotEmpty, IsISO8601, Matches, IsOptional } from "class-validator";

export class GetScheduleRequestDto {

  @IsString()
  @IsOptional()
  doctorId: string;

  @IsISO8601()
  @Matches(/Z$/, { message: 'El formato de horario debe estar en UTC' })
  date: string;
}
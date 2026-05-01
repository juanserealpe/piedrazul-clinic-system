import { IsString, IsNotEmpty, IsISO8601, Matches } from "class-validator";

export class GetAppointmentsRequestDto {

  @IsString()
  @IsNotEmpty()
  doctorId: string;

  @IsISO8601()
  @Matches(/Z$/, { message: "date must be in UTC format (end with Z)" })
  date: string;
}
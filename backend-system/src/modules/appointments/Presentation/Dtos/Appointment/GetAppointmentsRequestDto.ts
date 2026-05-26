import { IsString, IsNotEmpty, IsISO8601, Matches } from "class-validator";

export class GetAppointmentsRequestDto {

  @IsString()
  @IsNotEmpty()
  doctorId: string;

  @IsISO8601()
  @Matches(/Z$/, { message: "El formato de fecha debe estar en UTC(finalizar en Z)" })
  date: string;
}
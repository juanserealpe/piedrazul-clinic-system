// Agregar este metodo al archivo AppointmentController.ts existente
// Ubicacion: backend-system/src/modules/appointments/Presentation/Controller/AppointmentController.ts
//
// Importar Status si no esta importado:
// import { Status } from "../../domain/entities/Status";
//
// Agregar el metodo dentro de la clase AppointmentController:

/*
  @Patch("cancel")
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtGuard, RolesGuard)
  @Roles("PATIENT")
  async cancelByPatient(
    @Body() body: CancelAppointmentRequestDto,
    @Req() req
  ) {
    const patientId = req.user.preferred_username;
    return await this.cancelAppointmentUseCase.execute({
      appointmentId: body.appointmentId,
      patientId,
    });
  }
*/

// backend-system/src/modules/appointments/Presentation/Dtos/Appointment/CancelAppointmentRequestDto.ts

import { IsString, IsNotEmpty } from "class-validator";

export class CancelAppointmentRequestDto {
  @IsString()
  @IsNotEmpty()
  appointmentId: string;
}
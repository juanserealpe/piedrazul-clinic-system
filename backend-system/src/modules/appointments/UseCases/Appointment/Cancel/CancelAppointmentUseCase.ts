import { AppointmentRepository } from "../../../domain/Repositories/AppointmentRepository";
import { Status } from "../../../domain/entities/Status";
import { AppError } from "../../../../../common/errors/app-error.factory";

export interface CancelAppointmentInput {
  appointmentId: string;
  patientId: string;
}

export interface CancelAppointmentOutput {
  appointmentId: string;
  status: string;
  message: string;
}

/**
 * Caso de uso: cancelar una cita médica por parte del paciente.
 * Solo se pueden cancelar citas en estado SCHEDULED o RESCHEDULED.
 */
export class CancelAppointmentUseCase {
  constructor(private readonly appointmentRepository: AppointmentRepository) {}

  async execute(input: CancelAppointmentInput): Promise<CancelAppointmentOutput> {
    const appointment = await this.appointmentRepository.findById(input.appointmentId);

    if (!appointment) {
      throw AppError.notFound("Appointment not found");
    }

    if (appointment.patientId !== input.patientId) {
      throw AppError.forbidden("You can only cancel your own appointments");
    }

    if (
      appointment.status !== Status.SCHEDULED &&
      appointment.status !== Status.RESCHEDULED
    ) {
      throw AppError.badRequest("Only SCHEDULED or RESCHEDULED appointments can be cancelled");
    }

    appointment.status = Status.CANCELLED;
    await this.appointmentRepository.save(appointment);

    // Guard: id nunca es null aquí porque el appointment ya existe en BD
    if (!appointment.id) {
      throw new Error("Unexpected: saved appointment has no id");
    }

    return {
      appointmentId: appointment.id,
      status: appointment.status,
      message: "Appointment cancelled successfully",
    };
  }
}
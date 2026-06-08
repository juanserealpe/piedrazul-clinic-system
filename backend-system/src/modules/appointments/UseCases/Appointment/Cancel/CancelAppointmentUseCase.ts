import { AppointmentRepository } from "../../../domain/Repositories/AppointmentRepository";
import { Status } from "../../../domain/entities/Status";
import { AppError } from "../../../../../common/errors/app-error.factory";

export interface CancelAppointmentInput {
  appointmentId: string;
  patientId: string;
}

export interface CancelByStaffInput {
  appointmentId: string;
  staffId: string;
}

export interface CancelAppointmentOutput {
  appointmentId: string;
  status: string;
  message: string;
}

/**
 * Caso de uso: cancelar una cita médica.
 * - Por paciente: solo sus propias citas SCHEDULED o RESCHEDULED.
 * - Por staff (médico/agendador): cualquier cita SCHEDULED o RESCHEDULED.
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

    if (!appointment.id) {
      throw new Error("Unexpected: saved appointment has no id");
    }

    return {
      appointmentId: appointment.id,
      status: appointment.status,
      message: "Appointment cancelled successfully",
    };
  }

  async executeByStaff(input: CancelByStaffInput): Promise<CancelAppointmentOutput> {
    const appointment = await this.appointmentRepository.findById(input.appointmentId);

    if (!appointment) {
      throw AppError.notFound("Cita no encontrada");
    }

    if (
      appointment.status !== Status.SCHEDULED &&
      appointment.status !== Status.RESCHEDULED
    ) {
      throw AppError.badRequest("Solo se pueden cancelar citas en estado Programada o Reagendada");
    }

    appointment.status = Status.CANCELLED;
    await this.appointmentRepository.save(appointment);

    if (!appointment.id) {
      throw new Error("Unexpected: saved appointment has no id");
    }

    return {
      appointmentId: appointment.id,
      status: appointment.status,
      message: "Cita cancelada correctamente",
    };
  }
}
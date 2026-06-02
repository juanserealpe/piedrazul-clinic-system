import { Injectable, Inject } from "@nestjs/common";
import { APPOINTMENT_REPOSITORY } from "../../../../appointments.module";
import type { AppointmentRepository } from "../../../../domain/Repositories/AppointmentRepository";

@Injectable()
export class GetAppointmentsByPatient {
  constructor(
    @Inject(APPOINTMENT_REPOSITORY)
    private readonly appointmentRepo: AppointmentRepository,
  ) {}

  async execute(patientId: string) {
    const appointments = await this.appointmentRepo.findByPatientId(patientId);
    return {
      count: appointments.length,
      appointments: appointments.map((a) => ({
        appointmentId: a.id,
        date: a.date,
        doctorId: a.doctorId,
        status: a.status,
      })),
    };
  }
}
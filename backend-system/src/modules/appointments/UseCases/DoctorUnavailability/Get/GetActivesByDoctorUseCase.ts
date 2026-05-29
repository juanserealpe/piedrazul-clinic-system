import { DoctorUnavailability } from "../../../domain/entities/DoctorUnavailability";
import { DoctorUnavailabilityRepository } from "../../../domain/Repositories/DoctorUnavailabilityRepository";

export class GetActivesByDoctorUseCase{
  constructor(
    private readonly doctorUnavailabilityRepository:
      DoctorUnavailabilityRepository
  ) {}

  async execute(
    pDoctorId: string
  ): Promise<DoctorUnavailability[]> {

    const vCurrentDate = new Date();

    return this.doctorUnavailabilityRepository
      .findActiveUpcomingByDoctorId(
        pDoctorId,
        vCurrentDate
      );
  }
}
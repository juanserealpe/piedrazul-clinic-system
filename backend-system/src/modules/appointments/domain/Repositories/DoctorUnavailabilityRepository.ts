import { DoctorUnavailability } from "../entities/DoctorUnavailability";

export interface DoctorUnavailabilityRepository{
    findActiveByDoctorIdAndDate(pDoctorId: string, pDate: Date)
    : Promise<DoctorUnavailability| null>;

    findActiveByDoctorIdAndDateRange(pDoctorId: string, pStartDate: Date, pEndDate: Date)
        : Promise<DoctorUnavailability[]>

    save(pNewDoctorUnavailability: DoctorUnavailability)
    : Promise<DoctorUnavailability>;

    findActiveUpcomingByDoctorId(pDoctorId: string, pDate: Date)
    : Promise<DoctorUnavailability[]>;
}
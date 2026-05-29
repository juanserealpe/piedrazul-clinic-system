import { DoctorUnavailability } from "../../domain/entities/DoctorUnavailability";
import { DoctorUnavailabilityOrmEntity } from "../Entities/DoctorUnavailabilityOrmEntity";

export class DoctorUnavailabilityPersistenceMapper{
    static toDomain(pOrm: DoctorUnavailabilityOrmEntity): DoctorUnavailability{
        return new DoctorUnavailability(
            pOrm.id,
            pOrm.doctorId,
            new Date(pOrm.startDate),
            new Date(pOrm.endDate),
            pOrm.reason,
            new Date(pOrm.createdAt),
            pOrm.isActive,
        );
    }

    static toOrm(pEntity: DoctorUnavailability): DoctorUnavailabilityOrmEntity{
        const orm = new DoctorUnavailabilityOrmEntity();
        null;
        orm.doctorId = pEntity.doctorId;
        orm.startDate = pEntity.startDate.toISOString();
        orm.endDate = pEntity.endDate.toISOString();
        orm.reason = pEntity.reason;
        orm.createdAt = pEntity.createdAt.toISOString();
        orm.isActive = pEntity.isActive;
        return orm;
    }
}
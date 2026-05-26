import { AppointmentSchedule } from "../../domain/entities/AppointmentSchedule";
import { AppointmentScheduleOrmEntity } from "../Entities/AppointmentScheduleOrmEntity";

export class AppointmentSchedulePersistenceMapper{
    static toDomain(pOrm: AppointmentScheduleOrmEntity,): AppointmentSchedule {
        return new AppointmentSchedule(
            pOrm.id,
            pOrm.scheduledBy,
            pOrm.scheduledDate,
            pOrm.createdAt
        )
    }
    
    static toOrm(pDomain: AppointmentSchedule): AppointmentScheduleOrmEntity{
        const vOrm = new AppointmentScheduleOrmEntity();
        if(pDomain.id) {
            vOrm.id = pDomain.id;
        }
        vOrm.scheduledBy = pDomain.scheduledBy;
        vOrm.scheduledDate = pDomain.scheduledDate;
        vOrm.createdAt = pDomain.createdAt;
        return vOrm;

    }
}

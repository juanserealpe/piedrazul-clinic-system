import { Appointment } from "../../domain/entities/Appointment.entity";
import { AppointmentOrmEntity } from "../Entities/AppointmentOrmEntity";
import { AppointmentSchedulePersistenceMapper } from "./AppointmentSchedulePersistenceMapper";

export class AppointmentPersistenceMapper {
  static toDomain(pOrm: AppointmentOrmEntity): Appointment {
    return new Appointment(
      pOrm.id,
      pOrm.patientId,
      pOrm.doctorId,
      pOrm.observations,
      pOrm.history?.map(
        AppointmentSchedulePersistenceMapper.toDomain,
      ) ?? [],
      new Date(pOrm.date),
      pOrm.status
    );
  }

  static toOrm(pDomain: Appointment): AppointmentOrmEntity {
    const vOrm = new AppointmentOrmEntity();
    // ✅ CORREGIDO: se asigna el id para que TypeORM haga UPDATE y no INSERT
    if (pDomain.id) vOrm.id = pDomain.id;
    vOrm.patientId    = pDomain.patientId;
    vOrm.doctorId     = pDomain.doctorId;
    vOrm.observations = pDomain.observations;
    vOrm.status       = pDomain.status;
    vOrm.date         = pDomain.date.toISOString();
    vOrm.history      = pDomain.getHistory().map(
      AppointmentSchedulePersistenceMapper.toOrm,
    );
    return vOrm;
  }
}
import { Appointment } from "../../domain/entities/Appointment.entity";
import { AppointmentOrmEntity } from "../Entities/AppointmentOrmEntity";

export class AppointmentMapper {
  static toDomain(orm: AppointmentOrmEntity): Appointment {
    return new Appointment(
      orm.id,
      orm.patientId,
      orm.doctorId,
      new Date(orm.date),
      orm.observations,
      orm.status
    );
  }

  static toOrm(domain: Appointment): AppointmentOrmEntity {
    const orm = new AppointmentOrmEntity();
    orm.id = domain.id;
    orm.patientId = domain.patientId;
    orm.doctorId = domain.doctorId;
    orm.date = domain.date;
    orm.observations = domain.observations;
    orm.status = domain.status;
    return orm;
  }
}

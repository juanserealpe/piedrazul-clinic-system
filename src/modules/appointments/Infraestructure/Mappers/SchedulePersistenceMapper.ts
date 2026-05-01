import { Schedule } from "../../domain/entities/Schedule.entity";
import { ScheduleOrmEntity } from "../Entities/ScheduleOrmEntity";

export class SchedulePersistenceMapper {
  static toDomain(orm: ScheduleOrmEntity): Schedule {
    return new Schedule(
      orm.id,
      orm.doctorId,
      orm.day,
      orm.startHour,
      orm.endHour,
      orm.interval,
      orm.isActive
    );
  }

  static toOrm(domain: Schedule): ScheduleOrmEntity {
    const orm = new ScheduleOrmEntity();
    orm.id = domain.id;
    orm.doctorId = domain.doctorId;
    orm.day = domain.day;
    orm.startHour = domain.startHour;
    orm.endHour = domain.endHour;
    orm.interval = domain.interval;
    orm.isActive = domain.isActive;
    return orm;
  }
}

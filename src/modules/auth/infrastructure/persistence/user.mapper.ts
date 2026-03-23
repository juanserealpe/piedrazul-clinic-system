import { User } from "../../domain/entities/user.entity";
import { Doctor } from "../../domain/entities/doctor.entity";
import { Account } from "../../domain/entities/account.entity";
import {
  Schedule,
  AvailabilitySlot,
} from "../../domain/entities/availabilitySlot.entity";
import { RoleName } from "../../domain/entities/role.entity";
import { GenderEnum } from "../../domain/enums/gender.enum";
import { UserOrmEntity } from "./user.orm-entity";
import { DoctorOrmEntity } from "./doctor.orm-entity";
import { AccountOrmEntity } from "./account.orm-entity";
import { AvailabilitySlotOrmEntity } from "./availability-slot.orm-entity";

export class UserMapper {
  // ─────────────────────────────────────────────
  // ORM → Domain
  // ─────────────────────────────────────────────

  static toDomain(entity: UserOrmEntity): User {
    if (entity instanceof DoctorOrmEntity) {
      return UserMapper.toDoctorDomain(entity);
    }
    return new User(
      entity.id,
      entity.email,
      entity.phone_number,
      new Date(entity.born_date),
      entity.names,
      entity.lastnames,
      entity.gender as GenderEnum,
      entity.account ? UserMapper.toAccountDomain(entity.account) : undefined,
    );
  }

  static toDoctorDomain(entity: DoctorOrmEntity): Doctor {
    const schedule = new Schedule();
    if (entity.slots) {
      entity.slots.forEach((slot) => {
        schedule.addSlot(
          new AvailabilitySlot(
            slot.date,
            slot.startTime,
            slot.endTime,
            slot.status as "available" | "unavailable" | "busy",
          ),
        );
      });
    }

    return new Doctor(
      entity.id,
      entity.email,
      entity.phone_number,
      new Date(entity.born_date),
      entity.names,
      entity.lastnames,
      entity.gender as GenderEnum,
      UserMapper.toAccountDomain(entity.account),
      schedule,
      entity.averageAppointmentDuration ?? 20,
    );
  }

  static toAccountDomain(entity: AccountOrmEntity): Account {
    return new Account(entity.id, entity.password, entity.roles as RoleName[]);
  }

  // ─────────────────────────────────────────────
  // Domain → ORM
  // ─────────────────────────────────────────────

  static toOrm(user: User): UserOrmEntity {
    if (user instanceof Doctor) {
      return UserMapper.toDoctorOrm(user);
    }

    const entity = new UserOrmEntity();
    entity.id = user.id;
    entity.email = user.email;
    entity.phone_number = user.phone_number;
    entity.born_date = user.born_date;
    entity.names = user.names;
    entity.lastnames = user.lastnames;
    entity.gender = user.gender;
    if (user.account) {
      entity.account = UserMapper.toAccountOrm(user.account);
    }
    return entity;
  }

  static toDoctorOrm(doctor: Doctor): DoctorOrmEntity {
    const entity = new DoctorOrmEntity();
    entity.id = doctor.id;
    entity.email = doctor.email;
    entity.phone_number = doctor.phone_number;
    entity.born_date = doctor.born_date;
    entity.names = doctor.names;
    entity.lastnames = doctor.lastnames;
    entity.gender = doctor.gender;
    entity.account = UserMapper.toAccountOrm(doctor.account);
    entity.averageAppointmentDuration = doctor.averageAppointmentDuration;

    entity.slots = (doctor.schedule?.slots ?? []).map((slot) => {
      const slotEntity = new AvailabilitySlotOrmEntity();
      slotEntity.date = slot.date;
      slotEntity.startTime = slot.startTime;
      slotEntity.endTime = slot.endTime;
      slotEntity.status = slot.status;
      return slotEntity;
    });

    return entity;
  }

  static toAccountOrm(account: Account): AccountOrmEntity {
    const entity = new AccountOrmEntity();
    entity.id = account.id;
    entity.password = account.password;
    entity.roles = account.roles;
    return entity;
  }
}

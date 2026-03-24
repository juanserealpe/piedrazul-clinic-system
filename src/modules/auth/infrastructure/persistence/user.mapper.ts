import { User } from "../../domain/entities/user.entity";
import { Doctor } from "../../domain/entities/doctor.entity";
import { Account } from "../../domain/entities/account.entity";
import { RoleName } from "../../domain/entities/role.entity";
import { GenderEnum } from "../../domain/enums/gender.enum";
import { UserOrmEntity } from "./user.orm-entity";
import { DoctorOrmEntity } from "./doctor.orm-entity";
import { AccountOrmEntity } from "./account.orm-entity";

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

  static toDoctorDomain(doctorEntity: DoctorOrmEntity): Doctor {
    const user = doctorEntity.user;
    return new Doctor(
      user.id,
      user.email,
      user.phone_number,
      new Date(user.born_date),
      user.names,
      user.lastnames,
      user.gender as GenderEnum,
      UserMapper.toAccountDomain(user.account),
      doctorEntity.averageAppointmentDuration ?? 20,
    );
  }

  static toAccountDomain(entity: AccountOrmEntity): Account {
    return new Account(entity.id, entity.password, entity.roles as RoleName[]);
  }

  // ─────────────────────────────────────────────
  // Domain → ORM
  // ─────────────────────────────────────────────

  static toOrm(user: User): UserOrmEntity {
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
    const userEntity = UserMapper.toOrm(doctor);
    const doctorEntity = new DoctorOrmEntity();
    doctorEntity.user_id = doctor.id;
    doctorEntity.user = userEntity;
    doctorEntity.averageAppointmentDuration = doctor.averageAppointmentDuration;

    return doctorEntity;
  }

  static toAccountOrm(account: Account): AccountOrmEntity {
    const entity = new AccountOrmEntity();
    entity.id = account.id;
    entity.password = account.password;
    entity.roles = account.roles;
    return entity;
  }
}

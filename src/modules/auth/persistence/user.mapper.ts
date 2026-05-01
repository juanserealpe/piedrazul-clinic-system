import { UserOrmEntity } from "./user.orm-entity";

export class UserMapper {

  static toResponse(entity: UserOrmEntity) {
    return {
      id: entity.id,
      uuid: entity.uuid,
      email: entity.email,
      names: entity.names,
      lastnames: entity.lastnames,
      gender: entity.gender,
      phoneNumber: entity.phone_number,
      bornDate: entity.born_date,
    };
  }

  static toOrm(data: {
    id: string;
    uuid: string;
    email: string;
    names: string;
    lastnames: string;
    gender: string;
    phoneNumber: string;
    bornDate: Date;
  }): UserOrmEntity {
    const entity = new UserOrmEntity();

    entity.id = data.id;
    entity.uuid = data.uuid;
    entity.email = data.email;
    entity.names = data.names;
    entity.lastnames = data.lastnames;
    entity.gender = data.gender as any;
    entity.phone_number = data.phoneNumber;
    entity.born_date = data.bornDate;

    return entity;
  }
}
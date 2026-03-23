import { RoleName } from "../../domain/entities/role.entity";
import { GenderEnum } from "../../domain/enums/gender.enum";

export class UserResponseDto {
  id!: string;
  email!: string;
  phone_number!: string;
  born_date!: Date;
  names!: string;
  lastnames!: string;
  gender!: GenderEnum;
  account!: {
    id: string;
    roles: RoleName[];
  };
}

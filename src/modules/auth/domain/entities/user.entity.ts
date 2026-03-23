import { Account } from "./account.entity";
import { GenderEnum } from "../enums/gender.enum";

export class User {
  constructor(
    public readonly id: string,
    public readonly email: string,
    public readonly phone_number: string,
    public readonly born_date: Date,
    public readonly names: string,
    public readonly lastnames: string,
    public readonly gender: GenderEnum,
    public readonly account?: Account,
  ) {}
}

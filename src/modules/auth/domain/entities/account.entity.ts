import { RoleName } from "./role.entity";

export class Account {
  constructor(
    public readonly id: string,
    public readonly password: string,
    public readonly roles: RoleName[],
  ) {}
}

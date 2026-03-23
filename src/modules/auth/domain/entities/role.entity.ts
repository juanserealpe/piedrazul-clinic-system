export type RoleName = "ADMIN" | "DOCTOR" | "PATIENT";

export class Role {
  constructor(
    public readonly id: string,
    public readonly name: RoleName,
  ) {}
}

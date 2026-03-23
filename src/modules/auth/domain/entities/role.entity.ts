export enum RoleName {
  ADMIN = "ADMIN",
  DOCTOR = "DOCTOR",
  PATIENT = "PATIENT",
  SCHEDULER = "SCHEDULER",
}
export class Role {
  constructor(
    public readonly id: string,
    public readonly name: RoleName,
  ) {}
}

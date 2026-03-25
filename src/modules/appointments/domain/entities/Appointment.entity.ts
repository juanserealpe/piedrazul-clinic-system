import { Status } from "./Status";

export class Appointment {
  constructor(
    public readonly id: string,
    public readonly patientId: string,
    public readonly doctorId: string,
    public readonly date: Date,
    public readonly observations: string,
    public status: Status
  ) {}

  isOnSameDay(pDate: Date): boolean {
    return (
      this.date.getFullYear() === pDate.getFullYear() &&
      this.date.getMonth() === pDate.getMonth() &&
      this.date.getDate() === pDate.getDate()
    );
  }

  overlaps(pDate: Date): boolean {
    return this.date.getTime() === pDate.getTime();
  }

  isActive(): boolean {
    return this.status === Status.SCHEDULED;
  }

  reschedule(pNewDate: Date): Date {
    if (this.status !== Status.SCHEDULED)
      throw new Error('Only scheduled appointments can be rescheduled');

    this.status = Status.CANCELLED;
    return pNewDate;
  }
}

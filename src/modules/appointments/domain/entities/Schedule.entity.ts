import { getDayOfWeek } from "../../Utilities";
import { DayOfWeek } from "./DaysOfWeek";

export class Schedule {
  constructor(
    public readonly id: string,
    public readonly doctorId: string,
    public readonly day: DayOfWeek,
    public readonly startHour: number,
    public readonly endHour: number,
    public interval: number,
    public isActive: boolean = true
  ) {
    this.validate();
  }
  
  isSameDay(pDate: Date): boolean {
    return getDayOfWeek(pDate) === this.day;
  }
  
  isWithinWorkingHours(pDate: Date): boolean {
    const vHour = pDate.getUTCHours();
    return vHour >= this.startHour && vHour < this.endHour;
  }

  generateTimeSlots(pDate: Date): Date[] {
    const vSlots: Date[] = [];
    if (!this.isSameDay(pDate)) return vSlots;

    const vStart = new Date(pDate);
    vStart.setUTCHours(this.startHour, 0, 0, 0);

    const vEnd = new Date(pDate);
    vEnd.setUTCHours(this.endHour, 0, 0, 0);

    let vCurrent = new Date(vStart);
    while (vCurrent < vEnd) {
      vSlots.push(new Date(vCurrent));
      vCurrent.setUTCMinutes(vCurrent.getUTCMinutes() + this.interval);
    }

    return vSlots;
  }

  getAvailableSlots(pDate: Date, pTakenDates: Date[]): Date[] {
    const vAllSlots = this.generateTimeSlots(pDate);
    const vTakenTimes = new Set(pTakenDates.map(d => d.getTime()));
    return vAllSlots.filter(slot => !vTakenTimes.has(slot.getTime()));
  }

  containsSlot(pDate: Date): boolean {
    if (!this.isSameDay(pDate)) return false;
    if (!this.isWithinWorkingHours(pDate)) return false;

    const vMinutes = pDate.getUTCMinutes();
    return vMinutes % this.interval === 0;
  }

  overlaps(pOther: Schedule): boolean {
    if (this.day !== pOther.day) return false;
    return this.startHour < pOther.endHour && this.endHour > pOther.startHour;
  }

  private validate(): void {
    if (this.startHour >= this.endHour) {
      throw new Error("startHour must be less than endHour");
    }
    if (this.startHour < 0 || this.endHour > 23) {
      throw new Error("Invalid hour range");
    }
    if (this.interval <= 0) {
      throw new Error("Interval must be greater than 0");
    }
  }
}
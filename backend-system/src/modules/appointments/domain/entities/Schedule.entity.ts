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
    const hour = pDate.getUTCHours();
    return hour >= this.startHour && hour < this.endHour;
  }

  generateTimeSlots(pDate: Date): Date[] {
    if (!this.isSameDay(pDate)) return [];

    const slots: Date[] = [];
    const start = new Date(pDate);
    start.setUTCHours(this.startHour, 0, 0, 0);
    
    const end = new Date(pDate);
    end.setUTCHours(this.endHour, 0, 0, 0);

    let current = new Date(start);
    while (current < end) {
      slots.push(new Date(current));
      current.setUTCMinutes(current.getUTCMinutes() + this.interval);
    }

    return slots;
  }

  getAvailableSlots(pDate: Date, pTakenDates: Date[]): Date[] {
    const allSlots = this.generateTimeSlots(pDate);
    if (allSlots.length === 0) return [];
    
    const takenTimes = new Set(pTakenDates.map(d => d.getTime()));
    return allSlots.filter(slot => !takenTimes.has(slot.getTime()));
  }

  containsSlot(pDate: Date): boolean {
    return this.isSameDay(pDate) && 
           this.isWithinWorkingHours(pDate) && 
           pDate.getUTCMinutes() % this.interval === 0;
  }

  overlaps(pOther: Schedule): boolean {
    return this.day === pOther.day && 
           this.startHour < pOther.endHour && 
           this.endHour > pOther.startHour;
  }

  private validate(): void {
    if (this.startHour >= this.endHour) {
      throw new Error("startHour must be less than endHour");
    }
    if (this.startHour < 0 || this.endHour > 23) {
      throw new Error("Invalid hour range (0-23)");
    }
    if (this.interval <= 0 || this.interval > 60) {
      throw new Error("Interval must be between 1 and 60 minutes");
    }
  }
}
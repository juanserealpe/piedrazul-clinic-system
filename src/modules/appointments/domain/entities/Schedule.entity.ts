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
  ) {}
  
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

  desactivate() {
    this.isActive = false;
  }
  
  reactivate(){
    this.isActive = true;
  }

  changeInterval(newInterval: number){
    if(newInterval < 0 || newInterval > 60) 
      throw new Error("Interval (0-60)");
    else 
      this.interval = newInterval;
  }
}
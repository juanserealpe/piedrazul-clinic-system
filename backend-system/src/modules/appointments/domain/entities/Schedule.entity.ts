import { AppError } from "src/common/errors/app-error.factory";
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
    if (!this.isActive) return [];
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
    if (!this.isActive) return [];
    const allSlots = this.generateTimeSlots(pDate);
    if (allSlots.length === 0) return [];

    const takenTimes = new Set(pTakenDates.map(d => d.getTime()));
    return allSlots.filter(slot => !takenTimes.has(slot.getTime()));
  }

  containsSlot(pDate: Date): boolean {
    if (!this.isActive) return false;
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
      // CORRECCIÓN: mensaje explícito que coincide con el test
      throw new Error("startHour must be less than endHour");
    }
    // ── CORRECCIÓN Bug 7: endHour puede ser 24 (medianoche) ──────────────
    // El DTO permite Max(24) para representar "hasta medianoche".
    // La validación original bloqueaba endHour > 23, contradiciendo el DTO.
    if (this.startHour < 0 || this.endHour > 24) {
      throw AppError.invalidInterval();
    }
    // ─────────────────────────────────────────────────────────────────────
    if (this.interval <= 0 || this.interval > 60) {
      throw AppError.invalidInterval();
    }
    if (!this.isIntervalCompatible()) {
      throw AppError.invalidInterval();
    }
  }

  private isIntervalCompatible(): boolean {
    const vDurationMinutes =
      (this.endHour - this.startHour) * 60;

    return vDurationMinutes % this.interval === 0;
  }
}
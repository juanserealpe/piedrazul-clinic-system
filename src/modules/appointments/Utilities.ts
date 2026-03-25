import { DayOfWeek } from "./domain/entities/DaysOfWeek";

  export function getDayOfWeek(pDate: Date): DayOfWeek {
    const vDayMap: Record<number, DayOfWeek> = {
      0: DayOfWeek.SUNDAY,
      1: DayOfWeek.MONDAY,
      2: DayOfWeek.TUESDAY,
      3: DayOfWeek.WEDNESDAY,
      4: DayOfWeek.THURSDAY,
      5: DayOfWeek.FRIDAY,
      6: DayOfWeek.SATURDAY,
    };
    return vDayMap[pDate.getUTCDay()];
  }

export function parseLocalDate(pDateStr: string): Date {
  const [vYear, vMonth, vDay] = pDateStr.split("-").map(Number);
  return new Date(Date.UTC(vYear, vMonth - 1, vDay));
}

export function getDayRange(pDate: Date) {
  const vStart = new Date(pDate);
  vStart.setUTCHours(0, 0, 0, 0);

  const vEnd = new Date(pDate);
  vEnd.setUTCHours(23, 59, 59, 999);

  return { vStart, vEnd };
}
export enum DayOfWeek {
  MONDAY = "MONDAY",
  TUESDAY = "TUESDAY",
  WEDNESDAY = "WEDNESDAY",
  THURSDAY = "THURSDAY",
  FRIDAY = "FRIDAY",
  SATURDAY = "SATURDAY",
  SUNDAY = "SUNDAY"
}

export const getDayInSpanish = (pDay: DayOfWeek): string => {
  const vMap: Record<DayOfWeek, string> = {
    [DayOfWeek.MONDAY]: 'LUNES',
    [DayOfWeek.TUESDAY]: 'MARTES',
    [DayOfWeek.WEDNESDAY]: 'MIERCOLES',
    [DayOfWeek.THURSDAY]: 'JUEVES',
    [DayOfWeek.FRIDAY]: 'VIERNES',
    [DayOfWeek.SATURDAY]: 'SABADO',
    [DayOfWeek.SUNDAY]: 'DOMINGO',
  };

  return vMap[pDay];
};
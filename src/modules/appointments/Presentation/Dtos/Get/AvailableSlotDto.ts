export interface AvailableSlotDto {
  time: Date;
  isoString: string;
  label: string; // ej: "09:00", "09:30" — útil directo en el frontend
}
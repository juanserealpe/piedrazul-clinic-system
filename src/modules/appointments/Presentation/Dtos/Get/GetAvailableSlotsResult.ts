import { AvailableSlotDto } from "./AvailableSlotDto";

export interface GetAvailableSlotsResult {
  doctorId: string;
  date: Date;
  scheduleId: string;
  interval: number;      // en minutos
  slots: AvailableSlotDto[];
  totalAvailable: number;
}
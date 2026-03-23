// Cada bloque de disponibilidad
export class AvailabilitySlot {
  constructor(
    public readonly date: string, // Ej: "2026-03-22"
    public readonly startTime: string, // Ej: "08:00"
    public readonly endTime: string, // Ej: "12:00"
    public readonly appointmentDuration: number, // en minutos, Ej: 30
    public status: "available" | "unavailable" | "busy" = "available",
  ) {}
}

// La agenda del doctor será un conjunto de bloques
export class Schedule {
  constructor(public readonly slots: AvailabilitySlot[] = []) {}

  // Método para agregar un bloque
  addSlot(slot: AvailabilitySlot) {
    this.slots.push(slot);
  }

  // Método para bloquear un bloque
  blockSlot(date: string, startTime: string, endTime: string) {
    this.slots.forEach((slot) => {
      if (
        slot.date === date &&
        slot.startTime === startTime &&
        slot.endTime === endTime
      ) {
        slot.status = "unavailable";
      }
    });
  }

  // Obtener bloques disponibles
  getAvailableSlots(): AvailabilitySlot[] {
    return this.slots.filter((slot) => slot.status === "available");
  }
}

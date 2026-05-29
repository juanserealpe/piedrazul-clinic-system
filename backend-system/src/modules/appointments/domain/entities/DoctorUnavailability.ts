
export class DoctorUnavailability {
  constructor(
    public readonly id: string | null,
    public readonly doctorId: string,
    public readonly startDate: Date,
    public readonly endDate: Date,
    public readonly reason: string,
    public readonly createdAt: Date,
    public isActive: boolean = true
  ) {
  }

public validate(): void {

    if (this.endDate.getTime() <= this.startDate.getTime()) {
        throw new Error(
            "La fecha final debe ser mayor a la inicial"
        );
    }
    const vNowUtc = Date.now();
    if (this.startDate.getTime() < vNowUtc) {
        throw new Error("Fecha anterior a hoy");
    }
}

    public isInRange(pDate: Date): boolean {
    return (
        pDate.getTime() >= this.startDate.getTime() &&
        pDate.getTime() <= this.endDate.getTime()
    );
    }
}
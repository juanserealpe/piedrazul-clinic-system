export class Appointment {
  constructor(
    public readonly id: string,
    public readonly patientId: string,
    public readonly doctorId: string,
    public readonly dateTime: Date,
    public status: "SCHEDULED" | "CANCELLED" | "COMPLETED",
  ) {}

  cancel() {
    if (this.status === "CANCELLED") {
      throw new Error("Appointment already cancelled");
    }

    this.status = "CANCELLED";
  }
}

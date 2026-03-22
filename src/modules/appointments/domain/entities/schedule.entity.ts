export class Schedule {
  constructor(
    public readonly doctorId: string,
    public readonly availableDays: string[],
    public readonly startHour: number,
    public readonly endHour: number,
  ) {}

  isAvailable(date: Date): boolean {
    const day = date.toLocaleDateString("en-US", { weekday: "long" });
    const hour = date.getHours();

    return (
      this.availableDays.includes(day) &&
      hour >= this.startHour &&
      hour < this.endHour
    );
  }
}

import { Schedule } from "./Schedule.entity";
import { DayOfWeek } from "./DaysOfWeek";

describe("Schedule Entity", () => {

  const vSchedule = new Schedule(
    "1",
    "doc1",
    DayOfWeek.MONDAY,
    8,
    12,
    30
  );

  const vDateMonday = new Date("2026-05-04T09:00:00Z"); // Monday

  it("should validate working hours", () => {
    expect(vSchedule.isWithinWorkingHours(vDateMonday)).toBe(true);

    const vOutside = new Date("2026-05-04T13:00:00Z");
    expect(vSchedule.isWithinWorkingHours(vOutside)).toBe(false);
  });

  it("should generate correct time slots", () => {
    const vSlots = vSchedule.generateTimeSlots(vDateMonday);

    expect(vSlots.length).toBeGreaterThan(0);
    expect(vSlots[0].getUTCHours()).toBe(8);
  });

  it("should filter available slots correctly", () => {
    const vTaken = [new Date("2026-05-04T08:00:00Z")];

    const vAvailable = vSchedule.getAvailableSlots(vDateMonday, vTaken);

    expect(vAvailable.find(d => d.getTime() === vTaken[0].getTime())).toBeUndefined();
  });

  it("should validate slot containment", () => {
    const vValidSlot = new Date("2026-05-04T08:30:00Z");
    const vInvalidSlot = new Date("2026-05-04T08:15:00Z");

    expect(vSchedule.containsSlot(vValidSlot)).toBe(true);
    expect(vSchedule.containsSlot(vInvalidSlot)).toBe(false);
  });

  it("should detect overlap between schedules", () => {
    const vOther = new Schedule("2", "doc1", DayOfWeek.MONDAY, 10, 14, 30);

    expect(vSchedule.overlaps(vOther)).toBe(true);
  });

  it("should throw error on invalid schedule", () => {
    expect(() => {
      new Schedule("3", "doc1", DayOfWeek.MONDAY, 12, 8, 30);
    }).toThrow("startHour must be less than endHour");
  });

});
import { Appointment } from "./Appointment.entity";
import { Status } from "./Status";

describe("Appointment Entity", () => {

  const vBaseDate = new Date("2026-05-02T10:00:00Z");

  it("should validate same day correctly", () => {
    const vAppointment = new Appointment("1", "p1", "d1", vBaseDate, "", Status.SCHEDULED);

    const vSameDay = new Date("2026-05-02T15:00:00Z");
    const vOtherDay = new Date("2026-05-03T10:00:00Z");

    expect(vAppointment.isOnSameDay(vSameDay)).toBe(true);
    expect(vAppointment.isOnSameDay(vOtherDay)).toBe(false);
  });

  it("should detect overlap correctly", () => {
    const vAppointment = new Appointment("1", "p1", "d1", vBaseDate, "", Status.SCHEDULED);

    expect(vAppointment.overlaps(new Date("2026-05-02T10:00:00Z"))).toBe(true);
    expect(vAppointment.overlaps(new Date("2026-05-02T11:00:00Z"))).toBe(false);
  });

  it("should return active only when scheduled", () => {
    const vActive = new Appointment("1", "p1", "d1", vBaseDate, "", Status.SCHEDULED);
    const vCancelled = new Appointment("2", "p1", "d1", vBaseDate, "", Status.CANCELLED);

    expect(vActive.isActive()).toBe(true);
    expect(vCancelled.isActive()).toBe(false);
  });

  it("should reschedule only if scheduled", () => {
    const vAppointment = new Appointment("1", "p1", "d1", vBaseDate, "", Status.SCHEDULED);

    const vNewDate = new Date("2026-05-03T10:00:00Z");

    const vResult = vAppointment.reschedule(vNewDate);

    expect(vAppointment.status).toBe(Status.CANCELLED);
    expect(vResult).toEqual(vNewDate);
  });

  it("should throw error when rescheduling non scheduled", () => {
    const vAppointment = new Appointment("1", "p1", "d1", vBaseDate, "", Status.CANCELLED);

    expect(() => {
      vAppointment.reschedule(new Date());
    }).toThrow("Only scheduled appointments can be rescheduled");
  });

});
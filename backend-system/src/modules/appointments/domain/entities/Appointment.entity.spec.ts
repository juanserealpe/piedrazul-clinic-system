import { Appointment } from "./Appointment.entity";
import { AppointmentSchedule } from "./AppointmentSchedule";
import { Status } from "./Status";

describe("Appointment Entity", () => {

  // Constructor real: (id, patientId, doctorId, observations, history[], date, status)
  const vBaseDate = new Date("2026-05-02T10:00:00Z");
  const vEmptyHistory: AppointmentSchedule[] = [];

  it("should validate same day correctly", () => {
    const vAppointment = new Appointment(
      "1", "p1", "d1", "",
      vEmptyHistory,
      vBaseDate,
      Status.SCHEDULED
    );

    const vSameDay  = new Date("2026-05-02T15:00:00Z");
    const vOtherDay = new Date("2026-05-03T10:00:00Z");

    expect(vAppointment.isOnSameDay(vSameDay)).toBe(true);
    expect(vAppointment.isOnSameDay(vOtherDay)).toBe(false);
  });

  it("should detect overlap correctly", () => {
    const vAppointment = new Appointment(
      "1", "p1", "d1", "",
      vEmptyHistory,
      vBaseDate,
      Status.SCHEDULED
    );

    // misma fecha/hora → overlap
    expect(vAppointment.overlaps(new Date("2026-05-02T10:00:00Z"))).toBe(true);
    // distinta hora → no overlap
    expect(vAppointment.overlaps(new Date("2026-05-02T11:00:00Z"))).toBe(false);
  });

  it("should return active only when scheduled", () => {
    const vActive = new Appointment(
      "1", "p1", "d1", "",
      vEmptyHistory,
      vBaseDate,
      Status.SCHEDULED
    );
    const vCancelled = new Appointment(
      "2", "p1", "d1", "",
      vEmptyHistory,
      vBaseDate,
      Status.RESCHEDULED   // Status.CANCELLED no existe — el enum usa RESCHEDULED/PENDING_RESCHEDULE
    );

    expect(vActive.isScheduled()).toBe(true);
    expect(vCancelled.isScheduled()).toBe(false);
  });

  it("should reschedule and push to history", () => {
    const vAppointment = new Appointment(
      "1", "p1", "d1", "",
      vEmptyHistory,
      vBaseDate,
      Status.SCHEDULED
    );

    const vNewDate    = new Date("2026-05-03T10:00:00Z");
    const vNewSchedule = new AppointmentSchedule(null, "rescheduler1", vNewDate, new Date());

    vAppointment.reschedule(vNewSchedule);

    // Estado pasa a RESCHEDULED
    expect(vAppointment.status).toBe(Status.RESCHEDULED);
    // Historial tiene la nueva entrada
    expect(vAppointment.getHistory().length).toBe(1);
    expect(vAppointment.getHistory()[0].scheduledDate).toEqual(vNewDate);
  });

  it("should allow rescheduling an already rescheduled appointment", () => {
    const vAppointment = new Appointment(
      "1", "p1", "d1", "",
      vEmptyHistory,
      vBaseDate,
      Status.RESCHEDULED
    );

    const vNewDate     = new Date("2026-05-04T09:00:00Z");
    const vNewSchedule = new AppointmentSchedule(null, "rescheduler1", vNewDate, new Date());

    vAppointment.reschedule(vNewSchedule);

    // Ya era RESCHEDULED, sigue en RESCHEDULED (la guarda no lo sobreescribe)
    expect(vAppointment.status).toBe(Status.RESCHEDULED);
    expect(vAppointment.getHistory().length).toBe(1);
  });

  it("should return correct current date", () => {
    const vAppointment = new Appointment(
      "1", "p1", "d1", "",
      vEmptyHistory,
      vBaseDate,
      Status.SCHEDULED
    );

    expect(vAppointment.getCurrentDate()).toEqual(vBaseDate);
  });

  it("should update current date correctly", () => {
    const vAppointment = new Appointment(
      "1", "p1", "d1", "",
      vEmptyHistory,
      vBaseDate,
      Status.SCHEDULED
    );

    const vUpdated = new Date("2026-05-05T08:00:00Z");
    vAppointment.updateCurrentDate(vUpdated);

    expect(vAppointment.getCurrentDate()).toEqual(vUpdated);
  });
});
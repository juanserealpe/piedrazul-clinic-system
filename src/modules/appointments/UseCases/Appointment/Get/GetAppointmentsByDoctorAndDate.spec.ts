import { Appointment } from "src/modules/appointments/domain/entities/Appointment.entity";
import { GetAppointmentsByDoctorAndDate } from "./GetAppointmentsByDoctorAndDate";
import { Status } from "src/modules/appointments/domain/entities/Status";

describe("GetAppointmentsByDoctorAndDate", () => {

  let vUseCase: GetAppointmentsByDoctorAndDate;
  let vRepo: any;

  beforeEach(() => {
    vRepo = {
      findByDoctorStatusAndDateRange: jest.fn(),
    };

    vUseCase = new GetAppointmentsByDoctorAndDate(vRepo);
  });

    it("should return appointments", async () => {

    const vAppointment = new Appointment(
        "1",
        "patient1",
        "doc1",
        new Date("2026-05-04T10:00:00Z"),
        "",
        Status.SCHEDULED
    );

    vRepo.findByDoctorStatusAndDateRange.mockResolvedValue([vAppointment]);

    const vResult = await vUseCase.execute({
        doctorId: "doc1",
        date: new Date(),
    });

    expect(vResult).toBeDefined();
    });
  it("should throw on invalid input", async () => {
    await expect(
      vUseCase.execute({ doctorId: "", date: null as any })
    ).rejects.toThrow();
  });

});
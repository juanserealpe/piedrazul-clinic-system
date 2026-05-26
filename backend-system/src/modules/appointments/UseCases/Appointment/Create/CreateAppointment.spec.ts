import { CreateAppointment } from "./CreateAppointment";

describe("CreateAppointment UseCase", () => {

  let vUseCase: CreateAppointment;
  let vAppointmentRepo: any;
  let vScheduleRepo: any;

  beforeEach(() => {
    vAppointmentRepo = {
      findByDoctorStatusAndDateRange: jest.fn(),
      save: jest.fn(),
    };

    vScheduleRepo = {
      findByDoctorAndDay: jest.fn(),
    };

    vUseCase = new CreateAppointment(vAppointmentRepo, vScheduleRepo);
  });

  const vInput = {
    doctorId: "doc1",
    patientId: "p1",
    date: new Date("2026-05-04T08:00:00Z"),
  };

  it("should create appointment successfully", async () => {

    vScheduleRepo.findByDoctorAndDay.mockResolvedValue([
      { startHour: 8, endHour: 12, interval: 30 }
    ]);

    vAppointmentRepo.findByDoctorStatusAndDateRange.mockResolvedValue([]);
    vAppointmentRepo.save.mockResolvedValue({ id: "1" });

    const vResult = await vUseCase.execute(vInput);

    expect(vResult).toBeDefined();
  });

  it("should throw if no schedule exists", async () => {
    vScheduleRepo.findByDoctorAndDay.mockResolvedValue([]);

    await expect(vUseCase.execute(vInput))
      .rejects.toThrow();
  });

  it("should throw if interval is invalid", async () => {

    vScheduleRepo.findByDoctorAndDay.mockResolvedValue([
      { startHour: 8, endHour: 12, interval: 30 }
    ]);

    const vBadInput = {
      ...vInput,
      date: new Date("2026-05-04T08:15:00Z"),
    };

    await expect(vUseCase.execute(vBadInput))
      .rejects.toThrow();
  });

  it("should throw if appointment already exists", async () => {

    vScheduleRepo.findByDoctorAndDay.mockResolvedValue([
      { startHour: 8, endHour: 12, interval: 30 }
    ]);

    vAppointmentRepo.findByDoctorStatusAndDateRange.mockResolvedValue([
      { overlaps: () => true }
    ]);

    await expect(vUseCase.execute(vInput))
      .rejects.toThrow();
  });

});
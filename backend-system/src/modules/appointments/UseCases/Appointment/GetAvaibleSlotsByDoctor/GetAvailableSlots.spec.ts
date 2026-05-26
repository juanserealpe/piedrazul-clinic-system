import { GetAvailableSlotsUseCase } from "./GetAvailableSlots";

describe("GetAvailableSlotsUseCase", () => {

  let vUseCase: GetAvailableSlotsUseCase;
  let vScheduleRepo: any;
  let vAppointmentRepo: any;

  beforeEach(() => {
    vScheduleRepo = {
      findByDoctorAndDay: jest.fn(),
    };

    vAppointmentRepo = {
      findByDoctorStatusAndDateRange: jest.fn(),
    };

    vUseCase = new GetAvailableSlotsUseCase(vScheduleRepo, vAppointmentRepo);
  });

  it("should return empty if no schedules", async () => {
    vScheduleRepo.findByDoctorAndDay.mockResolvedValue([]);

    const vResult = await vUseCase.execute({
      doctorId: "doc1",
      date: new Date(),
    });

    expect(vResult.slots.length).toBe(0);
  });

  it("should return available slots", async () => {

    vScheduleRepo.findByDoctorAndDay.mockResolvedValue([
      {
        isActive: true,
        getAvailableSlots: jest.fn().mockReturnValue([
          new Date("2026-05-04T08:00:00Z")
        ])
      }
    ]);

    vAppointmentRepo.findByDoctorStatusAndDateRange.mockResolvedValue([]);

    const vResult = await vUseCase.execute({
      doctorId: "doc1",
      date: new Date("2026-05-04"),
    });

    expect(vResult.slots.length).toBeGreaterThan(0);
  });

});
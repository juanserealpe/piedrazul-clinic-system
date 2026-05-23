import { DayOfWeek } from "src/modules/appointments/domain/entities/DaysOfWeek";
import { CreateScheduleUseCase } from "./CreateScheduleUseCase";

describe("CreateScheduleUseCase", () => {

  let vUseCase: CreateScheduleUseCase;
  let vScheduleRepo: any;
  let vKeycloakService: any;

  beforeEach(() => {
    vScheduleRepo = {
      findByDoctorAndDay: jest.fn(),
      save: jest.fn(),
    };

    vKeycloakService = {}; 

    vUseCase = new CreateScheduleUseCase(
      vScheduleRepo,
      vKeycloakService
    );
  });

  const vInput = {
    doctorId: "doc1",
    day: DayOfWeek.MONDAY,
    startHour: 8,
    endHour: 12,
    interval: 30,
  };

  it("should create schedule successfully", async () => {

    vScheduleRepo.findByDoctorAndDay.mockResolvedValue([]);
    vScheduleRepo.save.mockResolvedValue({ id: "1" });

    const vResult = await vUseCase.execute(vInput);

    expect(vResult).toBeDefined();
    expect(vScheduleRepo.save).toHaveBeenCalled();
  });

  it("should throw error if overlaps with existing schedule", async () => {

    vScheduleRepo.findByDoctorAndDay.mockResolvedValue([
      {
        overlaps: () => true,
        day: "MONDAY",
        startHour: 9,
        endHour: 11,
      }
    ]);

    await expect(vUseCase.execute(vInput))
      .rejects.toThrow();
  });

});
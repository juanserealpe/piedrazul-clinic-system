import { DayOfWeek } from "src/modules/appointments/domain/entities/DaysOfWeek";
import { CreateManySchedulesUseCase } from "./CreateManySchedule";

describe("CreateManySchedulesUseCase", () => {

  let vUseCase: CreateManySchedulesUseCase;
  let vScheduleRepo: any;

  beforeEach(() => {
    vScheduleRepo = {
      findByDoctorAndDay: jest.fn(),
      save: jest.fn(),
    };

    vUseCase = new CreateManySchedulesUseCase(vScheduleRepo);
  });

  const vInput = [
    {
      doctorId: "doc1",
      day: DayOfWeek.MONDAY,
      startHour: 8,
      endHour: 10,
      interval: 30,
    },
    {
      doctorId: "doc1",
      day: DayOfWeek.MONDAY,
      startHour: 10,
      endHour: 12,
      interval: 30,
    },
  ];

  it("should create schedules successfully", async () => {

    vScheduleRepo.findByDoctorAndDay.mockResolvedValue([]);
    vScheduleRepo.save.mockImplementation(s => Promise.resolve(s));

    const vResult = await vUseCase.execute(vInput);

    expect(vResult.length).toBe(2);
    expect(vScheduleRepo.save).toHaveBeenCalledTimes(2);
  });

  it("should throw error if schedules overlap in batch", async () => {

    const vOverlapInput = [
      {
        doctorId: "doc1",
        day: DayOfWeek.MONDAY,
        startHour: 8,
        endHour: 11,
        interval: 30,
      },
      {
        doctorId: "doc1",
        day: DayOfWeek.MONDAY,
        startHour: 10,
        endHour: 12,
        interval: 30,
      },
    ];

    await expect(vUseCase.execute(vOverlapInput))
      .rejects.toThrow("Schedules overlap in batch");
  });

  it("should throw error if overlaps with existing schedules", async () => {

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
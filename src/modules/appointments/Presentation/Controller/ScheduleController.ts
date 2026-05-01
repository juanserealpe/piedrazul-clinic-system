import {
  Controller,
  Post,
  Get,
  Body,
  Query,
  HttpCode,
  HttpStatus,
} from "@nestjs/common";
import { CreateManySchedulesUseCase } from "../../UseCases/Schedule/Create/CreateManySchedule";
import { GetAvailableSlotsUseCase } from "../../UseCases/Schedule/Get/GetAvailableSlots";
import { ScheduleControllerMapper } from "../Mappers/ScheduleControllerMapper";
import { CreateScheduleUseCase } from "../../UseCases/Schedule/Create/CreateScheduleUseCase";

@Controller("schedules")
export class ScheduleController {

  constructor(
    private readonly createScheduleUseCase: CreateScheduleUseCase,
    private readonly createManySchedulesUseCase: CreateManySchedulesUseCase,
    private readonly getAvailableSlotsUseCase: GetAvailableSlotsUseCase
  ) {}

  // -------- CREATE ONE --------
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() body: any) {

    const vInput =
      ScheduleControllerMapper.toCreateInput(body);

    const vResult =
      await this.createScheduleUseCase.execute(vInput);

    return ScheduleControllerMapper.toCreateOutput(vResult);
  }

  // -------- CREATE MANY --------
  @Post("batch")
  @HttpCode(HttpStatus.CREATED)
  async createMany(@Body() body: any[]) {

    const vInputs =
      ScheduleControllerMapper.toCreateManyInput(body);

    const vResults =
      await this.createManySchedulesUseCase.execute(vInputs);

    return vResults.map(r =>
      ScheduleControllerMapper.toCreateOutput(r)
    );
  }

  // -------- GET AVAILABLE SLOTS --------
  @Get("available-slots")
  @HttpCode(HttpStatus.OK)
  async getAvailableSlots(@Query() query: any) {

    const vInput =
      ScheduleControllerMapper.toGetInput(query);

    const vResult =
      await this.getAvailableSlotsUseCase.execute(vInput);

    return ScheduleControllerMapper.toGetOutput(vResult);
  }
}
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
import { CreateScheduleRequestDto } from "../Dtos/Schedule/CreateScheduleRequestDto";
import { CreateManySchedulesRequestDto } from "../Dtos/Schedule/CreateManySchedulesRequestDto";
import { GetScheduleRequestDto } from "../Dtos/Schedule/GetScheduleRequestDto";

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
  async create(@Body() body: CreateScheduleRequestDto) {

    console.log(body);
    const vInput =
      ScheduleControllerMapper.toCreateInput(body);

    const vResult =
      await this.createScheduleUseCase.execute(vInput);

    return ScheduleControllerMapper.toCreateOutput(vResult);
  }

  // -------- CREATE MANY --------
  @Post("batch")
  @HttpCode(HttpStatus.CREATED)
  async createMany(@Body() body: CreateManySchedulesRequestDto) {

    const vInputs =
      ScheduleControllerMapper.toCreateManyInput(body.schedules);

    const vResults =
      await this.createManySchedulesUseCase.execute(vInputs);

    return vResults.map(ScheduleControllerMapper.toCreateOutput);
  }

  // -------- GET AVAILABLE SLOTS --------
  @Get("available-slots")
  @HttpCode(HttpStatus.OK)
  async getAvailableSlots(@Query() query: GetScheduleRequestDto) {

    const vInput =
      ScheduleControllerMapper.toGetInput(query);

    const vResult =
      await this.getAvailableSlotsUseCase.execute(vInput);

    return ScheduleControllerMapper.toGetOutput(vResult);
  }
}
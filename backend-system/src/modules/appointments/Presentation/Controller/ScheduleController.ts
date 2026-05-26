import {
  Controller,
  Post,
  Get,
  Body,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
  Req,
} from "@nestjs/common";
import { CreateManySchedulesUseCase } from "../../UseCases/Schedule/Create/CreateManySchedule";
import { GetAvailableSlotsUseCase } from "../../UseCases/Appointment/GetAvaibleSlotsByDoctor/GetAvailableSlots";
import { ScheduleControllerMapper } from "../Mappers/ScheduleControllerMapper";
import { CreateScheduleUseCase } from "../../UseCases/Schedule/Create/CreateScheduleUseCase";
import { CreateScheduleRequestDto } from "../Dtos/Schedule/CreateScheduleRequestDto";
import { CreateManySchedulesRequestDto } from "../Dtos/Schedule/CreateManySchedulesRequestDto";
import { GetScheduleRequestDto } from "../Dtos/Schedule/GetScheduleRequestDto";
import { Roles } from "src/common/auth/decorators/roles.decorator";
import { RolesGuard } from "src/common/auth/guards/roles.guard";
import { JwtGuard } from "src/common/auth/guards/jwt.guard";
import { Console } from "console";
import { GetScheduleUseCase } from "../../UseCases/Schedule/Get/GetScheduleUseCase";

@Controller("schedules")
export class ScheduleController {

  constructor(
    private readonly createScheduleUseCase: CreateScheduleUseCase,
    private readonly getScheduleBydoctorUseCase: GetScheduleUseCase,
    private readonly createManySchedulesUseCase: CreateManySchedulesUseCase,
    private readonly getAvailableSlotsUseCase: GetAvailableSlotsUseCase
  ) {}

  // -------- CREATE ONE --------
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(JwtGuard, RolesGuard)
  @Roles("ADMIN", "SCHEDULER", "DOCTOR")
  async create(@Body() body: CreateScheduleRequestDto) {

    console.log(body);
    const vInput =
      ScheduleControllerMapper.toCreateInput(body);

    const vResult =
      await this.createScheduleUseCase.execute(vInput);

    return ScheduleControllerMapper.toCreateOutput(vResult);
  }

  // -------- CREATE MANY --------
  @Post("batch/doctor")
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(JwtGuard, RolesGuard)
  @Roles("DOCTOR")
  async createManyByDoctor(@Body() body: CreateManySchedulesRequestDto, @Req() req) {

    const doctorId = req.user.preferred_username;
    body.schedules.forEach((s) => (s.doctorId = doctorId));
    console.log(body);
    const vInputs =
      ScheduleControllerMapper.toCreateManyInput(body.schedules);

    const vResults =
      await this.createManySchedulesUseCase.execute(vInputs);

    return vResults.map(ScheduleControllerMapper.toCreateOutput);
  }

  // -------- GET AVAILABLE SLOTS --------
  @Get("available-slots")
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtGuard, RolesGuard)
  @Roles("DOCTOR", "SCHEDULER", "PATIENT", "ADMIN")
  async getAvailableSlots(@Query() query: GetScheduleRequestDto) {

    const vInput =
      ScheduleControllerMapper.toGetInput(query);

    const vResult =
      await this.getAvailableSlotsUseCase.execute(vInput);

    return ScheduleControllerMapper.toGetOutput(vResult);
  }

  @Get("predefined/doctor")
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtGuard, RolesGuard)
  @Roles("DOCTOR")
  async getPredefinedByDoctor(@Req() req) {
    const doctorId = req.user.preferred_username;
    const vResult = await this.getScheduleBydoctorUseCase.execute(doctorId);
    return vResult.map(ScheduleControllerMapper.toCreateOutput);
  }
}
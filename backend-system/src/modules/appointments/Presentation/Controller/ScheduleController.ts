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
  Patch,
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
import { GetScheduleUseCase } from "../../UseCases/Schedule/Get/GetScheduleUseCase";
import { CreateDoctorUnavailabilityUseCase } from "../../UseCases/DoctorUnavailability/Create/CreateDoctorUnavailabilityUseCase";
import { GetActivesByDoctorUseCase } from "../../UseCases/DoctorUnavailability/Get/GetActivesByDoctorUseCase";
import { CreateDoctorUnavailabilityRequestDto } from "../Dtos/Appointment/CreateDoctorUnavailabilityRequestDto";
import { UpdateScheduleRequestDto } from "../Dtos/Schedule/UpdateScheduleRequestDto";
import { UpdateScheduleUseCase } from "../../UseCases/Schedule/Update/UpdateScheduleUseCase";
import { ChangeScheduleStatusRequestDto } from "../Dtos/Schedule/ChangeScheduleStatusRequestDto";
import { ChangeScheduleStatusUseCase } from "../../UseCases/Schedule/ChangeScheduleStatus/ChangeScheduleStatusUseCase";

@Controller("schedules")
export class ScheduleController {

  constructor(
    private readonly createScheduleUseCase: CreateScheduleUseCase,
    private readonly getScheduleBydoctorUseCase: GetScheduleUseCase,
    private readonly createManySchedulesUseCase: CreateManySchedulesUseCase,
    private readonly getAvailableSlotsUseCase: GetAvailableSlotsUseCase,
    private readonly createUnavailabilityUseCase: CreateDoctorUnavailabilityUseCase,
    private readonly getActivesByDoctorUseCase: GetActivesByDoctorUseCase,
    private readonly updateScheduleUseCase: UpdateScheduleUseCase,
    private readonly changeScheduleStatusUseCase: ChangeScheduleStatusUseCase
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

    return  await this.createScheduleUseCase.execute(vInput);
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

    return await this.createManySchedulesUseCase.execute(vInputs);
  }

  // -------- GET AVAILABLE SLOTS --------
  @Get("available-slots")
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtGuard, RolesGuard)
  @Roles("DOCTOR", "SCHEDULER", "PATIENT", "ADMIN")
  async getAvailableSlots(@Query() query: GetScheduleRequestDto, @Req() req)
  : Promise<GetScheduleOutput> {
    if(!query.doctorId) query.doctorId = req.user.preferred_username;
    const vInput =
      ScheduleControllerMapper.toGetInput(query);
    const a  = await this.getAvailableSlotsUseCase.execute(vInput);
    console.log(a);
    return a;
  }

  @Get("predefined/doctor")
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtGuard, RolesGuard)
  @Roles("DOCTOR")
  async getPredefinedByDoctor(@Req() req) {
    const doctorId = req.user.preferred_username;
    return await this.getScheduleBydoctorUseCase.execute(doctorId);
  }

  //

  @Post("unavailable")
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(JwtGuard, RolesGuard)
  @Roles("DOCTOR")
  async createUnavailability(@Body() body: CreateDoctorUnavailabilityRequestDto, @Req() req) {
    const doctorId = req.user.preferred_username;
    const input = ScheduleControllerMapper.toCreateUnavailabilityInput(doctorId, body);
    return await this.createUnavailabilityUseCase.execute(input);
  }

  @Get("unavailable")
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtGuard, RolesGuard)
  @Roles("DOCTOR")
  async getActiveUnavailabilities(@Req() req) {//EL ID CORRESPONDE AL TOKEN
    const doctorId = req.user.preferred_username;
    return await this.getActivesByDoctorUseCase.execute(doctorId);
  }

  @Post("update")
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtGuard, RolesGuard)
  @Roles("DOCTOR", "ADMIN")
  async updateSchedule(@Body() body: UpdateScheduleRequestDto){
    const vInput = ScheduleControllerMapper.toUpdateScheduleInput(body);
    return await this.updateScheduleUseCase.execute(vInput)
  }

  @Patch("activate")
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtGuard, RolesGuard)
  @Roles("DOCTOR","ADMIN")
  async activateSchedule(@Body() request: ChangeScheduleStatusRequestDto,) {
      const input =
          ScheduleControllerMapper.toChangeStatusInput(request,);

      return await this.changeScheduleStatusUseCase.activate(input);
      }
    
  @Patch("desactivate")
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtGuard, RolesGuard)
  @Roles("DOCTOR","ADMIN")
  async desactivateSchedule(@Body() request: ChangeScheduleStatusRequestDto,) {
      const input =
          ScheduleControllerMapper.toChangeStatusInput(request,);

      return await this.changeScheduleStatusUseCase.desactivate(input);
      }
}
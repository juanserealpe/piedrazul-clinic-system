import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  HttpCode,
  HttpStatus,
  Header,
  Patch,
  Param,
  Req,
  UseGuards,
} from "@nestjs/common";

import { CreateAppointment } from "../../UseCases/Appointment/Create/CreateAppointment";
import { GetAppointmentsByDoctorAndDate } from "../../UseCases/Appointment/Get/GetAppointmentsByDoctorAndDate";
import { AppointmentControllerMapper } from "../Mappers/AppointmentControllerMapper";
import { CreateAppointmentRequestDto } from "../Dtos/Appointment/CreateAppointmentRequestDto";
import { GetAppointmentsRequestDto } from "../Dtos/Appointment/GetAppointmentsRequestDto";
import { CsvExportUseCase } from "../../UseCases/Appointment/Export/CsvExportUseCase";
import { ReScheduleRequestDto } from "../Dtos/Appointment/ReScheduleRequestDto";
import { UpdateAppointment } from "../../UseCases/Appointment/Update/UpdateAppointment";
import { Roles } from "src/common/auth/decorators/roles.decorator";
import { RolesGuard } from "src/common/auth/guards/roles.guard";
import { JwtGuard } from "src/common/auth/guards/jwt.guard";

@Controller("appointments")
export class AppointmentController {
    constructor(
    private readonly createAppointmentUseCase: CreateAppointment,
    private readonly getAppointmentsByDoctorAndDateUseCase: GetAppointmentsByDoctorAndDate,
    private readonly reScheduleAppointmentUseCase: UpdateAppointment,
    private readonly csvExportUseCase: CsvExportUseCase
  ) {}

  // -------- CREATE APPOINTMENT --------
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(JwtGuard, RolesGuard)
  @Roles("DOCTOR", "SCHEDULER", "PATIENT")
  async create(@Body() body: CreateAppointmentRequestDto) {
    const vInput = AppointmentControllerMapper.toCreateInput(body);

    const vResult = await this.createAppointmentUseCase.execute(vInput);

    return vResult;
  }

  // -------- GET APPOINTMENTS BY DOCTOR AND DATE --------
  @Get("by-doctor")
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtGuard, RolesGuard)
  @Roles("DOCTOR", "SCHEDULER")
  async getByDoctor(@Query() query: GetAppointmentsRequestDto, @Req() req) {
    if(query.doctorId === null || query.doctorId === "") query.doctorId = req.user.preferred_username;
    const vInput = AppointmentControllerMapper.toGetInput(query);
    return await this.getAppointmentsByDoctorAndDateUseCase.execute(vInput);
  }
  

  @Get("export/csv")
  @Header("Content-Type", "text/csv")
  @Header("Content-Disposition", 'attachment; filename="appointments.csv"')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtGuard, RolesGuard)
  @Roles("DOCTOR", "SCHEDULER")
  async exportCsv(@Query() query: GetAppointmentsRequestDto, @Req() req) {
    if(query.doctorId === null || query.doctorId === "") query.doctorId = req.user.preferred_username;
    const vInput = AppointmentControllerMapper.toGetInput(query);
    return await this.csvExportUseCase.execute(vInput);
  }


  @Patch("reschedule/:id")
  @UseGuards(JwtGuard, RolesGuard)
  @Roles("DOCTOR", "SCHEDULER")
  async reSchedule( @Param("id") id: string,@Body() body: ReScheduleRequestDto){
    const vInput = AppointmentControllerMapper.toRescheduleInput(body);
    return await this.reScheduleAppointmentUseCase.execute(id,vInput);
  }
}
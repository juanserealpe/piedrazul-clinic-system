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
import { GetAppointmentsByDoctorAndDate } from "../../UseCases/Appointment/Get/GetAppointments/GetAppointmentsByDoctorAndDate";
import { AppointmentControllerMapper } from "../Mappers/AppointmentControllerMapper";
import { CreateAppointmentRequestDto } from "../Dtos/Appointment/CreateAppointmentRequestDto";
import { GetAppointmentsRequestDto } from "../Dtos/Appointment/GetAppointmentsRequestDto";
import { CsvExportUseCase } from "../../UseCases/Appointment/Export/CsvExportUseCase";
import { UpdateAppointment } from "../../UseCases/Appointment/Update/UpdateAppointment";
import { Roles } from "src/common/auth/decorators/roles.decorator";
import { RolesGuard } from "src/common/auth/guards/roles.guard";
import { JwtGuard } from "src/common/auth/guards/jwt.guard";
import { GetPendingsToRescheduleRequestDto } from "../Dtos/Appointment/GetPendingsToRescheduleRequestDto";
import { GetAllPendingsToRescheduleUseCase } from "../../UseCases/Appointment/Get/GetPendingsToReschedule/GetAllPendingsToRescheduleUseCase";
import { GetPendingsToRescheduleUseCase } from "../../UseCases/Appointment/Get/GetPendingsToReschedule/GetPendingsToRescheduleUseCase";
import { ReScheduleRequestDto } from "../Dtos/Appointment/ReScheduleRequestDto";
import { UpdateAppointmentOutput } from "../../UseCases/Appointment/Update/UpdateAppointmentOutput";
import { GetAppointmentsByPatient } from "../../UseCases/Appointment/Get/GetAppointmentsByPatient/GetAppointmentsByPatient";
import { CancelAppointmentUseCase } from "../../UseCases/Appointment/Cancel/CancelAppointmentUseCase";
import { MarkToRescheduleUseCase } from "../../UseCases/Appointment/Update/MarkToReschedule/MarkToRescheduleUseCase";
import { markToRescheduleRequestDto } from "../Dtos/Appointment/MarkToRescheduleRequestDto";

@Controller("appointments")
export class AppointmentController {
  constructor(
    private readonly createAppointmentUseCase:              CreateAppointment,
    private readonly getAppointmentsByDoctorAndDateUseCase: GetAppointmentsByDoctorAndDate,
    private readonly reScheduleAppointmentUseCase:          UpdateAppointment,
    private readonly csvExportUseCase:                      CsvExportUseCase,
    private readonly getAllPendingsToRescheduleUseCase:      GetAllPendingsToRescheduleUseCase,
    private readonly getPendingsToRescheduleUseCase:         GetPendingsToRescheduleUseCase,
    private readonly getAppointmentsByPatientUseCase:        GetAppointmentsByPatient,
    private readonly cancelAppointmentUseCase:               CancelAppointmentUseCase,
    private readonly markToRescheduleUseCase:                MarkToRescheduleUseCase,
  ) {}

  // ── CREATE ────────────────────────────────────────────────────────────────
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(JwtGuard, RolesGuard)
  @Roles("DOCTOR", "SCHEDULER", "PATIENT")
  async create(@Body() body: CreateAppointmentRequestDto, @Req() req) {
    if (!body.patientId) body.patientId = req.user.preferred_username;
    if (!body.doctorId)  body.doctorId  = req.user.preferred_username;
    const vInput = AppointmentControllerMapper.toCreateInput(body.doctorId, body);
    return await this.createAppointmentUseCase.execute(vInput);
  }

  // ── GET BY DOCTOR AND DATE ────────────────────────────────────────────────
  @Get("by-doctor")
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtGuard, RolesGuard)
  @Roles("DOCTOR", "SCHEDULER")
  async getByDoctor(@Query() query: GetAppointmentsRequestDto, @Req() req) {
    if (!query.doctorId) query.doctorId = req.user.preferred_username;
    const vInput = AppointmentControllerMapper.toGetInput(query);
    return await this.getAppointmentsByDoctorAndDateUseCase.execute(vInput);
  }

  // ── EXPORT CSV ────────────────────────────────────────────────────────────
  @Get("export/csv")
  @Header("Content-Type", "text/csv")
  @Header("Content-Disposition", 'attachment; filename="appointments.csv"')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtGuard, RolesGuard)
  @Roles("DOCTOR", "SCHEDULER")
  async exportCsv(@Query() query: GetAppointmentsRequestDto, @Req() req) {
    query.doctorId = req.user.preferred_username;
    const vInput = AppointmentControllerMapper.toGetInput(query);
    return await this.csvExportUseCase.execute(vInput);
  }

  // ── RESCHEDULE ────────────────────────────────────────────────────────────
  @Patch("reschedule")
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtGuard, RolesGuard)
  @Roles("DOCTOR", "SCHEDULER")
  async reScheduleByDoctor(
    @Body() body: ReScheduleRequestDto,
    @Req() req,
  ): Promise<UpdateAppointmentOutput> {
    if (!body.doctorId) body.doctorId = req.user.preferred_username;
    const vInput = AppointmentControllerMapper.toRescheduleInput(body.doctorId, body);
    return await this.reScheduleAppointmentUseCase.execute(vInput);
  }

  // ── CANCEL ────────────────────────────────────────────────────────────────
  @Patch("cancel")
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtGuard, RolesGuard)
  @Roles("PATIENT")
  async cancelAppointment(
    @Body() body: { appointmentId: string },
    @Req() req,
  ) {
    return await this.cancelAppointmentUseCase.execute({
      appointmentId: body.appointmentId,
      patientId:     req.user.preferred_username,
    });
  }

  // ── PENDING RESCHEDULE ALL (by id param) ──────────────────────────────────
  @Get("pending-reschedule/all/:id")
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtGuard, RolesGuard)
  @Roles("DOCTOR")
  async getAll(@Param("id") id: string) {
    return await this.getAllPendingsToRescheduleUseCase.execute(id);
  }

  // ── PENDING RESCHEDULE RANGE ──────────────────────────────────────────────
  @Get("pending-reschedule/range")
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtGuard, RolesGuard)
  @Roles("DOCTOR", "SCHEDULER")
  async getByRange(
    @Query() pQuery: GetPendingsToRescheduleRequestDto,
    @Req() req,
  ) {
    // Doctor: no manda doctorId → usa su propio JWT
    // Scheduler: manda doctorId del médico → lo respeta
    if (!pQuery.doctorId) pQuery.doctorId = req.user.preferred_username;

    const vInput = AppointmentControllerMapper.toGetPendingsInput(
      pQuery.doctorId!,
      pQuery,
    );
    return await this.getPendingsToRescheduleUseCase.execute(vInput);
  }

  // ── GET BY PATIENT ────────────────────────────────────────────────────────
  @Get("by-patient")
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtGuard, RolesGuard)
  @Roles("PATIENT")
  async getByPatient(@Req() req) {
    const patientId = req.user.preferred_username;
    return await this.getAppointmentsByPatientUseCase.execute(patientId);
  }

  // MARK TO RESCHEDULE
  @Patch("markToReschedule")
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtGuard, RolesGuard)
  @Roles("PATIENT", "DOCTOR", "ADMIN", "SCHEDULER")
  async markToReschedule(@Body() body: markToRescheduleRequestDto) {
    return await this.markToRescheduleUseCase.execute(body);
  }
}
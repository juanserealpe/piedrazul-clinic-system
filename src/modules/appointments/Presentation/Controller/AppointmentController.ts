import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  HttpCode,
  HttpStatus,
} from "@nestjs/common";
import { GetAppointmentsByDoctorAndDate } from "../../UseCases/GetAppointmentsByDoctorAndDate";
import { CreateAppointment } from "../../UseCases/CreateAppointment";
import { GetAvailableSlots } from "../../UseCases/GetAvailableSlots";
import { GetAppointmentsByDoctorAndDateDto } from "../Dtos/Get/GetAppointmentsByDoctorAndDateDto";
import { GetAvailableSlotsDto } from "../Dtos/Get/GetAvailableSlotsDto";
import { CreateAppointmentBySchedulerDto } from "../Dtos/Create/CreateAppointmentBySchedulerDto";

@Controller("appointments")
export class AppointmentController {
  constructor(
    private readonly getAppointmentsByDoctorAndDate: GetAppointmentsByDoctorAndDate,
    private readonly createAppointment: CreateAppointment,
    private readonly getAvailableSlotss: GetAvailableSlots
  ) {}

  /**
   * GET /appointments/by-doctor
   * Query params: doctorId, date (YYYY-MM-DD), status? (opcional)
   *
   * Req 1: listar citas de un médico en una fecha determinada
   */
  @Get("by-doctor")
  @HttpCode(HttpStatus.OK)
  async getByDoctor(@Query() query: GetAppointmentsByDoctorAndDateDto) {
    const result = await this.getAppointmentsByDoctorAndDate.execute(query);
    return result;
  }

  /**
   * GET /appointments/available-slots
   * Query params: doctorId, date (YYYY-MM-DD)
   *
   * Compartido entre req 2 (agendador) y req 3 (paciente web)
   * El frontend lo usa para renderizar las franjas disponibles
   */
  @Get("available-slots")
  @HttpCode(HttpStatus.OK)
  async getAvailableSlots(@Query() query: GetAvailableSlotsDto) {
    const result = await this.getAvailableSlotss.execute(query);
    return result;
  }

  /**
   * POST /appointments/scheduler
   * Body: { patientId, doctorId, requestedDate, observations? }
   *
   * Req 2: el agendador crea una cita para un paciente
   */
  @Post("scheduler")
  @HttpCode(HttpStatus.CREATED)
  async createByScheduler(@Body() body: CreateAppointmentBySchedulerDto) {
    const result = await this.createAppointment.execute(body);
    return result;
  }
}
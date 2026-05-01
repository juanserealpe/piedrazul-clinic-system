import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  HttpCode,
  HttpStatus,
  Header,
} from "@nestjs/common";

import { CreateAppointment } from "../../UseCases/Appointment/Create/CreateAppointment";
import { GetAppointmentsByDoctorAndDate } from "../../UseCases/Appointment/Get/GetAppointmentsByDoctorAndDate";
import { AppointmentControllerMapper } from "../Mappers/AppointmentControllerMapper";
import { CreateAppointmentRequestDto } from "../Dtos/Appointment/CreateAppointmentRequestDto";
import { GetAppointmentsRequestDto } from "../Dtos/Appointment/GetAppointmentsRequestDto";
import { CsvExportUseCase } from "../../UseCases/Appointment/Export/CsvExportUseCase";

@Controller("appointments")
export class AppointmentController {
    constructor(
    private readonly createAppointmentUseCase: CreateAppointment,
    private readonly getAppointmentsByDoctorAndDateUseCase: GetAppointmentsByDoctorAndDate,
    private readonly csvExportUseCase: CsvExportUseCase
  ) {}

  // -------- CREATE APPOINTMENT --------
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() body: CreateAppointmentRequestDto) {

    const vInput = AppointmentControllerMapper.toCreateInput(body);

    const vResult = await this.createAppointmentUseCase.execute(vInput);

    const vOutput = AppointmentControllerMapper.toCreateOutput(vResult);

    return vOutput;
  }

  // -------- GET APPOINTMENTS BY DOCTOR AND DATE --------
  @Get("by-doctor")
  @HttpCode(HttpStatus.OK)
  async getByDoctor(@Query() query: GetAppointmentsRequestDto) {

    const vInput =
      AppointmentControllerMapper.toGetInput(query);

    const vResult =
      await this.getAppointmentsByDoctorAndDateUseCase.execute(vInput);

    const vOutput =
      AppointmentControllerMapper.toGetOutput(vResult);

    return vOutput;
  }
  

  @Get("export/csv")
  @Header("Content-Type", "text/csv")
  @Header("Content-Disposition", 'attachment; filename="appointments.csv"')
  @HttpCode(HttpStatus.OK)
  async exportCsv(@Query() query: GetAppointmentsRequestDto) {

    const vInput =
      AppointmentControllerMapper.toGetInput(query);

    return await this.csvExportUseCase.execute(vInput);
  }
}
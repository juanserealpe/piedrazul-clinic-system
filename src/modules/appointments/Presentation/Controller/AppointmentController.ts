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
  @Roles("DOCTOR", "SCHEDULER", "PATIENT")
  async create(@Body() body: CreateAppointmentRequestDto) {

    const vInput = AppointmentControllerMapper.toCreateInput(body);

    const vResult = await this.createAppointmentUseCase.execute(vInput);

    return vResult;
  }

  // -------- GET APPOINTMENTS BY DOCTOR AND DATE --------
  @Get("by-doctor")
  @HttpCode(HttpStatus.OK)
  @Roles("DOCTOR" , "ADMIN")
  async getByDoctor(@Query() query: GetAppointmentsRequestDto) {

    const vInput =
      AppointmentControllerMapper.toGetInput(query);

    const vResult =
      await this.getAppointmentsByDoctorAndDateUseCase.execute(vInput);

    return vResult;
  }
  

  @Get("export/csv")
  @Header("Content-Type", "text/csv")
  @Header("Content-Disposition", 'attachment; filename="appointments.csv"')
  @HttpCode(HttpStatus.OK)
  @Roles("DOCTOR")
  async exportCsv(@Query() query: GetAppointmentsRequestDto) {

    const vInput =
      AppointmentControllerMapper.toGetInput(query);

    return await this.csvExportUseCase.execute(vInput);
  }


  @Patch("reschedule/:id")
  @Roles("DOCTOR")
  async reSchedule( @Param("id") id: string,@Body() body: ReScheduleRequestDto){
    const vInput = AppointmentControllerMapper.toRescheduleInput(body);
    return await this.reScheduleAppointmentUseCase.execute(id,vInput);
  }
}
import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  HttpCode,
  HttpStatus,
} from "@nestjs/common";

import { CreateAppointment } from "../../UseCases/Appointment/Create/CreateAppointment";
import { GetAppointmentsByDoctorAndDate } from "../../UseCases/Appointment/Get/GetAppointmentsByDoctorAndDate";
import { AppointmentControllerMapper } from "../Mappers/AppointmentControllerMapper";

@Controller("appointments")
export class AppointmentController {
    constructor(
    private readonly createAppointmentUseCase: CreateAppointment,
    private readonly getAppointmentsByDoctorAndDateUseCase: GetAppointmentsByDoctorAndDate
  ) {}

  // -------- CREATE APPOINTMENT --------
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() body: any) {

    const vInput = AppointmentControllerMapper.toCreateInput(body);

    const vResult = await this.createAppointmentUseCase.execute(vInput);

    const vOutput = AppointmentControllerMapper.toCreateOutput(vResult);

    return vOutput;
  }

  // -------- GET APPOINTMENTS BY DOCTOR AND DATE --------
  @Get("by-doctor")
  @HttpCode(HttpStatus.OK)
  async getByDoctor(@Query() query: any) {

    const vInput =
      AppointmentControllerMapper.toGetInput(query);

    const vResult =
      await this.getAppointmentsByDoctorAndDateUseCase.execute(vInput);

    const vOutput =
      AppointmentControllerMapper.toGetOutput(vResult);

    return vOutput;
  }
}
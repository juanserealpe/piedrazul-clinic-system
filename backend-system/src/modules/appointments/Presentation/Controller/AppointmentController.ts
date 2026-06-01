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

@Controller("appointments")
export class AppointmentController {
    constructor(
    private readonly createAppointmentUseCase: CreateAppointment,
    private readonly getAppointmentsByDoctorAndDateUseCase: GetAppointmentsByDoctorAndDate,
    private readonly reScheduleAppointmentUseCase: UpdateAppointment,
    private readonly csvExportUseCase: CsvExportUseCase,
    private readonly getAllPendingsToRescheduleUseCase: GetAllPendingsToRescheduleUseCase,
    private readonly getPendingsToRescheduleUseCase: GetPendingsToRescheduleUseCase,
    private readonly getAppointmentsByPatientUseCase: GetAppointmentsByPatient,
    
  ) {}

  // -------- CREATE APPOINTMENT --------
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(JwtGuard, RolesGuard)
  @Roles("DOCTOR", "SCHEDULER", "PATIENT")
  async create(@Body() body: CreateAppointmentRequestDto, @Req() req) {
    if(!body.patientId) body.patientId = req.user.preferred_username;
    if(!body.doctorId) body.doctorId = req.user.preferred_username;
    console.log("BODY:", body);
    const vInput = AppointmentControllerMapper.toCreateInput(body.doctorId, body);
    return await this.createAppointmentUseCase.execute(vInput);               
  }
  

  // -------- GET APPOINTMENTS BY DOCTOR AND DATE --------
  @Get("by-doctor")
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtGuard, RolesGuard)
  @Roles("DOCTOR", "SCHEDULER")
  async getByDoctor(@Query() query: GetAppointmentsRequestDto, @Req() req) {
    console.log("Received query:", query);
    console.log("Authenticated user:", req.user.preferred_username);
    if(!query.doctorId) query.doctorId = req.user.preferred_username;
    const vInput = AppointmentControllerMapper.toGetInput(query);
    const result = await this.getAppointmentsByDoctorAndDateUseCase.execute(vInput);
    console.log("Result:", result);
    return result;
  }
  

  @Get("export/csv")
  @Header("Content-Type", "text/csv")
  @Header("Content-Disposition", 'attachment; filename="appointments.csv"')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtGuard, RolesGuard)
  @Roles("DOCTOR", "SCHEDULER")
  async exportCsv(@Query() query: GetAppointmentsRequestDto, @Req() req) {
    query.doctorId = req.user.preferred_username;
    console.log("Received query for CSV export:", query);
    const vInput = AppointmentControllerMapper.toGetInput(query);
    return await this.csvExportUseCase.execute(vInput);
  }


  @Patch("reschedule")
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtGuard, RolesGuard)
  @Roles("DOCTOR")
  async reScheduleByDoctor(@Body() body: ReScheduleRequestDto, @Req() req)
  : Promise<UpdateAppointmentOutput> {
    if(!body.doctorId) body.doctorId = req.user.preferred_username; 
    const vInput = AppointmentControllerMapper.toRescheduleInput(body.appointmentId,body);
    return await this.reScheduleAppointmentUseCase.execute(vInput);
  }
  //UNAVAILABILITY
  ////Pendientes viaje el id por el jwt y no por url, solo para pruebas
  @Get("pending-reschedule/all/:id")
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtGuard, RolesGuard)
  @Roles("DOCTOR")
    async getAll(
      @Param("id") id: string,
    ) {
      return await this.getAllPendingsToRescheduleUseCase.execute(id,);
    }

  @Get("pending-reschedule/range") 
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtGuard, RolesGuard)
  @Roles("DOCTOR", "SCHEDULER")
  async getByRange(
    @Query()
    pQuery: GetPendingsToRescheduleRequestDto, @Req() req
    ) {
      const vInput =
        AppointmentControllerMapper
        .toGetPendingsInput(req.user.preferred_username,pQuery);
        const a =  await this.getPendingsToRescheduleUseCase
         .execute(vInput);
         return a;
    }
    @Get("by-patient")
@HttpCode(HttpStatus.OK)
@UseGuards(JwtGuard, RolesGuard)
@Roles("PATIENT")
async getByPatient(@Req() req) {
  const patientId = req.user.preferred_username;
  return await this.getAppointmentsByPatientUseCase.execute(patientId);
}
}
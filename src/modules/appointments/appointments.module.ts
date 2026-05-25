import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { TypeOrmAppointmentRepository } from "./Infraestructure/Implements/TypeOrmAppointmentRepository";
import { ScheduleOrmEntity } from "./Infraestructure/Entities/ScheduleOrmEntity";
import { AppointmentOrmEntity } from "./Infraestructure/Entities/AppointmentOrmEntity";
import { TypeOrmScheduleRepository } from "./Infraestructure/Implements/TypeOrmScheduleRepository";
import { GetAppointmentsByDoctorAndDate } from "./UseCases/Appointment/Get/GetAppointmentsByDoctorAndDate";
import { CreateAppointment } from "./UseCases/Appointment/Create/CreateAppointment";
import { AppointmentController } from "./Presentation/Controller/AppointmentController";
import { GetAvailableSlotsUseCase } from "./UseCases/Schedule/Get/GetAvailableSlots";
import { ScheduleController } from "./Presentation/Controller/ScheduleController";
import { CreateScheduleUseCase } from "./UseCases/Schedule/Create/CreateScheduleUseCase";
import { CreateManySchedulesUseCase } from "./UseCases/Schedule/Create/CreateManySchedule";
import { CsvExportUseCase } from "./UseCases/Appointment/Export/CsvExportUseCase";
import { TypeOrmAppointmentScheduleRepository } from "./Infraestructure/Implements/TypeOrmAppointmentScheduleRepository";
import { AppointmentScheduleOrmEntity } from "./Infraestructure/Entities/AppointmentScheduleOrmEntity";
import { UpdateAppointment } from "./UseCases/Appointment/Update/UpdateAppointment";

export const APPOINTMENT_REPOSITORY = "APPOINTMENT_REPOSITORY";
export const SCHEDULE_REPOSITORY = "SCHEDULE_REPOSITORY";

@Module({   
  imports: [
    TypeOrmModule.forFeature([AppointmentOrmEntity, ScheduleOrmEntity, AppointmentScheduleOrmEntity,]),
  ],
  controllers: [AppointmentController,ScheduleController],
  providers: [
    // ── Repositorios concretos ────────────────────────────────────────────────
    {
      provide: APPOINTMENT_REPOSITORY,
      useClass: TypeOrmAppointmentRepository,
    },
    {
      provide: SCHEDULE_REPOSITORY,
      useClass: TypeOrmScheduleRepository,
    },
    // ── Casos de uso ──────────────────────────────────────────────────────────
    { 
      provide: GetAppointmentsByDoctorAndDate,
      useFactory: (appointmentRepo) =>
        new GetAppointmentsByDoctorAndDate(appointmentRepo),
      inject: [APPOINTMENT_REPOSITORY],
    },
    {
      provide: CreateAppointment,
      useFactory: (appointmentRepo,scheduleRepo, authRepo) =>
        new CreateAppointment(appointmentRepo,scheduleRepo,authRepo),
      inject: [APPOINTMENT_REPOSITORY, SCHEDULE_REPOSITORY],
    },
    /*
    */
    {
      provide: CsvExportUseCase,
      useFactory: (getAppointmentsUseCase) =>
        new CsvExportUseCase(getAppointmentsUseCase),
      inject: [GetAppointmentsByDoctorAndDate],
    },
    //Schedule
    {
      provide: GetAvailableSlotsUseCase,
      useFactory: (scheduleRepo, appointmentRepo) =>
        new GetAvailableSlotsUseCase(scheduleRepo, appointmentRepo),
      inject: [SCHEDULE_REPOSITORY, APPOINTMENT_REPOSITORY],
    },

    {//MODIFICAR
      provide: CreateScheduleUseCase,
      useFactory: (scheduleRepo,authRepo) =>
        new CreateScheduleUseCase(scheduleRepo,authRepo),
      inject: [SCHEDULE_REPOSITORY],
    },
    {
      provide: UpdateAppointment,
      useFactory: (appointmentRepo, scheduleRepo) =>
        new UpdateAppointment(appointmentRepo,scheduleRepo),
      inject: [APPOINTMENT_REPOSITORY, SCHEDULE_REPOSITORY],
    },

    {
      provide: CreateManySchedulesUseCase,
      useFactory: (scheduleRepo) =>
        new CreateManySchedulesUseCase(scheduleRepo),
      inject: [SCHEDULE_REPOSITORY],
    },
  ],
})
export class AppointmentModule {}

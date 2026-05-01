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
import { KeycloakService } from "src/common/keycloak/keycloak.service";
import { KeycloakModule } from "src/common/keycloak/keycloak.module";
 
export const APPOINTMENT_REPOSITORY = "APPOINTMENT_REPOSITORY";
export const SCHEDULE_REPOSITORY = "SCHEDULE_REPOSITORY";

@Module({
  imports: [
    TypeOrmModule.forFeature([AppointmentOrmEntity, ScheduleOrmEntity]),
    KeycloakModule
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
      provide: GetAvailableSlotsUseCase,
      useFactory: (scheduleRepo, appointmentRepo) =>
        new GetAvailableSlotsUseCase(scheduleRepo, appointmentRepo),
      inject: [SCHEDULE_REPOSITORY, APPOINTMENT_REPOSITORY],
    },
    {
      provide: CreateAppointment,
      useFactory: (appointmentRepo,scheduleRepo) =>
        new CreateAppointment(appointmentRepo,scheduleRepo),
      inject: [APPOINTMENT_REPOSITORY, SCHEDULE_REPOSITORY],
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
      useFactory: (scheduleRepo, KeycloakService) =>
        new CreateScheduleUseCase(scheduleRepo, KeycloakService),
      inject: [SCHEDULE_REPOSITORY, KeycloakService],
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

import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { TypeOrmAppointmentRepository } from "./Infraestructure/TypeOrmAppointmentRepository";
import { ScheduleOrmEntity } from "./Infraestructure/Entities/ScheduleOrmEntity";
import { AppointmentOrmEntity } from "./Infraestructure/Entities/AppointmentOrmEntity";
import { TypeOrmScheduleRepository } from "./Infraestructure/TypeOrmScheduleRepository";
import { GetAppointmentsByDoctorAndDate } from "./UseCases/GetAppointmentsByDoctorAndDate";
import { GetAvailableSlots } from "./UseCases/GetAvailableSlots";
import { CreateAppointment } from "./UseCases/CreateAppointment";
import { AppointmentController } from "./Presentation/Controller/AppointmentController";

export const APPOINTMENT_REPOSITORY = "APPOINTMENT_REPOSITORY";
export const SCHEDULE_REPOSITORY = "SCHEDULE_REPOSITORY";

@Module({
  imports: [
    TypeOrmModule.forFeature([AppointmentOrmEntity, ScheduleOrmEntity]),
  ],
  controllers: [AppointmentController],
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
      provide: GetAvailableSlots,
      useFactory: (scheduleRepo, appointmentRepo) =>
        new GetAvailableSlots(scheduleRepo, appointmentRepo),
      inject: [SCHEDULE_REPOSITORY, APPOINTMENT_REPOSITORY],
    },
    {
      provide: CreateAppointment,
      useFactory: (appointmentRepo, scheduleRepo) =>
        new CreateAppointment(appointmentRepo, scheduleRepo),
      inject: [APPOINTMENT_REPOSITORY, SCHEDULE_REPOSITORY],
    },
  ],
})
export class AppointmentModule {}

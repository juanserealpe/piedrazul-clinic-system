import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

// Auth
import { AuthModule } from "../auth/auth.module";
import { AuthService } from "../auth/auth.service";

// Entities
import { AppointmentOrmEntity } from "./Infraestructure/Entities/AppointmentOrmEntity";
import { ScheduleOrmEntity } from "./Infraestructure/Entities/ScheduleOrmEntity";
import { AppointmentScheduleOrmEntity } from "./Infraestructure/Entities/AppointmentScheduleOrmEntity";

// Repositories
import { TypeOrmAppointmentRepository } from "./Infraestructure/Implements/TypeOrmAppointmentRepository";
import { TypeOrmScheduleRepository } from "./Infraestructure/Implements/TypeOrmScheduleRepository";
import { TypeOrmAppointmentScheduleRepository } from "./Infraestructure/Implements/TypeOrmAppointmentScheduleRepository";

// Controllers
import { AppointmentController } from "./Presentation/Controller/AppointmentController";
import { ScheduleController } from "./Presentation/Controller/ScheduleController";

// Appointment Use Cases
import { GetAppointmentsByDoctorAndDate } from "./UseCases/Appointment/Get/GetAppointmentsByDoctorAndDate";
import { CreateAppointment } from "./UseCases/Appointment/Create/CreateAppointment";
import { UpdateAppointment } from "./UseCases/Appointment/Update/UpdateAppointment";
import { CsvExportUseCase } from "./UseCases/Appointment/Export/CsvExportUseCase";
import { GetAvailableSlotsUseCase } from "./UseCases/Appointment/GetAvaibleSlotsByDoctor/GetAvailableSlots";

// Schedule Use Cases
import { CreateScheduleUseCase } from "./UseCases/Schedule/Create/CreateScheduleUseCase";
import { CreateManySchedulesUseCase } from "./UseCases/Schedule/Create/CreateManySchedule";
import { GetScheduleUseCase } from "./UseCases/Schedule/Get/GetScheduleUseCase";

export const APPOINTMENT_REPOSITORY =
  "APPOINTMENT_REPOSITORY";

export const SCHEDULE_REPOSITORY =
  "SCHEDULE_REPOSITORY";

@Module({

  imports: [

    TypeOrmModule.forFeature([

      AppointmentOrmEntity,
      ScheduleOrmEntity,
      AppointmentScheduleOrmEntity,

    ]),

    AuthModule,

  ],

  controllers: [

    AppointmentController,
    ScheduleController,

  ],

  providers: [

    // ─────────────────────────────────────────────
    // REPOSITORIES
    // ─────────────────────────────────────────────

    {
      provide: APPOINTMENT_REPOSITORY,

      useClass:
        TypeOrmAppointmentRepository,
    },

    {
      provide: SCHEDULE_REPOSITORY,

      useClass:
        TypeOrmScheduleRepository,
    },

    // ─────────────────────────────────────────────
    // APPOINTMENT USE CASES
    // ─────────────────────────────────────────────

    {
      provide:
        GetAppointmentsByDoctorAndDate,

      useFactory: (
        appointmentRepo,
      ) =>

        new GetAppointmentsByDoctorAndDate(
          appointmentRepo,
        ),

      inject: [
        APPOINTMENT_REPOSITORY,
      ],
    },

    {
      provide:
        CreateAppointment,

      useFactory: (
        appointmentRepo,
        scheduleRepo,
        authService: AuthService,
      ) =>

        new CreateAppointment(
          appointmentRepo,
          scheduleRepo,
          authService,
        ),

      inject: [
        APPOINTMENT_REPOSITORY,
        SCHEDULE_REPOSITORY,
        AuthService,
      ],
    },

    {
      provide:
        UpdateAppointment,

      useFactory: (
        appointmentRepo,
        scheduleRepo,
      ) =>

        new UpdateAppointment(
          appointmentRepo,
          scheduleRepo,
        ),

      inject: [
        APPOINTMENT_REPOSITORY,
        SCHEDULE_REPOSITORY,
      ],
    },

    {
      provide:
        CsvExportUseCase,

      useFactory: (
        getAppointmentsUseCase,
      ) =>

        new CsvExportUseCase(
          getAppointmentsUseCase,
        ),

      inject: [
        GetAppointmentsByDoctorAndDate,
      ],
    },

    // ─────────────────────────────────────────────
    // SCHEDULE USE CASES
    // ─────────────────────────────────────────────

    {
      provide:
        GetAvailableSlotsUseCase,

      useFactory: (
        scheduleRepo,
        appointmentRepo,
      ) =>

        new GetAvailableSlotsUseCase(
          scheduleRepo,
          appointmentRepo,
        ),

      inject: [
        SCHEDULE_REPOSITORY,
        APPOINTMENT_REPOSITORY,
      ],
    },

    {
      provide:
        CreateScheduleUseCase,

      useFactory: (
        scheduleRepo,
        authService: AuthService,
      ) =>

        new CreateScheduleUseCase(
          scheduleRepo,
          authService,
        ),

      inject: [
        SCHEDULE_REPOSITORY,
        AuthService,
      ],
    },

    {
      provide:
        CreateManySchedulesUseCase,

      useFactory: (
        scheduleRepo,
      ) =>

        new CreateManySchedulesUseCase(
          scheduleRepo,
        ),

      inject: [
        SCHEDULE_REPOSITORY,
      ],
    },

    {
      provide:
        GetScheduleUseCase,

      useFactory: (
        scheduleRepo,
      ) =>

        new GetScheduleUseCase(
          scheduleRepo,
        ),

      inject: [
        SCHEDULE_REPOSITORY,
      ],
    },

  ],

})
export class AppointmentModule {}
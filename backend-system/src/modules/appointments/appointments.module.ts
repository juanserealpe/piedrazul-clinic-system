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
import { GetAppointmentsByDoctorAndDate } from "./UseCases/Appointment/Get/GetAppointments/GetAppointmentsByDoctorAndDate";
import { CreateAppointment } from "./UseCases/Appointment/Create/CreateAppointment";
import { UpdateAppointment } from "./UseCases/Appointment/Update/UpdateAppointment";
import { CsvExportUseCase } from "./UseCases/Appointment/Export/CsvExportUseCase";
import { GetAvailableSlotsUseCase } from "./UseCases/Appointment/GetAvaibleSlotsByDoctor/GetAvailableSlots";

// Schedule Use Cases
import { CreateScheduleUseCase } from "./UseCases/Schedule/Create/CreateScheduleUseCase";
import { CreateManySchedulesUseCase } from "./UseCases/Schedule/Create/CreateManySchedule";
import { GetScheduleUseCase } from "./UseCases/Schedule/Get/GetScheduleUseCase";
import { DoctorUnavailabilityOrmEntity } from "./Infraestructure/Entities/DoctorUnavailabilityOrmEntity";
import { GetAllPendingsToRescheduleUseCase } from "./UseCases/Appointment/Get/GetPendingsToReschedule/GetAllPendingsToRescheduleUseCase";
import { GetPendingsToRescheduleUseCase } from "./UseCases/Appointment/Get/GetPendingsToReschedule/GetPendingsToRescheduleUseCase";
import { TypeOrmDoctorUnavailabilityRepository } from "./Infraestructure/Implements/TypeOrmDoctorUnavailabilityRepository";
import { CreateDoctorUnavailabilityUseCase } from "./UseCases/DoctorUnavailability/Create/CreateDoctorUnavailabilityUseCase";
import { GetActivesByDoctorUseCase } from "./UseCases/DoctorUnavailability/Get/GetActivesByDoctorUseCase";

export const APPOINTMENT_REPOSITORY =
  "APPOINTMENT_REPOSITORY";

export const SCHEDULE_REPOSITORY =
  "SCHEDULE_REPOSITORY";

export const DOCTOR_UNAVAILABILITY_REPOSITORY = 
  "DOCTOR_UNAVAILABILITY_REPOSITORY";
  
@Module({

  imports: [

    TypeOrmModule.forFeature([

      AppointmentOrmEntity,
      ScheduleOrmEntity,
      AppointmentScheduleOrmEntity,
      DoctorUnavailabilityOrmEntity,
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
      provide: DOCTOR_UNAVAILABILITY_REPOSITORY,
      
      useClass: 
      TypeOrmDoctorUnavailabilityRepository,
    },

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
        DoctorUnavailabilityRepository,
      ) =>

        new CreateAppointment(
          appointmentRepo,
          scheduleRepo,
          authService,
          DoctorUnavailabilityRepository,
        ),

      inject: [
        APPOINTMENT_REPOSITORY,
        SCHEDULE_REPOSITORY,
        AuthService,
        DOCTOR_UNAVAILABILITY_REPOSITORY,
      ],
    },

    {
      provide:
        UpdateAppointment,

      useFactory: (
        appointmentRepo,
        scheduleRepo,
        DoctorUnavailabilityRepository,
      ) =>

        new UpdateAppointment(
          appointmentRepo,
          scheduleRepo,
          DoctorUnavailabilityRepository,
        ),

      inject: [
        APPOINTMENT_REPOSITORY,
        SCHEDULE_REPOSITORY,
        DOCTOR_UNAVAILABILITY_REPOSITORY,
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
    //
    {
      provide:
          GetAllPendingsToRescheduleUseCase,

      useFactory: (
          appointmentRepo,
      ) =>

          new GetAllPendingsToRescheduleUseCase(
              appointmentRepo,
          ),

      inject: [
          APPOINTMENT_REPOSITORY,
        ],
    },
    {
      provide:
          GetPendingsToRescheduleUseCase,

      useFactory: (
          appointmentRepo,
      ) =>

          new GetPendingsToRescheduleUseCase(
              appointmentRepo,
          ),

      inject: [
          APPOINTMENT_REPOSITORY,
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
        doctorUnavailableRepo,
      ) =>

        new GetAvailableSlotsUseCase(
          scheduleRepo,
          appointmentRepo,
          doctorUnavailableRepo
        ),

      inject: [
        SCHEDULE_REPOSITORY,
        APPOINTMENT_REPOSITORY,
        DOCTOR_UNAVAILABILITY_REPOSITORY,
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
    {
      provide: CreateDoctorUnavailabilityUseCase,
      useFactory: (
        doctorUnavailabilityRepo,
        appointmentRepo,
      ) => new CreateDoctorUnavailabilityUseCase(
        doctorUnavailabilityRepo,
        appointmentRepo,
      ),
      inject: [
        DOCTOR_UNAVAILABILITY_REPOSITORY,
        APPOINTMENT_REPOSITORY,
      ],
    },

    {
      provide: GetActivesByDoctorUseCase,
      useFactory: (doctorUnavailabilityRepo) => 
        new GetActivesByDoctorUseCase(doctorUnavailabilityRepo),
      inject: [DOCTOR_UNAVAILABILITY_REPOSITORY],
    },
  ],

})
export class AppointmentModule {}
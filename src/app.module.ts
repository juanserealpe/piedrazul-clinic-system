import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ConfigModule } from "@nestjs/config";

// Appointments
import { AppointmentOrmEntity } from "./modules/appointments/Infraestructure/Entities/AppointmentOrmEntity.js";
import { ScheduleOrmEntity } from "./modules/appointments/Infraestructure/Entities/ScheduleOrmEntity.js";
import { AppointmentModule } from "./modules/appointments/appointments.module.js";
import { UserOrmEntity } from "./modules/auth/persistence/user.orm-entity.js";
import { AuthController } from "./modules/auth/auth.controller.js";
import { AuthService } from "./modules/auth/auth.service.js";
import { KeycloakService } from "./common/keycloak/keycloak.service.js";
import { UserRepository } from "./modules/auth/persistence/user.repository.js";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    TypeOrmModule.forRoot({
      type: "better-sqlite3",
      database: "piedrazul.db",
      entities: [
        UserOrmEntity,
        AppointmentOrmEntity,
        ScheduleOrmEntity,
      ],
      synchronize: true,
      logging: true,
    }),

    AppointmentModule,
    TypeOrmModule.forFeature([UserOrmEntity]),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    KeycloakService,
    UserRepository, 
  ],
})
export class AppModule {}
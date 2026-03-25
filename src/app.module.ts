import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AuthModule } from "./modules/auth/auth.module.js";

// ORM Entities
import { UserOrmEntity } from "./modules/auth/infrastructure/persistence/user.orm-entity.js";
import { DoctorOrmEntity } from "./modules/auth/infrastructure/persistence/doctor.orm-entity.js";
import { AccountOrmEntity } from "./modules/auth/infrastructure/persistence/account.orm-entity.js";

//Appoint
import { AppointmentOrmEntity } from "./modules/appointments/Infraestructure/Entities/AppointmentOrmEntity.js";
import { ScheduleOrmEntity } from "./modules/appointments/Infraestructure/Entities/ScheduleOrmEntity.js";
import { AppointmentModule } from "./modules/appointments/appointments.module.js";

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: "better-sqlite3",
      database: "piedrazul.db",
      entities: [
        UserOrmEntity,
        DoctorOrmEntity,
        AccountOrmEntity,
        //AvailabilitySlotOrmEntity,
        //
        AppointmentOrmEntity,
        ScheduleOrmEntity,
      ],
      synchronize: true,
      logging: true,
    }),
    AuthModule,
    //
    AppointmentModule
  ],
  
  
})
export class AppModule { }

import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AuthModule } from "./modules/auth/auth.module.js";

// ORM Entities
import { UserOrmEntity } from "./modules/auth/infrastructure/persistence/user.orm-entity.js";
import { DoctorOrmEntity } from "./modules/auth/infrastructure/persistence/doctor.orm-entity.js";
import { AccountOrmEntity } from "./modules/auth/infrastructure/persistence/account.orm-entity.js";
import { AvailabilitySlotOrmEntity } from "./modules/auth/infrastructure/persistence/availability-slot.orm-entity.js";

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: "better-sqlite3",
      database: "piedrazul.db",
      entities: [
        UserOrmEntity,
        DoctorOrmEntity,
        AccountOrmEntity,
        AvailabilitySlotOrmEntity,
      ],
      synchronize: true,
      logging: ["query", "error"],
    }),
    AuthModule,
  ],
})
export class AppModule {}

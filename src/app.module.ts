import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AuthModule } from "./modules/auth/auth.module.js";

// ORM Entities
import { UserOrmEntity } from "./modules/auth/infrastructure/persistence/user.orm-entity.js";
import { DoctorOrmEntity } from "./modules/auth/infrastructure/persistence/doctor.orm-entity.js";
import { AccountOrmEntity } from "./modules/auth/infrastructure/persistence/account.orm-entity.js";

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: "better-sqlite3",
      database: "piedrazul.db",
      entities: [
        UserOrmEntity,
        DoctorOrmEntity,
        AccountOrmEntity,
      ],
      synchronize: true,
      logging: true,
    }),
    AuthModule,
  ],
})
export class AppModule { }

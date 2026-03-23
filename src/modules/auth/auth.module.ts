import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { TypeOrmModule } from "@nestjs/typeorm";

import { AuthController } from "./presentation/controllers/auth.controller.js";
import { RegisterUseCase } from "./application/use-cases/register.use-case.js";
import { LoginUseCase } from "./application/use-cases/login.use-case.js";
import { UserRepositoryImpl } from "./infrastructure/repositories/user.repository.impl.js";
import { JwtAuthGuard } from "./presentation/guards/jwt-auth.guard.js";
import { RolesGuard } from "./presentation/guards/roles.guard.js";
import { USER_REPOSITORY } from "./auth.tokens.js";

// ORM Entities
import { UserOrmEntity } from "./infrastructure/persistence/user.orm-entity.js";
import { DoctorOrmEntity } from "./infrastructure/persistence/doctor.orm-entity.js";
import { AccountOrmEntity } from "./infrastructure/persistence/account.orm-entity.js";
import { AvailabilitySlotOrmEntity } from "./infrastructure/persistence/availability-slot.orm-entity.js";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserOrmEntity,
      DoctorOrmEntity,
      AccountOrmEntity,
      AvailabilitySlotOrmEntity,
    ]),
    JwtModule.register({
      global: false,
      secret: "piedrazul-jwt-secret-key-2024",
      signOptions: { expiresIn: "1h" },
    }),
  ],
  controllers: [AuthController],
  providers: [
    RegisterUseCase,
    LoginUseCase,
    {
      provide: USER_REPOSITORY,
      useClass: UserRepositoryImpl,
    },
    JwtAuthGuard,
    RolesGuard,
  ],
  exports: [JwtModule, JwtAuthGuard, RolesGuard],
})
export class AuthModule {}

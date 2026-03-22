import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './presentation/controllers/auth.controller.js';
import { RegisterUseCase } from './application/use-cases/register.use-case.js';
import { LoginUseCase } from './application/use-cases/login.use-case.js';
import { UserRepositoryImpl } from './infrastructure/repositories/user.repository.impl.js';
import { JwtAuthGuard } from './presentation/guards/jwt-auth.guard.js';
import { RolesGuard } from './presentation/guards/roles.guard.js';
import { USER_REPOSITORY } from './auth.tokens.js';

@Module({
    imports: [
        JwtModule.register({
            global: false,
            secret: 'piedrazul-jwt-secret-key-2024',
            signOptions: { expiresIn: '1h' },
        }),
    ],
    controllers: [AuthController],
    providers: [
        // Use Cases
        RegisterUseCase,
        LoginUseCase,

        // Infrastructure — Repository implementation bound to domain interface token
        {
            provide: USER_REPOSITORY,
            useClass: UserRepositoryImpl,
        },

        // Guards
        JwtAuthGuard,
        RolesGuard,
    ],
    exports: [JwtModule, JwtAuthGuard, RolesGuard],
})
export class AuthModule { }

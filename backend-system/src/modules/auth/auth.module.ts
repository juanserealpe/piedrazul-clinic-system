import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

import { UserOrmEntity } from './persistence/user.orm-entity';
import { UserRepository } from './persistence/user.repository';

import { KeycloakService } from './keycloak/keycloak.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserOrmEntity]),
  ],

  controllers: [AuthController],

  providers: [
    AuthService,
    UserRepository,
    KeycloakService,
  ],

  exports: [
    AuthService,
  ],
})
export class AuthModule {}
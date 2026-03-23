/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  Inject,
  Injectable,
  UnauthorizedException,
  Logger,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";
import type { UserRepository } from "../../domain/repositories/user.repository";
import { LoginDto } from "../dto/login.dto";
import { USER_REPOSITORY } from "../../auth.tokens.js";
import { User } from "../../domain/entities/user.entity";

export interface LoginResponse {
  accessToken: string;
  user: {
    id: string;
    email: string;
    username?: string;
    roles: string[];
  };
}

@Injectable()
export class LoginUseCase {
  private readonly logger = new Logger(LoginUseCase.name);

  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
    private readonly jwtService: JwtService,
  ) {}

  async execute(dto: LoginDto): Promise<LoginResponse> {
    this.logger.log(`Login attempt started for email: ${dto.email}`);

    // Buscar usuario por email
    const user: User | null = await this.userRepository.findByEmail(dto.email);
    if (!user) {
      this.logger.warn(`Login failed - User not found for email: ${dto.email}`);
      throw new UnauthorizedException("Invalid credentials");
    }
    this.logger.log(`User found in database: ${dto.email}, userId: ${user.id}`);

    // Validar que el usuario tenga cuenta
    if (!user.account) {
      this.logger.warn(
        `Login failed - No account associated with user: ${dto.email}`,
      );
      throw new UnauthorizedException("Invalid credentials");
    }
    this.logger.log(
      `User has an account, proceeding with password check: ${dto.email}`,
    );

    // Validar contraseña
    const isPasswordValid = await bcrypt.compare(
      dto.password,
      user.account.password,
    );
    if (!isPasswordValid) {
      this.logger.warn(
        `Login failed - Invalid password for email: ${dto.email}`,
      );
      throw new UnauthorizedException("Invalid credentials");
    }
    this.logger.log(`Password validated successfully for user: ${dto.email}`);

    // Extraer roles
    const roleNames = user.account.roles;
    this.logger.log(`Roles for user ${dto.email}: ${roleNames.join(", ")}`);

    // Generar JWT
    this.logger.log(`Generating JWT for userId: ${user.id}`);
    const payload = {
      sub: user.id,
      email: user.email,
      roles: roleNames,
    };
    const accessToken = await this.jwtService.signAsync(payload);
    this.logger.log(`JWT generated successfully for userId: ${user.id}`);

    this.logger.log(
      `Login successful for user: ${dto.email}, returning response`,
    );
    return {
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        username: (user as any).username,
        roles: roleNames,
      },
    };
  }
}

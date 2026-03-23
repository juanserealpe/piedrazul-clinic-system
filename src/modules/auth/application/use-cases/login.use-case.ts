import {
  Inject,
  Injectable,
  UnauthorizedException,
  Logger,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";
import * as userRepository from "../../domain/repositories/user.repository.js";
import { LoginDto } from "../dto/login.dto.js";
import { USER_REPOSITORY } from "../../auth.tokens.js";

export interface LoginResponse {
  accessToken: string;
  user: {
    id: string;
    email: string;
    username: string;
    roles: string[];
  };
}

@Injectable()
export class LoginUseCase {
  private readonly logger = new Logger(LoginUseCase.name);

  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: userRepository.UserRepository,
    private readonly jwtService: JwtService,
  ) {}

  async execute(dto: LoginDto): Promise<LoginResponse> {
    this.logger.log(`Login attempt: ${dto.email}`);

    const user = await this.userRepository.findByEmail(dto.email);
    if (!user) {
      this.logger.warn(`Login failed - User not found: ${dto.email}`);
      throw new UnauthorizedException("Invalid credentials");
    }

    this.logger.log(`User found, validating password: ${dto.email}`);
    const isPasswordValid = await bcrypt.compare(dto.password, user.password);

    if (!isPasswordValid) {
      this.logger.warn(`Login failed - Invalid password: ${dto.email}`);
      throw new UnauthorizedException("Invalid credentials");
    }

    const roleNames = user.roles.map((role) => role.name);

    this.logger.log(`Generating JWT for user: ${user.id}`);

    const payload = {
      sub: user.id,
      email: user.email,
      roles: roleNames,
    };

    const accessToken = await this.jwtService.signAsync(payload);

    this.logger.log(`Login successful: ${user.id}`);

    return {
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        roles: roleNames,
      },
    };
  }
}

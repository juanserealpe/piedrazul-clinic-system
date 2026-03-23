/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  Inject,
  Injectable,
  ConflictException,
  Logger,
  BadRequestException,
} from "@nestjs/common";
import * as bcrypt from "bcrypt";
import { randomUUID } from "crypto";
import type { UserRepository } from "../../domain/repositories/user.repository.js";
import { User } from "../../domain/entities/user.entity.js";
import { Role, RoleName } from "../../domain/entities/role.entity.js";
import { RegisterDto } from "../dto/register.dto.js";
import { USER_REPOSITORY } from "../../auth.tokens.js";

@Injectable()
export class RegisterUseCase {
  private readonly logger = new Logger(RegisterUseCase.name);

  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
  ) {}

  async execute(dto: RegisterDto): Promise<Omit<User, "password">> {
    this.logger.log(`Starting user registration: ${dto.email}`);

    const validRoles = Object.values(RoleName);

    const invalidRoles = dto.roles.filter((role) => !validRoles.includes(role));

    if (invalidRoles.length > 0) {
      this.logger.warn(`Invalid roles detected: ${invalidRoles.join(", ")}`);
      throw new BadRequestException(
        `Invalid roles: ${invalidRoles.join(", ")}`,
      );
    }

    const existingByEmail = await this.userRepository.findByEmail(dto.email);
    if (existingByEmail) {
      this.logger.warn(
        `Registration failed - Email already registered: ${dto.email}`,
      );
      throw new ConflictException("Email already registered");
    }

    const existingByUsername = await this.userRepository.findByUsername(
      dto.username,
    );
    if (existingByUsername) {
      this.logger.warn(
        `Registration failed - Username already taken: ${dto.username}`,
      );
      throw new ConflictException("Username already taken");
    }

    this.logger.log(`Hashing password for user: ${dto.email}`);
    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const roles: Role[] = dto.roles.map(
      (roleName: RoleName) => new Role(randomUUID(), roleName),
    );

    this.logger.log(
      `Assigning roles to user: ${dto.email} -> [${dto.roles.join(", ")}]`,
    );

    const user = new User(
      randomUUID(),
      dto.email,
      dto.username,
      hashedPassword,
      roles,
    );

    this.logger.log(`Saving user to repository: ${dto.email}`);
    const savedUser = await this.userRepository.save(user);

    this.logger.log(`User registered successfully: ${savedUser.id}`);

    const { password: _, ...userWithoutPassword } = savedUser;
    return userWithoutPassword as Omit<User, "password">;
  }
}

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
import { Doctor } from "../../domain/entities/doctor.entity.js";
import { Account } from "../../domain/entities/account.entity.js";
import { Role, RoleName } from "../../domain/entities/role.entity";
import { RegisterDto } from "../dto/register.dto.js";
import { USER_REPOSITORY } from "../../auth.tokens.js";
import {
  Schedule,
  AvailabilitySlot,
} from "../../domain/entities/availabilitySlot.entity";
import { UserResponseDto } from "../dto/user.response.dto.js";
import { ExceptionsHandler } from "@nestjs/core/exceptions/exceptions-handler.js";

@Injectable()
export class RegisterUseCase {
  private readonly logger = new Logger(RegisterUseCase.name);

  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
  ) {}

  async execute(dto: RegisterDto): Promise<UserResponseDto> {
    const existingUser = await this.userRepository.findByEmail(dto.email);
    if (existingUser) {
      throw new ConflictException(
        `El correo electronico ya está en uso por otro usuario: ${dto.email}`,
      );
    }
    // Verifica roles
    if (dto.roles.includes(RoleName.DOCTOR)) {
      return this.registerDoctor(dto);
    } else {
      return this.registerRegularUser(dto);
    }
  }

  // ----------------------
  // Registro de usuarios normales (pacientes, empleados no doctores)
  // ----------------------
  private async registerRegularUser(
    dto: RegisterDto,
  ): Promise<UserResponseDto> {
    this.logger.log(`Starting registration for regular user: ${dto.email}`);

    // Crear account con password
    const account = new Account(
      randomUUID(),
      await bcrypt.hash(dto.password, 10),
      dto.roles,
    );

    // Crear usuario (paciente o empleado)
    const user = new User(
      dto.id,
      dto.email,
      dto.phone_number,
      new Date(dto.born_date),
      dto.names,
      dto.lastnames,
      dto.gender,
      account,
    );

    // Guardar en repositorio
    await this.userRepository.save(user);

    // Construir DTO de respuesta sin password
    const response: UserResponseDto = {
      ...user,
      account: {
        id: user.account!.id,
        roles: user.account!.roles,
      },
    };

    return response;
  }

  // ----------------------
  // Registro de Doctor
  // ----------------------
  private async registerDoctor(dto: RegisterDto): Promise<UserResponseDto> {
    this.logger.log(`Starting registration for Doctor: ${dto.email}`);

    if (!dto.availability || dto.availability.length === 0) {
      this.logger.warn(`Doctor availability missing for: ${dto.email}`);
      throw new BadRequestException(
        "Se requiere que se llene el campo de disponibilidad del doctor.",
      );
    }

    // Crear agenda del doctor
    const doctorSchedule = new Schedule();
    if (dto.availability) {
      dto.availability.forEach((slot) => {
        doctorSchedule.addSlot(
          new AvailabilitySlot(
            slot.date,
            slot.startTime,
            slot.endTime,
            slot.appointmentDuration,
          ),
        );
      });
    }

    // Crear account con password
    const account = new Account(
      randomUUID(),
      await bcrypt.hash(dto.password, 10),
      dto.roles,
    );

    // Crear Doctor
    const doctor = new Doctor(
      dto.id,
      dto.email,
      dto.phone_number,
      new Date(dto.born_date),
      dto.names,
      dto.lastnames,
      dto.gender,
      account,
      doctorSchedule,
      dto.averageAppointmentDuration ?? 20,
    );

    // Guardar en repositorio
    await this.userRepository.save(doctor);

    // Construir DTO de respuesta sin password
    const response: UserResponseDto = {
      ...doctor,
      account: {
        id: doctor.account.id,
        roles: doctor.account.roles,
      },
    };

    return response;
  }
}

import { Inject, Injectable, ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';
import { UserRepository } from '../../domain/repositories/user.repository.js';
import { User } from '../../domain/entities/user.entity.js';
import { Role, RoleName } from '../../domain/entities/role.entity.js';
import { RegisterDto } from '../dto/register.dto.js';
import { USER_REPOSITORY } from '../../auth.tokens.js';

@Injectable()
export class RegisterUseCase {
    constructor(
        @Inject(USER_REPOSITORY)
        private readonly userRepository: UserRepository,
    ) { }

    async execute(dto: RegisterDto): Promise<Omit<User, 'password'>> {
        const existingByEmail = await this.userRepository.findByEmail(dto.email);
        if (existingByEmail) {
            throw new ConflictException('Email already registered');
        }

        const existingByUsername = await this.userRepository.findByUsername(dto.username);
        if (existingByUsername) {
            throw new ConflictException('Username already taken');
        }

        const hashedPassword = await bcrypt.hash(dto.password, 10);

        const roles: Role[] = dto.roles.map(
            (roleName: RoleName) => new Role(randomUUID(), roleName),
        );

        const user = new User(
            randomUUID(),
            dto.email,
            dto.username,
            hashedPassword,
            roles,
        );

        const savedUser = await this.userRepository.save(user);

        const { password: _, ...userWithoutPassword } = savedUser;
        return userWithoutPassword as Omit<User, 'password'>;
    }
}

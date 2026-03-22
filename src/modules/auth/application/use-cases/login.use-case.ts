import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UserRepository } from '../../domain/repositories/user.repository.js';
import { LoginDto } from '../dto/login.dto.js';
import { USER_REPOSITORY } from '../../auth.tokens.js';

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
    constructor(
        @Inject(USER_REPOSITORY)
        private readonly userRepository: UserRepository,
        private readonly jwtService: JwtService,
    ) { }

    async execute(dto: LoginDto): Promise<LoginResponse> {
        const user = await this.userRepository.findByEmail(dto.email);
        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const isPasswordValid = await bcrypt.compare(dto.password, user.password);
        if (!isPasswordValid) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const roleNames = user.roles.map((role) => role.name);

        const payload = {
            sub: user.id,
            email: user.email,
            roles: roleNames,
        };

        const accessToken = await this.jwtService.signAsync(payload);

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

import { Injectable } from '@nestjs/common';
import { UserRepository } from '../../domain/repositories/user.repository.js';
import { User } from '../../domain/entities/user.entity.js';

/**
 * In-memory implementation of the UserRepository interface.
 * Stores users in a simple array for development/testing purposes.
 */
@Injectable()
export class UserRepositoryImpl implements UserRepository {
    private readonly users: User[] = [];

    async findByEmail(email: string): Promise<User | null> {
        return this.users.find((user) => user.email === email) ?? null;
    }

    async findByUsername(username: string): Promise<User | null> {
        return this.users.find((user) => user.username === username) ?? null;
    }

    async findById(id: string): Promise<User | null> {
        return this.users.find((user) => user.id === id) ?? null;
    }

    async save(user: User): Promise<User> {
        const existingIndex = this.users.findIndex((u) => u.id === user.id);
        if (existingIndex !== -1) {
            this.users[existingIndex] = user;
        } else {
            this.users.push(user);
        }
        return user;
    }
}

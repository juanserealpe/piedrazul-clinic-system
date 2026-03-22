import { User } from '../entities/user.entity.js';

/**
 * Domain repository interface for User aggregate.
 * Infrastructure layer must provide an implementation.
 */
export interface UserRepository {
    findByEmail(email: string): Promise<User | null>;
    findByUsername(username: string): Promise<User | null>;
    findById(id: string): Promise<User | null>;
    save(user: User): Promise<User>;
}

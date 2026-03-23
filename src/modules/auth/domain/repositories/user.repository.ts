import { User } from "../entities/user.entity.js";

export interface UserRepository {
  findAll(): User[] | PromiseLike<User[]>;
  findByEmail(email: string): Promise<User | null>;
  findById(id: string): Promise<User | null>;
  save(user: User): Promise<User>;
}

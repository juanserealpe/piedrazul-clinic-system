import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { UserRepository } from "../../domain/repositories/user.repository";
import { User } from "../../domain/entities/user.entity";
import { UserOrmEntity } from "../persistence/user.orm-entity";
import { UserMapper } from "../persistence/user.mapper";

@Injectable()
export class UserRepositoryImpl implements UserRepository {
  constructor(
    /**
     * Inyectamos el repositorio del tipo PADRE (UserOrmEntity).
     * TypeORM con Single Table Inheritance resuelve automáticamente
     * el subtipo correcto (UserOrmEntity o DoctorOrmEntity) según
     * la columna discriminadora `type`. No hace falta inyectar
     * DoctorRepository por separado para las queries básicas.
     */
    @InjectRepository(UserOrmEntity)
    private readonly repo: Repository<UserOrmEntity>,
  ) {}

  async findByEmail(email: string): Promise<User | null> {
    const entity = await this.repo.findOne({ where: { email } });
    if (!entity) return null;
    return UserMapper.toDomain(entity);
  }

  async findById(id: string): Promise<User | null> {
    const entity = await this.repo.findOne({ where: { id } });
    if (!entity) return null;
    return UserMapper.toDomain(entity);
  }

  async save(user: User): Promise<User> {
    const entity = UserMapper.toOrm(user);
    const saved = await this.repo.save(entity);
    return UserMapper.toDomain(saved);
  }

  async findAll(): Promise<User[]> {
    const entities = await this.repo.find();
    return entities.map((e) => UserMapper.toDomain(e));
  }
}

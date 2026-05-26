import { Injectable } from "@nestjs/common";
import { UserOrmEntity } from "./user.orm-entity";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

@Injectable()
export class UserRepository {
  constructor(
    @InjectRepository(UserOrmEntity)
    private readonly repo: Repository<UserOrmEntity>,
  ) {}

  async create(user: UserOrmEntity): Promise<UserOrmEntity> {return this.repo.save(user);}
  async findByEmail(email: string): Promise<UserOrmEntity | null> {return this.repo.findOne({ where: { email } });}
  async isUserInRole(userId: string, roleName: string): Promise<boolean> {
    const user = await this.repo.findOne({ where: { id: userId } });
    return user ? user.roles.includes(roleName) : false;
  }
}
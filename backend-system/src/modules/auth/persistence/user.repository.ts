import { Injectable } from "@nestjs/common";
import { UserOrmEntity } from "./user.orm-entity";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { UserResponseDto } from "../dtos/user-response-dto";

@Injectable()
export class UserRepository {
  constructor(
    @InjectRepository(UserOrmEntity)
    private readonly repo: Repository<UserOrmEntity>,
  ) {}
  async userExists(id: string): Promise<boolean> {
    const count = await this.repo.count({ where: { id } });
    return count > 0;
  }
  async create(user: UserOrmEntity): Promise<UserOrmEntity> {return this.repo.save(user);}
  async findByEmail(email: string): Promise<UserOrmEntity | null> {return this.repo.findOne({ where: { email } });}
  async isUserInRole(userId: string, roleName: string): Promise<boolean> {
    const user = await this.repo.findOne({ where: { id: userId } });
    return user ? user.roles.includes(roleName) : false;
  }
  async getAllDoctors(): Promise<{ id: string; name: string, lastnames: string }[]> {
    const doctors = await this.repo.find({ where: { roles: 'DOCTOR' } });
    return doctors.map(doc => ({ id: doc.id, name: doc.names, lastnames: doc.lastnames }));
  }
  async getAllPatients(): Promise<{ id: string; name: string, lastnames: string }[]> {
    const patients = await this.repo.find({ where: { roles: 'PATIENT' } });
    return patients.map(pat => ({ id: pat.id, name: pat.names, lastnames: pat.lastnames }));
  }
  async getPatientById(id: string): Promise<{ id: string; name: string, lastnames: string } | null> {
    const patient = await this.repo.findOne({ where: { id, roles: 'PATIENT' } });
    if (!patient) return null;
    return { id: patient.id, name: patient.names, lastnames: patient.lastnames };
  }
}

import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { UserRepository } from "../../domain/repositories/user.repository";
import { User } from "../../domain/entities/user.entity";
import { Doctor } from "../../domain/entities/doctor.entity";
import { UserOrmEntity } from "../persistence/user.orm-entity";
import { DoctorOrmEntity } from "../persistence/doctor.orm-entity";
import { UserMapper } from "../persistence/user.mapper";

@Injectable()
export class UserRepositoryImpl implements UserRepository {
  constructor(
    @InjectRepository(UserOrmEntity)
    private readonly userRepo: Repository<UserOrmEntity>,

    @InjectRepository(DoctorOrmEntity)
    private readonly doctorRepo: Repository<DoctorOrmEntity>,
  ) {}

  async findByEmail(email: string): Promise<User | null> {
    const doctorEntity = await this.doctorRepo.findOne({
      where: { user: { email } },
      relations: ["user", "user.account"],
    });
    if (doctorEntity) return UserMapper.toDoctorDomain(doctorEntity);

    const userEntity = await this.userRepo.findOne({ where: { email } });
    if (!userEntity) return null;
    return UserMapper.toDomain(userEntity);
  }

  async findById(id: string): Promise<User | null> {
    const doctorEntity = await this.doctorRepo.findOne({
      where: { user_id: id },
      relations: ["user", "user.account"],
    });
    if (doctorEntity) return UserMapper.toDoctorDomain(doctorEntity);

    const userEntity = await this.userRepo.findOne({ where: { id } });
    if (!userEntity) return null;
    return UserMapper.toDomain(userEntity);
  }

  async save(user: User): Promise<User> {
    if (user instanceof Doctor) {
      const doctorEntity = UserMapper.toDoctorOrm(user);
      const saved = await this.doctorRepo.save(doctorEntity);
      const reloaded = await this.doctorRepo.findOne({
        where: { user_id: saved.user_id },
        relations: ["user", "user.account"],
      });
      return UserMapper.toDoctorDomain(reloaded!);
    }

    const userEntity = UserMapper.toOrm(user);
    const saved = await this.userRepo.save(userEntity);
    return UserMapper.toDomain(saved);
  }

  async findAll(): Promise<User[]> {
    const doctors = await this.doctorRepo.find({
      relations: ["user", "user.account"],
    });
    const doctorIds = new Set(doctors.map((d: DoctorOrmEntity) => d.user_id));

    const users = await this.userRepo.find();
    const regularUsers = users
      .filter((u) => !doctorIds.has(u.id))
      .map((u) => UserMapper.toDomain(u));

    const mappedDoctors = doctors.map((d: DoctorOrmEntity) =>
      UserMapper.toDoctorDomain(d),
    );

    return [...regularUsers, ...mappedDoctors];
  }
}

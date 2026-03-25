import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { ScheduleOrmEntity } from "./Entities/ScheduleOrmEntity";
import { ScheduleRepository } from "../domain/Repositories/ScheduleRepository";
import { Schedule } from "../domain/entities/Schedule.entity";
import { ScheduleMapper } from "./Mappers/ScheduleMapper";
import { DayOfWeek } from "../domain/entities/DaysOfWeek";


@Injectable()
export class TypeOrmScheduleRepository implements ScheduleRepository {
  constructor(
    @InjectRepository(ScheduleOrmEntity)
    private readonly repo: Repository<ScheduleOrmEntity>
  ) {}

  async findByDoctorAndDay(
    doctorId: string,
    day: DayOfWeek
  ): Promise<Schedule[] | null> {
  const results = await this.repo.find({
    where: {
      doctorId,
      day,
      isActive: true
    },
  });

  return results.map(ScheduleMapper.toDomain);
}

  async findByStatus(status: string): Promise<Schedule[] | null> {
    const isActive = status === "active";
    const results = await this.repo.find({
      where: { isActive },
    });
    return results.map(ScheduleMapper.toDomain);
  }

  async save(schedule: Schedule): Promise<Schedule> {
    const orm = ScheduleMapper.toOrm(schedule);
    const saved = await this.repo.save(orm);
    return ScheduleMapper.toDomain(saved);
  }

  async findActiveByDoctor(doctorId: string): Promise<Schedule[]> {
    const results = await this.repo.find({
      where: { doctorId, isActive: true },
    });
    return results.map(ScheduleMapper.toDomain);
  }
}
